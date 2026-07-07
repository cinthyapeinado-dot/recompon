import { exerciseLabelsById } from "../data/workouts";
import type {
  Exercise,
  ExerciseLog,
  ExerciseProgressState,
  PlannedExercise,
  WorkoutHistoryEntry
} from "../types";
import { addDays, formatCalendarDate, parseCalendarDate } from "./date";
import {
  convertWeight,
  formatLoggedWeightLabel,
  formatWeightPairLabel,
  parseWeightValue
} from "./units";

export type PersonalBest = {
  date: string;
  displayWeight: string;
  exerciseId: string;
  exerciseName: string;
  weight: number;
  weightUnit: "kg" | "lb";
};

export const formatVolumeKgLabel = (weightKg: number) => formatWeightPairLabel(weightKg, "kg");

export const parseRestToSeconds = (rest: string) => {
  const match = rest.match(/(\d+)/);
  return match ? Number(match[1]) : 60;
};

export const formatTimer = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

export const getRestPresets = (exercises: Array<Exercise | PlannedExercise>) =>
  [...new Set(exercises.map((exercise) => parseRestToSeconds(exercise.rest)))].sort(
    (left, right) => left - right
  );

export const countLoggedWeights = (weightsByExercise: Record<string, string>) =>
  Object.values(weightsByExercise).filter((value) => value.trim().length > 0).length;

export const countCompletedExercises = (exerciseStates: Record<string, ExerciseProgressState>) =>
  Object.values(exerciseStates).filter((state) => state.completedSets.every(Boolean)).length;

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

      const exerciseLog = entry.exerciseLogs.find((log) => log.exerciseId === exerciseId);
      if (exerciseLog?.loggedWeight?.trim()) {
        latestWeights[exerciseId] = `${exerciseLog.loggedWeight} ${exerciseLog.weightUnit}`;
        continue;
      }

      const legacyValue = entry.weightsByExercise[exerciseId];
      if (legacyValue?.trim()) {
        latestWeights[exerciseId] = legacyValue;
      }
    }
  }

  return latestWeights;
};

export const getExerciseHistory = (history: WorkoutHistoryEntry[], exerciseId: string) =>
  history
    .flatMap((entry) => {
      const exerciseLog = entry.exerciseLogs.find((log) => log.exerciseId === exerciseId);
      return exerciseLog ? [{ ...exerciseLog, calendarDate: entry.calendarDate }] : [];
    })
    .sort(
      (left, right) =>
        Date.parse(right.calendarDate ?? "") - Date.parse(left.calendarDate ?? "")
    );

export const getLatestExerciseLog = (history: WorkoutHistoryEntry[], exerciseId: string) =>
  getExerciseHistory(history, exerciseId)[0] ?? null;

export const getExerciseSparklinePoints = (
  history: WorkoutHistoryEntry[],
  exerciseId: string,
  limit = 6
) =>
  getExerciseHistory(history, exerciseId)
    .slice(0, limit)
    .reverse()
    .map((entry) => {
      const rawWeight =
        entry.weightUnit === "kg"
          ? entry.weightKg
          : entry.weightUnit === "lb"
            ? entry.weightLb
            : null;

      if (typeof rawWeight === "number") {
        return rawWeight;
      }

      const parsed = parseWeightValue(entry.loggedWeight);
      if (parsed == null) {
        return null;
      }

      return entry.weightUnit === "kg" ? parsed : convertWeight(parsed, "lb", "kg");
    })
    .filter((value): value is number => value != null);

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
  history.reduce((total, entry) => {
    const count = entry.exerciseLogs.filter((log) => log.loggedWeight.trim()).length;
    return total + count;
  }, 0);

export const getPersonalBests = (history: WorkoutHistoryEntry[]) => {
  const bests = new Map<string, PersonalBest>();

  for (const entry of history) {
    for (const log of entry.exerciseLogs) {
      const parsedWeight = parseWeightValue(log.loggedWeight);
      if (parsedWeight == null) {
        continue;
      }

      const comparableWeight =
        log.weightUnit === "kg" ? parsedWeight : convertWeight(parsedWeight, "lb", "kg");
      const currentBest = bests.get(log.exerciseId);

      if (!currentBest || comparableWeight > currentBest.weight) {
        bests.set(log.exerciseId, {
          date: entry.calendarDate,
          displayWeight: formatLoggedWeightLabel(log.loggedWeight, log.weightUnit),
          exerciseId: log.exerciseId,
          exerciseName: exerciseLabelsById[log.exerciseId] ?? log.exerciseName,
          weight: comparableWeight,
          weightUnit: "kg"
        });
      }
    }
  }

  return [...bests.values()].sort((left, right) => right.weight - left.weight);
};

export const getWeeklyVolumeKg = (history: WorkoutHistoryEntry[], currentWeek: number) =>
  history
    .filter((entry) => entry.week === currentWeek)
    .reduce((total, entry) => total + (entry.totalVolumeKg ?? 0), 0);

export const getCurrentStreak = (history: WorkoutHistoryEntry[]) => {
  const uniqueDates = new Set(history.map((entry) => entry.calendarDate));
  if (uniqueDates.size === 0) {
    return 0;
  }

  const today = parseCalendarDate(formatCalendarDate());
  const todayKey = formatCalendarDate(today);
  const yesterday = addDays(today, -1);
  const yesterdayKey = formatCalendarDate(yesterday);
  let currentDate: Date | null = null;

  if (uniqueDates.has(todayKey)) {
    currentDate = today;
  } else if (uniqueDates.has(yesterdayKey)) {
    currentDate = yesterday;
  } else {
    return 0;
  }

  let streak = 0;

  while (currentDate != null) {
    const expectedKey = formatCalendarDate(currentDate);
    if (!uniqueDates.has(expectedKey)) {
      break;
    }

    streak += 1;
    currentDate = addDays(currentDate, -1);
  }

  return streak;
};

export const computeExerciseVolumeKg = (log: ExerciseLog, reps: string) => {
  const weight =
    typeof log.weightKg === "number"
      ? log.weightKg
      : parseWeightValue(log.loggedWeight) != null
        ? log.weightUnit === "kg"
          ? (parseWeightValue(log.loggedWeight) as number)
          : convertWeight(parseWeightValue(log.loggedWeight) as number, "lb", "kg")
        : null;

  if (weight == null) {
    return 0;
  }

  const repsValue = Number(reps.match(/\d+/)?.[0] ?? 0);
  return weight * log.completedSets * repsValue;
};
