# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

Record your plan here before editing code.

- Presentation tier decision: Use one shared resource hook and card state component so every page presents loading, empty, success, and error states consistently.
- Logic tier decision: Keep route handlers thin and implement validation and capability behavior in the OctoFit service.
- Data tier decision: Require each contract field in its Mongoose schema and default team members to an empty array.
- Activity tracking approach: Validate inputs and existing references, award one point per minute, and timestamp each created activity.
- Team management approach: Validate names and member references before creating a team; preserve the submitted name and mascot.
- Leaderboard approach: Sum activity points per team, include teams with no activity at zero, and rank totals descending.
- Workout suggestions approach: Match a known user's goal first, fall back to their latest activity, and explain the first matching suggestion.

## Test plan

Record the commands you run and what each failure means.

- Data-tier command: `npm run test:data --prefix octofit-tracker/backend` — passed (5/5); failures indicate schema validation or seed behavior regressions.
- API command: `npm run test:api --prefix octofit-tracker/backend` — passed (4/4); failures indicate request validation, persistence, leaderboard, or recommendation regressions.
- Frontend command: `npm test --prefix octofit-tracker/frontend` — passed (15/15); failures indicate API rendering or loading, empty, and error state regressions.
- Backend build command: `npm run build --prefix octofit-tracker/backend` — passed; failures indicate TypeScript errors.
- Frontend build command: `npm run build --prefix octofit-tracker/frontend` — passed; failures indicate TypeScript or production bundling errors.
