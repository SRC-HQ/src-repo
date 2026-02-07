import React, { useEffect } from 'react';
import Image from 'next/image';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useGameStore } from '../../store/gameStore';
import XIcon from '../svgs/XIcon';
import DiscordIcon from '../svgs/DiscordIcon';

export const Navbar = () => {
  const { connected, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const { setWalletConnected, hasWinnings } = useGameStore();

  useEffect(() => {
    setWalletConnected(connected);
  }, [connected, setWalletConnected]);

  return (
    <div className="h-16 flex-shrink-0 bg-game-bg border-b border-white/10 flex items-center justify-between px-4 z-50">
      {/* Left Side: Logo & Nav */}
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8">
            <Image
              src="/assets/src-logo.png"
              alt="Sperm Race Club"
              fill
              className="object-contain"
            />
          </div>
          <span className="font-bold text-white uppercase tracking-wider text-sm font-sans">
            Sperm Race Club
          </span>
        </div>

        {/* Nav Items */}
        <nav className="flex items-center gap-6 hidden md:flex">
          <a
            href="https://spermrace.club#about"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/60 hover:text-white transition-colors text-xs font-sans uppercase tracking-wider font-bold"
          >
            About
          </a>
          <button className="text-white/60 hover:text-white transition-colors text-xs font-sans uppercase tracking-wider font-bold">
            Leaderboard
          </button>
        </nav>
      </div>

      {/* Right Side: Actions */}
      <div className="flex items-center gap-4">
        {/* Social Icons */}
        <div className="flex items-center gap-4 mr-2">
          <a
            href="https://x.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary text-white/60 transition-colors hover:scale-110"
            aria-label="Follow us on X (Twitter)"
          >
            <XIcon className="size-4 w-4 h-4" />
          </a>
          <a
            href="https://discord.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/60 transition-colors hover:scale-110 hover:text-primary"
            aria-label="Join our Discord"
          >
            <DiscordIcon className="size-5 w-5 h-5" />
          </a>
        </div>

        {/* Claim Winnings Button (Conditional) */}
        {hasWinnings && (
          <button className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xs py-2 px-4 rounded-lg animate-shake shadow-[0_0_15px_rgba(234,179,8,0.3)] transition-colors truncate font-mono">
            Claim Winnings
          </button>
        )}

        {/* User Avatar / Connect Button */}
        <div className="flex-shrink-0">
          {connected ? (
            <div
              onClick={disconnect}
              className="w-10 h-10 rounded-full border border-white/20 bg-gray-700 flex items-center justify-center overflow-hidden cursor-pointer hover:border-white/40 transition-colors"
              title="Disconnect Wallet"
            >
              {/* Placeholder Avatar */}
              <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-500"></div>
            </div>
          ) : (
            <button
              onClick={() => setVisible(true)}
              className="h-10 px-4 bg-primary hover:bg-primary/90 text-black text-xs font-bold rounded-full transition-all flex items-center gap-2"
            >
              <span>Connect Wallet</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
