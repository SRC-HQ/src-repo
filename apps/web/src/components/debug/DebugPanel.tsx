import React, { useState } from 'react';
import { GameMode } from '../../game/types/GameState';
import { useGameStore } from '../../store/gameStore';

export const DebugPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    isWalletConnected,
    hasWinnings,
    debugFreezeAtFinish,
    setWalletConnected,
    setHasWinnings,
    setDebugFreezeAtFinish,
  } = useGameStore();

  const setMode = (mode: GameMode) => {
    // Directly set store mode for debug — bypasses socket
    if (mode === 'DISTRIBUTION') {
      // Ensure we have leaderboard data for distribution mode
      const currentLeaderboard = useGameStore.getState().leaderboard;
      if (!currentLeaderboard || currentLeaderboard.length === 0) {
        // Set dummy leaderboard data (racer IDs 0-9 in random order)
        const dummyLeaderboard = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        // Shuffle for variety
        for (let i = dummyLeaderboard.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [dummyLeaderboard[i], dummyLeaderboard[j]] = [dummyLeaderboard[j], dummyLeaderboard[i]];
        }
        useGameStore.setState({
          mode,
          leaderboard: dummyLeaderboard,
          apiTotalPot: '5000000000', // 5 SOL in lamports
        });
        return;
      }
    }
    useGameStore.setState({ mode });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700 opacity-50 hover:opacity-100 transition-all text-xs"
      >
        ⚙️
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-gray-900 border border-gray-700 p-4 rounded-lg shadow-xl w-64 text-white">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-gray-400">DEBUG CONTROLS</h3>
        <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white">
          ✕
        </button>
      </div>

      <div className="space-y-2">
        <p className="text-xs text-gray-500 mb-2">Force Game Mode:</p>
        <div className="grid grid-cols-1 gap-2">
          <button
            onClick={() => setMode('PREPARATION')}
            className="px-3 py-2 bg-blue-900/50 hover:bg-blue-800 border border-blue-800/50 rounded text-xs transition-colors text-left"
          >
            Wait / Preparation
          </button>
          <button
            onClick={() => setMode('RACE')}
            className="px-3 py-2 bg-green-900/50 hover:bg-green-800 border border-green-800/50 rounded text-xs transition-colors text-left"
          >
            Start Race
          </button>
          <button
            onClick={() => setMode('DISTRIBUTION')}
            className="px-3 py-2 bg-purple-900/50 hover:bg-purple-800 border border-purple-800/50 rounded text-xs transition-colors text-left"
          >
            End / Distribution
          </button>
        </div>

        <div className="h-px bg-white/10 my-2"></div>

        <p className="text-xs text-gray-500 mb-2">User State:</p>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isWalletConnected || false}
              onChange={(e) => setWalletConnected(e.target.checked)}
              className="rounded border-gray-600 bg-gray-800"
            />
            <span className="text-xs">Wallet Connected</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={hasWinnings || false}
              onChange={(e) => setHasWinnings(e.target.checked)}
              className="rounded border-gray-600 bg-gray-800"
            />
            <span className="text-xs">Has Winnings</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={!!debugFreezeAtFinish}
              onChange={(e) => setDebugFreezeAtFinish(e.target.checked)}
              className="rounded border-gray-600 bg-gray-800"
            />
            <span className="text-xs">Freeze race at finish</span>
          </label>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-800">
          <p className="text-[10px] text-gray-600">
            Note: Debug controls override the current mode directly.
          </p>
        </div>
      </div>
    </div>
  );
};
