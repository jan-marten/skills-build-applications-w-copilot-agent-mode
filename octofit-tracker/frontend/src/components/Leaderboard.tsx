import { useApiResource } from '../api/useApiResource.js';
import { CapabilityCard } from './CapabilityCard.js';

type LeaderboardEntry = { teamName: string; totalPoints: number; rank: number };
type LeaderboardResponse = { leaderboard: LeaderboardEntry[] };

export default function Leaderboard() {
  const { data, loading, error } = useApiResource<LeaderboardResponse>('/api/leaderboard');
  const entries = data?.leaderboard ?? [];

  return (
    <CapabilityCard
      title="Leaderboard"
      description="Compare team point totals."
      loading={loading}
      error={error}
      isEmpty={entries.length === 0}
      emptyMessage="No leaderboard scores yet."
    >
      <ol>
        {entries.map((entry) => (
          <li key={entry.teamName}>
            {entry.teamName}: {entry.totalPoints} points
          </li>
        ))}
      </ol>
    </CapabilityCard>
  );
}
