import { useEffect, useMemo, useState } from "react";
import { athleteProfile } from "./data/athleteProfile";
import { BottomNav } from "./components/BottomNav";
import { ConfirmationSheet } from "./components/ConfirmationSheet";
import { FloatingTodayButton } from "./components/FloatingTodayButton";
import { workouts, workoutsById } from "./data/workouts";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { AgendaScreen } from "./screens/AgendaScreen";
import { CheckInScreen } from "./screens/CheckInScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { ProgressionScreen } from "./screens/ProgressionScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { WorkoutScreen } from "./screens/WorkoutScreen";
import type {
  AppScreen,
  DailyCheckIn,
  DayId,
  ExerciseLog,
  ExerciseProgressState,
  ExerciseWeights,
  FeltArea,
  NotificationSettings,
  PlannedExercise,
  ProgressState,
  SessionStrategy,
  WeightUnit,
  WorkoutHistoryEntry
} from "./types";
import { formatCalendarDate, getDayIdFromDate } from "./utils/date";
import { buildWorkoutCoachPlan } from "./utils/recommendations";
import {
  clampWeek,
  createDefaultProgress,
  normalizeProgress
} from "./utils/progress";
import {
  computeExerciseVolumeKg,
  getExerciseSparklinePoints,
  getLatestExerciseLog,
} from "./utils/training";
import {
  createExerciseState,
  findCurrentExerciseIndex,
  getWeightSummary,
  isExerciseComplete
} from "./utils/session";
import { convertWeight, parseWeightValue } from "./utils/units";

const STORAGE_KEY = "recompon-progress-v1";
const NOTIFICATION_ICON = "/icons/icon-192.png";

type NotificationPermissionState = NotificationPermission | "unsupported";

const getNotificationPermissionState = (): NotificationPermissionState => {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }

  return Notification.permission;
};

const energyLabelMap = {
  suave: "Suave",
  media: "Media",
  alta: "Alta"
} as const;

const buildHistoryEntry = ({
  calendarDate,
  checkIn,
  completedAt,
  dayId,
  exerciseLogs,
  focus,
  kind,
  title,
  totalVolumeKg,
  week,
  weightsByExercise
}: {
  calendarDate: string;
  checkIn: DailyCheckIn | null;
  completedAt: string;
  dayId: DayId;
  exerciseLogs: ExerciseLog[];
  focus: string;
  kind: WorkoutHistoryEntry["kind"];
  title: string;
  totalVolumeKg: number | null;
  week: number;
  weightsByExercise: ExerciseWeights;
}): WorkoutHistoryEntry => ({
  id: `${calendarDate}-${week}-${dayId}`,
  completedAt,
  calendarDate,
  week,
  dayId,
  title,
  focus,
  kind,
  checkedExerciseIds: exerciseLogs
    .filter((log) => log.targetSets > 0 && log.completedSets >= log.targetSets)
    .map((log) => log.exerciseId),
  weightsByExercise,
  checkIn,
  exerciseLogs,
  totalVolumeKg
});

function App() {
  const todayDayId = getDayIdFromDate();
  const todayCalendarDate = formatCalendarDate();
  const [activeScreen, setActiveScreen] = useState<AppScreen>("home");
  const [selectedDayId, setSelectedDayId] = useState<DayId>(todayDayId);
  const [isResetSheetOpen, setResetSheetOpen] = useState(false);
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermissionState>(getNotificationPermissionState);
  const [workoutExerciseIndex, setWorkoutExerciseIndex] = useState(0);
  const [progress, setProgress] = useLocalStorage<ProgressState>(
    STORAGE_KEY,
    createDefaultProgress,
    {
      deserialize: (value) => normalizeProgress(JSON.parse(value) as unknown)
    }
  );

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const syncPermission = () => {
      setNotificationPermission(getNotificationPermissionState());
    };

    document.addEventListener("visibilitychange", syncPermission);
    window.addEventListener("focus", syncPermission);

    return () => {
      document.removeEventListener("visibilitychange", syncPermission);
      window.removeEventListener("focus", syncPermission);
    };
  }, []);

  const currentWeekKey = String(progress.currentWeek);
  const selectedWorkout = workoutsById[selectedDayId];
  const todayWorkout = workoutsById[todayDayId];
  const completedDays = progress.completedDaysByWeek[currentWeekKey] ?? [];
  const selectedCheckIn = progress.checkInsByWeek[currentWeekKey]?.[selectedDayId] ?? null;
  const todayCheckIn = progress.checkInsByWeek[currentWeekKey]?.[todayDayId] ?? null;
  const selectedStrategy =
    progress.sessionStrategyByWeek[currentWeekKey]?.[selectedDayId] ?? "pending";
  const todayStrategy = progress.sessionStrategyByWeek[currentWeekKey]?.[todayDayId] ?? "pending";
  const selectedDayHistory = useMemo(
    () => progress.history.filter((entry) => entry.dayId === selectedDayId),
    [progress.history, selectedDayId]
  );
  const todayHistory = useMemo(
    () => progress.history.filter((entry) => entry.dayId === todayDayId),
    [progress.history, todayDayId]
  );

  const selectedCoachPlan = useMemo(
    () =>
      buildWorkoutCoachPlan({
        history: selectedDayHistory,
        strategy: selectedStrategy,
        workout: selectedWorkout,
        checkIn: selectedCheckIn
      }),
    [selectedCheckIn, selectedDayHistory, selectedStrategy, selectedWorkout]
  );

  const todayCoachPlan = useMemo(
    () =>
      buildWorkoutCoachPlan({
        history: todayHistory,
        strategy: todayStrategy,
        workout: todayWorkout,
        checkIn: todayCheckIn
      }),
    [todayCheckIn, todayHistory, todayStrategy, todayWorkout]
  );

  const selectedExercisePlans = selectedCoachPlan.exercisePlans;
  const selectedExerciseStates =
    progress.exerciseStatesByWeek[currentWeekKey]?.[selectedDayId] ?? {};
  const normalizedExerciseStates = Object.fromEntries(
    selectedExercisePlans.map((exercise) => [
      exercise.id,
      createExerciseState(exercise, selectedExerciseStates[exercise.id])
    ])
  ) as Record<string, ExerciseProgressState>;
  const derivedWorkoutStartIndex = useMemo(() => {
    if (selectedExercisePlans.length === 0) {
      return 0;
    }

    const firstIncompleteIndex = findCurrentExerciseIndex(
      selectedExercisePlans,
      normalizedExerciseStates
    );

    const allComplete = selectedExercisePlans.every((exercise) =>
      isExerciseComplete(exercise, normalizedExerciseStates[exercise.id])
    );

    return allComplete ? selectedExercisePlans.length : firstIncompleteIndex;
  }, [normalizedExerciseStates, selectedExercisePlans]);

  useEffect(() => {
    if (activeScreen !== "workout") {
      return;
    }

    setWorkoutExerciseIndex(derivedWorkoutStartIndex);
  }, [activeScreen, progress.currentWeek, selectedDayId]);

  useEffect(() => {
    if (workoutExerciseIndex > selectedExercisePlans.length) {
      setWorkoutExerciseIndex(selectedExercisePlans.length);
    }
  }, [selectedExercisePlans.length, workoutExerciseIndex]);

  const currentExercise = selectedExercisePlans[workoutExerciseIndex] ?? null;
  const currentExerciseState = currentExercise
    ? normalizedExerciseStates[currentExercise.id]
    : null;
  const isWorkoutComplete =
    selectedWorkout.kind !== "strength"
      ? true
      : selectedExercisePlans.length > 0 &&
        selectedExercisePlans.every((exercise) =>
          isExerciseComplete(exercise, normalizedExerciseStates[exercise.id])
        );
  const latestExerciseLog = currentExercise
    ? getLatestExerciseLog(selectedDayHistory, currentExercise.id)
    : null;
  const sparklinePoints = currentExercise
    ? getExerciseSparklinePoints(selectedDayHistory, currentExercise.id)
    : [];
  const completionPercentage = Math.round((completedDays.length / workouts.length) * 100);
  const notificationsEnabled =
    notificationPermission === "granted" && progress.notificationSettings.restTimer;
  const hasSessionToday = progress.history.some(
    (entry) => entry.calendarDate === todayCalendarDate
  );

  const syncDerivedDayState = (
    exercises: PlannedExercise[],
    dayStates: Record<string, ExerciseProgressState>
  ) => {
    const checkedIds = exercises
      .filter((exercise) => isExerciseComplete(exercise, dayStates[exercise.id]))
      .map((exercise) => exercise.id);

    const weights = Object.fromEntries(
      exercises.flatMap((exercise) => {
        const state = dayStates[exercise.id];
        const summary = getWeightSummary(state?.weightValue ?? "", state?.weightUnit ?? exercise.defaultUnit);
        return summary ? [[exercise.id, summary]] : [];
      })
    );

    return { checkedIds, weights };
  };

  const sendLocalNotification = async (
    title: string,
    body: string,
    options?: Pick<NotificationOptions, "tag">
  ) => {
    if (notificationPermission !== "granted") {
      return false;
    }

    const notificationOptions: NotificationOptions = {
      body,
      icon: NOTIFICATION_ICON,
      badge: NOTIFICATION_ICON,
      tag: options?.tag
    };

    try {
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(title, notificationOptions);
      } else {
        new Notification(title, notificationOptions);
      }

      if ("vibrate" in navigator) {
        navigator.vibrate([120, 60, 120]);
      }

      return true;
    } catch {
      try {
        new Notification(title, notificationOptions);
        return true;
      } catch {
        return false;
      }
    }
  };

  const shouldOpenCheckIn = (dayId: DayId, week: number) => {
    const workout = workoutsById[dayId];
    if (workout.kind !== "strength") {
      return false;
    }

    const weekKey = String(week);
    const hasCheckIn = Boolean(progress.checkInsByWeek[weekKey]?.[dayId]);
    const hasCompletedSession = (progress.completedDaysByWeek[weekKey] ?? []).includes(dayId);
    const hasExerciseProgress =
      Object.keys(progress.exerciseStatesByWeek[weekKey]?.[dayId] ?? {}).length > 0;

    return !hasCheckIn && !hasCompletedSession && !hasExerciseProgress;
  };

  const openWorkout = (dayId: DayId, week = progress.currentWeek) => {
    const resolvedWeek = clampWeek(week);
    const nextScreen = shouldOpenCheckIn(dayId, resolvedWeek) ? "checkin" : "workout";

    setProgress((currentValue) =>
      currentValue.currentWeek === resolvedWeek
        ? currentValue
        : {
            ...currentValue,
            currentWeek: resolvedWeek
          }
    );
    setSelectedDayId(dayId);
    setActiveScreen(nextScreen);
  };

  const openToday = () => openWorkout(todayDayId);

  const upsertExerciseState = (
    exercise: PlannedExercise,
    updater: (currentValue: ExerciseProgressState) => ExerciseProgressState
  ) => {
    setProgress((currentValue) => {
      const weekKey = String(currentValue.currentWeek);
      const weekStates = currentValue.exerciseStatesByWeek[weekKey] ?? {};
      const dayStates = weekStates[selectedDayId] ?? {};
      const nextState = updater(createExerciseState(exercise, dayStates[exercise.id]));
      const nextDayStates = {
        ...dayStates,
        [exercise.id]: nextState
      };
      const { checkedIds, weights } = syncDerivedDayState(selectedExercisePlans, nextDayStates);

      return {
        ...currentValue,
        exerciseStatesByWeek: {
          ...currentValue.exerciseStatesByWeek,
          [weekKey]: {
            ...weekStates,
            [selectedDayId]: nextDayStates
          }
        },
        checkedExercisesByWeek: {
          ...currentValue.checkedExercisesByWeek,
          [weekKey]: {
            ...(currentValue.checkedExercisesByWeek[weekKey] ?? {}),
            [selectedDayId]: checkedIds
          }
        },
        weightsByWeek: {
          ...currentValue.weightsByWeek,
          [weekKey]: {
            ...(currentValue.weightsByWeek[weekKey] ?? {}),
            [selectedDayId]: weights
          }
        }
      };
    });
  };

  const handleToggleSet = (setIndex: number) => {
    if (!currentExercise) {
      return;
    }

    upsertExerciseState(currentExercise, (currentValue) => {
      const nextCompletedSets = [...currentValue.completedSets];
      nextCompletedSets[setIndex] = !nextCompletedSets[setIndex];

      return {
        ...currentValue,
        completedSets: nextCompletedSets,
        updatedAt: new Date().toISOString()
      };
    });
  };

  const handleWeightValueChange = (value: string) => {
    if (!currentExercise) {
      return;
    }

    upsertExerciseState(currentExercise, (currentValue) => ({
      ...currentValue,
      weightValue: value.trimStart(),
      updatedAt: new Date().toISOString()
    }));
  };

  const handleWeightUnitChange = (unit: WeightUnit) => {
    if (!currentExercise) {
      return;
    }

    upsertExerciseState(currentExercise, (currentValue) => ({
      ...currentValue,
      weightUnit: unit,
      updatedAt: new Date().toISOString()
    }));
  };

  const handleRpeChange = (value: number) => {
    if (!currentExercise) {
      return;
    }

    upsertExerciseState(currentExercise, (currentValue) => ({
      ...currentValue,
      rpe: value,
      updatedAt: new Date().toISOString()
    }));
  };

  const handleFeltAreaChange = (value: FeltArea) => {
    if (!currentExercise) {
      return;
    }

    upsertExerciseState(currentExercise, (currentValue) => ({
      ...currentValue,
      feltArea: value,
      updatedAt: new Date().toISOString()
    }));
  };

  const handleApplyRecommendation = () => {
    if (!currentExercise || currentExercise.recommendation.suggestedValue == null) {
      return;
    }

    upsertExerciseState(currentExercise, (currentValue) => ({
      ...currentValue,
      recommendationDecision: "applied",
      weightUnit: currentExercise.recommendation.suggestedUnit,
      weightValue: String(currentExercise.recommendation.suggestedValue),
      updatedAt: new Date().toISOString()
    }));
  };

  const handleKeepRecommendation = () => {
    if (!currentExercise) {
      return;
    }

    upsertExerciseState(currentExercise, (currentValue) => ({
      ...currentValue,
      recommendationDecision: "kept",
      updatedAt: new Date().toISOString()
    }));
  };

  const handleMarkCompleted = (dayId: DayId) => {
    setProgress((currentValue) => {
      const weekKey = String(currentValue.currentWeek);
      const currentCompletedDays = currentValue.completedDaysByWeek[weekKey] ?? [];
      const dayStates = currentValue.exerciseStatesByWeek[weekKey]?.[dayId] ?? {};
      const plan =
        dayId === selectedDayId
          ? selectedCoachPlan
          : buildWorkoutCoachPlan({
              history: currentValue.history.filter((entry) => entry.dayId === dayId),
              strategy: currentValue.sessionStrategyByWeek[weekKey]?.[dayId] ?? "pending",
              workout: workoutsById[dayId],
              checkIn: currentValue.checkInsByWeek[weekKey]?.[dayId] ?? null
            });
      const weightsByExercise = Object.fromEntries(
        plan.exercisePlans.flatMap((exercise) => {
          const state = createExerciseState(exercise, dayStates[exercise.id]);
          const summary = getWeightSummary(state.weightValue, state.weightUnit);
          return summary ? [[exercise.id, summary]] : [];
        })
      );

      const exerciseLogs = plan.exercisePlans.map((exercise) => {
        const state = createExerciseState(exercise, dayStates[exercise.id]);
        const numericWeight = parseWeightValue(state.weightValue);
        const weightKg =
          numericWeight == null
            ? null
            : state.weightUnit === "kg"
              ? numericWeight
              : convertWeight(numericWeight, "lb", "kg");
        const weightLb =
          numericWeight == null
            ? null
            : state.weightUnit === "lb"
              ? numericWeight
              : convertWeight(numericWeight, "kg", "lb");

        return {
          completedSets: state.completedSets.filter(Boolean).length,
          completedSetsMask: [...state.completedSets],
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          feltArea: state.feltArea,
          loggedWeight: state.weightValue.trim(),
          muscleGroup: exercise.muscleGroup,
          recommendationDecision: state.recommendationDecision,
          restSeconds: exercise.plannedRestSeconds,
          rpe: state.rpe,
          targetSets: exercise.plannedSets,
          weightKg,
          weightLb,
          weightUnit: state.weightUnit
        } satisfies ExerciseLog;
      });

      const totalVolumeKg =
        exerciseLogs.length > 0
          ? exerciseLogs.reduce(
              (total, exerciseLog, index) =>
                total + computeExerciseVolumeKg(exerciseLog, plan.exercisePlans[index].reps),
              0
            )
          : null;

      const completedAt = new Date().toISOString();
      const resolvedCalendarDate =
        currentValue.checkInsByWeek[weekKey]?.[dayId]?.calendarDate ?? todayCalendarDate;
      const historyEntry = buildHistoryEntry({
        calendarDate: resolvedCalendarDate,
        checkIn: currentValue.checkInsByWeek[weekKey]?.[dayId] ?? null,
        completedAt,
        dayId,
        exerciseLogs,
        focus: workoutsById[dayId].focus,
        kind: workoutsById[dayId].kind,
        title: workoutsById[dayId].title,
        totalVolumeKg,
        week: currentValue.currentWeek,
        weightsByExercise
      });

      return {
        ...currentValue,
        completedDaysByWeek: {
          ...currentValue.completedDaysByWeek,
          [weekKey]: currentCompletedDays.includes(dayId)
            ? currentCompletedDays
            : [...currentCompletedDays, dayId]
        },
        history: [
          historyEntry,
          ...currentValue.history.filter((entry) => entry.id !== historyEntry.id)
        ]
      };
    });

    setActiveScreen("progression");
  };

  const handleChangeWeek = (week: number) => {
    setProgress((currentValue) => ({
      ...currentValue,
      currentWeek: clampWeek(week)
    }));
  };

  const handleToggleNotificationSetting = (
    setting: keyof Pick<NotificationSettings, "restTimer" | "trainingReminder">
  ) => {
    setProgress((currentValue) => ({
      ...currentValue,
      notificationSettings: {
        ...currentValue.notificationSettings,
        [setting]: !currentValue.notificationSettings[setting]
      }
    }));
  };

  const handleRequestNotificationPermission = async () => {
    if (notificationPermission === "unsupported" || !("Notification" in window)) {
      return;
    }

    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
  };

  const handleSendTestNotification = () =>
    void sendLocalNotification(
      "Recompón",
      "Tus avisos locales ya están listos para acompañarte durante el entrenamiento.",
      { tag: "recompon-test" }
    );

  const handleRestTimerComplete = (workoutTitle: string, seconds: number) => {
    if (!progress.notificationSettings.restTimer) {
      return;
    }

    void sendLocalNotification(
      "Descanso terminado",
      `Comienza la siguiente serie de ${workoutTitle}. Ya pasaron ${seconds} segundos.`,
      { tag: `rest-${workoutTitle}` }
    );
  };

  const handleCheckInComplete = (
    value: Omit<DailyCheckIn, "calendarDate" | "createdAt" | "dayId" | "week">,
    strategy: SessionStrategy
  ) => {
    const nextCheckIn: DailyCheckIn = {
      calendarDate: todayCalendarDate,
      createdAt: new Date().toISOString(),
      dayId: selectedDayId,
      energy: value.energy,
      discomforts: value.discomforts,
      sleep: value.sleep,
      timeAvailable: value.timeAvailable,
      week: progress.currentWeek
    };

    setProgress((currentValue) => {
      const weekKey = String(currentValue.currentWeek);

      return {
        ...currentValue,
        checkInsByWeek: {
          ...currentValue.checkInsByWeek,
          [weekKey]: {
            ...(currentValue.checkInsByWeek[weekKey] ?? {}),
            [selectedDayId]: nextCheckIn
          }
        },
        sessionStrategyByWeek: {
          ...currentValue.sessionStrategyByWeek,
          [weekKey]: {
            ...(currentValue.sessionStrategyByWeek[weekKey] ?? {}),
            [selectedDayId]: strategy
          }
        }
      };
    });

    setActiveScreen("workout");
  };

  const handleConfirmReset = () => {
    setProgress((currentValue) => ({
      ...createDefaultProgress(),
      notificationSettings: currentValue.notificationSettings
    }));
    setSelectedDayId(todayDayId);
    setWorkoutExerciseIndex(0);
    setActiveScreen("home");
    setResetSheetOpen(false);
  };

  useEffect(() => {
    if (progress.notificationSettings.trainingReminder !== true) {
      return;
    }

    if (notificationPermission !== "granted") {
      return;
    }

    if (progress.notificationSettings.lastTrainingReminderDate === todayCalendarDate) {
      return;
    }

    if (todayWorkout.kind === "rest" || hasSessionToday) {
      return;
    }

    void sendLocalNotification(
      "Plan del día listo",
      `Hoy toca ${todayWorkout.title}. Entra a Recompón y deja que la app te lleve ejercicio por ejercicio.`,
      { tag: `daily-${todayCalendarDate}` }
    ).then((wasSent) => {
      if (!wasSent) {
        return;
      }

      setProgress((currentValue) => ({
        ...currentValue,
        notificationSettings: {
          ...currentValue.notificationSettings,
          lastTrainingReminderDate: todayCalendarDate
        }
      }));
    });
  }, [
    hasSessionToday,
    notificationPermission,
    progress.notificationSettings.lastTrainingReminderDate,
    progress.notificationSettings.trainingReminder,
    setProgress,
    todayCalendarDate,
    todayWorkout.kind,
    todayWorkout.title
  ]);

  const renderScreen = () => {
    switch (activeScreen) {
      case "home":
        return (
          <HomeScreen
            athleteName={athleteProfile.name}
            currentWeek={progress.currentWeek}
            estimatedDurationMinutes={todayCoachPlan.estimatedDurationMinutes}
            expectedEnergy={energyLabelMap[todayWorkout.expectedEnergy]}
            focus={todayWorkout.focus}
            onOpenToday={openToday}
            todayLabel={todayWorkout.label}
            todayTitle={todayWorkout.title}
          />
        );
      case "checkin":
        return (
          <CheckInScreen
            calendarDate={todayCalendarDate}
            currentWeek={progress.currentWeek}
            history={todayHistory}
            initialValue={todayCheckIn}
            onComplete={handleCheckInComplete}
            workout={todayWorkout}
          />
        );
      case "agenda":
        return (
          <AgendaScreen
            completedDays={completedDays}
            currentWeek={progress.currentWeek}
            history={progress.history}
            onOpenHistoryEntry={(entry) => openWorkout(entry.dayId, entry.week)}
            onSelectDay={openWorkout}
            todayDayId={todayDayId}
            workouts={workouts}
          />
        );
      case "workout":
        return (
          <WorkoutScreen
            canGoPrevious={workoutExerciseIndex > 0}
            currentExercise={currentExercise}
            currentExerciseIndex={workoutExerciseIndex}
            currentWeek={progress.currentWeek}
            exerciseCount={selectedExercisePlans.length}
            isLastExercise={workoutExerciseIndex === selectedExercisePlans.length - 1}
            isWorkoutComplete={isWorkoutComplete}
            lastExerciseDate={latestExerciseLog?.calendarDate ?? null}
            lastExerciseRpe={latestExerciseLog?.rpe ?? null}
            lastExerciseUnit={latestExerciseLog?.weightUnit ?? null}
            lastExerciseWeight={
              latestExerciseLog?.loggedWeight
                ? `${latestExerciseLog.loggedWeight} ${latestExerciseLog.weightUnit}`
                : null
            }
            nextExerciseName={selectedExercisePlans[workoutExerciseIndex + 1]?.name ?? null}
            notificationEnabled={notificationsEnabled}
            onAdvance={() =>
              setWorkoutExerciseIndex((currentValue) =>
                Math.min(currentValue + 1, selectedExercisePlans.length)
              )
            }
            onApplyRecommendation={handleApplyRecommendation}
            onCompleteWorkout={() => handleMarkCompleted(selectedDayId)}
            onGoPrevious={() =>
              setWorkoutExerciseIndex((currentValue) => Math.max(currentValue - 1, 0))
            }
            onKeepRecommendation={handleKeepRecommendation}
            onRestTimerComplete={handleRestTimerComplete}
            onSetFeltArea={handleFeltAreaChange}
            onSetRpe={handleRpeChange}
            onSetWeightUnit={handleWeightUnitChange}
            onSetWeightValue={handleWeightValueChange}
            onToggleSet={handleToggleSet}
            sparklinePoints={sparklinePoints}
            state={currentExerciseState}
            workout={selectedWorkout}
          />
        );
      case "progression":
        return (
          <ProgressionScreen
            completedDaysByWeek={progress.completedDaysByWeek}
            currentWeek={progress.currentWeek}
            history={progress.history}
            onOpenHistoryEntry={(entry) => openWorkout(entry.dayId, entry.week)}
          />
        );
      case "settings":
        return (
          <SettingsScreen
            currentWeek={progress.currentWeek}
            notificationPermission={notificationPermission}
            notificationSettings={progress.notificationSettings}
            onChangeWeek={handleChangeWeek}
            onRequestNotificationPermission={handleRequestNotificationPermission}
            onRequestReset={() => setResetSheetOpen(true)}
            onSendTestNotification={handleSendTestNotification}
            onToggleNotificationSetting={handleToggleNotificationSetting}
          />
        );
      default:
        return null;
    }
  };

  const showBottomNav = activeScreen !== "checkin" && activeScreen !== "workout";

  return (
    <div className="relative min-h-screen overflow-hidden bg-graphite-950 text-fog-100">
      <div className="relative mx-auto flex min-h-screen max-w-[430px] flex-col px-4 pb-32 pt-[calc(env(safe-area-inset-top)+18px)]">
        {activeScreen !== "home" && (
          <header className="mb-6">
            <div className="frost-nav flex items-center justify-between px-4 py-3">
              <div>
                <p className="eyebrow">Coach privado</p>
                <p className="mt-1 text-[1.05rem] font-semibold tracking-[-0.03em] text-fog-100">
                  Recompón
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="top-pill">Semana {progress.currentWeek}</span>
                <span className="top-pill">{completionPercentage}%</span>
              </div>
            </div>
          </header>
        )}

        <main className="screen-enter flex-1">{renderScreen()}</main>
      </div>

      {activeScreen !== "home" &&
        activeScreen !== "checkin" &&
        activeScreen !== "workout" && (
          <FloatingTodayButton todayDayId={todayDayId} onOpenToday={openToday} />
        )}

      {showBottomNav && (
        <BottomNav activeScreen={activeScreen} onChange={(screen) => setActiveScreen(screen)} />
      )}

      <ConfirmationSheet
        open={isResetSheetOpen}
        title="Reiniciar progreso"
        description="Se limpiará el avance guardado, los check-ins y las series registradas. La semana actual volverá a 1."
        confirmLabel="Reiniciar"
        cancelLabel="Cancelar"
        onConfirm={handleConfirmReset}
        onCancel={() => setResetSheetOpen(false)}
      />
    </div>
  );
}

export default App;
