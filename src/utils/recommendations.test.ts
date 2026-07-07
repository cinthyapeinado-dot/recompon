import type { DailyCheckIn, Exercise, WorkoutDay, WorkoutHistoryEntry } from "../types";
import { buildWorkoutCoachPlan } from "./recommendations";

const buildWorkout = (exercise: Exercise): WorkoutDay => ({
  id: "monday",
  label: "Lunes",
  shortLabel: "Lun",
  title: "Pierna A",
  focus: "Trabajo tecnico",
  kind: "strength",
  warmup: "Eliptica 15 min",
  tip: "Control y postura",
  microcopy: "Sin prisa",
  estimatedDurationMinutes: 55,
  expectedEnergy: "media",
  exercises: [exercise]
});

const baseExercise: Exercise = {
  id: "prensa",
  mediaKey: "leg-press",
  name: "Prensa",
  sets: "4",
  reps: "12",
  rest: "90 s",
  priority: "base",
  muscleGroup: "Cuadriceps",
  equipment: "machine",
  difficulty: "principiante",
  kneeFriendly: false,
  motion: "press",
  jointLoad: "high",
  defaultUnit: "kg",
  starterWeight: {
    value: 40,
    unit: "kg"
  }
};

const baseHistoryEntry: WorkoutHistoryEntry = {
  id: "history-1",
  completedAt: "2026-07-01T08:00:00.000Z",
  calendarDate: "2026-07-01",
  week: 1,
  dayId: "monday",
  title: "Pierna A",
  focus: "Trabajo tecnico",
  kind: "strength",
  checkedExerciseIds: ["prensa"],
  weightsByExercise: {
    prensa: "60 kg"
  },
  checkIn: null,
  exerciseLogs: [
    {
      completedSets: 4,
      completedSetsMask: [true, true, true, true],
      exerciseId: "prensa",
      exerciseName: "Prensa",
      feltArea: "cuadriceps",
      loggedWeight: "60",
      muscleGroup: "Cuadriceps",
      recommendationDecision: "kept",
      restSeconds: 90,
      rpe: 6,
      targetSets: 4,
      weightKg: 60,
      weightLb: 132,
      weightUnit: "kg"
    }
  ],
  totalVolumeKg: 2880
};

const buildCheckIn = (overrides: Partial<DailyCheckIn>): DailyCheckIn => ({
  calendarDate: "2026-07-07",
  createdAt: "2026-07-07T08:00:00.000Z",
  dayId: "monday",
  energy: "media",
  discomforts: [],
  sleep: "bien",
  timeAvailable: "completo",
  week: 1,
  ...overrides
});

describe("workout recommendations", () => {
  it("keeps knee-sensitive load increases conservative", () => {
    const plan = buildWorkoutCoachPlan({
      history: [baseHistoryEntry],
      strategy: "pending",
      workout: buildWorkout(baseExercise),
      checkIn: buildCheckIn({})
    });

    const recommendation = plan.exercisePlans[0].recommendation;

    expect(recommendation.action).toBe("increase_weight");
    expect(recommendation.suggestedValue).toBeLessThanOrEqual(61.5);
    expect(recommendation.detail).toContain("rodilla");
  });

  it("reduces the suggested load when there is knee discomfort", () => {
    const plan = buildWorkoutCoachPlan({
      history: [baseHistoryEntry],
      strategy: "pending",
      workout: buildWorkout(baseExercise),
      checkIn: buildCheckIn({ discomforts: ["rodilla"] })
    });

    const recommendation = plan.exercisePlans[0].recommendation;

    expect(recommendation.action).toBe("decrease_weight");
    expect(recommendation.suggestedValue).toBeLessThan(60);
  });
});
