import React, { useEffect, useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import Image from 'next/image';
import SpmSwimSprite from '../sprites/SpmSwimSprite';
import SolColorIconSvg from '../svgs/SolColorIconSvg';
import { RACER_COLORS } from '../../game/constants';

export const LeftSidebar = () => {
  const startTime = useGameStore((state) => state.startTime);
  const mode = useGameStore((state) => state.mode);

  const [timeLeft, setTimeLeft] = useState<string>('00:00');
  const [betMode, setBetMode] = useState<'manual' | 'auto'>('manual');
  const [selectedRacers, setSelectedRacers] = useState<number[]>([]);

  // Auto mode states
  const [autoMatches, setAutoMatches] = useState<number>(0);
  const [betAmount, setBetAmount] = useState<number>(0);

  const isManualValid = betAmount > 0 && selectedRacers.length > 0;
  const isAutoValid = betAmount > 0 && selectedRacers.length > 0 && autoMatches > 0;
  const isValid = betMode === 'manual' ? isManualValid : isAutoValid;

  useEffect(() => {
    const updateTimer = () => {
      if (mode === 'PREPARATION') {
        const remaining = Math.max(0, Math.ceil((startTime - Date.now()) / 1000));
        const mins = Math.floor(remaining / 60)
          .toString()
          .padStart(2, '0');
        const secs = (remaining % 60).toString().padStart(2, '0');
        setTimeLeft(`${mins}:${secs}`);
      } else if (mode === 'RACE') {
        setTimeLeft('RACING');
      } else {
        setTimeLeft('ENDED');
      }
    };

    updateTimer(); // Initial call
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [startTime, mode]);

  return (
    <div className="w-80 flex-shrink-0 bg-game-bg border-r border-white/10 flex flex-col h-full overflow-hidden text-white font-mono">
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-4">
        {/* Top Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Baby King */}
          <div className="group rounded-lg border border-white/10 bg-game-card/10 p-3 flex flex-col items-center justify-center">
            <div className="flex items-center gap-2 mb-1">
              <SpmSwimSprite color="white" animating={false} className="w-6 h-6" />
              <span className="font-bold text-base font-sans">20.4</span>
            </div>
            <span className="text-[10px] font-sans tracking-wider text-white/60">Baby King</span>
          </div>

          {/* Time Remaining */}
          <div className="group rounded-lg border border-white/10 bg-game-card/10 p-3 flex flex-col items-center justify-center">
            <div className="h-6 flex items-center mb-1">
              <span className="font-bold text-base font-sans">{timeLeft}</span>
            </div>
            <span className="text-[10px] font-sans tracking-wider text-white/60">
              Time Remaining
            </span>
          </div>

          {/* Prize Pool */}
          <div className="group rounded-lg border border-white/10 bg-game-card/10 p-3 flex flex-col items-center justify-center">
            <div className="flex items-center gap-1 mb-1">
              <SolColorIconSvg className="w-4 h-4" />
              <span className="font-bold text-base font-sans">11.4522</span>
            </div>
            <span className="text-[10px] font-sans tracking-wider text-white/60">Prize Pool</span>
          </div>

          {/* Your Position */}
          <div className="group rounded-lg border border-white/10 bg-game-card/10 p-3 flex flex-col items-center justify-center">
            <div className="h-6 flex items-center mb-1">
              <span className="font-bold text-base font-sans">--</span>
            </div>
            <span className="text-[10px] font-sans tracking-wider text-white/60">
              Your Position
            </span>
          </div>
        </div>

        {/* Select Your Racer */}
        <div className="flex flex-col gap-4 mt-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-sans text-sm tracking-wider">Select Your Racer</h3>
            <button
              onClick={() => {
                if (selectedRacers.length === 10) {
                  setSelectedRacers([]);
                } else {
                  setSelectedRacers(Array.from({ length: 10 }).map((_, i) => i));
                }
              }}
              className="flex items-center gap-2 group cursor-pointer"
            >
              <div
                className={`
                w-3 h-3 rounded-sm border-2 flex items-center justify-center transition-all duration-200
                ${selectedRacers.length === 10 ? 'border-primary bg-primary/20' : 'border-white/40 group-hover:border-white/60'}
              `}
              >
                <div
                  className={`
                  w-1.5 h-1.5 rounded-sm bg-primary transition-all duration-200
                  ${selectedRacers.length === 10 ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}
                `}
                />
              </div>
              <span className="text-xs font-sans text-white/60 group-hover:text-white/80 transition-colors">
                Select All
              </span>
            </button>
          </div>
          <div className="grid grid-cols-5 gap-x-2 px-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setSelectedRacers((prev) =>
                    prev.includes(i) ? prev.filter((r) => r !== i) : [...prev, i],
                  );
                }}
                className={`
                  aspect-square flex items-center justify-center
                  transition-all duration-200
                  ${selectedRacers.includes(i) ? 'scale-125 drop-shadow-[0_0_5px_rgba(182,176,255,0.8)]' : 'hover:opacity-80 opacity-60 grayscale-[0.5]'}
                `}
              >
                <SpmSwimSprite
                  color={RACER_COLORS[i]}
                  className="w-full h-full"
                  animating={selectedRacers.includes(i)}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Betting Interface */}
        <div className="flex flex-col gap-3 mt-auto">
          <div className="rounded-lg border border-white/10 bg-game-card/10 p-4 relative overflow-hidden">
            {/* Tabs */}
            <div className="flex bg-black/20 rounded-lg p-1 mb-4 relative z-10">
              <button
                onClick={() => setBetMode('manual')}
                className={`flex-1 py-1.5 text-sm font-sans rounded-md transition-all duration-300 ${betMode === 'manual' ? 'bg-white/10 text-white shadow-lg' : 'text-white/40 hover:text-white/60'}`}
              >
                Manual
              </button>
              <button
                onClick={() => setBetMode('auto')}
                className={`flex-1 py-1.5 text-sm font-sans rounded-md transition-all duration-300 ${betMode === 'auto' ? 'bg-white/10 text-white shadow-lg' : 'text-white/40 hover:text-white/60'}`}
              >
                Auto
              </button>
            </div>

            {/* Wallet Balance & Quick Amount */}
            <div className="flex justify-between items-center mb-4 relative z-10">
              <div className="flex items-center gap-2 text-xs text-white/60 font-sans">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-4 h-4"
                >
                  <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
                  <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
                  <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h2v-4Z" />
                </svg>
                <span>0 SOL</span>
              </div>
              <div className="flex gap-1.5">
                {[1, 0.5, 0.1].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setBetAmount((prev) => +(prev + amount).toFixed(2))}
                    className="w-10 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-sans transition-colors flex items-center justify-center"
                  >
                    +{amount}
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Content */}
            {betMode === 'manual' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SolColorIconSvg className="w-6 h-6" />
                    <span className="font-bold font-sans">SOL</span>
                  </div>
                  <input
                    type="number"
                    value={betAmount || ''}
                    onChange={(e) => setBetAmount(Number(e.target.value))}
                    className="bg-transparent text-right text-2xl font-bold w-32 focus:outline-none font-sans text-white/90 placeholder:text-white/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="1.0"
                    step="0.1"
                  />
                </div>
              </div>
            )}

            {/* Auto Content */}
            {betMode === 'auto' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300 relative z-10">
                {/* SOL Amount */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SolColorIconSvg className="w-6 h-6" />
                    <span className="font-bold font-sans">SOL</span>
                  </div>
                  <input
                    type="number"
                    value={betAmount || ''}
                    onChange={(e) => setBetAmount(Number(e.target.value))}
                    className="bg-transparent text-right text-2xl font-bold w-32 focus:outline-none font-sans text-white/90 placeholder:text-white/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="1.0"
                    step="0.1"
                  />
                </div>

                {/* Racers Count */}
                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-2 text-white/80 group-hover:text-white transition-colors">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="w-5 h-5 opacity-70"
                    >
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                    </svg>
                    <span className="font-bold font-sans">Racers</span>
                  </div>
                  <span className="text-2xl font-bold font-sans">{selectedRacers.length}</span>
                </div>

                {/* Matches Control */}
                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-2 text-white/80 group-hover:text-white transition-colors">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="w-5 h-5 opacity-70"
                    >
                      <line x1="8" y1="6" x2="21" y2="6" />
                      <line x1="8" y1="12" x2="21" y2="12" />
                      <line x1="8" y1="18" x2="21" y2="18" />
                      <line x1="3" y1="6" x2="3.01" y2="6" />
                      <line x1="3" y1="12" x2="3.01" y2="12" />
                      <line x1="3" y1="18" x2="3.01" y2="18" />
                    </svg>
                    <span className="font-bold font-sans">Matches</span>
                  </div>
                  <input
                    type="number"
                    value={autoMatches || ''}
                    onChange={(e) => setAutoMatches(Number(e.target.value))}
                    className="bg-transparent text-right text-2xl font-bold w-32 focus:outline-none font-sans text-white/90 placeholder:text-white/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="0"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer Summary */}
          <div className="space-y-1.5 px-1">
            <div className="flex justify-between items-center text-sm font-sans">
              <span className="text-white/40">Racers</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">x{selectedRacers.length}</span>
              </div>
            </div>

            {betMode === 'auto' && (
              <div className="flex justify-between items-center text-sm font-sans">
                <span className="text-white/40">Total per match</span>
                <span className="font-bold text-white">
                  {(betAmount * selectedRacers.length).toFixed(2)} SOL
                </span>
              </div>
            )}

            <div className="flex justify-between items-center text-sm font-sans">
              <span className="text-white/40">Total</span>
              <span className="font-bold text-primary text-base">
                {(
                  betAmount *
                  (betMode === 'auto' ? autoMatches : 1) *
                  selectedRacers.length
                ).toFixed(2)}{' '}
                SOL
              </span>
            </div>
          </div>

          <button
            disabled={!isValid}
            className={`w-full py-3 font-bold font-sans rounded-full transition-all ${
              isValid
                ? 'bg-primary hover:bg-primary/90 text-black'
                : 'bg-white/10 text-white/40 cursor-not-allowed'
            }`}
          >
            {betMode === 'manual' ? 'Place Bet' : 'Start Auto'}
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 bg-game-bg">
        <div className="font-bold uppercase tracking-wider text-sm mb-1 font-sans">
          SPERM RACE CLUB
        </div>
        <div className="text-[10px] text-gray-500">
          © 2026 Sperm Race Club. All rights reserved.
        </div>
      </div>
    </div>
  );
};
