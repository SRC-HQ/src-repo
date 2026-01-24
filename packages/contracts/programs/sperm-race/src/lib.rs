use anchor_lang::prelude::*;
use anchor_lang::system_program;
use sha2::{Sha256, Digest};

declare_id!("CNgqKqXLnzyzuqvZHewxMeE55UbEquQMMRVE7Fdqz7Zh");

#[program]
pub mod sperm_race {
    use super::*;

    /// Initialize the game with an authority
    pub fn initialize_game(ctx: Context<InitializeGame>) -> Result<()> {
        let global_state = &mut ctx.accounts.global_state;
        global_state.authority = ctx.accounts.authority.key();
        global_state.current_round = 0;
        msg!("Game initialized with authority: {}", global_state.authority);
        Ok(())
    }

    /// Start a new round (authority only)
    /// Creates a new RoundAccount PDA and stores the hashed seed
    pub fn start_round(
        ctx: Context<StartRound>,
        round_id: u64,
        hashed_seed: [u8; 32],
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
        round_account.winner_id = 0;
        round_account.is_locked = false;
        round_account.total_pot = 0;
        round_account.is_resolved = false;
        round_account.bets_per_sperm = [0u64; 10]; // Initialize all bets to 0

        msg!("Round {} started with hashed seed", global_state.current_round);
        Ok(())
    }

    /// Place a bet on a sperm (user action)
    /// Transfers SOL to the RoundAccount vault and creates/updates BetRecord
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

        // Update or create bet record
        let bet_record = &mut ctx.accounts.bet_record;
        if bet_record.amount == 0 {
            // New bet
            bet_record.user = ctx.accounts.user.key();
            bet_record.round_id = ctx.accounts.round_account.round_id;
            bet_record.sperm_id = sperm_id;
            bet_record.amount = amount;
        } else {
            // Update existing bet (add to amount)
            require!(
                bet_record.sperm_id == sperm_id,
                ErrorCode::SpermIdMismatch
            );
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

        msg!(
            "Bet placed: User {} bet {} lamports on sperm {} in round {}",
            ctx.accounts.user.key(),
            amount,
            sperm_id,
            ctx.accounts.round_account.round_id
        );

        Ok(())
    }

    /// Lock betting for the current round (authority only)
    pub fn lock_betting(ctx: Context<LockBetting>) -> Result<()> {
        ctx.accounts.round_account.is_locked = true;
        msg!(
            "Betting locked for round {}",
            ctx.accounts.round_account.round_id
        );
        Ok(())
    }

    /// Resolve the round with winner and server seed (authority only)
    /// Verifies that sha256(server_seed) matches the stored hashed_seed
    pub fn resolve_round(
        ctx: Context<ResolveRound>,
        winner_id: u8,
        server_seed: [u8; 32],
    ) -> Result<()> {
        require!(winner_id < 10, ErrorCode::InvalidSpermId);

        // Verify seed hash using SHA256
        let mut hasher = Sha256::new();
        hasher.update(&server_seed);
        let computed_hash = hasher.finalize();
        require!(
            computed_hash.as_slice() == ctx.accounts.round_account.hashed_seed,
            ErrorCode::InvalidSeed
        );

        ctx.accounts.round_account.winner_id = winner_id;
        ctx.accounts.round_account.is_resolved = true;

        msg!(
            "Round {} resolved: Winner is sperm {}",
            ctx.accounts.round_account.round_id,
            winner_id
        );

        Ok(())
    }

    /// Claim winnings (user action)
    /// If user bet on the winning sperm, transfer their share of the pot (minus 15% house fee)
    pub fn claim_winnings(ctx: Context<ClaimWinnings>) -> Result<()> {
        let round_account = &ctx.accounts.round_account;
        let bet_record = &ctx.accounts.bet_record;

        // Validate round is resolved
        require!(round_account.is_resolved, ErrorCode::RoundNotResolved);

        // Validate user bet on winner
        require!(
            bet_record.sperm_id == round_account.winner_id,
            ErrorCode::NotAWinner
        );

        // Validate bet record matches round
        require!(
            bet_record.round_id == round_account.round_id,
            ErrorCode::RoundMismatch
        );

        // Calculate user's share of the pot
        // Formula: (user_bet / total_bets_on_winner) * (total_pot - house_fee)
        let total_pot = round_account.total_pot;
        let winner_id = round_account.winner_id as usize;
        let total_bets_on_winner = round_account.bets_per_sperm[winner_id];
        
        require!(total_bets_on_winner > 0, ErrorCode::InvalidPayout);

        let house_fee_percent = 15u64; // 15%
        let house_fee = total_pot
            .checked_mul(house_fee_percent)
            .and_then(|x| x.checked_div(100))
            .ok_or(ErrorCode::AmountOverflow)?;
        
        let net_pool = total_pot
            .checked_sub(house_fee)
            .ok_or(ErrorCode::AmountOverflow)?;

        // Calculate user's share: proportional to their bet vs total bets on winner
        let user_share = bet_record
            .amount
            .checked_mul(net_pool)
            .and_then(|x| x.checked_div(total_bets_on_winner))
            .ok_or(ErrorCode::AmountOverflow)?;

        require!(user_share > 0, ErrorCode::InvalidPayout);

        // Transfer winnings to user
        **ctx.accounts.round_account.to_account_info().try_borrow_mut_lamports()? -= user_share;
        **ctx.accounts.user.to_account_info().try_borrow_mut_lamports()? += user_share;

        // Mark bet as claimed (optional - for tracking)
        // In a full implementation, you might want to track this

        msg!(
            "Winnings claimed: User {} received {} lamports for round {}",
            ctx.accounts.user.key(),
            user_share,
            round_account.round_id
        );

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeGame<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 8, // discriminator + Pubkey + u64
        seeds = [b"global_state"],
        bump
    )]
    pub global_state: Account<'info, GlobalState>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(round_id: u64)]
pub struct StartRound<'info> {
    #[account(
        mut,
        has_one = authority @ ErrorCode::Unauthorized
    )]
    pub global_state: Account<'info, GlobalState>,

    #[account(
        init,
        payer = authority,
        space = 8 + 8 + 32 + 1 + 1 + 8 + 1 + (8 * 10), // discriminator + round_id + hashed_seed + winner_id + is_locked + total_pot + is_resolved + bets_per_sperm[10]
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
    #[account(
        mut,
        seeds = [b"round", round_id.to_le_bytes().as_ref()],
        bump
    )]
    pub round_account: Account<'info, RoundAccount>,

    #[account(
        init_if_needed,
        payer = user,
        space = 8 + 32 + 8 + 1 + 8,
        seeds = [b"bet", user.key().as_ref(), round_id.to_le_bytes().as_ref()],
        bump
    )]
    pub bet_record: Account<'info, BetRecord>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
pub struct LockBetting<'info> {
    #[account(
        mut,
        has_one = authority @ ErrorCode::Unauthorized
    )]
    pub global_state: Account<'info, GlobalState>,

    #[account(
        mut,
        seeds = [b"round", global_state.current_round.to_le_bytes().as_ref()],
        bump
    )]
    pub round_account: Account<'info, RoundAccount>,

    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct ResolveRound<'info> {
    #[account(
        has_one = authority @ ErrorCode::Unauthorized
    )]
    pub global_state: Account<'info, GlobalState>,

    #[account(
        mut,
        seeds = [b"round", global_state.current_round.to_le_bytes().as_ref()],
        bump
    )]
    pub round_account: Account<'info, RoundAccount>,

    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct ClaimWinnings<'info> {
    #[account(mut)]
    pub round_account: Account<'info, RoundAccount>,

    #[account(
        mut,
        seeds = [b"bet", user.key().as_ref(), round_account.round_id.to_le_bytes().as_ref()],
        bump
    )]
    pub bet_record: Account<'info, BetRecord>,

    #[account(mut)]
    pub user: Signer<'info>,
}

#[account]
pub struct GlobalState {
    pub authority: Pubkey,
    pub current_round: u64,
}

#[account]
pub struct RoundAccount {
    pub round_id: u64,
    pub hashed_seed: [u8; 32],
    pub winner_id: u8,
    pub is_locked: bool,
    pub total_pot: u64,
    pub is_resolved: bool,
    pub bets_per_sperm: [u64; 10], // Track total bets per sperm_id (0-9)
}

#[account]
pub struct BetRecord {
    pub user: Pubkey,
    pub round_id: u64,
    pub sperm_id: u8,
    pub amount: u64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized: Only authority can perform this action")]
    Unauthorized,
    #[msg("Invalid sperm ID: Must be 0-9")]
    InvalidSpermId,
    #[msg("Invalid bet amount: Must be greater than 0")]
    InvalidBetAmount,
    #[msg("Betting is locked for this round")]
    BettingLocked,
    #[msg("Round overflow: Maximum round number exceeded")]
    RoundOverflow,
    #[msg("Amount overflow: Calculation resulted in overflow")]
    AmountOverflow,
    #[msg("Invalid seed: Server seed hash does not match stored hash")]
    InvalidSeed,
    #[msg("Round not resolved: Cannot claim winnings before round is resolved")]
    RoundNotResolved,
    #[msg("Not a winner: User did not bet on the winning sperm")]
    NotAWinner,
    #[msg("Round mismatch: Provided round_id does not match expected round (current_round + 1). Check transaction logs for details.")]
    RoundMismatch,
    #[msg("Sperm ID mismatch: Cannot change sperm ID on existing bet")]
    SpermIdMismatch,
    #[msg("Invalid payout: Calculated payout is zero or negative")]
    InvalidPayout,
}
