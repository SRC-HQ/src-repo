use anchor_lang::prelude::*;
use anchor_lang::system_program;
use sha2::{Sha256, Digest};
use solana_sysvar::slot_hashes::PodSlotHashes;

declare_id!("2y2AdrVLKqwcA5GQEC1ULEHac3hH9ck565UBqzPaReJZ");

#[program]
pub mod sperm_race {
    use crate::ErrorCode;

    use super::*;

    /// Initialize the game with an authority
    pub fn initialize_game(ctx: Context<InitializeGame>, treasury: Pubkey) -> Result<()> {
        let global_state = &mut ctx.accounts.global_state;
        global_state.authority = ctx.accounts.authority.key();
        global_state.treasury = treasury;
        global_state.current_round = 0;

        // Initialize Baby King Vault
        let baby_king_vault = &mut ctx.accounts.baby_king_vault;
        baby_king_vault.total_accumulated = 0;
        baby_king_vault.bump = ctx.bumps.baby_king_vault;

        msg!("Game initialized with authority: {}", global_state.authority);
        Ok(())
    }

    /// Start a new round (authority only).
    /// end_slot: slot at which entropy is fixed (slot hash sampled from SlotHashes sysvar). Must be in the future when called; resolution must happen within ~512 slots after end_slot.
    pub fn start_round(
        ctx: Context<StartRound>,
        round_id: u64,
        hashed_seed: [u8; 32],
        end_slot: u64,
    ) -> Result<()> {
        let global_state = &mut ctx.accounts.global_state;

        // Verify round_id is current_round + 1
        let expected_round = global_state
            .current_round
            .checked_add(1)
            .ok_or(ErrorCode::RoundOverflow)?;

        if round_id != expected_round {
            msg!(
                "Round mismatch: Provided round_id={}, expected round={}, current_round={}",
                round_id,
                expected_round,
                global_state.current_round
            );
            return Err(ErrorCode::RoundMismatch.into());
        }

        // Increment round counter
        global_state.current_round = round_id;

        let round_account = &mut ctx.accounts.round_account;
        round_account.round_id = round_id;
        round_account.hashed_seed = hashed_seed;
        round_account.end_slot = end_slot;
        round_account.winner_id = 0;
        round_account.is_locked = false;
        round_account.total_pot = 0;
        round_account.is_resolved = false;
        round_account.bets_per_sperm = [0u64; 10];

        emit!(StartRoundEvent {
            round_id,
            hashed_seed,
            end_slot,
            authority: ctx.accounts.authority.key(),
        });

        Ok(())
    }

    /// Place a bet on a sperm (user action)
    pub fn place_bet(ctx: Context<PlaceBet>, round_id: u64, sperm_id: u8, amount: u64) -> Result<()> {
        // Validate constraints
        require!(sperm_id < 10, ErrorCode::InvalidSpermId);
        require!(amount > 0, ErrorCode::InvalidBetAmount);
        require!(!ctx.accounts.round_account.is_locked, ErrorCode::BettingLocked);

        // Transfer SOL from user to round vault
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.user.to_account_info(),
                to: ctx.accounts.round_account.to_account_info(),
            },
        );
        system_program::transfer(cpi_context, amount)?;

        // Update or create bet record (init_if_needed handles creation)
        let bet_record = &mut ctx.accounts.bet_record;
        if bet_record.amount == 0 {
            bet_record.user = ctx.accounts.user.key();
            bet_record.round_id = round_id;
            bet_record.sperm_id = sperm_id;
            bet_record.amount = amount;
        } else {
            // Update existing bet for THIS specific sperm
            bet_record.amount = bet_record
                .amount
                .checked_add(amount)
                .ok_or(ErrorCode::AmountOverflow)?;
        }

        // Update round total pot
        ctx.accounts.round_account.total_pot = ctx
            .accounts
            .round_account
            .total_pot
            .checked_add(amount)
            .ok_or(ErrorCode::AmountOverflow)?;

        // Update bets per sperm tracking
        let sperm_idx = sperm_id as usize;
        ctx.accounts.round_account.bets_per_sperm[sperm_idx] = ctx
            .accounts
            .round_account
            .bets_per_sperm[sperm_idx]
            .checked_add(amount)
            .ok_or(ErrorCode::AmountOverflow)?;

        // Emit Anchor event for easy off-chain indexing
        emit!(PlaceBetEvent {
            user: ctx.accounts.user.key(),
            round_id,
            sperm_id,
            amount,
        });

        Ok(())
    }

    pub fn lock_betting(ctx: Context<LockBetting>) -> Result<()> {
        ctx.accounts.round_account.is_locked = true;
        emit!(LockBettingEvent {
            round_id: ctx.accounts.round_account.round_id,
            authority: ctx.accounts.authority.key(),
        });
        Ok(())
    }

    /// Resolve round: entropy = sha256(slot_hash || seed || round_id), winner and baby_king derived on-chain. Server only reveals seed; cannot influence outcome.
    pub fn resolve_round(ctx: Context<ResolveRound>, server_seed: [u8; 32]) -> Result<()> {
        let round_account = &mut ctx.accounts.round_account;

        require!(round_account.is_locked, ErrorCode::BettingNotLocked);

        // 1. Verify commitment: hash(server_seed) == hashed_seed
        let mut hasher = Sha256::new();
        hasher.update(&server_seed);
        let computed_hash = hasher.finalize();
        require!(
            computed_hash.as_slice() == round_account.hashed_seed,
            ErrorCode::InvalidSeed
        );

        // 2. Load slot hash for committed end_slot (PodSlotHashes syscall; no account needed)
        let end_slot = round_account.end_slot;
        let slot_hashes = PodSlotHashes::fetch().map_err(|_| ErrorCode::InvalidSlotHash)?;
        let slot_hash = slot_hashes
            .get(&end_slot)
            .map_err(|_| ErrorCode::InvalidSlotHash)?
            .ok_or(ErrorCode::InvalidSlotHash)?;

        // 3. entropy: value = hash(slot_hash || seed || round_id)
        let mut preimage = Vec::with_capacity(32 + 32 + 8);
        preimage.extend_from_slice(slot_hash.as_ref());
        preimage.extend_from_slice(&server_seed);
        preimage.extend_from_slice(&round_account.round_id.to_le_bytes());
        let entropy_hash = Sha256::digest(&preimage);
        let entropy_bytes = entropy_hash.as_slice();

        // 4. Round RNG: r = u64[0] ^ u64[1] ^ u64[2] ^ u64[3]
        let r = u64::from_le_bytes(entropy_bytes[0..8].try_into().unwrap())
            ^ u64::from_le_bytes(entropy_bytes[8..16].try_into().unwrap())
            ^ u64::from_le_bytes(entropy_bytes[16..24].try_into().unwrap())
            ^ u64::from_le_bytes(entropy_bytes[24..32].try_into().unwrap());

        // 5. Winner: 10 sperms (0-9)
        let winner_id = (r % 10) as u8;
        round_account.winner_id = winner_id;
        round_account.is_resolved = true;

        // 6. Baby King jackpot: ~1/650 chance (same ballpark as before), using reverse_bits for independence from winner
        let baby_king_hit = r.reverse_bits().wrapping_rem(650) == 0;
        round_account.baby_king_hit = baby_king_hit;

        if baby_king_hit {
            let snapshot = ctx.accounts.baby_king_vault.total_accumulated;
            round_account.baby_king_jackpot_snapshot = snapshot;
            // DoS fix: reserve jackpot in round account now so later rounds cannot drain the vault before this round's claims
            if snapshot > 0 {
                let round_info = round_account.to_account_info();
                let vault_info = ctx.accounts.baby_king_vault.to_account_info();
                **vault_info.try_borrow_mut_lamports()? -= snapshot;
                **round_info.try_borrow_mut_lamports()? += snapshot;
                ctx.accounts.baby_king_vault.total_accumulated = ctx
                    .accounts
                    .baby_king_vault
                    .total_accumulated
                    .saturating_sub(snapshot);
            }
        }

        emit!(ResolveRoundEvent {
            round_id: round_account.round_id,
            winner_id,
            total_pot: round_account.total_pot,
            is_baby_king_hit: round_account.baby_king_hit,
            baby_king_jackpot_snapshot: round_account.baby_king_jackpot_snapshot,
        });
        Ok(())
    }

    pub fn claim_winnings(ctx: Context<ClaimWinnings>, sperm_id: u8) -> Result<()> {
        let round_account = &ctx.accounts.round_account;
        let bet_record = &ctx.accounts.bet_record;

        require!(round_account.is_resolved, ErrorCode::RoundNotResolved);
        require_eq!(bet_record.sperm_id, sperm_id, ErrorCode::InvalidSpermId); 
        require!(bet_record.sperm_id == round_account.winner_id, ErrorCode::NotAWinner);
    
        let total_bets_on_winner = round_account.bets_per_sperm[round_account.winner_id as usize];
        require!(total_bets_on_winner > 0, ErrorCode::InvalidPayout);
    
        // 1. Calculate User's RAW proportional share of the TOTAL POT
        // Formula: (User Bet / Total Bets on Winner) * Total Pot
        let raw_user_share = (bet_record.amount as u128)
            .checked_mul(round_account.total_pot as u128).unwrap()
            .checked_div(total_bets_on_winner as u128).unwrap() as u64;
    
        // 2. Calculate the Taxes based on the USER'S share (not the whole pot)
        let house_fee = raw_user_share.checked_mul(10).unwrap() / 100;
        let baby_king_tax = raw_user_share.checked_mul(5).unwrap() / 100;
        
        let net_winnings = raw_user_share
            .checked_sub(house_fee).unwrap()
            .checked_sub(baby_king_tax).unwrap();
    
        // 3. Calculate Jackpot (if applicable)
        let mut jackpot_share = 0u64;
        if round_account.baby_king_hit && round_account.baby_king_jackpot_snapshot > 0 {
            jackpot_share = (bet_record.amount as u128)
                .checked_mul(round_account.baby_king_jackpot_snapshot as u128).unwrap()
                .checked_div(total_bets_on_winner as u128).unwrap() as u64;
        }
    
        // --- EXECUTE TRANSFERS ---
    
        // A. Pay User (Winnings + Jackpot)
        let total_to_user = net_winnings.checked_add(jackpot_share).unwrap();
        
        // B. Move House fee to Treasury and Baby King tax from Round to Vault
        **ctx.accounts.round_account.to_account_info().try_borrow_mut_lamports()? -= net_winnings + house_fee + baby_king_tax;
        **ctx.accounts.treasury.to_account_info().try_borrow_mut_lamports()? += house_fee; 
        **ctx.accounts.baby_king_vault.to_account_info().try_borrow_mut_lamports()? += baby_king_tax;
        ctx.accounts.baby_king_vault.total_accumulated = ctx.accounts.baby_king_vault.total_accumulated.checked_add(baby_king_tax).unwrap();
    
        // C. Jackpot paid from round account (reserved at resolve; DoS-safe)
        if jackpot_share > 0 {
            **ctx.accounts.round_account.to_account_info().try_borrow_mut_lamports()? -= jackpot_share;
        }

        // D. Final Lamport Add to User
        **ctx.accounts.user.to_account_info().try_borrow_mut_lamports()? += total_to_user;

        emit!(ClaimWinningsEvent {
            round_id: round_account.round_id,
            user: ctx.accounts.user.key(),
            sperm_id,
            amount_claimed: total_to_user,
        });
        Ok(())
    }

    /// Allows a user to reclaim the rent (lamports) locked in their BetRecord PDA.
    /// This does NOT touch the round pot; it only closes the BetRecord account and
    /// returns its lamports to the user via Anchor's `close = user` mechanism.
    pub fn reclaim_bet_rent(ctx: Context<ReclaimBetRent>, sperm_id: u8) -> Result<()> {
        let round_account = &ctx.accounts.round_account;
        let bet_record = &ctx.accounts.bet_record;

        // Round must be resolved; before that, bets are still active.
        require!(round_account.is_resolved, ErrorCode::RoundNotResolved);

        // Basic consistency check: PDA seeds vs stored sperm_id.
        require_eq!(bet_record.sperm_id, sperm_id, ErrorCode::InvalidSpermId);

        // NOTE: We intentionally do NOT prevent a user from reclaiming rent on a
        // winning bet before claiming winnings. Doing so would make them unable
        // to claim later, but only harms that user and not the protocol. The
        // frontend / backend should enforce the intended flow:
        // 1) claim_winnings first (for winners)
        // 2) then reclaim_bet_rent for any remaining BetRecords.

        emit!(RentClaimedEvent {
            round_id: round_account.round_id,
            user: ctx.accounts.user.key(),
            sperm_id,
            amount: bet_record.amount,
        });

        // Anchor will automatically transfer all lamports in `bet_record` to `user`
        // and close the account at the end of the instruction because of `close = user`
        // in the `ReclaimBetRent` account struct.
        Ok(())
    }

    /// Reclaims rent from a RoundAccount after all claims are finished
    pub fn close_round_account(ctx: Context<CloseRound>) -> Result<()> {
        let round_account_info = ctx.accounts.round_account.to_account_info();
        let dest_info = ctx.accounts.authority.to_account_info();

        // Transfer all remaining SOL (the Rent) to your authority wallet
        let rent_amount = round_account_info.lamports();
        
        **round_account_info.try_borrow_mut_lamports()? = 0;
        **dest_info.try_borrow_mut_lamports()? = dest_info.lamports()
            .checked_add(rent_amount)
            .ok_or(ErrorCode::AmountOverflow)?;

        msg!("Account closed. Reclaimed {} lamports", rent_amount);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeGame<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 8,
        seeds = [b"global_state"],
        bump
    )]
    pub global_state: Account<'info, GlobalState>,
    #[account(
        init,
        payer = authority,
        space = 8 + 8 + 1,
        seeds = [b"baby_king_vault"],
        bump
    )]
    pub baby_king_vault: Account<'info, BabyKingVault>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(round_id: u64)]
pub struct StartRound<'info> {
    #[account(mut, has_one = authority @ ErrorCode::Unauthorized)]
    pub global_state: Account<'info, GlobalState>,
    #[account(
        init,
        payer = authority,
        space = 8 + 8 + 32 + 8 + 1 + 1 + 8 + 1 + (8 * 10) + 1 + 8,
        seeds = [b"round", round_id.to_le_bytes().as_ref()],
        bump
    )]
    pub round_account: Account<'info, RoundAccount>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(round_id: u64, sperm_id: u8, amount: u64)]
pub struct PlaceBet<'info> {
    #[account(mut, seeds = [b"round", round_id.to_le_bytes().as_ref()], bump)]
    pub round_account: Account<'info, RoundAccount>,
    #[account(
        init_if_needed,
        payer = user,
        space = 8 + 32 + 8 + 1 + 8,
        seeds = [b"bet", user.key().as_ref(), round_id.to_le_bytes().as_ref(), &[sperm_id]],
        bump
    )]
    pub bet_record: Account<'info, BetRecord>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct LockBetting<'info> {
    #[account(has_one = authority @ ErrorCode::Unauthorized)]
    pub global_state: Account<'info, GlobalState>,
    #[account(mut, seeds = [b"round", global_state.current_round.to_le_bytes().as_ref()], bump)]
    pub round_account: Account<'info, RoundAccount>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct ResolveRound<'info> {
    #[account(has_one = authority @ ErrorCode::Unauthorized)]
    pub global_state: Account<'info, GlobalState>,
    #[account(mut, seeds = [b"round", global_state.current_round.to_le_bytes().as_ref()], bump)]
    pub round_account: Account<'info, RoundAccount>,
    #[account(mut, seeds = [b"baby_king_vault"], bump)]
    pub baby_king_vault: Account<'info, BabyKingVault>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(sperm_id: u8)] // Tell Anchor to look at the function arguments
pub struct ClaimWinnings<'info> {
    #[account(mut)]
    pub round_account: Account<'info, RoundAccount>,
    #[account(seeds = [b"global_state"], bump)]
    pub global_state: Account<'info, GlobalState>,
    #[account(mut, seeds = [b"baby_king_vault"], bump)]
    pub baby_king_vault: Account<'info, BabyKingVault>,
    #[account(
        mut,
        seeds = [b"bet", user.key().as_ref(), round_account.round_id.to_le_bytes().as_ref(), &[sperm_id]],
        bump
    )]
    pub bet_record: Account<'info, BetRecord>,
    #[account(mut)]
    pub user: Signer<'info>,
    /// CHECK: We verify this matches global_state.treasury
    #[account(mut, address = global_state.treasury)]
    pub treasury: AccountInfo<'info>,
}

#[derive(Accounts)]
#[instruction(sperm_id: u8)]
pub struct ReclaimBetRent<'info> {
    #[account(mut)]
    pub round_account: Account<'info, RoundAccount>,
    #[account(
        mut,
        close = user,
        seeds = [b"bet", user.key().as_ref(), round_account.round_id.to_le_bytes().as_ref(), &[sperm_id]],
        bump
    )]
    pub bet_record: Account<'info, BetRecord>,
    #[account(mut)]
    pub user: Signer<'info>,
}

#[derive(Accounts)]
pub struct CloseRound<'info> {
    #[account(
        mut, 
        seeds = [b"round", round_account.round_id.to_le_bytes().as_ref()], 
        bump,
        // Security: Ensure only the authority can reclaim the rent
        constraint = global_state.authority == authority.key() @ ErrorCode::Unauthorized
    )]
    pub round_account: Account<'info, RoundAccount>,
    #[account(seeds = [b"global_state"], bump)]
    pub global_state: Account<'info, GlobalState>,
    #[account(mut)]
    pub authority: Signer<'info>,
}

#[account]
pub struct GlobalState {
    pub authority: Pubkey,
    pub treasury: Pubkey,
    pub current_round: u64,
}

#[account]
pub struct BabyKingVault {
    pub total_accumulated: u64,
    pub bump: u8,
}

#[account]
pub struct RoundAccount {
    pub round_id: u64,
    pub hashed_seed: [u8; 32],
    pub end_slot: u64,
    pub winner_id: u8,
    pub is_locked: bool,
    pub total_pot: u64,
    pub is_resolved: bool,
    pub bets_per_sperm: [u64; 10],
    pub baby_king_hit: bool,
    pub baby_king_jackpot_snapshot: u64,
}

#[account]
pub struct BetRecord {
    pub user: Pubkey,
    pub round_id: u64,
    pub sperm_id: u8,
    pub amount: u64,
}

#[event]
pub struct StartRoundEvent {
    pub round_id: u64,
    pub hashed_seed: [u8; 32],
    pub end_slot: u64,
    pub authority: Pubkey,
}

#[event]
pub struct PlaceBetEvent {
    pub user: Pubkey,
    pub round_id: u64,
    pub sperm_id: u8,
    pub amount: u64,
}

#[event]
pub struct LockBettingEvent {
    pub round_id: u64,
    pub authority: Pubkey,
}

#[event]
pub struct ResolveRoundEvent {
    pub round_id: u64,
    pub winner_id: u8,
    pub total_pot: u64,
    pub is_baby_king_hit: bool,
    pub baby_king_jackpot_snapshot: u64,
}

#[event]
pub struct ClaimWinningsEvent {
    pub round_id: u64,
    pub user: Pubkey,
    pub sperm_id: u8,
    pub amount_claimed: u64,
}

#[event]
pub struct RentClaimedEvent {
    pub round_id: u64,
    pub user: Pubkey,
    pub sperm_id: u8,
    pub amount: u64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized: Only authority can perform this action")] Unauthorized,
    #[msg("Invalid sperm ID: Must be 0-9")] InvalidSpermId,
    #[msg("Invalid bet amount")] InvalidBetAmount,
    #[msg("Betting is locked")] BettingLocked,
    #[msg("Betting must be locked before resolving")] BettingNotLocked,
    #[msg("Round overflow")] RoundOverflow,
    #[msg("Amount overflow")] AmountOverflow,
    #[msg("Invalid seed hash")] InvalidSeed,
    #[msg("Round not resolved")] RoundNotResolved,
    #[msg("Not a winner")] NotAWinner,
    #[msg("Round mismatch")] RoundMismatch,
    #[msg("Invalid payout")] InvalidPayout,
    #[msg("Invalid slot hash or end_slot not in SlotHashes history")] InvalidSlotHash,
}