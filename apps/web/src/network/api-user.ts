export interface UserStats {
  total_races: number;
  total_winning: string;
}

const API_BASE = 'https://api.spermrace.club';

export async function fetchUserStats(address: string): Promise<UserStats | null> {
  if (!address) return null;
  const res = await fetch(`${API_BASE}/users/${address}/stats`);
  if (!res.ok) {
    return null;
  }
  const data: UserStats = await res.json();
  return data;
}
