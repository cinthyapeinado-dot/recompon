import { useEffect, useState } from "react";
import { BottomNav } from "./components/BottomNav";
import { ConfirmationSheet } from "./components/ConfirmationSheet";
import { FloatingTodayButton } from "./components/FloatingTodayButton";
import { TOTAL_PROGRAM_WEEKS, workouts, workoutsById } from "./data/workouts";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { AgendaScreen } from "./screens/AgendaScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { ProgressionScreen } from "./screens/ProgressionScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { WorkoutScreen } from "./screens/WorkoutScreen";
import type {
  AppScreen,
  DayId,
  ExerciseWeights,
  NotificationSettings,
  ProgressState,
  WorkoutHistoryEntry
} from "./types";
import { formatCalendarDate, getDayIdFromDate } from "./utils/date";
import {
  clampWeek,
  createDefaultProgress,
  normalizeProgress
} from "./utils/progress";
import { getLatestWeightsForExercises, getWeeksWithActivity } from "./utils/training";

const STORAGE_KEY = "recompon-progress-v1";
const NOTIFICATION_ICON = "/icons/icon-192.png";

type NotificationPermissionState = NotificationPermission | "unsupported";

const getNotificationPermissionState = (): NotificationPermissionState => {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }

  return Notification.permission;
};

const buildHistoryEntry = ({
  calendarDate,
  checkedExerciseIds,
  completedAt,
  dayId,
  week,
  weightsByExercise
}: {
  calendarDate: string;
  checkedExerciseIds: string[];
  completedAt: string;
  dayId: DayId;
  week: number;
  weightsByExercise: ExerciseWeights;
}): WorkoutHistoryEntry => {
  const workout = workoutsById[dayId];

  return {
    id: `${calendarDate}-${week}-${dayId}`,
    completedAt,
    calendarDate,
    week,
    dayId,
    title: workout.title,
    focus: workout.focus,
    kind: workout.kind,
    checkedExerciseIds,
    weightsByExercise
  };
};

function App() {
  const todayDayId = getDayIdFromDate();
  const todayCalendarDate = formatCalendarDate();
  const [activeScreen, setActiveScreen] = useState<AppScreen>("home");
  const [selectedDayId, setSelectedDayId] = useState<DayId>(todayDayId);
  const [isResetSheetOpen, setResetSheetOpen] = useState(false);
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermissionState>(getNotificationPermissionState);
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
  const completedDays = progress.completedDaysByWeek[currentWeekKey] ?? [];
  const checkedExercisesForWeek = progress.checkedExercisesByWeek[currentWeekKey] ?? {};
  const weightsForWeek = progress.weightsByWeek[currentWeekKey] ?? {};
  const selectedWorkout = workoutsById[selectedDayId];
  const checkedIds = checkedExercisesForWeek[selectedDayId] ?? [];
  const weights = weightsForWeek[selectedDayId] ?? {};
  const todayWorkout = workoutsById[todayDayId];
  const previousWeights = getLatestWeightsForExercises(
    progress.history.filter((entry) => entry.dayId === selectedDayId),
    selectedWorkout.exercises.map((exercise) => exercise.id)
  );
  const completionPercentage = Math.round((completedDays.length / workouts.length) * 100);
  const activeWeeks = getWeeksWithActivity(progress.completedDaysByWeek);
  const totalSessions = progress.history.length;
  const recentHistory = progress.history.slice(0, 4);
  const weeksRemaining = Math.max(TOTAL_PROGRAM_WEEKS - progress.currentWeek, 0);
  const notificationsEnabled =
    notificationPermission === "granted" && progress.notificationSettings.restTimer;
  const hasSessionToday = progress.history.some(
    (entry) => entry.calendarDate === todayCalendarDate
  );
  const screenKey =
    activeScreen === "workout"
      ? `${activeScreen}-${selectedDayId}-${progress.currentWeek}`
      : activeScreen;

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

  const openWorkout = (dayId: DayId, week = progress.currentWeek) => {
    const resolvedWeek = clampWeek(week);

    setProgress((currentValue) =>
      currentValue.currentWeek === resolvedWeek
        ? currentValue
        : {
            ...currentValue,
            currentWeek: resolvedWeek
          }
    );
    setSelectedDayId(dayId);
    setActiveScreen("workout");
  };

  const openToday = () => {
    setSelectedDayId(todayDayId);
    setActiveScreen("workout");
  };

  const handleToggleExercise = (dayId: DayId, exerciseId: string) => {
    setProgress((currentValue) => {
      const weekKey = String(currentValue.currentWeek);
      const weekChecks = currentValue.checkedExercisesByWeek[weekKey] ?? {};
      const dayChecks = weekChecks[dayId] ?? [];
      const nextChecks = dayChecks.includes(exerciseId)
        ? dayChecks.filter((id) => id !== exerciseId)
        : [...dayChecks, exerciseId];

      return {
        ...currentValue,
        checkedExercisesByWeek: {
          ...currentValue.checkedExercisesByWeek,
          [weekKey]: {
            ...weekChecks,
            [dayId]: nextChecks
          }
        }
      };
    });
  };

  const handleWeightChange = (dayId: DayId, exerciseId: string, value: string) => {
    setProgress((currentValue) => {
      const weekKey = String(currentValue.currentWeek);
      const weekWeights = currentValue.weightsByWeek[weekKey] ?? {};
      const dayWeights = weekWeights[dayId] ?? {};
      const nextDayWeights = { ...dayWeights };
      const trimmedValue = value.trim();

      if (trimmedValue) {
        nextDayWeights[exerciseId] = trimmedValue;
      } else {
        delete nextDayWeights[exerciseId];
      }

      const nextWeekWeights = { ...weekWeights };

      if (Object.keys(nextDayWeights).length > 0) {
        nextWeekWeights[dayId] = nextDayWeights;
      } else {
        delete nextWeekWeights[dayId];
      }

      const nextWeightsByWeek = { ...currentValue.weightsByWeek };

      if (Object.keys(nextWeekWeights).length > 0) {
        nextWeightsByWeek[weekKey] = nextWeekWeights;
      } else {
        delete nextWeightsByWeek[weekKey];
      }

      return {
        ...currentValue,
        weightsByWeek: nextWeightsByWeek
      };
    });
  };

  const handleMarkCompleted = (dayId: DayId) => {
    setProgress((currentValue) => {
      const weekKey = String(currentValue.currentWeek);
      const currentCompletedDays = currentValue.completedDaysByWeek[weekKey] ?? [];
      const checkedExerciseIds = [
        ...(currentValue.checkedExercisesByWeek[weekKey]?.[dayId] ?? [])
      ];
      const weightsByExercise = {
        ...(currentValue.weightsByWeek[weekKey]?.[dayId] ?? {})
      };
      const completedAt = new Date().toISOString();
      const historyEntry = buildHistoryEntry({
        calendarDate: todayCalendarDate,
        checkedExerciseIds,
        completedAt,
        dayId,
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
      "Tus avisos locales ya están listos para acompañarte en el gym.",
      { tag: "recompon-test" }
    );

  const handleRestTimerComplete = (workoutTitle: string, seconds: number) => {
    if (!progress.notificationSettings.restTimer) {
      return;
    }

    void sendLocalNotification(
      "Descanso terminado",
      `Vuelve a ${workoutTitle}. Ya pasaron ${seconds} segundos.`,
      { tag: `rest-${workoutTitle}` }
    );
  };

  const handleConfirmReset = () => {
    setProgress((currentValue) => ({
      ...createDefaultProgress(),
      notificationSettings: currentValue.notificationSettings
    }));
    setSelectedDayId(todayDayId);
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
      `Hoy toca ${todayWorkout.title}. Entra a Recompón y deja marcada tu sesión.`,
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
            activeWeeks={activeWeeks}
            completedDaysCount={completedDays.length}
            currentWeek={progress.currentWeek}
            onOpenAgenda={() => setActiveScreen("agenda")}
            onOpenProgression={() => setActiveScreen("progression")}
            onOpenToday={openToday}
            recentHistory={recentHistory}
            todayWorkout={todayWorkout}
            totalSessions={totalSessions}
            weeksRemaining={weeksRemaining}
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
            checkedIds={checkedIds}
            currentWeek={progress.currentWeek}
            isCompleted={completedDays.includes(selectedDayId)}
            notificationEnabled={notificationsEnabled}
            onMarkCompleted={handleMarkCompleted}
            onRestTimerComplete={handleRestTimerComplete}
            onToggleExercise={(exerciseId) => handleToggleExercise(selectedDayId, exerciseId)}
            onWeightChange={(exerciseId, value) =>
              handleWeightChange(selectedDayId, exerciseId, value)
            }
            previousWeights={previousWeights}
            weights={weights}
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

  return (
    <div className="relative min-h-screen overflow-hidden bg-sand-50 text-ink-200">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-3rem] h-80 w-80 -translate-x-1/2 rounded-full bg-blush-200/40 blur-3xl" />
        <div className="absolute left-[-5rem] top-1/3 h-72 w-72 rounded-full bg-white/60 blur-3xl" />
        <div className="absolute bottom-[-5rem] right-[-4rem] h-72 w-72 rounded-full bg-sand-200/60 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-[430px] flex-col px-4 pb-32 pt-[calc(env(safe-area-inset-top)+18px)]">
        <header className="sticky top-[calc(env(safe-area-inset-top)+10px)] z-20 mb-6">
          <div className="frost-nav flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-50">
                Plan privado
              </p>
              <p className="mt-1 text-[1.05rem] font-semibold tracking-[-0.03em] text-ink-200">
                Recompón
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="top-pill">Semana {progress.currentWeek}</span>
              <span className="top-pill">{completionPercentage}%</span>
            </div>
          </div>
        </header>

        <main key={screenKey} className="screen-enter flex-1">
          {renderScreen()}
        </main>
      </div>

      {activeScreen !== "workout" && (
        <FloatingTodayButton todayDayId={todayDayId} onOpenToday={openToday} />
      )}

      <BottomNav
        activeScreen={activeScreen}
        onChange={(screen) => setActiveScreen(screen)}
      />

      <ConfirmationSheet
        open={isResetSheetOpen}
        title="Reiniciar progreso"
        description="Se limpiará el avance guardado de Recompón y la semana actual volverá a 1."
        confirmLabel="Reiniciar"
        cancelLabel="Cancelar"
        onConfirm={handleConfirmReset}
        onCancel={() => setResetSheetOpen(false)}
      />
    </div>
  );
}

export default App;
