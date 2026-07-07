import {
  TOTAL_PROGRAM_WEEKS,
  exercisesById,
  normalizeExerciseId,
  workoutsById
} from "../data/workouts";
import type {
  DailyCheckIn,
  DayId,
  DiscomfortArea,
  ExerciseLog,
  ExerciseProgressState,
  ExerciseWeights,
  FeltArea,
  NotificationSettings,
  ProgressState,
  SessionStrategy,
  SleepQuality,
  TimeAvailability,
  WeightUnit,
  WorkoutHistoryEntry,
  WorkoutKind,
  EnergyLevel
} from "../types";

const CALENDAR_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const dayIds = Object.keys(workoutsById) as DayId[];

const discomfortAreas: DiscomfortArea[] = ["rodilla", "espalda", "hombro", "otra"];
const feltAreas: FeltArea[] = ["gluteo", "femoral", "cuadriceps", "espalda", "otro"];
const sleepQualities: SleepQuality[] = ["excelente", "bien", "regular", "mal"];
const energyLevels: EnergyLevel[] = ["alta", "media", "baja"];
const timeAvailabilities: TimeAvailability[] = ["completo", "45_min", "30_min"];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isWorkoutKind = (value: unknown): value is WorkoutKind =>
  value === "strength" || value === "active" || value === "rest";

const isDayId = (value: unknown): value is DayId =>
  typeof value === "string" && dayIds.includes(value as DayId);

const isWeightUnit = (value: unknown): value is WeightUnit => value === "kg" || value === "lb";

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

const normalizeDiscomforts = (value: unknown): DiscomfortArea[] =>
  normalizeStringList(value).filter((item): item is DiscomfortArea =>
    discomfortAreas.includes(item as DiscomfortArea)
  );

const normalizeCheckIn = (value: unknown): DailyCheckIn | null => {
  if (!isRecord(value)) {
    return null;
  }

  if (
    typeof value.calendarDate !== "string" ||
    !CALENDAR_DATE_PATTERN.test(value.calendarDate) ||
    !isDayId(value.dayId)
  ) {
    return null;
  }

  return {
    calendarDate: value.calendarDate,
    createdAt:
      typeof value.createdAt === "string" && value.createdAt.trim()
        ? value.createdAt
        : `${value.calendarDate}T00:00:00.000Z`,
    dayId: value.dayId,
    energy: energyLevels.includes(value.energy as EnergyLevel)
      ? (value.energy as EnergyLevel)
      : "media",
    discomforts: normalizeDiscomforts(value.discomforts),
    sleep: sleepQualities.includes(value.sleep as SleepQuality)
      ? (value.sleep as SleepQuality)
      : "bien",
    timeAvailable: timeAvailabilities.includes(value.timeAvailable as TimeAvailability)
      ? (value.timeAvailable as TimeAvailability)
      : "completo",
    week: clampWeek(Number(value.week))
  };
};

const normalizeCheckInsByWeek = (
  value: unknown
): Record<string, Partial<Record<DayId, DailyCheckIn>>> => {
  if (!isRecord(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).flatMap(([weekKey, rawWeek]) => {
      if (!isRecord(rawWeek)) {
        return [];
      }

      const dayCheckIns: Partial<Record<DayId, DailyCheckIn>> = {};

      for (const [dayKey, rawCheckIn] of Object.entries(rawWeek)) {
        if (!isDayId(dayKey)) {
          continue;
        }

        const checkIn = normalizeCheckIn(rawCheckIn);
        if (checkIn) {
          dayCheckIns[dayKey] = checkIn;
        }
      }

      return Object.keys(dayCheckIns).length > 0 ? [[weekKey, dayCheckIns]] : [];
    })
  );
};

const normalizeCompletedSets = (value: unknown, minimumLength: number) => {
  const normalized =
    Array.isArray(value) && value.every((item) => typeof item === "boolean")
      ? [...value]
      : [];

  return normalized.length >= minimumLength
    ? normalized
    : [...normalized, ...Array.from({ length: minimumLength - normalized.length }, () => false)];
};

const normalizeRpe = (value: unknown) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return null;
  }

  return Math.min(10, Math.max(1, Math.round(numeric)));
};

const getExerciseDefaultUnit = (exerciseId: string): WeightUnit =>
  exercisesById[normalizeExerciseId(exerciseId)]?.defaultUnit ?? "kg";

const getExerciseDefaultSets = (exerciseId: string) => {
  const rawSets = Number(exercisesById[normalizeExerciseId(exerciseId)]?.sets ?? 0);
  return Number.isFinite(rawSets) && rawSets > 0 ? rawSets : 0;
};

const normalizeExerciseState = (
  exerciseId: string,
  value: unknown
): ExerciseProgressState | null => {
  if (!isRecord(value)) {
    return null;
  }

  const defaultLength = getExerciseDefaultSets(exerciseId);
  const completedSets = normalizeCompletedSets(value.completedSets, defaultLength);

  return {
    completedSets,
    feltArea: feltAreas.includes(value.feltArea as FeltArea)
      ? (value.feltArea as FeltArea)
      : null,
    recommendationDecision:
      value.recommendationDecision === "applied" || value.recommendationDecision === "kept"
        ? value.recommendationDecision
        : null,
    rpe: normalizeRpe(value.rpe),
    updatedAt:
      typeof value.updatedAt === "string" && value.updatedAt.trim() ? value.updatedAt : null,
    weightUnit: isWeightUnit(value.weightUnit)
      ? value.weightUnit
      : getExerciseDefaultUnit(exerciseId),
    weightValue:
      typeof value.weightValue === "string"
        ? value.weightValue.trim()
        : typeof value.weightValue === "number"
          ? String(value.weightValue)
          : ""
  };
};

const normalizeExerciseStatesByWeek = (
  value: unknown
): Record<string, Partial<Record<DayId, Record<string, ExerciseProgressState>>>> => {
  if (!isRecord(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).flatMap(([weekKey, rawWeek]) => {
      if (!isRecord(rawWeek)) {
        return [];
      }

      const dayStates: Partial<Record<DayId, Record<string, ExerciseProgressState>>> = {};

      for (const [dayKey, rawDayStates] of Object.entries(rawWeek)) {
        if (!isDayId(dayKey) || !isRecord(rawDayStates)) {
          continue;
        }

        const exerciseStates = Object.fromEntries(
          Object.entries(rawDayStates).flatMap(([rawExerciseId, rawState]) => {
            const exerciseId = normalizeExerciseId(rawExerciseId);
            const normalizedState = normalizeExerciseState(exerciseId, rawState);
            return normalizedState ? [[exerciseId, normalizedState]] : [];
          })
        );

        if (Object.keys(exerciseStates).length > 0) {
          dayStates[dayKey] = exerciseStates;
        }
      }

      return Object.keys(dayStates).length > 0 ? [[weekKey, dayStates]] : [];
    })
  );
};

const normalizeSessionStrategy = (value: unknown): SessionStrategy =>
  value === "applied" || value === "kept" ? value : "pending";

const normalizeSessionStrategyByWeek = (
  value: unknown
): Record<string, Partial<Record<DayId, SessionStrategy>>> => {
  if (!isRecord(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).flatMap(([weekKey, rawWeek]) => {
      if (!isRecord(rawWeek)) {
        return [];
      }

      const dayStrategies: Partial<Record<DayId, SessionStrategy>> = {};

      for (const [dayKey, rawStrategy] of Object.entries(rawWeek)) {
        if (!isDayId(dayKey)) {
          continue;
        }

        dayStrategies[dayKey] = normalizeSessionStrategy(rawStrategy);
      }

      return Object.keys(dayStrategies).length > 0 ? [[weekKey, dayStrategies]] : [];
    })
  );
};

const getWeightPartsFromSummary = (summary: string, exerciseId: string) => {
  const trimmed = summary.trim();
  if (!trimmed) {
    return { unit: getExerciseDefaultUnit(exerciseId), value: "" };
  }

  const detectedUnit = trimmed.toLowerCase().includes("lb")
    ? "lb"
    : trimmed.toLowerCase().includes("kg")
      ? "kg"
      : getExerciseDefaultUnit(exerciseId);

  return {
    unit: detectedUnit,
    value: trimmed.replace(/kg|lb/gi, "").trim()
  };
};

const buildLegacyExerciseStates = ({
  checkedExercisesByWeek,
  weightsByWeek
}: {
  checkedExercisesByWeek: Record<string, Partial<Record<DayId, string[]>>>;
  weightsByWeek: Record<string, Partial<Record<DayId, ExerciseWeights>>>;
}) => {
  const result: Record<string, Partial<Record<DayId, Record<string, ExerciseProgressState>>>> = {};

  const weekKeys = [...new Set([...Object.keys(checkedExercisesByWeek), ...Object.keys(weightsByWeek)])];

  for (const weekKey of weekKeys) {
    const weekChecked = checkedExercisesByWeek[weekKey] ?? {};
    const weekWeights = weightsByWeek[weekKey] ?? {};
    const dayIdsForWeek = [...new Set([...Object.keys(weekChecked), ...Object.keys(weekWeights)])].filter(
      isDayId
    );

    const nextWeek: Partial<Record<DayId, Record<string, ExerciseProgressState>>> = {};

    for (const dayId of dayIdsForWeek) {
      const checkedIds = weekChecked[dayId] ?? [];
      const weights = weekWeights[dayId] ?? {};
      const exercises = workoutsById[dayId].exercises;
      const dayStates: Record<string, ExerciseProgressState> = {};

      for (const exercise of exercises) {
        const summary = weights[exercise.id] ?? "";
        const { unit, value } = getWeightPartsFromSummary(summary, exercise.id);
        const completed = checkedIds.includes(exercise.id);

        if (!completed && !value) {
          continue;
        }

        dayStates[exercise.id] = {
          completedSets: Array.from({ length: Number(exercise.sets) || 0 }, () => completed),
          feltArea: null,
          recommendationDecision: null,
          rpe: null,
          updatedAt: null,
          weightUnit: unit,
          weightValue: value
        };
      }

      if (Object.keys(dayStates).length > 0) {
        nextWeek[dayId] = dayStates;
      }
    }

    if (Object.keys(nextWeek).length > 0) {
      result[weekKey] = nextWeek;
    }
  }

  return result;
};

const normalizeExerciseLog = (value: unknown): ExerciseLog | null => {
  if (!isRecord(value) || typeof value.exerciseId !== "string") {
    return null;
  }

  const exerciseId = normalizeExerciseId(value.exerciseId);
  const exercise = exercisesById[exerciseId];

  return {
    completedSets: Math.max(0, Number(value.completedSets) || 0),
    completedSetsMask: normalizeCompletedSets(
      value.completedSetsMask,
      Number(value.targetSets) || getExerciseDefaultSets(exerciseId)
    ),
    exerciseId,
    exerciseName:
      typeof value.exerciseName === "string" && value.exerciseName.trim()
        ? value.exerciseName
        : exercise?.name ?? exerciseId,
    feltArea: feltAreas.includes(value.feltArea as FeltArea)
      ? (value.feltArea as FeltArea)
      : null,
    loggedWeight:
      typeof value.loggedWeight === "string"
        ? value.loggedWeight.trim()
        : typeof value.loggedWeight === "number"
          ? String(value.loggedWeight)
          : "",
    muscleGroup:
      typeof value.muscleGroup === "string" && value.muscleGroup.trim()
        ? value.muscleGroup
        : exercise?.muscleGroup ?? "",
    recommendationDecision:
      value.recommendationDecision === "applied" || value.recommendationDecision === "kept"
        ? value.recommendationDecision
        : null,
    restSeconds: Math.max(0, Number(value.restSeconds) || 0),
    rpe: normalizeRpe(value.rpe),
    targetSets: Math.max(0, Number(value.targetSets) || getExerciseDefaultSets(exerciseId)),
    weightKg: Number.isFinite(Number(value.weightKg)) ? Number(value.weightKg) : null,
    weightLb: Number.isFinite(Number(value.weightLb)) ? Number(value.weightLb) : null,
    weightUnit: isWeightUnit(value.weightUnit) ? value.weightUnit : getExerciseDefaultUnit(exerciseId)
  };
};

const createLegacyExerciseLogs = (entry: {
  checkedExerciseIds: string[];
  dayId: DayId;
  weightsByExercise: ExerciseWeights;
}): ExerciseLog[] => {
  const workout = workoutsById[entry.dayId];

  return workout.exercises.map((exercise) => {
    const isCompleted = entry.checkedExerciseIds.includes(exercise.id);
    const targetSets = Number(exercise.sets) || 0;
    const completedSetsMask = Array.from({ length: targetSets }, () => isCompleted);
    const loggedWeight = entry.weightsByExercise[exercise.id] ?? "";

    return {
      completedSets: isCompleted ? targetSets : 0,
      completedSetsMask,
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      feltArea: null,
      loggedWeight,
      muscleGroup: exercise.muscleGroup,
      recommendationDecision: null,
      restSeconds: 0,
      rpe: null,
      targetSets,
      weightKg: null,
      weightLb: null,
      weightUnit: exercise.defaultUnit
    };
  });
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
    const rawCheckedIds = normalizeExerciseIdList(rawEntry.checkedExerciseIds);
    const exerciseLogs =
      Array.isArray(rawEntry.exerciseLogs) && rawEntry.exerciseLogs.length > 0
        ? rawEntry.exerciseLogs
            .map((rawLog) => normalizeExerciseLog(rawLog))
            .filter((log): log is ExerciseLog => Boolean(log))
        : createLegacyExerciseLogs({
            checkedExerciseIds: rawCheckedIds,
            dayId: rawEntry.dayId,
            weightsByExercise
          });

    const checkedExerciseIds =
      rawCheckedIds.length > 0
        ? rawCheckedIds
        : exerciseLogs
            .filter((log) => log.targetSets > 0 && log.completedSets >= log.targetSets)
            .map((log) => log.exerciseId);

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
        checkedExerciseIds,
        weightsByExercise,
        checkIn: normalizeCheckIn(rawEntry.checkIn),
        exerciseLogs,
        totalVolumeKg: Number.isFinite(Number(rawEntry.totalVolumeKg))
          ? Number(rawEntry.totalVolumeKg)
          : null
      }
    ];
  });

  return entries.sort(
    (left, right) => Date.parse(right.completedAt) - Date.parse(left.completedAt)
  );
};

export const clampWeek = (week: number) =>
  Math.min(TOTAL_PROGRAM_WEEKS, Math.max(1, Number.isFinite(week) ? week : 1));

export const createDefaultNotificationSettings = (): NotificationSettings => ({
  restTimer: true,
  trainingReminder: true,
  lastTrainingReminderDate: null
});

export const createDefaultProgress = (): ProgressState => ({
  currentWeek: 1,
  completedDaysByWeek: {},
  checkedExercisesByWeek: {},
  weightsByWeek: {},
  history: [],
  notificationSettings: createDefaultNotificationSettings(),
  checkInsByWeek: {},
  exerciseStatesByWeek: {},
  sessionStrategyByWeek: {}
});

export const normalizeProgress = (value: unknown): ProgressState => {
  if (!isRecord(value)) {
    return createDefaultProgress();
  }

  const completedDaysByWeek = normalizeCompletedDays(value.completedDaysByWeek);
  const checkedExercisesByWeek = normalizeCheckedExercises(value.checkedExercisesByWeek);
  const weightsByWeek = normalizeWeightsByWeek(value.weightsByWeek);
  const exerciseStatesByWeek = normalizeExerciseStatesByWeek(value.exerciseStatesByWeek);

  return {
    currentWeek: clampWeek(Number(value.currentWeek)),
    completedDaysByWeek,
    checkedExercisesByWeek,
    weightsByWeek,
    history: normalizeHistory(value.history),
    notificationSettings: normalizeNotificationSettings(value.notificationSettings),
    checkInsByWeek: normalizeCheckInsByWeek(value.checkInsByWeek),
    exerciseStatesByWeek:
      Object.keys(exerciseStatesByWeek).length > 0
        ? exerciseStatesByWeek
        : buildLegacyExerciseStates({
            checkedExercisesByWeek,
            weightsByWeek
          }),
    sessionStrategyByWeek: normalizeSessionStrategyByWeek(value.sessionStrategyByWeek)
  };
};
