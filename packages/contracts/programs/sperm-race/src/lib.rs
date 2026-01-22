use anchor_lang::prelude::*;

declare_id!("EPLZGLkPntoQswDdtDdgZ3kK1jrQBJC66dgadtyeDEry");

#[program]
pub mod sperm_race {
    use super::*;

    /// Initialize the game state
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let game_state = &mut ctx.accounts.game_state;
        game_state.authority = ctx.accounts.authority.key();
        game_state.current_round = 0;
        game_state.total_deposited = 0;
        game_state.is_paused = false;
        game_state.house_fee_percent = 15; // 15% house fee
        game_state.bump = ctx.bumps.game_state;

        msg!("Game initialized with authority: {}", game_state.authority);
        Ok(())
    }

    /// User deposits a bet for a specific sperm in a round
    pub fn deposit_bet(
        ctx: Context<DepositBet>,
        amount: u64,
        sperm_id: u8,
        round_id: u64,
    ) -> Result<()> {
        require!(sperm_id < 10, GameError::InvalidSpermId);
        require!(amount >= 10_000_000, GameError::BetTooSmall); // Min 0.01 SOL
        require!(amount <= 10_000_000_000, GameError::BetTooLarge); // Max 10 SOL
        require!(!ctx.accounts.game_state.is_paused, GameError::GamePaused);

        // Transfer SOL from user to vault
        let transfer_ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.user.key(),
            &ctx.accounts.vault.key(),
            amount,
        );
        anchor_lang::solana_program::program::invoke(
            &transfer_ix,
            &[
                ctx.accounts.user.to_account_info(),
                ctx.accounts.vault.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        // Record the bet
        let bet_record = &mut ctx.accounts.bet_record;
        bet_record.user = ctx.accounts.user.key();
        bet_record.amount = amount;
        bet_record.sperm_id = sperm_id;
        bet_record.round_id = round_id;
        bet_record.claimed = false;
        bet_record.payout_amount = 0;
        bet_record.bump = ctx.bumps.bet_record;

        // Update game state
        let game_state = &mut ctx.accounts.game_state;
        game_state.total_deposited = game_state.total_deposited.checked_add(amount).unwrap();

        msg!(
            "Bet placed: {} lamports on sperm {} for round {} by {}",
            amount,
            sperm_id,
            round_id,
            ctx.accounts.user.key()
        );

        Ok(())
    }

    /// Backend sets the payout amount for a winning bet
    pub fn set_payout(ctx: Context<SetPayout>, payout_amount: u64) -> Result<()> {
        require!(
            ctx.accounts.authority.key() == ctx.accounts.game_state.authority,
            GameError::Unauthorized
        );

        let bet_record = &mut ctx.accounts.bet_record;
        bet_record.payout_amount = payout_amount;

        msg!(
            "Payout set: {} lamports for bet by {}",
            payout_amount,
            bet_record.user
        );

        Ok(())
    }

    /// User claims their winnings
    pub fn claim_winnings(ctx: Context<ClaimWinnings>) -> Result<()> {
        let bet_record = &ctx.accounts.bet_record;
        
        require!(!bet_record.claimed, GameError::AlreadyClaimed);
        require!(bet_record.payout_amount > 0, GameError::NotAWinner);

        let payout = bet_record.payout_amount;

        // Transfer from vault to user
        let vault = &ctx.accounts.vault;
        let user = &ctx.accounts.user;

        **vault.to_account_info().try_borrow_mut_lamports()? = vault
            .to_account_info()
            .lamports()
            .checked_sub(payout)
            .ok_or(GameError::InsufficientFunds)?;
        **user.to_account_info().try_borrow_mut_lamports()? = user
            .to_account_info()
            .lamports()
            .checked_add(payout)
            .ok_or(GameError::Overflow)?;

        // Mark as claimed
        let bet_record = &mut ctx.accounts.bet_record;
        bet_record.claimed = true;

        msg!(
            "Winnings claimed: {} lamports by {}",
            payout,
            ctx.accounts.user.key()
        );

        Ok(())
    }

    /// Authority withdraws house fees
    pub fn withdraw_fees(ctx: Context<WithdrawFees>, amount: u64) -> Result<()> {
        require!(
            ctx.accounts.authority.key() == ctx.accounts.game_state.authority,
            GameError::Unauthorized
        );

        let vault = &ctx.accounts.vault;
        let authority = &ctx.accounts.authority;

        **vault.to_account_info().try_borrow_mut_lamports()? = vault
            .to_account_info()
            .lamports()
            .checked_sub(amount)
            .ok_or(GameError::InsufficientFunds)?;
        **authority.to_account_info().try_borrow_mut_lamports()? = authority
            .to_account_info()
            .lamports()
            .checked_add(amount)
            .ok_or(GameError::Overflow)?;

        msg!("Fees withdrawn: {} lamports", amount);

        Ok(())
    }

    /// Pause or unpause the game (emergency)
    pub fn set_paused(ctx: Context<SetPaused>, paused: bool) -> Result<()> {
        require!(
            ctx.accounts.authority.key() == ctx.accounts.game_state.authority,
            GameError::Unauthorized
        );

        ctx.accounts.game_state.is_paused = paused;
        msg!("Game paused: {}", paused);

        Ok(())
    }
}

// ===========================================
// Accounts
// ===========================================

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = 8 + GameState::INIT_SPACE,
        seeds = [b"game_state"],
        bump,
    )]
    pub game_state: Account<'info, GameState>,

    /// CHECK: Vault PDA for holding bets
    #[account(
        mut,
        seeds = [b"vault"],
        bump,
    )]
    pub vault: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(amount: u64, sperm_id: u8, round_id: u64)]
pub struct DepositBet<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [b"game_state"],
        bump = game_state.bump,
    )]
    pub game_state: Account<'info, GameState>,

    #[account(
        init,
        payer = user,
        space = 8 + BetRecord::INIT_SPACE,
        seeds = [b"bet", user.key().as_ref(), &round_id.to_le_bytes(), &[sperm_id]],
        bump,
    )]
    pub bet_record: Account<'info, BetRecord>,

    /// CHECK: Vault PDA
    #[account(
        mut,
        seeds = [b"vault"],
        bump,
    )]
    pub vault: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SetPayout<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        seeds = [b"game_state"],
        bump = game_state.bump,
    )]
    pub game_state: Account<'info, GameState>,

    #[account(mut)]
    pub bet_record: Account<'info, BetRecord>,
}

#[derive(Accounts)]
pub struct ClaimWinnings<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        constraint = bet_record.user == user.key() @ GameError::Unauthorized,
    )]
    pub bet_record: Account<'info, BetRecord>,

    /// CHECK: Vault PDA
    #[account(
        mut,
        seeds = [b"vault"],
        bump,
    )]
    pub vault: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct WithdrawFees<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        seeds = [b"game_state"],
        bump = game_state.bump,
    )]
    pub game_state: Account<'info, GameState>,

    /// CHECK: Vault PDA
    #[account(
        mut,
        seeds = [b"vault"],
        bump,
    )]
    pub vault: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SetPaused<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [b"game_state"],
        bump = game_state.bump,
    )]
    pub game_state: Account<'info, GameState>,
}

// ===========================================
// State
// ===========================================

#[account]
#[derive(InitSpace)]
pub struct GameState {
    /// Authority that can manage the game
    pub authority: Pubkey,
    /// Current round number
    pub current_round: u64,
    /// Total amount deposited (for tracking)
    pub total_deposited: u64,
    /// Whether the game is paused
    pub is_paused: bool,
    /// House fee percentage (0-100)
    pub house_fee_percent: u8,
    /// PDA bump
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct BetRecord {
    /// User who placed the bet
    pub user: Pubkey,
    /// Bet amount in lamports
    pub amount: u64,
    /// Sperm ID (0-9)
    pub sperm_id: u8,
    /// Round ID
    pub round_id: u64,
    /// Whether winnings have been claimed
    pub claimed: bool,
    /// Payout amount (set by backend after round ends)
    pub payout_amount: u64,
    /// PDA bump
    pub bump: u8,
}

// ===========================================
// Errors
// ===========================================

#[error_code]
pub enum GameError {
    #[msg("Invalid sperm ID. Must be 0-9.")]
    InvalidSpermId,
    #[msg("Bet amount too small. Minimum is 0.01 SOL.")]
    BetTooSmall,
    #[msg("Bet amount too large. Maximum is 10 SOL.")]
    BetTooLarge,
    #[msg("Game is paused.")]
    GamePaused,
    #[msg("Unauthorized action.")]
    Unauthorized,
    #[msg("Winnings already claimed.")]
    AlreadyClaimed,
    #[msg("Not a winner. No payout available.")]
    NotAWinner,
    #[msg("Insufficient funds in vault.")]
    InsufficientFunds,
    #[msg("Arithmetic overflow.")]
    Overflow,
}
