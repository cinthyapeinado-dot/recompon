import type {
  ExerciseProgressState,
  PlannedExercise,
  TrainingMode,
  WeightUnit
} from "../types";
import { toWeightSummary } from "./units";

export type TrainingStep = {
  exerciseId: string;
  exerciseIndex: number;
  roundIndex: number;
  setIndex: number;
};

export type TrainingRoundSummary = {
  currentRound: number;
  currentRoundStep: number;
  roundStepCount: number;
  totalRounds: number;
};

export type TrainingStepFlow =
  | "complete"
  | "rest-between-rounds"
  | "rest-between-sets"
  | "rest-between-exercises"
  | "advance";

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

export const getCurrentPendingSetIndex = (
  exercise: PlannedExercise,
  state?: ExerciseProgressState | null
) => createExerciseState(exercise, state).completedSets.findIndex((value) => !value);

export const findCurrentExerciseIndex = (
  exercises: PlannedExercise[],
  states: Record<string, ExerciseProgressState>
) => {
  const firstIncompleteIndex = exercises.findIndex(
    (exercise) => !isExerciseComplete(exercise, states[exercise.id])
  );

  return firstIncompleteIndex >= 0 ? firstIncompleteIndex : Math.max(exercises.length - 1, 0);
};

const buildTraditionalTrainingSequence = (exercises: PlannedExercise[]) =>
  exercises.flatMap((exercise, exerciseIndex) =>
    Array.from({ length: exercise.plannedSets }, (_, setIndex) => ({
      exerciseId: exercise.id,
      exerciseIndex,
      roundIndex: setIndex,
      setIndex
    }))
  );

const buildRoundBasedTrainingSequence = (exercises: PlannedExercise[]) => {
  const totalRounds = Math.max(0, ...exercises.map((exercise) => exercise.plannedSets));
  const steps: TrainingStep[] = [];

  for (let roundIndex = 0; roundIndex < totalRounds; roundIndex += 1) {
    exercises.forEach((exercise, exerciseIndex) => {
      if (exercise.plannedSets <= roundIndex) {
        return;
      }

      steps.push({
        exerciseId: exercise.id,
        exerciseIndex,
        roundIndex,
        setIndex: roundIndex
      });
    });
  }

  return steps;
};

export const buildTrainingSequence = (
  exercises: PlannedExercise[],
  mode: TrainingMode
): TrainingStep[] =>
  mode === "alternated"
    ? buildRoundBasedTrainingSequence(exercises)
    : buildTraditionalTrainingSequence(exercises);

export const getTrainingStepFlow = (
  mode: TrainingMode,
  currentStep: TrainingStep,
  nextStep: TrainingStep | null
): TrainingStepFlow => {
  if (nextStep == null) {
    return "complete";
  }

  if (mode === "alternated") {
    return nextStep.roundIndex !== currentStep.roundIndex ? "rest-between-rounds" : "advance";
  }

  if (nextStep.exerciseId === currentStep.exerciseId) {
    return "rest-between-sets";
  }

  return mode === "circuit" ? "rest-between-exercises" : "advance";
};

export const isTrainingStepComplete = (
  step: TrainingStep,
  exercises: PlannedExercise[],
  states: Record<string, ExerciseProgressState>
) => {
  const exercise = exercises[step.exerciseIndex];

  if (!exercise) {
    return true;
  }

  return createExerciseState(exercise, states[exercise.id]).completedSets[step.setIndex] === true;
};

export const getCompletedTrainingStepCount = (
  sequence: TrainingStep[],
  exercises: PlannedExercise[],
  states: Record<string, ExerciseProgressState>
) => sequence.filter((step) => isTrainingStepComplete(step, exercises, states)).length;

export const findCurrentTrainingStepIndex = (
  sequence: TrainingStep[],
  exercises: PlannedExercise[],
  states: Record<string, ExerciseProgressState>
) => {
  const firstIncompleteIndex = sequence.findIndex(
    (step) => !isTrainingStepComplete(step, exercises, states)
  );

  return firstIncompleteIndex >= 0 ? firstIncompleteIndex : sequence.length;
};

export const findNextPendingTrainingStepIndex = (
  sequence: TrainingStep[],
  exercises: PlannedExercise[],
  states: Record<string, ExerciseProgressState>,
  startIndex: number
) => {
  for (let index = Math.max(0, startIndex); index < sequence.length; index += 1) {
    if (!isTrainingStepComplete(sequence[index], exercises, states)) {
      return index;
    }
  }

  return sequence.length;
};

export const getTrainingRoundSummary = (
  sequence: TrainingStep[],
  currentStepIndex: number
): TrainingRoundSummary | null => {
  if (sequence.length === 0) {
    return null;
  }

  const safeIndex = Math.min(currentStepIndex, sequence.length - 1);
  const currentStep = sequence[safeIndex];
  const roundSteps = sequence.filter((step) => step.roundIndex === currentStep.roundIndex);
  const currentRoundStep = roundSteps.findIndex(
    (step) => step.exerciseId === currentStep.exerciseId && step.setIndex === currentStep.setIndex
  );

  return {
    currentRound: currentStep.roundIndex + 1,
    currentRoundStep: currentRoundStep + 1,
    roundStepCount: roundSteps.length,
    totalRounds: Math.max(...sequence.map((step) => step.roundIndex + 1), 0)
  };
};

export const getWeightSummary = (value: string, unit: WeightUnit) => toWeightSummary(value, unit);
