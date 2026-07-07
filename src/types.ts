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

export type Exercise = {
  id: string;
  name: string;
  sets: string;
  reps: string;
  rest: string;
  priority: Priority;
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

export type ExerciseWeights = Record<string, string>;

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
};

export type NotificationSettings = {
  restTimer: boolean;
  trainingReminder: boolean;
  lastTrainingReminderDate: null | string;
};

export type AppScreen = "home" | "agenda" | "workout" | "progression" | "settings";

export type ProgressState = {
  currentWeek: number;
  completedDaysByWeek: Record<string, DayId[]>;
  checkedExercisesByWeek: Record<string, Partial<Record<DayId, string[]>>>;
  weightsByWeek: Record<string, Partial<Record<DayId, ExerciseWeights>>>;
  history: WorkoutHistoryEntry[];
  notificationSettings: NotificationSettings;
};
