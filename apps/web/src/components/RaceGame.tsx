import { useEffect, useState, useRef } from 'react';
import { GameApp } from '../game/core/GameApp';
import Script from 'next/script';
import { apiGameSocket } from '../network/api-socket';
import { useGameStore } from '../store/gameStore';
import { useLegacyGameSync } from '../game/hooks/useLegacyGameSync';

declare global {
  interface Window {
    resizeGameFunc?: () => void;
  }
}

const SCRIPTS = [
  "/game/js/vendor/jquery.min.js",
  "/game/js/vendor/mobile-detect.js",
  "/game/js/vendor/createjs.min.js",
  "/game/js/vendor/TweenMax.min.js",
  "/game/js/plugins.js",
  "/game/js/sound.js",
  "/game/js/canvas.js",
  "/game/js/game.js",
  "/game/js/bridge.js",
  "/game/js/mobile.js",
  "/game/js/main.js",
  "/game/js/loader.js",
  "/game/js/init.js"
];

export const RaceGame = () => {
  const [loadedIndex, setLoadedIndex] = useState(0);
  const [isLegacyReady, setIsLegacyReady] = useState(false);
  const isStateSynced = useGameStore((state) => state.isStateSynced);
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<GameApp | null>(null);
  
  const areScriptsLoaded = loadedIndex >= SCRIPTS.length;
  useLegacyGameSync(areScriptsLoaded && isLegacyReady);

  useEffect(() => {
    // Intercept GameBridge.onGameReady to know when legacy assets are loaded
    const win = window as any;
    if (areScriptsLoaded && win.GameBridge) {
      const originalOnGameReady = win.GameBridge.onGameReady;
      win.GameBridge.onGameReady = () => {
        if (originalOnGameReady) originalOnGameReady.call(win.GameBridge);
        setIsLegacyReady(true);
      };
      
      // Check if it already finished loading before we attached the listener
      if (win.isLoaded && !isLegacyReady) {
          // If isLoaded is true, and we know onGameReady is called at the end of initMain
          // We can check if game is already in a state that implies it's ready
          if (win.mainContainer || win.curPage === 'game') {
              setIsLegacyReady(true);
          }
      }
    }
  }, [areScriptsLoaded]);

  useEffect(() => {
    apiGameSocket.connect();
    if (containerRef.current && !gameRef.current) {
      const game = new GameApp();
      game.init(containerRef.current).catch(console.error);
      gameRef.current = game;
    }

    return () => {
      apiGameSocket.disconnect();
      if (gameRef.current) {
        gameRef.current.destroy();
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <link rel="stylesheet" href="/game/css/normalize.css" />
      <link rel="stylesheet" href="/game/css/main.css" />

      {/* CONTENT START */}
      <div id="mainHolder">
        {/* BROWSER NOT SUPPORT START */}
        <div id="notSupportHolder">
          <div className="notSupport">
            YOUR BROWSER ISN'T SUPPORTED.
            <br />
            PLEASE UPDATE YOUR BROWSER IN ORDER TO RUN THE GAME
          </div>
        </div>
        {/* BROWSER NOT SUPPORT END */}

        {/* CANVAS START */}
        <div id="canvasHolder" className="relative">
          <canvas id="gameCanvas" width="1280" height="768" style={{ display: 'none' }}></canvas>
          
          {/* Loading Overlay */}
          {(!isStateSynced || !isLegacyReady) && (
            <div className="absolute inset-0 bg-black z-50 flex items-center justify-center">
               <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-game-accent border-t-transparent rounded-full animate-spin"></div>
                  <div className="uppercase tracking-widest text-xs text-white">
                    {!isLegacyReady ? "Loading Game Assets..." : "Syncing Race Data..."}
                  </div>
               </div>
            </div>
          )}
        </div>
        {/* CANVAS END */}
      </div>
      {/* CONTENT END */}

      {/* Scripts - Load sequentially to ensure dependencies */}
      {SCRIPTS.map((src, index) => (
        index <= loadedIndex && (
          <Script
            key={src}
            src={src}
            strategy="afterInteractive"
            onLoad={() => {
              if (index === loadedIndex) {
                setLoadedIndex(prev => prev + 1);
              }
            }}
          />
        )
      ))}
    </div>
  );
};
