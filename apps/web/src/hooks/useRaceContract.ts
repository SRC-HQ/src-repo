import { useEffect, useState, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL, Transaction } from '@solana/web3.js';
import { Program, AnchorProvider, BN, Idl } from '@coral-xyz/anchor';
// import { SpermRace } from '@sperm-race/contracts';
// import * as IDL from '@sperm-race/contracts/idl';

const PROGRAM_ID = new PublicKey('HntbeNBqUZuFpXXeQNKa2XFZKYS2gnUfUR1osCgS2S1E');

export const useRaceContract = () => {
  const { connection } = useConnection();
  const { publicKey, wallet } = useWallet();

  const [program, setProgram] = useState<Program<Idl> | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (connection && wallet?.adapter) {
      const provider = new AnchorProvider(connection, wallet.adapter as any, {
        commitment: 'confirmed',
      });

      const idlWithProgramId = { address: PROGRAM_ID.toBase58() };
      // Note: We're casting to Idl because we don't have the JSON file imported yet
      // In a real scenario, we should import the IDL JSON
      const programInstance = new Program<Idl>(idlWithProgramId as Idl, provider);
      setProgram(programInstance);
    }
  }, [connection, wallet]);

  useEffect(() => {
    if (!publicKey || !connection) {
      setBalance(null);
      return;
    }
    const fetchBalance = async () => {
      try {
        const balance = await connection.getBalance(publicKey);
        setBalance(balance);
      } catch (e) {
        console.error(e);
      }
    };
    fetchBalance();
    const interval = setInterval(fetchBalance, 5000);
    return () => clearInterval(interval);
  }, [publicKey, connection]);

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
        const roundAccountPda = getRoundAccountPda(roundId);

        for (const spermId of Array.from(selectedSperms)) {
          const betRecordPda = getBetRecordPda(publicKey, roundId, spermId);

          const ix = await program.methods
            .placeBet(new BN(roundId), spermId, new BN(lamports))
            .accounts({
              roundAccount: roundAccountPda,
              betRecord: betRecordPda,
              user: publicKey,
              systemProgram: SystemProgram.programId,
            } as any)
            .instruction();

          transaction.add(ix);
        }

        const tx = await program.provider.sendAndConfirm!(transaction);
        setLoading(false);
        return tx;
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Transaction failed');
        setLoading(false);
        throw err;
      }
    },
    [publicKey, program, getRoundAccountPda, getBetRecordPda],
  );

  const claimWinnings = useCallback(
    async (roundId: number, spermId: number) => {
      if (!publicKey || !program) {
        throw new Error('Wallet not connected');
      }

      setLoading(true);
      setError(null);

      try {
        const roundAccountPda = getRoundAccountPda(roundId);
        const betRecordPda = getBetRecordPda(publicKey, roundId, spermId);

        const tx = await program.methods
          .claimWinnings()
          .accounts({
            roundAccount: roundAccountPda,
            betRecord: betRecordPda,
            user: publicKey,
          } as any)
          .rpc();

        // Refresh balance
        const newBalance = await connection.getBalance(publicKey);
        setBalance(newBalance);

        setLoading(false);
        return tx;
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Claim failed');
        setLoading(false);
        throw err;
      }
    },
    [publicKey, program, connection, getRoundAccountPda, getBetRecordPda],
  );

  return {
    balance,
    placeBet,
    claimWinnings,
    loading,
    error,
    program,
  };
};
