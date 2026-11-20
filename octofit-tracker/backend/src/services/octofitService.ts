import { isObjectIdOrHexString, Types } from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

function httpError(status: number, message: string) {
  return Object.assign(new Error(message), { status });
}

function inputObject(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw httpError(400, 'Request body must be an object');
  }
  return input as Record<string, unknown>;
}

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  const body = inputObject(input);
  const { userId, teamId, type, minutes } = body;
  if (typeof userId !== 'string' || !isObjectIdOrHexString(userId)) {
    throw httpError(400, 'A valid userId is required');
  }
  if (typeof teamId !== 'string' || !isObjectIdOrHexString(teamId)) {
    throw httpError(400, 'A valid teamId is required');
  }
  if (typeof type !== 'string' || !type.trim()) {
    throw httpError(400, 'An activity type is required');
  }
  if (typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes < 1) {
    throw httpError(400, 'Minutes must be a positive number');
  }

  const [user, team] = await Promise.all([
    User.findById(userId).select('_id').lean(),
    Team.findById(teamId).select('_id').lean(),
  ]);
  if (!user || !team) throw httpError(404, 'User or team was not found');

  return Activity.create({
    user: userId,
    team: teamId,
    type: type.trim(),
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  const body = inputObject(input);
  const { name, mascot } = body;
  if (typeof name !== 'string' || !name.trim()) throw httpError(400, 'A team name is required');
  if (typeof mascot !== 'string' || !mascot.trim()) throw httpError(400, 'A team mascot is required');

  const members = body.members === undefined ? [] : body.members;
  if (!Array.isArray(members) || !members.every((member) => typeof member === 'string' && isObjectIdOrHexString(member))) {
    throw httpError(400, 'Members must be valid user IDs');
  }
  const existingMembers = await User.find({ _id: { $in: members } }).select('_id').lean();
  const existingMemberIds = new Set(existingMembers.map((member) => member._id.toString()));
  if (members.some((member) => !existingMemberIds.has(member))) {
    throw httpError(404, 'One or more team members were not found');
  }

  return Team.create({ name: name.trim(), mascot: mascot.trim(), members });
}

export async function getLeaderboard() {
  const [teams, totals] = await Promise.all([
    Team.find().select('name').lean(),
    Activity.aggregate<{ _id: Types.ObjectId; totalPoints: number }>([
      { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    ]),
  ]);
  const totalsByTeam = new Map(totals.map(({ _id, totalPoints }) => [_id.toString(), totalPoints]));
  return teams
    .map((team) => ({
      teamName: team.name,
      totalPoints: totalsByTeam.get(team._id.toString()) ?? 0,
    }))
    .sort((left, right) => right.totalPoints - left.totalPoints || left.teamName.localeCompare(right.teamName))
    .map((team, index) => ({ ...team, rank: index + 1 }));
}

function focusFromActivity(type: string) {
  if (['run', 'cycle', 'walk'].includes(type.toLowerCase())) return 'endurance';
  return type;
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail }).lean();
  if (!user) throw httpError(404, 'User was not found');

  const recentActivity = await Activity.findOne({ user: user._id }).sort({ occurredAt: -1 }).lean();
  const workouts = await Workout.find().lean();
  const focusCandidates = [user.fitnessGoal, recentActivity && focusFromActivity(recentActivity.type)]
    .filter((focus): focus is string => Boolean(focus));
  const recommendationFocus = focusCandidates.find((focus) => workouts.some((workout) => workout.focus === focus));

  const reason = recommendationFocus === user.fitnessGoal
    ? `Recommended to support your ${user.fitnessGoal} fitness goal.`
    : recentActivity
      ? `Recommended based on your recent ${recentActivity.type} activity.`
      : 'Recommended as a general workout.';
  return workouts
    .sort((left, right) => Number(right.focus === recommendationFocus) - Number(left.focus === recommendationFocus))
    .map((workout) => ({
      ...workout,
      reason: workout.focus === recommendationFocus ? reason : `A ${workout.focus} workout to add variety.`,
    }));
}

export { User };
