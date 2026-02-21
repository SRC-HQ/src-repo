'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Modal } from '../ui/Modal';
import { AvatarDefaultIcon, SolColorIconSvg } from '../svgs';
import { fetchLeaderboard, fetchUserDetail, LeaderboardEntry, UserDetail } from '../../network/api-leaderboard';
import { prettyTruncate } from '../../utils/format';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface LeaderboardRowData extends LeaderboardEntry {
  user: UserDetail | null;
}

const LAMPORTS_PER_SOL = 1_000_000_000;

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ isOpen, onClose }) => {
  const [rows, setRows] = useState<LeaderboardRowData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const entries = await fetchLeaderboard();
        const topEntries = entries.slice(0, 10);

        const userPromises = topEntries.map((entry) =>
          fetchUserDetail(entry.user_address).catch(() => null),
        );
        const users = await Promise.all(userPromises);

        if (cancelled) return;

        const combined: LeaderboardRowData[] = topEntries.map((entry, index) => ({
          ...entry,
          user: users[index],
        }));

        setRows(combined);
      } catch (e) {
        if (!cancelled) {
          setError('Failed to load leaderboard');
          setRows([]);
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
  }, [isOpen]);

  const displayRows = useMemo(() => {
    const filled = [...rows];
    while (filled.length < 10) {
      const rank = filled.length + 1;
      filled.push({
        rank,
        user_address: '',
        total_winning_amount: '0',
        user: null,
      });
    }
    return filled.slice(0, 10);
  }, [rows]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Leaderboard">
      <div className="space-y-4">
        <p className="text-xs text-white/60 font-mono">
          Top 10 winners based on total distribution winnings.
        </p>

        {error && (
          <div className="text-xs text-red-400 font-mono bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-lg border border-white/10 bg-black/40">
          <table className="w-full text-xs font-mono">
            <thead className="bg-white/5">
              <tr>
                <th className="px-3 py-2 text-left text-white/60 font-normal uppercase tracking-wider text-[10px]">
                  Rank
                </th>
                <th className="px-3 py-2 text-left text-white/60 font-normal uppercase tracking-wider text-[10px]">
                  User
                </th>
                <th className="px-3 py-2 text-right text-white/60 font-normal uppercase tracking-wider text-[10px]">
                  Total Winning
                </th>
              </tr>
            </thead>
            <tbody>
              {displayRows.map((row) => (
                <LeaderboardTableRow
                  key={row.rank}
                  row={row}
                  loading={loading}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  );
};

interface LeaderboardTableRowProps {
  row: LeaderboardRowData;
  loading: boolean;
}

const LeaderboardTableRow: React.FC<LeaderboardTableRowProps> = ({ row, loading }) => {
  const hasData = !!row.user_address;
  const rankBadgeClass =
    row.rank === 1
      ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-black'
      : row.rank === 2
        ? 'bg-gradient-to-br from-slate-200 to-slate-400 text-black'
        : row.rank === 3
          ? 'bg-gradient-to-br from-amber-700 to-orange-500 text-black'
          : 'bg-white/10 text-white/80';

  const solAmount = useMemo(() => {
    if (!hasData) return '-';
    const value = Number(row.total_winning_amount || '0');
    if (!Number.isFinite(value) || value <= 0) return '-';
    return (value / LAMPORTS_PER_SOL).toFixed(4);
  }, [row.total_winning_amount, hasData]);

  const displayName = useMemo(() => {
    if (!hasData) return '—';
    if (row.user?.username && row.user.username.trim().length > 0) {
      return row.user.username;
    }
    if (row.user_address) {
      return prettyTruncate(row.user_address, 10, 'mid');
    }
    return 'Unknown';
  }, [hasData, row.user?.username, row.user_address]);

  return (
    <tr className="border-t border-white/5">
      <td className="px-3 py-2">
        <div
          className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${rankBadgeClass}`}
        >
          {row.rank}
        </div>
      </td>
      <td className="px-3 py-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-7 w-7 rounded-full bg-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
            {hasData && row.user?.image ? (
              <img
                src={row.user.image}
                alt={displayName}
                className="h-full w-full object-cover"
              />
            ) : (
              <AvatarDefaultIcon className="h-6 w-6 text-white/40" />
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs text-white truncate">
              {displayName}
            </span>
            {hasData && row.user_address && (
              <span className="text-[10px] text-white/40 truncate">
                {prettyTruncate(row.user_address, 6, 'mid')}
              </span>
            )}
          </div>
        </div>
      </td>
      <td className="px-3 py-2 text-right">
        {loading && !hasData ? (
          <span className="text-[10px] text-white/40">Loading...</span>
        ) : hasData && solAmount !== '-' ? (
          <div className="inline-flex items-center gap-1">
            <SolColorIconSvg className="h-3 w-3" />
            <span className="text-xs text-white">{solAmount}</span>
          </div>
        ) : (
          <span className="text-[10px] text-white/30">—</span>
        )}
      </td>
    </tr>
  );
};

