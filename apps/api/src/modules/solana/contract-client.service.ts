import { Injectable, Logger } from '@nestjs/common';
import { Connection, PublicKey, SystemProgram } from '@solana/web3.js';
import { Program, AnchorProvider, BN, Wallet, Idl } from '@coral-xyz/anchor';
import { SpermRace } from '@sperm-race/contracts';
import * as IDL from '@sperm-race/contracts/idl';

/**
 * Service that provides a typed Anchor program client for the Sperm Race contract
 */
@Injectable()
export class ContractClientService {
  private readonly logger = new Logger(ContractClientService.name);
  private program: Program<SpermRace> | null = null;

  /**
   * Initialize the program client
   */
  initialize(connection: Connection, wallet: Wallet, programId: PublicKey): void {
    const provider = new AnchorProvider(connection, wallet, {
      commitment: 'confirmed',
    });
    
    // Import the JSON IDL directly from @sperm-race/contracts/idl
    // This uses the monorepo package resolution, similar to importing types
    // Program constructor: (IDL, provider) - programId is in the IDL
    // If IDL has different address, we override it
    const idlWithProgramId = {
      ...IDL,
      address: programId.toBase58(),
    };
    this.program = new Program<SpermRace>(idlWithProgramId as Idl, provider);
    this.logger.log(`Contract client initialized with program ID: ${programId.toBase58()}`);
  }

  /**
   * Get the Anchor program instance
   */
  getProgram(): Program<SpermRace> {
    if (!this.program) {
      throw new Error('Contract client not initialized. Call initialize() first.');
    }
    return this.program;
  }

  /**
   * Get global state PDA
   */
  getGlobalStatePda(programId: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('global_state')],
      programId,
    );
  }

  /**
   * Get round account PDA
   */
  getRoundAccountPda(programId: PublicKey, roundId: BN): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('round'), roundId.toArrayLike(Buffer, 'le', 8)],
      programId,
    );
  }

  /**
   * Fetch global state account
   */
  async fetchGlobalState(programId: PublicKey): Promise<{
    authority: PublicKey;
    currentRound: BN;
  } | null> {
    try {
      const [globalStatePda] = this.getGlobalStatePda(programId);
      const account = await this.getProgram().account.globalState.fetch(globalStatePda);
      
      return {
        authority: account.authority,
        currentRound: account.currentRound,
      };
    } catch (error: any) {
      if (error.message?.includes('Account does not exist')) {
        return null;
      }
      return null
    }
  }

  /**
   * Fetch round account
   */
  async fetchRoundAccount(programId: PublicKey, roundId: BN): Promise<{
    roundId: BN;
    hashedSeed: number[];
    winnerId: number;
    isLocked: boolean;
    totalPot: BN;
    isResolved: boolean;
    betsPerSperm: BN[];
  } | null> {
    try {
      const [roundAccountPda] = this.getRoundAccountPda(programId, roundId);
      const account = await this.getProgram().account.roundAccount.fetch(roundAccountPda);
      
      return {
        roundId: account.roundId,
        hashedSeed: Array.from(account.hashedSeed),
        winnerId: account.winnerId,
        isLocked: account.isLocked,
        totalPot: account.totalPot,
        isResolved: account.isResolved,
        betsPerSperm: account.betsPerSperm,
      };
    } catch (error: any) {
      if (error.message?.includes('Account does not exist')) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Initialize the game with authority and treasury wallet pubkeys
   */
  async initializeGame(
    programId: PublicKey,
    authority: PublicKey,
    treasury: PublicKey,
  ): Promise<string> {
    const program = this.getProgram();
    const [globalStatePda] = this.getGlobalStatePda(programId);

    const tx = await program.methods
      .initializeGame(treasury)
      .accounts({
        globalState: globalStatePda,
        babyKingVault: this.getBabyKingVaultPda(programId)[0],
        authority: authority,
        systemProgram: SystemProgram.programId,
      } as any)
      .rpc();

    return tx;
  }

  /**
   * Get baby king vault PDA
   */
  getBabyKingVaultPda(programId: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('baby_king_vault')],
      programId,
    );
  }

  /**
   * Start a new round
   */
  async startRound(
    programId: PublicKey,
    authority: PublicKey,
    hashedSeed: number[],
    roundId: BN,
  ): Promise<string> {
    const program = this.getProgram();
    const [globalStatePda] = this.getGlobalStatePda(programId);
    const [roundAccountPda] = this.getRoundAccountPda(programId, roundId);

    const x = await program.account.globalState.fetch(globalStatePda)

    // Convert hashedSeed array to [u8; 32]
    const hashedSeedArray = new Uint8Array(32);
    for (let i = 0; i < 32 && i < hashedSeed.length; i++) {
      hashedSeedArray[i] = hashedSeed[i];
    }

    const tx = await program.methods
      .startRound(roundId, Array.from(hashedSeedArray))
      .accounts({
        globalState: globalStatePda,
        roundAccount: roundAccountPda,
        authority: authority,
        systemProgram: SystemProgram.programId,
      } as any)
      .rpc();

    return tx;
  }

  /**
   * Lock betting for the current round
   */
  async lockBetting(
    programId: PublicKey,
    authority: PublicKey,
    roundId: BN,
  ): Promise<string> {
    const program = this.getProgram();
    const [globalStatePda] = this.getGlobalStatePda(programId);
    const [roundAccountPda] = this.getRoundAccountPda(programId, roundId);

    const tx = await program.methods
      .lockBetting()
      .accounts({
        globalState: globalStatePda,
        roundAccount: roundAccountPda,
        authority: authority,
      } as any)
      .rpc();

    return tx;
  }

  /**
   * Resolve the round with winner and server seed
   */
  async resolveRound(
    programId: PublicKey,
    authority: PublicKey,
    roundId: BN,
    winnerId: number,
    serverSeed: number[],
  ): Promise<string> {
    const program = this.getProgram();
    const [globalStatePda] = this.getGlobalStatePda(programId);
    const [roundAccountPda] = this.getRoundAccountPda(programId, roundId);

    // Convert serverSeed array to [u8; 32]
    const serverSeedArray = new Uint8Array(32);
    for (let i = 0; i < 32 && i < serverSeed.length; i++) {
      serverSeedArray[i] = serverSeed[i];
    }

    const tx = await program.methods
      .resolveRound(winnerId, Array.from(serverSeedArray))
      .accounts({
        globalState: globalStatePda,
        roundAccount: roundAccountPda,
        authority: authority,
      } as any)
      .rpc();

    return tx;
  }
}
