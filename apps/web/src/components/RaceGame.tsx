import { useEffect, useRef } from 'react';
import { GameApp } from '../game/core/GameApp';
import { gameSocket } from '../network/socket';

export const RaceGame = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<GameApp | null>(null);

  useEffect(() => {
    // Initialize game
    if (containerRef.current && !gameRef.current) {
      const game = new GameApp();
      game.init(containerRef.current).catch(console.error);
      gameRef.current = game;

      // Connect socket
      gameSocket.connect();
    }

    return () => {
      // Cleanup
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
