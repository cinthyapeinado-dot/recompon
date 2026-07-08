export type Priority = "alta" | "base";

export type DayId =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type WorkoutKind = "strength" | "active" | "rest";

export type WeightUnit = "kg" | "lb";

export type TrainingMode = "traditional" | "alternated" | "circuit";

export type SleepQuality = "excelente" | "bien" | "regular" | "mal";

export type EnergyLevel = "alta" | "media" | "baja";

export type TimeAvailability = "completo" | "45_min" | "30_min";

export type DiscomfortArea = "rodilla" | "espalda" | "hombro" | "otra";

export type FeltArea = "gluteo" | "femoral" | "cuadriceps" | "espalda" | "otro";

export type ExerciseMotionKind =
  | "thrust"
  | "hinge"
  | "press"
  | "pull"
  | "abduction"
  | "extension"
  | "curl"
  | "calf"
  | "plank"
  | "walk"
  | "rest";

export type ExerciseDifficulty = "principiante" | "principiante-intermedia" | "intermedia";

export type ExerciseMediaKind = "placeholder" | "mp4" | "gif" | "image";

export type ExerciseMediaResource = {
  alt: string;
  kind: ExerciseMediaKind;
  posterSrc?: string | null;
  previewSrc: string | null;
  source: "external" | "local" | "placeholder" | "preview";
  src?: string;
};

export type Exercise = {
  id: string;
  externalExerciseId?: string;
  mediaKey: string;
  name: string;
  sets: string;
  reps: string;
  rest: string;
  priority: Priority;
  muscleGroup: string;
  equipment: string;
  difficulty: ExerciseDifficulty;
  kneeFriendly: boolean;
  motion: ExerciseMotionKind;
  jointLoad: "low" | "medium" | "high";
  defaultUnit: WeightUnit;
  starterWeight: {
    value: number;
    unit: WeightUnit;
  };
};

export type WorkoutDay = {
  id: DayId;
  label: string;
  shortLabel: string;
  title: string;
  focus: string;
  kind: WorkoutKind;
  warmup?: string;
  details?: string;
  tip: string;
  microcopy: string;
  estimatedDurationMinutes: number;
  expectedEnergy: "suave" | "media" | "alta";
  exercises: Exercise[];
};

export type ProgressionPhase = {
  title: string;
  weeks: string;
  startWeek: number;
  endWeek: number;
  description: string;
  emphasis: string;
};

export type AthleteProfile = {
  name: string;
  level: string;
  weeklyTrainingDays: number;
  companionDiscipline: string;
  strengthProfile: string;
  historyNotes: string[];
  sensitivities: string[];
  trainingPreferences: string[];
  mixedUnits: boolean;
};

export type ExerciseWeights = Record<string, string>;

export type DailyCheckIn = {
  calendarDate: string;
  createdAt: string;
  dayId: DayId;
  energy: EnergyLevel;
  discomforts: DiscomfortArea[];
  sleep: SleepQuality;
  timeAvailable: TimeAvailability;
  week: number;
};

export type ExerciseProgressState = {
  completedSets: boolean[];
  feltArea: FeltArea | null;
  recommendationDecision: "applied" | "kept" | null;
  rpe: number | null;
  updatedAt: string | null;
  weightUnit: WeightUnit;
  weightValue: string;
};

export type ExerciseLog = {
  completedSets: number;
  completedSetsMask: boolean[];
  exerciseId: string;
  exerciseName: string;
  feltArea: FeltArea | null;
  loggedWeight: string;
  muscleGroup: string;
  recommendationDecision: "applied" | "kept" | null;
  restSeconds: number;
  rpe: number | null;
  targetSets: number;
  weightKg: number | null;
  weightLb: number | null;
  weightUnit: WeightUnit;
};

export type WorkoutHistoryEntry = {
  id: string;
  completedAt: string;
  calendarDate: string;
  week: number;
  dayId: DayId;
  title: string;
  focus: string;
  kind: WorkoutKind;
  checkedExerciseIds: string[];
  weightsByExercise: ExerciseWeights;
  checkIn: DailyCheckIn | null;
  exerciseLogs: ExerciseLog[];
  totalVolumeKg: number | null;
};

export type NotificationSettings = {
  restTimer: boolean;
  trainingReminder: boolean;
  lastTrainingReminderDate: null | string;
};

export type SessionStrategy = "pending" | "applied" | "kept";

export type RecommendationAction =
  | "increase_weight"
  | "maintain_weight"
  | "decrease_weight"
  | "reduce_volume"
  | "extend_rest"
  | "protect_joint"
  | "shorten_session";

export type ExerciseRecommendation = {
  action: RecommendationAction;
  confidence: number;
  detail: string;
  exerciseId: string;
  reasons: string[];
  suggestedUnit: WeightUnit;
  suggestedValue: number | null;
  title: string;
};

export type WorkoutAdjustment = {
  action: RecommendationAction;
  detail: string;
  exerciseId?: string;
  reason: string;
  title: string;
};

export type PlannedExercise = Exercise & {
  isOptional: boolean;
  plannedRestSeconds: number;
  plannedSets: number;
  recommendation: ExerciseRecommendation;
};

export type WorkoutCoachPlan = {
  adjustments: WorkoutAdjustment[];
  confidence: number;
  estimatedDurationMinutes: number;
  exercisePlans: PlannedExercise[];
  reasons: string[];
  summary: string;
};

export type AppScreen =
  | "home"
  | "checkin"
  | "agenda"
  | "workout"
  | "progression"
  | "settings";

export type ProgressState = {
  currentWeek: number;
  completedDaysByWeek: Record<string, DayId[]>;
  checkedExercisesByWeek: Record<string, Partial<Record<DayId, string[]>>>;
  weightsByWeek: Record<string, Partial<Record<DayId, ExerciseWeights>>>;
  history: WorkoutHistoryEntry[];
  notificationSettings: NotificationSettings;
  checkInsByWeek: Record<string, Partial<Record<DayId, DailyCheckIn>>>;
  exerciseStatesByWeek: Record<
    string,
    Partial<Record<DayId, Record<string, ExerciseProgressState>>>
  >;
  sessionStrategyByWeek: Record<string, Partial<Record<DayId, SessionStrategy>>>;
  trainingModeByWeek: Record<string, Partial<Record<DayId, TrainingMode>>>;
  trainingModePreference: TrainingMode | null;
};
