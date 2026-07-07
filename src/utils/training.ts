import { exerciseLabelsById } from "../data/workouts";
import type { Exercise, WorkoutHistoryEntry } from "../types";
import { parseCalendarDate } from "./date";

export type PersonalBest = {
  date: string;
  displayWeight: string;
  exerciseId: string;
  exerciseName: string;
  weight: number;
};

export const parseRestToSeconds = (rest: string) => {
  const match = rest.match(/(\d+)/);
  return match ? Number(match[1]) : 60;
};

export const formatTimer = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

export const getRestPresets = (exercises: Exercise[]) =>
  [...new Set(exercises.map((exercise) => parseRestToSeconds(exercise.rest)))].sort(
    (left, right) => left - right
  );

export const countLoggedWeights = (weightsByExercise: Record<string, string>) =>
  Object.values(weightsByExercise).filter((value) => value.trim().length > 0).length;

export const parseWeightValue = (value: string) => {
  const normalized = value.replace(",", ".");
  const match = normalized.match(/-?\d+(\.\d+)?/);
  return match ? Number(match[0]) : null;
};

export const groupHistoryByDate = (history: WorkoutHistoryEntry[]) =>
  history.reduce<Record<string, WorkoutHistoryEntry[]>>((groups, entry) => {
    if (!groups[entry.calendarDate]) {
      groups[entry.calendarDate] = [];
    }

    groups[entry.calendarDate].push(entry);
    return groups;
  }, {});

export const getLatestWeightsForExercises = (
  history: WorkoutHistoryEntry[],
  exerciseIds: string[]
) => {
  const latestWeights: Record<string, string> = {};

  for (const entry of history) {
    for (const exerciseId of exerciseIds) {
      if (latestWeights[exerciseId]) {
        continue;
      }

      const value = entry.weightsByExercise[exerciseId];
      if (value?.trim()) {
        latestWeights[exerciseId] = value;
      }
    }
  }

  return latestWeights;
};

export const getWeeksWithActivity = (completedDaysByWeek: Record<string, string[]>) =>
  Object.values(completedDaysByWeek).filter((days) => days.length > 0).length;

export const getBestWeekCount = (completedDaysByWeek: Record<string, string[]>) =>
  Object.values(completedDaysByWeek).reduce(
    (highestCount, weekDays) => Math.max(highestCount, weekDays.length),
    0
  );

export const getMonthlySessionCount = (history: WorkoutHistoryEntry[], monthDate: Date) =>
  history.filter((entry) => {
    const date = parseCalendarDate(entry.calendarDate);
    return (
      date.getFullYear() === monthDate.getFullYear() &&
      date.getMonth() === monthDate.getMonth()
    );
  }).length;

export const getTotalLoggedWeights = (history: WorkoutHistoryEntry[]) =>
  history.reduce(
    (total, entry) => total + countLoggedWeights(entry.weightsByExercise),
    0
  );

export const getPersonalBests = (history: WorkoutHistoryEntry[]) => {
  const bests = new Map<string, PersonalBest>();

  for (const entry of history) {
    for (const [exerciseId, rawValue] of Object.entries(entry.weightsByExercise)) {
      const parsedWeight = parseWeightValue(rawValue);
      if (parsedWeight == null) {
        continue;
      }

      const currentBest = bests.get(exerciseId);
      if (!currentBest || parsedWeight > currentBest.weight) {
        bests.set(exerciseId, {
          date: entry.calendarDate,
          displayWeight: rawValue,
          exerciseId,
          exerciseName: exerciseLabelsById[exerciseId] ?? exerciseId,
          weight: parsedWeight
        });
      }
    }
  }

  return [...bests.values()].sort((left, right) => right.weight - left.weight);
};
