"use client";

import React from "react";
import { useGameStore } from "../../store/gameStore";
import {
  RACER_SETTINGS,
  RACER_COUNT,
  FRAME_COUNT,
} from "../../game/constants/vanillaAssets";

const BG_SRC = "/game/assets/background.png";

const ORDINALS = [
  "1ST",
  "2ND",
  "3RD",
  "4TH",
  "5TH",
  "6TH",
  "7TH",
  "8TH",
  "9TH",
  "10TH",
];

/** CSS spritesheet animation for the racer PNGs (10 horizontal frames, 131×91 each) */
const SpermAnim: React.FC<{ src: string; className?: string }> = ({
  src,
  className,
}) => (
  <div
    className={className}
    style={{
      backgroundImage: `url(${src})`,
      backgroundSize: `${FRAME_COUNT * 100}% 100%`,
      imageRendering: "smooth",
      animation: "sperm-run 0.8s steps(10) infinite",
    }}
  />
);

export const DistributionOverlayV2: React.FC = () => {
  const leaderboard = useGameStore((s) => s.leaderboard);
  const apiSperms = useGameStore((s) => s.apiSperms);
  const apiTotalPot = useGameStore((s) => s.apiTotalPot);

  if (!leaderboard?.length) return null;

  const getBettorCount = (spermId: number) =>
    apiSperms?.find((s) => s.spermId === spermId)?.bettorCount ?? 0;

  const LAMPORTS_PER_SOL = 1_000_000_000;
  const winnerId = leaderboard[0];
  const winnerRacer = RACER_SETTINGS[winnerId] ?? RACER_SETTINGS[0];
  const totalWinSol = (parseFloat(apiTotalPot) || 0) / LAMPORTS_PER_SOL;

  return (
    <div className="absolute inset-0 w-full h-full z-[10] overflow-hidden">
      {/* spritesheet keyframes */}
      <style>{`
        @keyframes sperm-run {
          from { background-position-x: 0; }
          to   { background-position-x: -1000%; }
        }
      `}</style>

      {/* tiled dark background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: "#12122a",
          backgroundImage: `url(${BG_SRC})`,
          backgroundRepeat: "repeat",
          backgroundSize: "500px auto",
          backgroundPosition: "center",
          opacity: 0.12,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />

      {/* two-column layout that fills without scrolling */}
      <div className="relative w-full h-full flex flex-row">
        {/* LEFT: Race Result table */}
        <div className="flex flex-col w-[45%] h-full p-4 md:p-6">
          <h2
            className="text-[#BBFF00] text-lg md:text-2xl font-bold uppercase tracking-wider mb-2"
            style={{ fontFamily: "Orbitron, sans-serif" }}
          >
            Race Result
          </h2>

          {/* table header */}
          <div className="flex items-center gap-3 px-3 py-1.5 border-b border-[#BBFF00]/30 mb-1">
            <span
              className="text-[#BBFF00] text-[10px] md:text-xs font-bold uppercase w-12 shrink-0"
              style={{ fontFamily: "Orbitron, sans-serif" }}
            >
              Pos
            </span>
            <span
              className="text-[#BBFF00] text-[10px] md:text-xs font-bold uppercase"
              style={{ fontFamily: "Orbitron, sans-serif" }}
            >
              Racer No &amp; Name
            </span>
          </div>

          {/* rows — flex-1 distributes evenly so no scrolling */}
          <div className="flex-1 flex flex-col justify-evenly min-h-0">
            {leaderboard.slice(0, RACER_COUNT).map((spermId, rank) => {
              const racer = RACER_SETTINGS[spermId] ?? RACER_SETTINGS[0];
              const isTop3 = rank < 3;

              return (
                <div key={spermId} className="flex items-center gap-3 px-3">
                  <span
                    className={`w-12 shrink-0 text-xs md:text-sm font-bold ${isTop3 ? "text-white" : "text-white/50"}`}
                    style={{ fontFamily: "Orbitron, sans-serif" }}
                  >
                    {ORDINALS[rank]}
                  </span>

                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={racer.icon}
                    alt={racer.name}
                    className="w-6 h-6 shrink-0"
                    draggable={false}
                  />

                  <span
                    className={`text-xs md:text-sm font-semibold truncate ${isTop3 ? "text-white" : "text-white/60"}`}
                  >
                    {racer.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Winner showcase */}
        <div className="flex flex-col items-center justify-center w-[55%] h-full p-4 md:p-6">
          <p
            className="text-[#BBFF00] text-base md:text-xl lg:text-2xl uppercase tracking-[0.25em] font-bold mb-4"
            style={{ fontFamily: "Orbitron, sans-serif" }}
          >
            The Winner
          </p>

          {/* animated winner sperm — large */}
          <div className="relative mb-4">
            <div className="absolute inset-0 rounded-full bg-[#BBFF00]/15 blur-3xl scale-[2] animate-pulse" />
            <SpermAnim
              src={winnerRacer.race}
              className="relative w-40 h-28 md:w-56 md:h-40 lg:w-72 lg:h-52 drop-shadow-[0_0_30px_rgba(187,255,0,0.3)]"
            />
          </div>

          {/* winner name with icon */}
          <div className="flex items-center gap-2 mb-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={winnerRacer.icon}
              alt={winnerRacer.name}
              className="w-8 h-8 md:w-10 md:h-10"
              draggable={false}
            />
            <p
              className="text-white text-xl md:text-2xl lg:text-3xl font-bold"
              style={{ fontFamily: "Orbitron, sans-serif" }}
            >
              {winnerRacer.name}
            </p>
          </div>

          {/* total win */}
          <div className="flex items-baseline gap-2">
            <p
              className="text-[#65EF96] text-xs md:text-sm lg:text-base font-semibold uppercase tracking-[0.2em]"
              style={{ fontFamily: "Orbitron, sans-serif" }}
            >
              Total Win
            </p>
            <p
              className="text-[#65EF96] text-xl md:text-2xl lg:text-3xl font-bold"
              style={{ fontFamily: "Orbitron, sans-serif" }}
            >
              {totalWinSol.toFixed(3)} SOL
            </p>
          </div>

          {/* bettor count */}
          <p className="text-white/40 text-xs md:text-sm mt-2">
            {getBettorCount(winnerId)} winner(s)
          </p>
        </div>
      </div>
    </div>
  );
};
