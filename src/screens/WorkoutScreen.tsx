import { useEffect, useState } from "react";
import { Card } from "../components/Card";
import { CircularProgress } from "../components/CircularProgress";
import { ExerciseChecklist } from "../components/ExerciseChecklist";
import { CheckIcon, SparkIcon, WeightIcon } from "../components/Icons";
import { ProgressBar } from "../components/ProgressBar";
import { RestTimerCard } from "../components/RestTimerCard";
import { SectionIntro } from "../components/SectionIntro";
import { StatTile } from "../components/StatTile";
import type { DayId, Exercise, WorkoutDay } from "../types";
import { cn } from "../utils/cn";
import { countLoggedWeights, getRestPresets, parseRestToSeconds } from "../utils/training";

type WorkoutScreenProps = {
  currentWeek: number;
  checkedIds: string[];
  isCompleted: boolean;
  notificationEnabled: boolean;
  onMarkCompleted: (dayId: DayId) => void;
  onRestTimerComplete: (workoutTitle: string, seconds: number) => void;
  onToggleExercise: (exerciseId: string) => void;
  onWeightChange: (exerciseId: string, value: string) => void;
  previousWeights: Record<string, string>;
  weights: Record<string, string>;
  workout: WorkoutDay;
};

export const WorkoutScreen = ({
  currentWeek,
  checkedIds,
  isCompleted,
  notificationEnabled,
  onMarkCompleted,
  onRestTimerComplete,
  onToggleExercise,
  onWeightChange,
  previousWeights,
  weights,
  workout
}: WorkoutScreenProps) => {
  const completedExerciseCount = checkedIds.length;
  const totalExercises = workout.exercises.length;
  const isStrengthDay = workout.kind === "strength";
  const loggedWeights = countLoggedWeights(weights);
  const restPresets = isStrengthDay ? getRestPresets(workout.exercises) : [];
  const defaultRest = restPresets[0] ?? 60;

  const [selectedPreset, setSelectedPreset] = useState(defaultRest);
  const [secondsLeft, setSecondsLeft] = useState(defaultRest);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    setSelectedPreset(defaultRest);
    setSecondsLeft(defaultRest);
    setIsRunning(false);
  }, [defaultRest, workout.id]);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    if (secondsLeft <= 0) {
      setIsRunning(false);
      onRestTimerComplete(workout.title, selectedPreset);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setSecondsLeft((currentValue) => currentValue - 1);
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [isRunning, onRestTimerComplete, secondsLeft, selectedPreset, workout.title]);

  const handleSelectPreset = (seconds: number) => {
    setSelectedPreset(seconds);
    setSecondsLeft(seconds);
    setIsRunning(false);
  };

  const handleStartRestFromExercise = (exercise: Exercise) => {
    const nextSeconds = parseRestToSeconds(exercise.rest);
    setSelectedPreset(nextSeconds);
    setSecondsLeft(nextSeconds);
    setIsRunning(true);
  };

  return (
    <div className="space-y-5">
      <SectionIntro
        eyebrow={`Semana ${currentWeek}`}
        title={workout.title}
        description={workout.focus}
        side={
          isCompleted ? (
            <span className="top-pill">
              <CheckIcon className="h-3.5 w-3.5" />
              Completado
            </span>
          ) : undefined
        }
      />

      <Card className="overflow-hidden px-5 py-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-50">
              Sesión del día
            </p>
            <p className="mt-2 text-[1.95rem] font-semibold tracking-[-0.05em] text-ink-200">
              {workout.label}
            </p>
            <p className="mt-3 max-w-[16rem] text-[0.95rem] leading-7 text-ink-50">
              {workout.microcopy}
            </p>
          </div>
          {isStrengthDay ? (
            <CircularProgress
              value={completedExerciseCount}
              max={Math.max(totalExercises, 1)}
              label="Checklist"
              detail={`${completedExerciseCount}/${totalExercises}`}
              size={88}
            />
          ) : (
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-blush-100 text-blush-500">
              <SparkIcon className="h-5 w-5" />
            </span>
          )}
        </div>

        {isStrengthDay ? (
          <>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <StatTile
                label="Calentamiento"
                value={workout.warmup ?? "Listo"}
                detail="Entrada en calor"
                tone="light"
              />
              <StatTile
                label="Pesos"
                value={`${loggedWeights}/${totalExercises}`}
                detail="Ejercicios con carga"
                tone="tint"
              />
            </div>

            <ProgressBar
              className="mt-5"
              value={completedExerciseCount}
              max={Math.max(totalExercises, 1)}
            />
          </>
        ) : (
          <div className="mt-6 rounded-[28px] bg-white/78 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.88)]">
            <p className="text-[11px] uppercase tracking-[0.18em] text-ink-50">Plan del día</p>
            <p className="mt-2 text-base font-semibold tracking-[-0.03em] text-ink-200">
              {workout.details}
            </p>
          </div>
        )}
      </Card>

      {isStrengthDay && (
        <>
          <RestTimerCard
            isRunning={isRunning}
            notificationsEnabled={notificationEnabled}
            onReset={() => {
              setSecondsLeft(selectedPreset);
              setIsRunning(false);
            }}
            onSelectPreset={handleSelectPreset}
            onToggle={() => {
              if (secondsLeft <= 0) {
                setSecondsLeft(selectedPreset);
              }
              setIsRunning((currentValue) => !currentValue);
            }}
            presets={restPresets}
            secondsLeft={secondsLeft}
            selectedPreset={selectedPreset}
          />

          <Card className="p-0">
            <div className="flex items-center justify-between gap-3 px-5 pt-5">
              <div>
                <h2 className="text-[1.4rem] font-semibold tracking-[-0.04em] text-ink-200">
                  Ejercicios
                </h2>
                <p className="mt-1 text-sm leading-6 text-ink-50">
                  Marca cada bloque, registra el peso y lanza el descanso desde aquí.
                </p>
              </div>
              <span className="ios-chip text-ink-50">
                <WeightIcon className="h-3.5 w-3.5" />
                {loggedWeights} pesos
              </span>
            </div>
            <div className="px-3 pb-3 pt-4">
              <ExerciseChecklist
                checkedIds={checkedIds}
                exercises={workout.exercises}
                onStartRest={handleStartRestFromExercise}
                onToggle={onToggleExercise}
                onWeightChange={onWeightChange}
                previousWeights={previousWeights}
                weights={weights}
              />
            </div>
          </Card>
        </>
      )}

      <Card tone="dark" className="px-5 py-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
          Tip del día
        </p>
        <p className="mt-3 text-base leading-7 text-white/94">{workout.tip}</p>
      </Card>

      <button
        type="button"
        onClick={() => onMarkCompleted(workout.id)}
        className={cn(
          "primary-button mb-4 flex w-full items-center justify-center gap-2",
          isCompleted && "bg-[linear-gradient(135deg,#4a3834_0%,#6f5a54_100%)]"
        )}
      >
        <CheckIcon className="h-5 w-5" />
        {isCompleted ? "Sesión completada" : "Marcar día como completado"}
      </button>
    </div>
  );
};
