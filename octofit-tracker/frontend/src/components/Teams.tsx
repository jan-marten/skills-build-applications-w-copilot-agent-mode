import { useApiResource } from '../api/useApiResource.js';
import { CapabilityCard } from './CapabilityCard.js';

type Team = { name: string; mascot: string; members: string[] };
type TeamsResponse = { teams: Team[] };

export default function Teams() {
  const { data, loading, error } = useApiResource<TeamsResponse>('/api/teams');
  const teams = data?.teams ?? [];

  return (
    <CapabilityCard
      title="Teams"
      description="Manage teams and members."
      loading={loading}
      error={error}
      isEmpty={teams.length === 0}
      emptyMessage="No teams yet."
    >
      <ul>
        {teams.map((team) => (
          <li key={team.name}>
            {team.name} — {team.mascot} ({team.members.length} members)
          </li>
        ))}
      </ul>
    </CapabilityCard>
  );
}
