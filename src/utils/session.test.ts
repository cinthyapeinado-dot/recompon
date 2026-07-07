import type { ExerciseProgressState, PlannedExercise } from "../types";
import { createExerciseState, isExerciseComplete } from "./session";

const plannedExercise: PlannedExercise = {
  id: "hip-thrust",
  mediaKey: "hip-thrust",
  name: "Hip Thrust",
  sets: "4",
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
  plannedSets: 4,
  recommendation: {
    action: "maintain_weight",
    confidence: 80,
    detail: "Mantener la carga",
    exerciseId: "hip-thrust",
    reasons: [],
    suggestedUnit: "kg",
    suggestedValue: 20,
    title: "Mantener la carga"
  }
};

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
});
