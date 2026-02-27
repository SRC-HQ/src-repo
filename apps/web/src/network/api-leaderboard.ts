export interface LeaderboardEntry {
  rank: number;
  user_address: string;
  total_winning_amount: string;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
}

export interface UserDetail {
  id: string;
  user_address: string;
  username: string | null;
  image: string | null;
  x_id?: string | null;
  x_username: string | null;
  created_at: string;
  updated_at: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const res = await fetch(`${API_BASE}/distribution-history/leaderboard`);
  if (!res.ok) {
    throw new Error('Failed to fetch leaderboard');
  }
  const data: LeaderboardResponse = await res.json();
  return data.entries ?? [];
}

export async function fetchUserDetail(userAddress: string): Promise<UserDetail | null> {
  if (!userAddress) return null;
  const res = await fetch(`${API_BASE}/users/${userAddress}`);
  if (!res.ok) {
    return null;
  }
  const data: UserDetail = await res.json();
  return data;
}

