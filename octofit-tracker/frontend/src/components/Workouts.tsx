import { useApiResource } from '../api/useApiResource.js';
import { CapabilityCard } from './CapabilityCard.js';

type WorkoutSuggestion = {
  title: string;
  focus: string;
  minutes: number;
  difficulty: string;
  reason: string;
};
type WorkoutResponse = { suggestions: WorkoutSuggestion[] };

const userEmail = 'mona@example.com';

export default function Workouts() {
  const path = `/api/workouts/suggestions/${encodeURIComponent(userEmail)}`;
  const { data, loading, error } = useApiResource<WorkoutResponse>(path);
  const suggestions = data?.suggestions ?? [];

  return (
    <CapabilityCard
      title="Workout suggestions"
      description="Recommend workouts from activity patterns."
      loading={loading}
      error={error}
      isEmpty={suggestions.length === 0}
      emptyMessage="No workout suggestions yet."
    >
      <ul>
        {suggestions.map((workout) => (
          <li key={workout.title}>
            {workout.title}: {workout.focus}, {workout.minutes} minutes, {workout.difficulty}. {workout.reason}
          </li>
        ))}
      </ul>
    </CapabilityCard>
  );
}
