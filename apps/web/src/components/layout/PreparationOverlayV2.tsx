'use client';

import React, { useEffect, useState } from 'react';

const LOGO_SRC = '/game/assets/src-logo.png';
const BG_SRC = '/game/assets/background.png';

export const PreparationOverlayV2: React.FC = () => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    let count = 0;
    const id = setInterval(() => {
      count = (count + 1) % 4;
      setDots('.'.repeat(count));
    }, 500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full z-[10] flex items-center justify-center overflow-hidden">
      {/* dark tiled background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: '#1a1a2e',
          backgroundImage: `url(${BG_SRC})`,
          backgroundRepeat: 'repeat',
          backgroundSize: '600px auto',
          backgroundPosition: 'center',
          opacity: 0.15,
        }}
      />

      {/* content */}
      <div className="relative flex flex-col items-center gap-6">
        <img
          src={LOGO_SRC}
          alt="Logo"
          className="w-[260px] md:w-[340px] lg:w-[400px] h-auto drop-shadow-[0_0_30px_rgba(187,255,0,0.3)]"
          draggable={false}
        />
        <p
          className="text-[#BBFF00] text-2xl md:text-3xl lg:text-[40px] font-bold tracking-wider select-none"
          style={{ fontFamily: 'Orbitron, sans-serif', minWidth: '28ch', textAlign: 'center' }}
        >
          SELECT YOUR RACER{dots}
        </p>
      </div>
    </div>
  );
};
