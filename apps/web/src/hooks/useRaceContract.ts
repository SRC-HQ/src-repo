import { useEffect, useState, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, LAMPORTS_PER_SOL, Transaction } from '@solana/web3.js';
import { Program, AnchorProvider, BN, Idl } from '@coral-xyz/anchor';
import { SpermRace } from '@sperm-race/contract-types';
import * as IDL from '@sperm-race/contract-types/idl';
import { useWalletBalance } from './useWalletBalance';

const PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_PROGRAM_ID ?? '2y2AdrVLKqwcA5GQEC1ULEHac3hH9ck565UBqzPaReJZ',
);

export const useRaceContract = () => {
  const { connection } = useConnection();
  const { publicKey, wallet } = useWallet();
  const { refetch: refetchBalance } = useWalletBalance();

  const [program, setProgram] = useState<Program<SpermRace> | null>(null);
  const [babyKingTotal, setBabyKingTotal] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!connection) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const walletOrDummy = (wallet?.adapter as any) ?? {
      publicKey: new PublicKey('11111111111111111111111111111111'),
      signTransaction: async (tx: Transaction) => tx,
      signAllTransactions: async (txs: Transaction[]) => txs,
    };

    const provider = new AnchorProvider(connection, walletOrDummy, {
      commitment: 'confirmed',
    });
    const idlWithProgramId = { ...IDL, address: PROGRAM_ID.toBase58() };
    const programInstance = new Program<SpermRace>(idlWithProgramId as Idl, provider);
    setProgram(programInstance);
  }, [connection, wallet]);

  // PDA Helpers
  const getRoundAccountPda = useCallback((roundId: number): PublicKey => {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from('round'), new BN(roundId).toArrayLike(Buffer, 'le', 8)],
      PROGRAM_ID,
    );
    return pda;
  }, []);

  const getBetRecordPda = useCallback(
    (user: PublicKey, roundId: number, spermId: number): PublicKey => {
      const [pda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('bet'),
          user.toBuffer(),
          new BN(roundId).toArrayLike(Buffer, 'le', 8),
          Buffer.from([spermId]),
        ],
        PROGRAM_ID,
      );
      return pda;
    },
    [],
  );

  const getGlobalStatePda = useCallback((): PublicKey => {
    const [pda] = PublicKey.findProgramAddressSync([Buffer.from('global_state')], PROGRAM_ID);
    return pda;
  }, []);

  const getBabyKingVaultPda = useCallback((): PublicKey => {
    const [pda] = PublicKey.findProgramAddressSync([Buffer.from('baby_king_vault')], PROGRAM_ID);
    return pda;
  }, []);

  useEffect(() => {
    if (!program) {
      setBabyKingTotal(null);
      return;
    }
    const fetchBabyKing = async () => {
      try {
        const pda = getBabyKingVaultPda();
        const vault = await program.account.babyKingVault.fetch(pda);
        console.log(vault);
        const total = (vault as { totalAccumulated: BN }).totalAccumulated;
        setBabyKingTotal(total.toString());
      } catch (e) {
        console.error('[useRaceContract] Failed to fetch baby king vault:', e);
        setBabyKingTotal(null);
      }
    };
    fetchBabyKing();
    const interval = setInterval(fetchBabyKing, 10000);
    return () => clearInterval(interval);
  }, [program, getBabyKingVaultPda]);

  const placeBet = useCallback(
    async (roundId: number, selectedSperms: Set<number>, amountPerSperm: number) => {
      if (!publicKey || !program) {
        throw new Error('Wallet not connected');
      }

      setLoading(true);
      setError(null);

      try {
        const lamports = Math.floor(amountPerSperm * LAMPORTS_PER_SOL);
        const transaction = new Transaction();

        for (const spermId of Array.from(selectedSperms)) {
          const betRecordPda = getBetRecordPda(publicKey, roundId, spermId);

          const ix = await program.methods
            .placeBet(new BN(roundId), spermId, new BN(lamports))
            .accounts({
              betRecord: betRecordPda,
              user: publicKey,
            })
            .instruction();

          transaction.add(ix);
        }

        const tx = await program.provider.sendAndConfirm?.(transaction);
        if (!tx) throw new Error('Transaction failed');
        setLoading(false);
        return tx;
      } catch (err: unknown) {
        console.error(err);
        setError((err as Error).message || 'Transaction failed');
        setLoading(false);
        throw err;
      }
    },
    [publicKey, program, getBetRecordPda],
  );

  const claimWinnings = useCallback(
    async (roundId: number, spermId: number) => {
      if (!publicKey || !program) {
        throw new Error('Wallet not connected');
      }

      setLoading(true);
      setError(null);

      try {
        const globalStatePda = getGlobalStatePda();
        const roundAccountPda = getRoundAccountPda(roundId);
        const betRecordPda = getBetRecordPda(publicKey, roundId, spermId);

        const globalState = await program.account.globalState.fetch(globalStatePda);
        const treasury = globalState.treasury as PublicKey;

        const tx = await program.methods
          .claimWinnings(spermId)
          .accounts({
            roundAccount: roundAccountPda,
            betRecord: betRecordPda,
            user: publicKey,
            treasury,
          })
          .rpc();

        await refetchBalance?.();

        setLoading(false);
        return tx;
      } catch (err: unknown) {
        console.error(err);
        setError((err as Error).message || 'Claim failed');
        setLoading(false);
        throw err;
      }
    },
    [publicKey, program, refetchBalance, getRoundAccountPda, getBetRecordPda, getGlobalStatePda],
  );

  /** Batch claim multiple winnings in a single transaction */
  const batchClaimWinnings = useCallback(
    async (claims: { roundId: number; spermId: number }[]) => {
      if (!publicKey || !program) {
        throw new Error('Wallet not connected');
      }
      if (claims.length === 0) {
        throw new Error('No claims to process');
      }

      setLoading(true);
      setError(null);

      try {
        const globalStatePda = getGlobalStatePda();
        const globalState = await program.account.globalState.fetch(globalStatePda);
        const treasury = globalState.treasury as PublicKey;

        const transaction = new Transaction();
        for (const { roundId, spermId } of claims) {
          const roundAccountPda = getRoundAccountPda(roundId);
          const betRecordPda = getBetRecordPda(publicKey, roundId, spermId);

          const ix = await program.methods
            .claimWinnings(spermId)
            .accounts({
              roundAccount: roundAccountPda,
              betRecord: betRecordPda,
              user: publicKey,
              treasury,
            })
            .instruction();

          transaction.add(ix);
        }

        const tx = await program.provider.sendAndConfirm?.(transaction);
        if (!tx) throw new Error('Transaction failed');
        await refetchBalance?.();
        setLoading(false);
        return tx;
      } catch (err: unknown) {
        console.error(err);
        setError((err as Error).message || 'Claim failed');
        setLoading(false);
        throw err;
      }
    },
    [publicKey, program, refetchBalance, getRoundAccountPda, getBetRecordPda, getGlobalStatePda],
  );

  return {
    babyKingTotal,
    placeBet,
    claimWinnings,
    batchClaimWinnings,
    loading,
    error,
    program,
  };
};
