import type { ExerciseProgressState, PlannedExercise } from "../types";
import {
  buildTrainingSequence,
  createExerciseState,
  findCurrentTrainingStepIndex,
  findNextPendingTrainingStepIndex,
  getTrainingStepFlow,
  getTrainingRoundSummary,
  isExerciseComplete
} from "./session";

const createPlannedExercise = (
  id: string,
  name: string,
  plannedSets: number
): PlannedExercise => ({
  id,
  mediaKey: id,
  name,
  sets: String(plannedSets),
  reps: "10",
  rest: "90 s",
  priority: "alta",
  muscleGroup: "Gluteo",
  equipment: "barbell",
  difficulty: "principiante-intermedia",
  kneeFriendly: true,
  motion: "thrust",
  jointLoad: "low",
  defaultUnit: "kg",
  starterWeight: {
    value: 20,
    unit: "kg"
  },
  isOptional: false,
  plannedRestSeconds: 90,
  plannedSets,
  recommendation: {
    action: "maintain_weight",
    confidence: 80,
    detail: "Mantener la carga",
    exerciseId: id,
    reasons: [],
    suggestedUnit: "kg",
    suggestedValue: 20,
    title: "Mantener la carga"
  }
});

const plannedExercise = createPlannedExercise("hip-thrust", "Hip Thrust", 4);
const legPress = createPlannedExercise("leg-press", "Leg Press", 2);

describe("session helpers", () => {
  it("pads completed sets to the planned amount", () => {
    const state = createExerciseState(plannedExercise, {
      completedSets: [true, false],
      feltArea: null,
      recommendationDecision: null,
      rpe: null,
      updatedAt: null,
      weightUnit: "kg",
      weightValue: "20"
    });

    expect(state.completedSets).toEqual([true, false, false, false]);
  });

  it("detects when every set is complete", () => {
    const state: ExerciseProgressState = {
      completedSets: [true, true, true, true],
      feltArea: null,
      recommendationDecision: null,
      rpe: 7,
      updatedAt: null,
      weightUnit: "kg",
      weightValue: "22.5"
    };

    expect(isExerciseComplete(plannedExercise, state)).toBe(true);
  });

  it("builds a traditional sequence by finishing one exercise before moving on", () => {
    const sequence = buildTrainingSequence([plannedExercise, legPress], "traditional");

    expect(sequence.map((step) => `${step.exerciseId}:${step.setIndex + 1}`)).toEqual([
      "hip-thrust:1",
      "hip-thrust:2",
      "hip-thrust:3",
      "hip-thrust:4",
      "leg-press:1",
      "leg-press:2"
    ]);
  });

  it("builds an alternated sequence by rounds and skips finished exercises", () => {
    const sequence = buildTrainingSequence([plannedExercise, legPress], "alternated");

    expect(sequence.map((step) => `${step.roundIndex + 1}-${step.exerciseId}:${step.setIndex + 1}`)).toEqual([
      "1-hip-thrust:1",
      "1-leg-press:1",
      "2-hip-thrust:2",
      "2-leg-press:2",
      "3-hip-thrust:3",
      "4-hip-thrust:4"
    ]);
  });

  it("builds a circuit sequence by exercise blocks", () => {
    const sequence = buildTrainingSequence([plannedExercise, legPress], "circuit");

    expect(sequence.map((step) => `${step.exerciseId}:${step.setIndex + 1}`)).toEqual([
      "hip-thrust:1",
      "hip-thrust:2",
      "hip-thrust:3",
      "hip-thrust:4",
      "leg-press:1",
      "leg-press:2"
    ]);
  });

  it("finds the current and next pending steps from saved progress", () => {
    const sequence = buildTrainingSequence([plannedExercise, legPress], "alternated");
    const states = {
      "hip-thrust": createExerciseState(plannedExercise, {
        completedSets: [true, true, false, false],
        feltArea: null,
        recommendationDecision: null,
        rpe: null,
        updatedAt: null,
        weightUnit: "kg",
        weightValue: "20"
      }),
      "leg-press": createExerciseState(legPress, {
        completedSets: [true, false],
        feltArea: null,
        recommendationDecision: null,
        rpe: null,
        updatedAt: null,
        weightUnit: "kg",
        weightValue: "40"
      })
    };

    expect(findCurrentTrainingStepIndex(sequence, [plannedExercise, legPress], states)).toBe(3);
    expect(findNextPendingTrainingStepIndex(sequence, [plannedExercise, legPress], states, 4)).toBe(4);
  });

  it("summarizes the current round for alternated mode", () => {
    const sequence = buildTrainingSequence([plannedExercise, legPress], "alternated");
    const roundSummary = getTrainingRoundSummary(sequence, 2);

    expect(roundSummary).toEqual({
      currentRound: 2,
      currentRoundStep: 1,
      roundStepCount: 2,
      totalRounds: 4
    });
  });

  it("resolves rest and advance flow for each training mode", () => {
    const traditionalSequence = buildTrainingSequence([plannedExercise, legPress], "traditional");
    const alternatedSequence = buildTrainingSequence([plannedExercise, legPress], "alternated");
    const circuitSequence = buildTrainingSequence([plannedExercise, legPress], "circuit");

    expect(
      getTrainingStepFlow("traditional", traditionalSequence[0], traditionalSequence[1])
    ).toBe("rest-between-sets");
    expect(
      getTrainingStepFlow("traditional", traditionalSequence[3], traditionalSequence[4])
    ).toBe("advance");
    expect(
      getTrainingStepFlow("alternated", alternatedSequence[0], alternatedSequence[1])
    ).toBe("advance");
    expect(
      getTrainingStepFlow("alternated", alternatedSequence[1], alternatedSequence[2])
    ).toBe("rest-between-rounds");
    expect(getTrainingStepFlow("circuit", circuitSequence[0], circuitSequence[1])).toBe(
      "rest-between-sets"
    );
    expect(getTrainingStepFlow("circuit", circuitSequence[3], circuitSequence[4])).toBe(
      "rest-between-exercises"
    );
    expect(getTrainingStepFlow("circuit", circuitSequence[5], null)).toBe("complete");
  });
});
