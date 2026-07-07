import type { ExerciseProgressState, PlannedExercise, WeightUnit } from "../types";
import { toWeightSummary } from "./units";

export const createExerciseState = (
  exercise: PlannedExercise,
  currentState?: ExerciseProgressState | null
): ExerciseProgressState => ({
  completedSets:
    currentState?.completedSets.length === exercise.plannedSets
      ? [...currentState.completedSets]
      : Array.from({ length: exercise.plannedSets }, (_, index) =>
          currentState?.completedSets[index] ?? false
        ),
  feltArea: currentState?.feltArea ?? null,
  recommendationDecision: currentState?.recommendationDecision ?? null,
  rpe: currentState?.rpe ?? null,
  updatedAt: currentState?.updatedAt ?? null,
  weightUnit: currentState?.weightUnit ?? exercise.defaultUnit,
  weightValue: currentState?.weightValue ?? ""
});

export const isExerciseComplete = (
  exercise: PlannedExercise,
  state?: ExerciseProgressState | null
) => Boolean(state) && createExerciseState(exercise, state).completedSets.every(Boolean);

export const getCompletedSetCount = (
  exercise: PlannedExercise,
  state?: ExerciseProgressState | null
) => createExerciseState(exercise, state).completedSets.filter(Boolean).length;

export const findCurrentExerciseIndex = (
  exercises: PlannedExercise[],
  states: Record<string, ExerciseProgressState>
) => {
  const firstIncompleteIndex = exercises.findIndex(
    (exercise) => !isExerciseComplete(exercise, states[exercise.id])
  );

  return firstIncompleteIndex >= 0 ? firstIncompleteIndex : Math.max(exercises.length - 1, 0);
};

export const getWeightSummary = (value: string, unit: WeightUnit) => toWeightSummary(value, unit);
