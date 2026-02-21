import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { SolColorIconSvg } from '../svgs';
import { fetchWinnerRounds, WinnerRound } from '../../network/api-round-history';
import { prettyTruncate } from '../../utils/format';

interface HistoryRow {
  race: string;
  block: string;
  winnerIndex: number;
  winnersCount: number;
  totalPool: string;
  babyKing: string;
  time: string;
}

const mapWinnerToHistoryRow = (item: WinnerRound): HistoryRow => {
  const race = `#${item.round_id}`;
  const block = prettyTruncate(item.tx_hash, 10, 'mid');
  const winnerIndex = typeof item.winner_sperm_id === 'number' ? item.winner_sperm_id : 0;
  const winnersCount = typeof item.total_user === 'number' ? item.total_user : 0;
  const totalPoolNumber = Number(item.total_pot || '0');
  const totalPool = Number.isFinite(totalPoolNumber) ? totalPoolNumber.toFixed(4) : '0.0000';
  const babyKing =
    item.is_baby_king_hit === true ? 'Hit' : item.is_baby_king_hit === false ? 'Miss' : '—';
  const time = formatTimeAgo(item.timestamp);

  return {
    race,
    block,
    winnerIndex,
    winnersCount,
    totalPool,
    babyKing,
    time,
  };
};

const formatTimeAgo = (iso: string): string => {
  const date = new Date(iso);
  const now = Date.now();
  const diffMs = now - date.getTime();
  if (!Number.isFinite(diffMs)) return '';

  const diffSec = Math.max(0, Math.floor(diffMs / 1000));
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};

export const GameHistory = () => {
  const [mounted, setMounted] = useState(false);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const winners = await fetchWinnerRounds(100);
        if (cancelled) return;
        const rows = winners.map(mapWinnerToHistoryRow);
        setHistory(rows);
      } catch (e) {
        if (!cancelled) {
          setError('Failed to load history');
          setHistory([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [mounted]);

  if (!mounted) {
    return (
      <div className="w-full h-full overflow-hidden flex flex-col font-sans">
        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-game-bg z-10 shadow-sm shadow-black/20">
              <tr className="text-gray-400 font-sans">
                <th className="p-3 font-medium bg-game-bg">Race</th>
                <th className="p-3 font-medium bg-game-bg">Block</th>
                <th className="p-3 font-medium text-center bg-game-bg">1st</th>
                <th className="p-3 font-medium text-center bg-game-bg">Winners</th>
                <th className="p-3 font-medium text-right bg-game-bg">Total Pool</th>
                <th className="p-3 font-medium text-right bg-game-bg">Baby King</th>
                <th className="p-3 font-medium text-right bg-game-bg">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {/* Skeleton or empty state for SSR */}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-hidden flex flex-col font-sans">
      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 bg-game-bg z-10 shadow-sm shadow-black/20">
            <tr className="text-gray-400 font-sans">
              <th className="p-3 font-medium bg-game-bg">Race</th>
              <th className="p-3 font-medium bg-game-bg">Block</th>
              <th className="p-3 font-medium text-center bg-game-bg">1st</th>
              <th className="p-3 font-medium text-center bg-game-bg">Winners</th>
              <th className="p-3 font-medium text-right bg-game-bg">Total Pool</th>
              <th className="p-3 font-medium text-right bg-game-bg">Baby King</th>
              <th className="p-3 font-medium text-right bg-game-bg">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 bg-game-bg">
            {error && (
              <tr>
                <td
                  className="p-3 text-xs text-red-400 font-sans"
                  colSpan={7}
                >
                  {error}
                </td>
              </tr>
            )}
            {!error &&
              history.map((item, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors font-sans">
                  <td className="p-3 text-white">{item.race}</td>
                  <td className="p-3 text-gray-500">{item.block}</td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center">
                      <div className="relative w-8 h-8 mt-2">
                        <Image
                          src={`/game/assets/icon_${String(item.winnerIndex + 1).padStart(
                            2,
                            '0',
                          )}.png`}
                          alt={`Racer ${item.winnerIndex + 1}`}
                          width={24}
                          height={24}
                          className="object-contain"
                        />
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-center text-white">{item.winnersCount}</td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <SolColorIconSvg className="w-3.5 h-3.5" />
                      <span className="text-game-accent">{item.totalPool}</span>
                    </div>
                  </td>
                  <td className="p-3 text-right text-gray-400">{item.babyKing}</td>
                  <td className="p-3 text-right text-gray-500 text-[10px]">{item.time}</td>
                </tr>
              ))}
            {!error && !loading && history.length === 0 && (
              <tr>
                <td
                  className="p-3 text-xs text-white/40 font-sans"
                  colSpan={7}
                >
                  No history yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
