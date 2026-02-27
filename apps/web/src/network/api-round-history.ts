export interface WinnerRound {
  round_id: string;
  winner_sperm_id: number;
  total_pot: string;
  total_user: number;
  user_pots: unknown[];
  timestamp: string;
  tx_hash: string;
  user_winnings: string | null;
  is_baby_king_hit?: boolean | null;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export async function fetchWinnerRounds(skip?: number): Promise<WinnerRound[]> {
  const url =
    typeof skip === 'number'
      ? `${API_BASE}/round-history/winners?skip=${skip}`
      : `${API_BASE}/round-history/winners`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch winner rounds');
  }
  const data: WinnerRound[] = await res.json();
  return Array.isArray(data) ? data : [];
}
