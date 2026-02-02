'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL, Transaction } from '@solana/web3.js';
import { Program, AnchorProvider, BN, Idl } from '@coral-xyz/anchor';
import { SpermRace } from '@sperm-race/contracts';
import * as IDL from '@sperm-race/contracts/idl';
import '@solana/wallet-adapter-react-ui/styles.css';

const WalletMultiButton = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false },
);

const PROGRAM_ID = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID!);

export default function Home() {
  const { connection } = useConnection();
  const { publicKey, wallet, connected } = useWallet();
  const [betting, setBetting] = useState(false);
  const [roundId, setRoundId] = useState<string>('0');
  const [betAmount, setBetAmount] = useState<string>('0.1');

  // CHANGED: Use a Set to track multiple selected sperm
  const [selectedSperms, setSelectedSperms] = useState<Set<number>>(new Set());

  const [message, setMessage] = useState<string>('');
  const [program, setProgram] = useState<Program<SpermRace> | null>(null);
  const [balance, setBalance] = useState<number | null>(null);

  // Claim winnings
  const [claimRoundId, setClaimRoundId] = useState<string>('0');
  const [claimSpermId, setClaimSpermId] = useState<string>('0');
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (connection && wallet?.adapter) {
      const provider = new AnchorProvider(connection, wallet.adapter as any, {
        commitment: 'confirmed',
      });

      const idlWithProgramId = { ...IDL, address: PROGRAM_ID.toBase58() };
      const programInstance = new Program<SpermRace>(idlWithProgramId as Idl, provider);
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
  const getRoundAccountPda = (roundId: number): PublicKey => {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from('round'), new BN(roundId).toArrayLike(Buffer, 'le', 8)],
      PROGRAM_ID,
    );
    return pda;
  };

  const getGlobalStatePda = (): PublicKey => {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from('global_state')],
      PROGRAM_ID,
    );
    return pda;
  };

  const getBabyKingVaultPda = (): PublicKey => {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from('baby_king_vault')],
      PROGRAM_ID,
    );
    return pda;
  };

  // UPDATED: Now includes spermId in seeds (matches contract: bet + user + round_id + sperm_id)
  const getBetRecordPda = (user: PublicKey, roundId: number, spermId: number): PublicKey => {
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
  };

  const toggleSpermSelection = (id: number) => {
    const newSelection = new Set(selectedSperms);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedSperms(newSelection);
  };

  const handlePlaceBet = async () => {
    if (!publicKey || !connection || !program) {
      setMessage('Connect wallet first');
      return;
    }

    if (selectedSperms.size === 0) {
      setMessage('Select at least one sperm');
      return;
    }

    const amountPerSperm = parseFloat(betAmount);
    if (isNaN(amountPerSperm) || amountPerSperm <= 0) {
      setMessage('Invalid amount');
      return;
    }

    const roundIdNum = parseInt(roundId);
    setBetting(true);
    setMessage(`Preparing batch bet for ${selectedSperms.size} positions...`);

    try {
      const lamports = Math.floor(amountPerSperm * LAMPORTS_PER_SOL);
      const transaction = new Transaction();
      const roundAccountPda = getRoundAccountPda(roundIdNum);

      // Loop through all selected sperms and add instructions to ONE transaction
      for (const spermId of Array.from(selectedSperms)) {
        const betRecordPda = getBetRecordPda(publicKey, roundIdNum, spermId);
        console.log("BET_RECORD & sperm_id: ", roundAccountPda.toString(), spermId)

        const ix = await program.methods
          .placeBet(new BN(roundIdNum), spermId, new BN(lamports))
          .accounts({
            roundAccount: roundAccountPda,
            betRecord: betRecordPda,
            user: publicKey,
            systemProgram: SystemProgram.programId,
          } as any)
          .instruction();

        transaction.add(ix);
      }

      // Send the batch transaction
      const tx = await program.provider.sendAndConfirm!(transaction);

      setMessage(`Batch bet successful! Tx: ${tx.substring(0, 8)}...`);
      setSelectedSperms(new Set()); // Clear selection
    } catch (error: any) {
      console.error(error);
      setMessage(`Error: ${error.message || 'Transaction failed'}`);
    } finally {
      setBetting(false);
    }
  };

  const handleClaimWinnings = async () => {
    if (!publicKey || !program || !connection) {
      setMessage('Connect wallet first');
      return;
    }

    setClaiming(true);
    setMessage('Claiming winnings...');

    try {
      const rId = parseInt(claimRoundId);
      const sId = parseInt(claimSpermId);

      const roundAccountPda = getRoundAccountPda(rId);
      const globalStatePda = getGlobalStatePda();
      const babyKingVaultPda = getBabyKingVaultPda();
      const betRecordPda = getBetRecordPda(publicKey, rId, sId);

      // Treasury is stored in global_state; must be passed explicitly per IDL
      const globalState = await program.account.globalState.fetch(globalStatePda);
      const treasury = globalState.treasury as PublicKey;

      console.log("ROUNDACCOUNT: ", roundAccountPda.toString())
      // console.log("BET: ", getBetRecordPda(publicKey, 16, 8).toString())
      const tx = await program.methods
        .claimWinnings(sId)
        .accounts({
          roundAccount: roundAccountPda,
          globalState: globalStatePda,
          babyKingVault: babyKingVaultPda,
          betRecord: betRecordPda,
          user: publicKey,
          treasury,
        } as any)
        .rpc();

      setMessage(`Claim successful! Signature: ${tx.substring(0, 8)}`);

      const newBalance = await connection.getBalance(publicKey);
      setBalance(newBalance);
    } catch (error: any) {
      console.error(error);
      setMessage(`Claim failed: ${error.message || 'Are you sure you won?'}`);
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header (Simplified for brevity) */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Sperm Race</h1>
        <div className="flex gap-4 items-center">
          {balance !== null && (
            <span className="text-sm">{(balance / LAMPORTS_PER_SOL).toFixed(3)} SOL</span>
          )}
          <WalletMultiButton />
        </div>
      </div>

      <div className="flex p-6 gap-6 h-[calc(100vh-80px)]">
        {/* Placeholder Chat/Gameplay Left/Middle */}
        <div className="flex-1 bg-gray-900 rounded-2xl border border-gray-800 flex items-center justify-center">
          <p className="text-gray-500 italic">Gameplay Visualization Area</p>
        </div>

        {/* Betting Panel Right */}
        <div className="w-80 flex flex-col gap-4 bg-gray-900 p-5 rounded-2xl border border-gray-800">
          <h2 className="text-lg font-semibold">Place Batch Bet</h2>

          <div>
            <label className="text-xs text-gray-400">Round ID</label>
            <input
              type="number"
              value={roundId}
              onChange={(e) => setRoundId(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 mt-1"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400">Select Sperm (Multiple allowed)</label>
            <div className="grid grid-cols-5 gap-2 mt-2">
              {Array.from({ length: 10 }, (_, i) => (
                <button
                  key={i}
                  onClick={() => toggleSpermSelection(i)}
                  className={`h-10 rounded-lg text-xs font-bold transition-all border ${
                    selectedSperms.has(i)
                      ? 'bg-white text-black border-white'
                      : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-500'
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400">Amount per Sperm (SOL)</label>
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 mt-1"
            />
          </div>

          <button
            onClick={handlePlaceBet}
            disabled={betting || !connected}
            className="w-full py-3 bg-white text-black font-bold rounded-xl disabled:opacity-50 mt-2"
          >
            {betting ? 'Processing...' : `Bet on ${selectedSperms.size} Sperm`}
          </button>

          {message && (
            <div className="mt-2 p-3 text-xs bg-gray-800 rounded-lg border border-gray-700 text-gray-300">
              {message}
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-800">
            <h2 className="text-lg font-semibold text-white mb-4">Claim Winnings</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400">Round ID to Claim</label>
                <input
                  type="number"
                  value={claimRoundId}
                  onChange={(e) => setClaimRoundId(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 mt-1 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400">Winning Sperm ID</label>
                <input
                  type="number"
                  value={claimSpermId}
                  onChange={(e) => setClaimSpermId(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 mt-1 text-sm"
                />
              </div>
              <button
                onClick={handleClaimWinnings}
                disabled={claiming || !connected}
                className="w-full p-1 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl disabled:opacity-50 transition-colors shadow-lg"
              >
                {claiming ? 'Processing...' : 'Claim SOL'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
