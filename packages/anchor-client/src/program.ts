import { Program, AnchorProvider, BN, Wallet } from '@coral-xyz/anchor';
import {
  Connection,
  PublicKey,
  Keypair,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';
import { IDL, SpermRace } from './idl';
import { ProgramAddresses, DepositBetParams, GameStateAccount, BetRecordAccount } from './types';

// Default program ID - update after deployment
const DEFAULT_PROGRAM_ID = new PublicKey('SpermRace111111111111111111111111111111111');

/**
 * Client for interacting with the Sperm Race Solana program
 */
export class SpermRaceClient {
  public program: Program<SpermRace>;
  public programId: PublicKey;
  private addresses: ProgramAddresses | null = null;

  constructor(
    connection: Connection,
    wallet: Wallet,
    programId: PublicKey = DEFAULT_PROGRAM_ID,
  ) {
    this.programId = programId;
    const provider = new AnchorProvider(connection, wallet, {
      commitment: 'confirmed',
    });
    this.program = new Program(IDL, programId, provider);
  }

  /**
   * Get PDA addresses for the program
   */
  async getAddresses(): Promise<ProgramAddresses> {
    if (this.addresses) {
      return this.addresses;
    }

    const [gameState, gameStateBump] = PublicKey.findProgramAddressSync(
      [Buffer.from('game_state')],
      this.programId,
    );

    const [vault, vaultBump] = PublicKey.findProgramAddressSync(
      [Buffer.from('vault')],
      this.programId,
    );

    this.addresses = {
      gameState,
      gameStateBump,
      vault,
      vaultBump,
    };

    return this.addresses;
  }

  /**
   * Get bet record PDA for a user's bet
   */
  getBetRecordPda(user: PublicKey, roundId: BN, spermId: number): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from('bet'),
        user.toBuffer(),
        roundId.toArrayLike(Buffer, 'le', 8),
        Buffer.from([spermId]),
      ],
      this.programId,
    );
  }

  /**
   * Fetch the game state account
   */
  async fetchGameState(): Promise<GameStateAccount | null> {
    try {
      const { gameState } = await this.getAddresses();
      const account = await this.program.account.gameState.fetch(gameState);
      return account as unknown as GameStateAccount;
    } catch {
      return null;
    }
  }

  /**
   * Fetch a bet record
   */
  async fetchBetRecord(
    user: PublicKey,
    roundId: BN,
    spermId: number,
  ): Promise<BetRecordAccount | null> {
    try {
      const [betRecordPda] = this.getBetRecordPda(user, roundId, spermId);
      const account = await this.program.account.betRecord.fetch(betRecordPda);
      return account as unknown as BetRecordAccount;
    } catch {
      return null;
    }
  }

  /**
   * Build instruction to initialize the game (authority only)
   */
  async buildInitializeIx(authority: PublicKey): Promise<TransactionInstruction> {
    const { gameState, vault } = await this.getAddresses();

    return await this.program.methods
      .initialize()
      .accounts({
        authority,
        gameState,
        vault,
        systemProgram: SystemProgram.programId,
      })
      .instruction();
  }

  /**
   * Build instruction to deposit a bet
   */
  async buildDepositBetIx(
    user: PublicKey,
    params: DepositBetParams,
  ): Promise<TransactionInstruction> {
    const { gameState, vault } = await this.getAddresses();
    const [betRecord] = this.getBetRecordPda(user, params.roundId, params.spermId);

    return await this.program.methods
      .depositBet(params.amount, params.spermId, params.roundId)
      .accounts({
        user,
        gameState,
        betRecord,
        vault,
        systemProgram: SystemProgram.programId,
      })
      .instruction();
  }

  /**
   * Build instruction to claim winnings
   */
  async buildClaimWinningsIx(
    user: PublicKey,
    roundId: BN,
    spermId: number,
  ): Promise<TransactionInstruction> {
    const { vault } = await this.getAddresses();
    const [betRecord] = this.getBetRecordPda(user, roundId, spermId);

    return await this.program.methods
      .claimWinnings()
      .accounts({
        user,
        betRecord,
        vault,
        systemProgram: SystemProgram.programId,
      })
      .instruction();
  }

  /**
   * Build a complete deposit bet transaction
   * This is what the frontend will use
   */
  async buildDepositBetTx(
    user: PublicKey,
    params: DepositBetParams,
  ): Promise<Transaction> {
    const ix = await this.buildDepositBetIx(user, params);
    const tx = new Transaction().add(ix);
    return tx;
  }

  /**
   * Build a complete claim winnings transaction
   */
  async buildClaimWinningsTx(
    user: PublicKey,
    roundId: BN,
    spermId: number,
  ): Promise<Transaction> {
    const ix = await this.buildClaimWinningsIx(user, roundId, spermId);
    const tx = new Transaction().add(ix);
    return tx;
  }
}

/**
 * Create a read-only client (no wallet needed)
 */
export function createReadOnlyClient(
  connection: Connection,
  programId?: PublicKey,
): SpermRaceClient {
  // Create a dummy wallet for read-only operations
  const dummyKeypair = Keypair.generate();
  const dummyWallet: Wallet = {
    publicKey: dummyKeypair.publicKey,
    signTransaction: async (tx) => tx,
    signAllTransactions: async (txs) => txs,
    payer: dummyKeypair,
  };

  return new SpermRaceClient(connection, dummyWallet, programId);
}
