import { athleteProfile } from "../data/athleteProfile";
import type {
  DailyCheckIn,
  Exercise,
  ExerciseRecommendation,
  PlannedExercise,
  RecommendationAction,
  SessionStrategy,
  WorkoutAdjustment,
  WorkoutCoachPlan,
  WorkoutDay,
  WorkoutHistoryEntry
} from "../types";
import { getLatestExerciseLog, parseRestToSeconds } from "./training";
import { convertWeight, parseWeightValue, roundToIncrement } from "./units";

const highKneeLoadExerciseIds = new Set(["prensa", "extension"]);
const shoulderSensitiveMotion = new Set(["press"]);
const backSensitiveMotion = new Set(["hinge"]);

const getWeightIncrement = (exercise: Exercise, currentUnit: "kg" | "lb") => {
  if (exercise.priority === "alta") {
    return currentUnit === "kg" ? 2.5 : 5;
  }

  return currentUnit === "kg" ? 1 : 2.5;
};

const getWarmupMinutes = (workout: WorkoutDay) =>
  workout.warmup?.match(/\d+/)?.[0] ? Number(workout.warmup.match(/\d+/)?.[0]) : 0;

const getBaseDuration = (workout: WorkoutDay) =>
  workout.exercises.reduce((total, exercise) => {
    const sets = Number(exercise.sets) || 0;
    const restSeconds = parseRestToSeconds(exercise.rest);
    return total + sets * 1.4 + ((Math.max(sets - 1, 0) * restSeconds) / 60);
  }, getWarmupMinutes(workout));

const isRelevantDiscomfort = (exercise: Exercise, discomforts: DailyCheckIn["discomforts"]) => {
  if (discomforts.includes("rodilla") && highKneeLoadExerciseIds.has(exercise.id)) {
    return true;
  }

  if (discomforts.includes("hombro") && shoulderSensitiveMotion.has(exercise.motion)) {
    return true;
  }

  if (discomforts.includes("espalda") && backSensitiveMotion.has(exercise.motion)) {
    return true;
  }

  return false;
};

const getConfidence = (hasHistory: boolean, reasons: string[]) => {
  let confidence = hasHistory ? 84 : 58;
  confidence += Math.max(0, 3 - reasons.length) * 4;
  return Math.min(98, Math.max(42, confidence));
};

const buildExerciseRecommendation = (
  exercise: Exercise,
  history: WorkoutHistoryEntry[],
  checkIn: DailyCheckIn | null
): ExerciseRecommendation => {
  const latestLog = getLatestExerciseLog(history, exercise.id);
  const latestWeight =
    latestLog && latestLog.loggedWeight
      ? (parseWeightValue(latestLog.loggedWeight) ?? exercise.starterWeight.value)
      : exercise.starterWeight.value;
  const latestUnit = latestLog?.weightUnit ?? exercise.starterWeight.unit;
  const latestCompletedAllSets =
    latestLog?.targetSets != null && latestLog.completedSets >= latestLog.targetSets;
  const latestRpe = latestLog?.rpe ?? null;
  const reasons: string[] = [];
  let action: RecommendationAction = "maintain_weight";
  let suggestedValue = latestWeight;

  if (!latestLog) {
    reasons.push("Aún no hay historial suficiente, así que partimos de una carga técnica conservadora.");
  } else {
    reasons.push(`Tu último registro fue ${latestLog.loggedWeight} ${latestLog.weightUnit}.`);
  }

  if (latestLog && latestCompletedAllSets && (latestRpe == null || latestRpe <= 7)) {
    action = "increase_weight";
    suggestedValue = latestWeight + getWeightIncrement(exercise, latestUnit);
    reasons.push("Completaste todas las series con margen suficiente.");
  }

  if (latestLog && (latestLog.completedSets < latestLog.targetSets || (latestRpe != null && latestRpe >= 9))) {
    action = "decrease_weight";
    suggestedValue = Math.max(
      latestWeight - getWeightIncrement(exercise, latestUnit),
      exercise.starterWeight.value
    );
    reasons.push("La sesión anterior se sintió exigente o quedó incompleta.");
  }

  if (checkIn?.energy === "baja" || checkIn?.sleep === "mal") {
    action = latestLog ? "maintain_weight" : action;
    suggestedValue = latestLog ? latestWeight : suggestedValue;
    reasons.push("Hoy reportaste baja energía o mal descanso; conviene priorizar control.");
  }

  if (checkIn && isRelevantDiscomfort(exercise, checkIn.discomforts)) {
    action = "decrease_weight";
    suggestedValue = Math.max(
      latestWeight - getWeightIncrement(exercise, latestUnit),
      exercise.starterWeight.value
    );
    reasons.push("Hay una molestia reportada que afecta directamente este patrón.");
  }

  const confidence = getConfidence(Boolean(latestLog), reasons);

  return {
    action,
    confidence,
    detail:
      action === "increase_weight"
        ? "Puedes subir un paso pequeño si la técnica sigue sólida."
        : action === "decrease_weight"
          ? "Hoy conviene bajar un poco y priorizar sensación muscular."
          : "Mantén una carga estable y enfócate en ejecución consistente.",
    exerciseId: exercise.id,
    reasons,
    suggestedUnit: latestUnit,
    suggestedValue:
      latestUnit === "kg"
        ? roundToIncrement(suggestedValue, 0.5)
        : roundToIncrement(suggestedValue, 1),
    title:
      action === "increase_weight"
        ? "Subir peso"
        : action === "decrease_weight"
          ? "Bajar peso"
          : "Mantener peso"
  };
};

const buildWorkoutAdjustments = (
  workout: WorkoutDay,
  checkIn: DailyCheckIn | null
) => {
  const adjustments: WorkoutAdjustment[] = [];

  if (!checkIn) {
    return adjustments;
  }

  if (checkIn.discomforts.includes("rodilla")) {
    highKneeLoadExerciseIds.forEach((exerciseId) => {
      if (workout.exercises.some((exercise) => exercise.id === exerciseId)) {
        adjustments.push({
          action: "protect_joint",
          detail: "Reducir una serie y dar más descanso si decides aplicar la recomendación.",
          exerciseId,
          reason: "Reportaste molestia en la rodilla y este ejercicio suele cargar más esa zona.",
          title: "Proteger rodilla"
        });
      }
    });
  }

  if (checkIn.discomforts.includes("espalda")) {
    workout.exercises
      .filter((exercise) => backSensitiveMotion.has(exercise.motion))
      .forEach((exercise) => {
        adjustments.push({
          action: "protect_joint",
          detail: "Reducir una serie y bajar un punto de exigencia hoy.",
          exerciseId: exercise.id,
          reason: "Reportaste molestia en espalda y este patrón demanda estabilidad lumbar.",
          title: "Bajar demanda lumbar"
        });
      });
  }

  if (checkIn.discomforts.includes("hombro")) {
    workout.exercises
      .filter((exercise) => shoulderSensitiveMotion.has(exercise.motion))
      .forEach((exercise) => {
        adjustments.push({
          action: "protect_joint",
          detail: "Alargar descanso y mantener un peso muy controlado.",
          exerciseId: exercise.id,
          reason: "Reportaste molestia en hombro y este patrón puede irritarlo si se apura.",
          title: "Cuidar hombro"
        });
      });
  }

  if (checkIn.timeAvailable === "45_min" || checkIn.timeAvailable === "30_min") {
    adjustments.push({
      action: "shorten_session",
      detail:
        checkIn.timeAvailable === "30_min"
          ? "Recortar accesorios base al final de la sesión."
          : "Dejar como opcional el último accesorio base.",
      reason: "Hoy tienes menos tiempo y conviene asegurar el bloque principal primero.",
      title: "Ajustar duración"
    });
  }

  if (checkIn.energy === "baja" || checkIn.sleep === "mal" || checkIn.sleep === "regular") {
    adjustments.push({
      action: "extend_rest",
      detail: "Agregar 15 segundos de descanso en los básicos principales.",
      reason: "El estado de energía sugiere dar más espacio para sostener técnica.",
      title: "Respirar más entre series"
    });
  }

  return adjustments;
};

export const buildWorkoutCoachPlan = ({
  history,
  strategy,
  workout,
  checkIn
}: {
  history: WorkoutHistoryEntry[];
  strategy: SessionStrategy;
  workout: WorkoutDay;
  checkIn: DailyCheckIn | null;
}): WorkoutCoachPlan => {
  const adjustments = buildWorkoutAdjustments(workout, checkIn);
  const baseOptionalCount =
    checkIn?.timeAvailable === "30_min" ? 2 : checkIn?.timeAvailable === "45_min" ? 1 : 0;
  const baseExercises = workout.exercises.filter((exercise) => exercise.priority === "base");
  const optionalIds = new Set(
    baseExercises
      .slice(Math.max(baseExercises.length - baseOptionalCount, 0))
      .map((exercise) => exercise.id)
  );

  let exercisePlans: PlannedExercise[] = workout.exercises.map((exercise) => {
    const recommendation = buildExerciseRecommendation(exercise, history, checkIn);
    let plannedSets = Number(exercise.sets) || 0;
    let plannedRestSeconds = parseRestToSeconds(exercise.rest);

    if (strategy === "applied" && checkIn) {
      if (isRelevantDiscomfort(exercise, checkIn.discomforts) && plannedSets > 2) {
        plannedSets -= 1;
      }

      if (
        checkIn.energy === "baja" ||
        checkIn.sleep === "mal" ||
        checkIn.sleep === "regular"
      ) {
        plannedRestSeconds += 15;
      }
    }

    return {
      ...exercise,
      isOptional: optionalIds.has(exercise.id),
      plannedRestSeconds,
      plannedSets,
      recommendation
    };
  });

  if (strategy === "applied" && optionalIds.size > 0) {
    exercisePlans = exercisePlans.filter((exercise) => !exercise.isOptional);
  }

  const reasons =
    checkIn == null
      ? [
          `${athleteProfile.name} entrena con prioridad en técnica, bajo impacto y progresión gradual.`,
          "Sin check-in del día, el plan mantiene la estructura base con recomendaciones por historial."
        ]
      : [
          `Sueño: ${checkIn.sleep}.`,
          `Energía: ${checkIn.energy}.`,
          checkIn.discomforts.length > 0
            ? `Molestias reportadas: ${checkIn.discomforts.join(", ")}.`
            : "Sin molestias reportadas.",
          `Tiempo disponible: ${checkIn.timeAvailable.replace("_", " ")}.`
        ];

  const estimatedDurationMinutes = Math.round(
    Math.max(
      18,
      exercisePlans.reduce((total, exercise) => {
        const setMinutes = exercise.plannedSets * 1.4;
        const restMinutes =
          (Math.max(exercise.plannedSets - 1, 0) * exercise.plannedRestSeconds) / 60;
        return total + setMinutes + restMinutes;
      }, getWarmupMinutes(workout))
    )
  );

  return {
    adjustments,
    confidence: Math.min(97, Math.max(64, 76 + Math.min(10, adjustments.length * 3))),
    estimatedDurationMinutes:
      workout.kind === "strength" ? estimatedDurationMinutes : Math.round(getBaseDuration(workout)),
    exercisePlans,
    reasons,
    summary:
      checkIn == null
        ? "Plan base listo para entrenar sin fricción."
        : strategy === "applied"
          ? "Aplicamos un ajuste inteligente para acompañar cómo llegaste hoy."
          : "Se mantuvo la rutina original, pero las recomendaciones siguen visibles."
  };
};

export const getRecommendationReasonList = (recommendation: ExerciseRecommendation) =>
  recommendation.reasons.slice(0, 4);

export const getSuggestedPair = (recommendation: ExerciseRecommendation) => {
  if (recommendation.suggestedValue == null) {
    return null;
  }

  const primaryValue = recommendation.suggestedValue;
  const primaryUnit = recommendation.suggestedUnit;
  const secondaryUnit: "kg" | "lb" = primaryUnit === "kg" ? "lb" : "kg";
  const secondaryValue = convertWeight(primaryValue, primaryUnit, secondaryUnit);

  return {
    primaryUnit,
    primaryValue,
    secondaryUnit,
    secondaryValue
  };
};
