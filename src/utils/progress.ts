import {
  TOTAL_PROGRAM_WEEKS,
  normalizeExerciseId,
  workoutsById
} from "../data/workouts";
import type {
  DayId,
  ExerciseWeights,
  NotificationSettings,
  ProgressState,
  WorkoutHistoryEntry,
  WorkoutKind
} from "../types";

const CALENDAR_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const dayIds = Object.keys(workoutsById) as DayId[];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isWorkoutKind = (value: unknown): value is WorkoutKind =>
  value === "strength" || value === "active" || value === "rest";

const isDayId = (value: unknown): value is DayId =>
  typeof value === "string" && dayIds.includes(value as DayId);

const normalizeStringList = (value: unknown) =>
  Array.isArray(value)
    ? [...new Set(value.filter((item): item is string => typeof item === "string"))]
    : [];

const normalizeExerciseIdList = (value: unknown) =>
  [...new Set(normalizeStringList(value).map((exerciseId) => normalizeExerciseId(exerciseId)))];

const normalizeExerciseWeights = (value: unknown): ExerciseWeights => {
  if (!isRecord(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).flatMap(([rawExerciseId, rawValue]) => {
      const exerciseId = normalizeExerciseId(rawExerciseId);
      const resolvedValue =
        typeof rawValue === "number"
          ? String(rawValue)
          : typeof rawValue === "string"
            ? rawValue.trim()
            : "";

      return resolvedValue ? [[exerciseId, resolvedValue]] : [];
    })
  );
};

const normalizeCompletedDays = (value: unknown): Record<string, DayId[]> => {
  if (!isRecord(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).flatMap(([weekKey, rawDays]) => {
      const days = normalizeStringList(rawDays).filter(isDayId);
      return days.length > 0 ? [[weekKey, days]] : [];
    })
  );
};

const normalizeCheckedExercises = (
  value: unknown
): Record<string, Partial<Record<DayId, string[]>>> => {
  if (!isRecord(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).flatMap(([weekKey, rawWeek]) => {
      if (!isRecord(rawWeek)) {
        return [];
      }

      const dayChecks: Partial<Record<DayId, string[]>> = {};

      for (const [dayKey, rawChecks] of Object.entries(rawWeek)) {
        if (!isDayId(dayKey)) {
          continue;
        }

        const checks = normalizeExerciseIdList(rawChecks);
        if (checks.length > 0) {
          dayChecks[dayKey] = checks;
        }
      }

      return Object.keys(dayChecks).length > 0 ? [[weekKey, dayChecks]] : [];
    })
  );
};

const normalizeWeightsByWeek = (
  value: unknown
): Record<string, Partial<Record<DayId, ExerciseWeights>>> => {
  if (!isRecord(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).flatMap(([weekKey, rawWeek]) => {
      if (!isRecord(rawWeek)) {
        return [];
      }

      const dayWeights: Partial<Record<DayId, ExerciseWeights>> = {};

      for (const [dayKey, rawWeights] of Object.entries(rawWeek)) {
        if (!isDayId(dayKey)) {
          continue;
        }

        const exerciseWeights = normalizeExerciseWeights(rawWeights);
        if (Object.keys(exerciseWeights).length > 0) {
          dayWeights[dayKey] = exerciseWeights;
        }
      }

      return Object.keys(dayWeights).length > 0 ? [[weekKey, dayWeights]] : [];
    })
  );
};

export const clampWeek = (week: number) =>
  Math.min(TOTAL_PROGRAM_WEEKS, Math.max(1, Number.isFinite(week) ? week : 1));

export const createDefaultNotificationSettings = (): NotificationSettings => ({
  restTimer: true,
  trainingReminder: true,
  lastTrainingReminderDate: null
});

const normalizeNotificationSettings = (value: unknown): NotificationSettings => {
  if (!isRecord(value)) {
    return createDefaultNotificationSettings();
  }

  return {
    restTimer: value.restTimer === undefined ? true : Boolean(value.restTimer),
    trainingReminder:
      value.trainingReminder === undefined ? true : Boolean(value.trainingReminder),
    lastTrainingReminderDate:
      typeof value.lastTrainingReminderDate === "string" &&
      CALENDAR_DATE_PATTERN.test(value.lastTrainingReminderDate)
        ? value.lastTrainingReminderDate
        : null
  };
};

const normalizeHistory = (value: unknown): WorkoutHistoryEntry[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  const entries = value.flatMap((rawEntry, index) => {
    if (!isRecord(rawEntry) || !isDayId(rawEntry.dayId)) {
      return [];
    }

    const workout = workoutsById[rawEntry.dayId];
    const calendarDate =
      typeof rawEntry.calendarDate === "string" &&
      CALENDAR_DATE_PATTERN.test(rawEntry.calendarDate)
        ? rawEntry.calendarDate
        : null;

    if (!calendarDate) {
      return [];
    }

    const weightsByExercise = normalizeExerciseWeights(rawEntry.weightsByExercise);

    return [
      {
        id:
          typeof rawEntry.id === "string" && rawEntry.id.trim()
            ? rawEntry.id
            : `${calendarDate}-${rawEntry.dayId}-${index}`,
        completedAt:
          typeof rawEntry.completedAt === "string" && rawEntry.completedAt.trim()
            ? rawEntry.completedAt
            : `${calendarDate}T00:00:00.000Z`,
        calendarDate,
        week: clampWeek(Number(rawEntry.week)),
        dayId: rawEntry.dayId,
        title:
          typeof rawEntry.title === "string" && rawEntry.title.trim()
            ? rawEntry.title
            : workout.title,
        focus:
          typeof rawEntry.focus === "string" && rawEntry.focus.trim()
            ? rawEntry.focus
            : workout.focus,
        kind: isWorkoutKind(rawEntry.kind) ? rawEntry.kind : workout.kind,
        checkedExerciseIds: normalizeExerciseIdList(rawEntry.checkedExerciseIds),
        weightsByExercise
      }
    ];
  });

  return entries.sort(
    (left, right) => Date.parse(right.completedAt) - Date.parse(left.completedAt)
  );
};

export const createDefaultProgress = (): ProgressState => ({
  currentWeek: 1,
  completedDaysByWeek: {},
  checkedExercisesByWeek: {},
  weightsByWeek: {},
  history: [],
  notificationSettings: createDefaultNotificationSettings()
});

export const normalizeProgress = (value: unknown): ProgressState => {
  if (!isRecord(value)) {
    return createDefaultProgress();
  }

  return {
    currentWeek: clampWeek(Number(value.currentWeek)),
    completedDaysByWeek: normalizeCompletedDays(value.completedDaysByWeek),
    checkedExercisesByWeek: normalizeCheckedExercises(value.checkedExercisesByWeek),
    weightsByWeek: normalizeWeightsByWeek(value.weightsByWeek),
    history: normalizeHistory(value.history),
    notificationSettings: normalizeNotificationSettings(value.notificationSettings)
  };
};
