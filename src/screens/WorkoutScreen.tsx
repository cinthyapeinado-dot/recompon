import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "../components/Card";
import { ExerciseHistoryCard } from "../components/ExerciseHistoryCard";
import { ExerciseMotionPreview } from "../components/ExerciseMotionPreview";
import { ArrowLeftIcon, CheckIcon, TimerIcon } from "../components/Icons";
import { ProgressBar } from "../components/ProgressBar";
import { SectionIntro } from "../components/SectionIntro";
import type {
  ExerciseProgressState,
  FeltArea,
  PlannedExercise,
  WeightUnit,
  WorkoutDay
} from "../types";
import { cn } from "../utils/cn";
import { getSuggestedPair, getRecommendationReasonList } from "../utils/recommendations";
import { formatTimer } from "../utils/training";
import { convertWeight, formatWeightNumber, parseWeightValue } from "../utils/units";

type WorkoutScreenProps = {
  canGoPrevious: boolean;
  currentExercise: PlannedExercise | null;
  currentExerciseIndex: number;
  currentWeek: number;
  exerciseCount: number;
  isLastExercise: boolean;
  isWorkoutComplete: boolean;
  lastExerciseDate: string | null;
  lastExerciseRpe: number | null;
  lastExerciseUnit: WeightUnit | null;
  lastExerciseWeight: string | null;
  nextExerciseName: string | null;
  notificationEnabled: boolean;
  onAdvance: () => void;
  onApplyRecommendation: () => void;
  onCompleteWorkout: () => void;
  onGoPrevious: () => void;
  onKeepRecommendation: () => void;
  onRestTimerComplete: (workoutTitle: string, seconds: number) => void;
  onSetFeltArea: (value: FeltArea) => void;
  onSetRpe: (value: number) => void;
  onSetWeightUnit: (value: WeightUnit) => void;
  onSetWeightValue: (value: string) => void;
  onToggleSet: (setIndex: number) => void;
  sparklinePoints: number[];
  state: ExerciseProgressState | null;
  workout: WorkoutDay;
};

const feltAreas: FeltArea[] = ["gluteo", "femoral", "cuadriceps", "espalda", "otro"];
const rpeValues = [6, 7, 8, 9, 10];

const feltAreaLabel: Record<FeltArea, string> = {
  gluteo: "Glúteo",
  femoral: "Femoral",
  cuadriceps: "Cuádriceps",
  espalda: "Espalda",
  otro: "Otro"
};

export const WorkoutScreen = ({
  canGoPrevious,
  currentExercise,
  currentExerciseIndex,
  currentWeek,
  exerciseCount,
  isLastExercise,
  isWorkoutComplete,
  lastExerciseDate,
  lastExerciseRpe,
  lastExerciseUnit,
  lastExerciseWeight,
  nextExerciseName,
  notificationEnabled,
  onAdvance,
  onApplyRecommendation,
  onCompleteWorkout,
  onGoPrevious,
  onKeepRecommendation,
  onRestTimerComplete,
  onSetFeltArea,
  onSetRpe,
  onSetWeightUnit,
  onSetWeightValue,
  onToggleSet,
  sparklinePoints,
  state,
  workout
}: WorkoutScreenProps) => {
  const advanceTimeoutRef = useRef<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    "Marca cada serie y deja que la app te lleve al siguiente paso."
  );
  const clearAdvanceTimeout = () => {
    if (advanceTimeoutRef.current != null) {
      window.clearTimeout(advanceTimeoutRef.current);
      advanceTimeoutRef.current = null;
    }
  };

  useEffect(
    () => () => clearAdvanceTimeout(),
    []
  );

  useEffect(() => {
    clearAdvanceTimeout();
    if (!currentExercise) {
      setIsRunning(false);
      setSecondsLeft(0);
      return;
    }

    setIsRunning(false);
    setSecondsLeft(currentExercise.plannedRestSeconds);
    setStatusMessage("Marca cada serie y deja que la app te lleve al siguiente paso.");
  }, [currentExercise]);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    if (secondsLeft <= 0) {
      setIsRunning(false);
      setStatusMessage("Comienza la siguiente serie.");
      if ("vibrate" in navigator) {
        navigator.vibrate([120, 80, 120]);
      }
      onRestTimerComplete(workout.title, currentExercise?.plannedRestSeconds ?? 0);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setSecondsLeft((current) => current - 1);
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [currentExercise?.plannedRestSeconds, isRunning, onRestTimerComplete, secondsLeft, workout.title]);

  const parsedWeight = state?.weightValue ? parseWeightValue(state.weightValue) : null;
  const weightPair = useMemo(() => {
    if (parsedWeight == null || !state) {
      return null;
    }

    const secondaryUnit: WeightUnit = state.weightUnit === "kg" ? "lb" : "kg";
    const secondaryValue = convertWeight(parsedWeight, state.weightUnit, secondaryUnit);
    return {
      primary: formatWeightNumber(parsedWeight, state.weightUnit),
      secondary: formatWeightNumber(secondaryValue, secondaryUnit)
    };
  }, [parsedWeight, state]);

  if (workout.kind !== "strength") {
    return (
      <div className="space-y-5">
        <SectionIntro
          eyebrow={`Semana ${currentWeek}`}
          title={workout.title}
          description={workout.focus}
          side={<span className="badge-soft">{workout.label}</span>}
        />

        <Card className="space-y-4">
          <div>
            <p className="eyebrow">Plan del día</p>
            <h2 className="mt-2 text-[1.7rem] font-semibold text-fog-100">
              {workout.details ?? workout.focus}
            </h2>
          </div>
          <div className="card-subtle text-sm leading-7 text-fog-300">{workout.microcopy}</div>
          <div className="card-subtle text-sm leading-7 text-fog-300">{workout.tip}</div>
          <button type="button" onClick={onCompleteWorkout} className="primary-button w-full">
            Marcar día como completado
          </button>
        </Card>
      </div>
    );
  }

  if (!currentExercise || !state) {
    return (
      <div className="space-y-5">
        <SectionIntro
          eyebrow={`Semana ${currentWeek}`}
          title={`${workout.title} lista`}
          description="Todas las series del bloque actual ya están completadas."
          side={<span className="badge-strong">Hecho</span>}
        />

        <Card className="space-y-4">
          <div className="card-subtle text-sm leading-7 text-fog-300">
            Cierra la sesión para guardar el historial completo, el RPE y las cargas de hoy.
          </div>
          <button type="button" onClick={onCompleteWorkout} className="primary-button w-full">
            Finalizar entrenamiento
          </button>
        </Card>
      </div>
    );
  }

  const completedSetCount = state.completedSets.filter(Boolean).length;
  const progressValue = (currentExerciseIndex + 1) / Math.max(exerciseCount, 1);
  const suggestedPair = getSuggestedPair(currentExercise.recommendation);
  const recommendationReasons = getRecommendationReasonList(currentExercise.recommendation);

  const handleToggleSet = (setIndex: number) => {
    clearAdvanceTimeout();

    const isActivating = !state.completedSets[setIndex];
    const nextCompletedCount = completedSetCount + (isActivating ? 1 : -1);
    onToggleSet(setIndex);

    if (!isActivating) {
      setIsRunning(false);
      setSecondsLeft(currentExercise.plannedRestSeconds);
      setStatusMessage("Serie reabierta. Ajusta lo que necesites.");
      return;
    }

    if (nextCompletedCount < currentExercise.plannedSets) {
      setSecondsLeft(currentExercise.plannedRestSeconds);
      setIsRunning(true);
      setStatusMessage("Descansa. Te avisaremos para la siguiente serie.");
      if ("vibrate" in navigator) {
        navigator.vibrate(50);
      }
      return;
    }

    setIsRunning(false);
    setSecondsLeft(currentExercise.plannedRestSeconds);

    if ("vibrate" in navigator) {
      navigator.vibrate([80, 50, 100]);
    }

    if (!isLastExercise) {
      setStatusMessage("Bloque listo. Pasando al siguiente ejercicio...");
      advanceTimeoutRef.current = window.setTimeout(() => {
        advanceTimeoutRef.current = null;
        onAdvance();
      }, 1100);
      return;
    }

    setStatusMessage("Último ejercicio completo. Ya puedes cerrar la sesión.");
  };

  return (
    <div className="space-y-5">
      <SectionIntro
        eyebrow={`Semana ${currentWeek}`}
        title={currentExercise.name}
        description={currentExercise.muscleGroup}
        side={<span className="badge-soft">{currentExerciseIndex + 1}/{exerciseCount}</span>}
      />

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <ProgressBar value={progressValue * 100} max={100} />
            <p className="mt-3 text-sm text-fog-300">{statusMessage}</p>
          </div>
          {canGoPrevious && (
            <button
              type="button"
              onClick={onGoPrevious}
              aria-label="Volver al ejercicio anterior"
              className="secondary-button h-11 w-11 shrink-0 rounded-full p-0"
            >
              <ArrowLeftIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        <ExerciseMotionPreview exercise={currentExercise} />

        <Card className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="metric-tile px-4 py-4">
              <p className="eyebrow">Series</p>
              <p className="mt-2 text-[1.3rem] font-semibold text-fog-100">
                {completedSetCount}/{currentExercise.plannedSets}
              </p>
              <p className="mt-2 text-sm text-fog-300">{currentExercise.reps} por serie</p>
            </div>
            <div className="metric-tile metric-tile-tint px-4 py-4">
              <p className="eyebrow">Descanso</p>
              <p className="mt-2 text-[1.3rem] font-semibold text-fog-100">
                {formatTimer(secondsLeft || currentExercise.plannedRestSeconds)}
              </p>
              <p className="mt-2 text-sm text-fog-300">
                {isRunning
                  ? "Corriendo ahora"
                  : notificationEnabled
                    ? "Con aviso local"
                    : "Sin aviso local"}
              </p>
            </div>
          </div>

          <div className="card-subtle space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="eyebrow">Peso sugerido</p>
                <h3 className="mt-2 text-[1.3rem] font-semibold text-fog-100">
                  {suggestedPair
                    ? `${formatWeightNumber(
                        suggestedPair.primaryValue,
                        suggestedPair.primaryUnit
                      )} · ${formatWeightNumber(
                        suggestedPair.secondaryValue,
                        suggestedPair.secondaryUnit
                      )}`
                    : "Sin sugerencia numérica"}
                </h3>
              </div>
              <span className="badge-strong">{currentExercise.recommendation.confidence}%</span>
            </div>

            <p className="text-sm leading-6 text-fog-300">{currentExercise.recommendation.detail}</p>

            <div className="space-y-2">
              {recommendationReasons.map((reason) => (
                <div key={reason} className="coach-note">
                  <p className="text-sm leading-6 text-fog-300">{reason}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={onApplyRecommendation} className="primary-button">
                Aplicar recomendación
              </button>
              <button type="button" onClick={onKeepRecommendation} className="secondary-button">
                Mantener rutina
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="field-shell">
              <p className="eyebrow">Peso actual</p>
              <div className="mt-3 flex items-center gap-3">
                <input
                  type="text"
                  inputMode="decimal"
                  value={state.weightValue}
                  onChange={(event) => onSetWeightValue(event.target.value)}
                  placeholder={
                    currentExercise.recommendation.suggestedValue != null
                      ? String(currentExercise.recommendation.suggestedValue)
                      : "Ej. 20"
                  }
                  className="min-w-0 flex-1 bg-transparent text-[1.3rem] font-semibold text-fog-100 outline-none placeholder:text-fog-400"
                />

                <div className="segmented">
                  {(["kg", "lb"] as const).map((unit) => (
                    <button
                      key={unit}
                      type="button"
                      onClick={() => onSetWeightUnit(unit)}
                      className={cn(
                        "rounded-[12px] px-3 py-2 text-sm font-semibold text-fog-300 transition",
                        state.weightUnit === unit && "segmented-active"
                      )}
                    >
                      {unit.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <p className="mt-3 text-sm text-fog-300">
                {weightPair
                  ? `Equivalente automático: ${weightPair.primary} · ${weightPair.secondary}`
                  : "En cuanto registres una carga, verás su equivalente automático en kg y lb."}
              </p>
            </div>

            <ExerciseHistoryCard
              date={lastExerciseDate}
              displayWeight={lastExerciseWeight}
              rpe={lastExerciseRpe}
              sparklinePoints={sparklinePoints}
              unit={lastExerciseUnit ?? currentExercise.defaultUnit}
            />
          </div>

          <div className="space-y-3">
            <p className="eyebrow">Series</p>
            <div className="flex flex-wrap gap-3">
              {state.completedSets.map((isDone, index) => (
                <button
                  key={`${currentExercise.id}-set-${index + 1}`}
                  type="button"
                  onClick={() => handleToggleSet(index)}
                  aria-pressed={isDone}
                  className={cn("set-bubble", isDone && "set-bubble-active")}
                >
                  {isDone ? <CheckIcon className="h-4 w-4" /> : index + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="eyebrow">Nivel de esfuerzo (RPE)</p>
            <div className="flex flex-wrap gap-2">
              {rpeValues.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => onSetRpe(value)}
                  className={cn("choice-chip min-h-[46px] px-4 py-3", state.rpe === value && "choice-chip-active")}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="eyebrow">¿Dónde sentiste el ejercicio?</p>
            <div className="grid grid-cols-2 gap-3">
              {feltAreas.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => onSetFeltArea(value)}
                  className={cn(
                    "choice-chip justify-start",
                    state.feltArea === value && "choice-chip-active"
                  )}
                >
                  {feltAreaLabel[value]}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="eyebrow">Flujo guiado</p>
              <h3 className="mt-2 text-[1.2rem] font-semibold text-fog-100">
                {isLastExercise
                  ? "Último bloque del día"
                  : nextExerciseName
                    ? `Después sigue ${nextExerciseName}`
                    : "Siguiente paso listo"}
              </h3>
            </div>
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-500/12 text-accent-300">
              <TimerIcon className="h-5 w-5" />
            </span>
          </div>

          <p className="text-sm leading-6 text-fog-300">
            La app arranca descanso cuando marcas una serie y avanza sola al siguiente ejercicio en cuanto terminas este bloque.
          </p>

          <button
            type="button"
            onClick={onCompleteWorkout}
            disabled={!isWorkoutComplete}
            className="primary-button w-full"
          >
            {isLastExercise ? "Finalizar entrenamiento" : "Guardar avance completo"}
          </button>
        </Card>
      </div>
    </div>
  );
};
