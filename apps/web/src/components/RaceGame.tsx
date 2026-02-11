import { useEffect, useRef } from 'react';
import { GameApp } from '../game/core/GameApp';
import { gameSocket } from '../network/socket';
import { API_SOCKET_URL } from '../game/constants';

export const RaceGame = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<GameApp | null>(null);

  useEffect(() => {
    // Initialize game
    if (containerRef.current && !gameRef.current) {
      const game = new GameApp();
      game.init(containerRef.current).catch(console.error);
      gameRef.current = game;

      // Only connect the old simulation socket when API socket is NOT available.
      // When API is connected, scenes self-animate based on phase timing.
      if (!API_SOCKET_URL || API_SOCKET_URL === 'MOCK') {
        gameSocket.connect();
      }
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy();
        gameRef.current = null;
      }
      gameSocket.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center bg-black overflow-hidden relative"
    />
  );
};
