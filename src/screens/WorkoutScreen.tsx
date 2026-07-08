import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "../components/Card";
import { ExerciseHistoryCard } from "../components/ExerciseHistoryCard";
import { ExerciseMotionPreview } from "../components/ExerciseMotionPreview";
import {
  ArrowLeftIcon,
  CheckIcon,
  DumbbellIcon,
  LoopIcon,
  TimerIcon,
  ZapIcon
} from "../components/Icons";
import { ProgressBar } from "../components/ProgressBar";
import { SectionIntro } from "../components/SectionIntro";
import { trainingModeById } from "../data/trainingModes";
import type {
  ExerciseProgressState,
  FeltArea,
  PlannedExercise,
  TrainingMode,
  WeightUnit,
  WorkoutDay
} from "../types";
import { cn } from "../utils/cn";
import { getRecommendationReasonList, getSuggestedPair } from "../utils/recommendations";
import { getTrainingStepFlow } from "../utils/session";
import type { TrainingRoundSummary, TrainingStep } from "../utils/session";
import { formatTimer } from "../utils/training";
import {
  convertWeight,
  formatEditableWeight,
  formatWeightNumber,
  parseWeightValue
} from "../utils/units";

type WorkoutScreenProps = {
  activeTrainingMode: TrainingMode;
  canGoPrevious: boolean;
  completedStepCount: number;
  currentExercise: PlannedExercise | null;
  currentExerciseIndex: number;
  currentSetIndex: number | null;
  currentStep: TrainingStep | null;
  currentWeek: number;
  exerciseCount: number;
  isLastStep: boolean;
  isWorkoutComplete: boolean;
  lastExerciseDate: string | null;
  lastExerciseRpe: number | null;
  lastExerciseWeight: string | null;
  nextExerciseName: string | null;
  nextStep: TrainingStep | null;
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
  roundSummary: TrainingRoundSummary | null;
  sparklinePoints: number[];
  state: ExerciseProgressState | null;
  totalStepCount: number;
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

const modeIconMap = {
  alternated: LoopIcon,
  circuit: ZapIcon,
  traditional: DumbbellIcon
} as const;

const getDefaultStatusMessage = (mode: TrainingMode) => {
  switch (mode) {
    case "alternated":
      return "Cierra esta serie y seguimos con la ronda.";
    case "circuit":
      return "Cada cambio activa descanso antes del siguiente ejercicio.";
    default:
      return "Completa este bloque y deja que la app guíe el siguiente paso.";
  }
};

const getFlowDescription = (
  mode: TrainingMode,
  isLastStep: boolean,
  nextExerciseName: string | null
) => {
  if (isLastStep) {
    return "Último bloque del día";
  }

  switch (mode) {
    case "alternated":
      return nextExerciseName ? `La ronda sigue con ${nextExerciseName}` : "La ronda sigue";
    case "circuit":
      return nextExerciseName ? `Descanso y luego ${nextExerciseName}` : "Descanso y cambio";
    default:
      return nextExerciseName ? `Después sigue ${nextExerciseName}` : "Siguiente paso listo";
  }
};

const getFlowMicrocopy = (mode: TrainingMode) => {
  switch (mode) {
    case "alternated":
      return "No hay descanso entre ejercicios. El cronómetro arranca al cerrar la ronda.";
    case "circuit":
      return "Cada cambio de ejercicio activa descanso antes del siguiente bloque.";
    default:
      return "La app arranca descanso entre series y avanza al siguiente ejercicio cuando terminas el bloque.";
  }
};

export const WorkoutScreen = ({
  activeTrainingMode,
  canGoPrevious,
  completedStepCount,
  currentExercise,
  currentExerciseIndex,
  currentSetIndex,
  currentStep,
  currentWeek,
  exerciseCount,
  isLastStep,
  isWorkoutComplete,
  lastExerciseDate,
  lastExerciseRpe,
  lastExerciseWeight,
  nextExerciseName,
  nextStep,
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
  roundSummary,
  sparklinePoints,
  state,
  totalStepCount,
  workout
}: WorkoutScreenProps) => {
  const advanceTimeoutRef = useRef<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [advanceAfterRest, setAdvanceAfterRest] = useState(false);
  const [statusMessage, setStatusMessage] = useState(getDefaultStatusMessage(activeTrainingMode));
  const modeDefinition = trainingModeById[activeTrainingMode];
  const ModeIcon = modeIconMap[activeTrainingMode];

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
    setAdvanceAfterRest(false);

    if (!currentExercise) {
      setIsRunning(false);
      setSecondsLeft(0);
      return;
    }

    setIsRunning(false);
    setSecondsLeft(currentExercise.plannedRestSeconds);
    setStatusMessage(getDefaultStatusMessage(activeTrainingMode));
  }, [activeTrainingMode, currentExercise?.id, currentSetIndex]);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    if (secondsLeft <= 0) {
      setIsRunning(false);
      setStatusMessage(advanceAfterRest ? "Descanso listo. Seguimos." : "Comienza la siguiente serie.");
      if ("vibrate" in navigator) {
        navigator.vibrate([120, 80, 120]);
      }
      onRestTimerComplete(workout.title, currentExercise?.plannedRestSeconds ?? 0);

      if (advanceAfterRest && nextStep) {
        setAdvanceAfterRest(false);
        advanceTimeoutRef.current = window.setTimeout(() => {
          advanceTimeoutRef.current = null;
          onAdvance();
        }, 240);
      }

      return;
    }

    const timeoutId = window.setTimeout(() => {
      setSecondsLeft((current) => current - 1);
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [
    advanceAfterRest,
    currentExercise?.plannedRestSeconds,
    isRunning,
    nextStep,
    onAdvance,
    onRestTimerComplete,
    secondsLeft,
    workout.title
  ]);

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

  const suggestedInputValue = useMemo(() => {
    if (!currentExercise || !state || currentExercise.recommendation.suggestedValue == null) {
      return "";
    }

    const baseValue =
      currentExercise.recommendation.suggestedUnit === state.weightUnit
        ? currentExercise.recommendation.suggestedValue
        : convertWeight(
            currentExercise.recommendation.suggestedValue,
            currentExercise.recommendation.suggestedUnit,
            state.weightUnit
          );

    return formatEditableWeight(baseValue, state.weightUnit);
  }, [currentExercise, state]);

  const suggestedWeightPair = useMemo(() => {
    if (!currentExercise || !state || currentExercise.recommendation.suggestedValue == null) {
      return null;
    }

    const primaryValue =
      currentExercise.recommendation.suggestedUnit === state.weightUnit
        ? currentExercise.recommendation.suggestedValue
        : convertWeight(
            currentExercise.recommendation.suggestedValue,
            currentExercise.recommendation.suggestedUnit,
            state.weightUnit
          );
    const secondaryUnit: WeightUnit = state.weightUnit === "kg" ? "lb" : "kg";
    const secondaryValue = convertWeight(primaryValue, state.weightUnit, secondaryUnit);

    return {
      primary: formatWeightNumber(primaryValue, state.weightUnit),
      secondary: formatWeightNumber(secondaryValue, secondaryUnit)
    };
  }, [currentExercise, state]);

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

  if (!currentExercise || !state || !currentStep) {
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
  const progressValue = totalStepCount > 0 ? (completedStepCount / totalStepCount) * 100 : 0;
  const roundProgressValue =
    activeTrainingMode === "alternated" && roundSummary
      ? (roundSummary.currentRound / Math.max(roundSummary.totalRounds, 1)) * 100
      : 0;
  const suggestedPair = getSuggestedPair(currentExercise.recommendation);
  const recommendationReasons = getRecommendationReasonList(currentExercise.recommendation);

  const handleToggleSet = (setIndex: number) => {
    clearAdvanceTimeout();
    const isActivating = !state.completedSets[setIndex];
    const isCurrentSet = currentSetIndex === setIndex;

    onToggleSet(setIndex);

    if (!isActivating) {
      setAdvanceAfterRest(false);
      setIsRunning(false);
      setSecondsLeft(currentExercise.plannedRestSeconds);
      setStatusMessage("Serie reabierta. Ajusta lo que necesites.");
      return;
    }

    if (!isCurrentSet) {
      setAdvanceAfterRest(false);
      setIsRunning(false);
      setSecondsLeft(currentExercise.plannedRestSeconds);
      setStatusMessage("Serie guardada. El flujo se reajustó.");
      return;
    }

    if (!nextStep) {
      setAdvanceAfterRest(false);
      setIsRunning(false);
      setSecondsLeft(currentExercise.plannedRestSeconds);
      if ("vibrate" in navigator) {
        navigator.vibrate([80, 50, 100]);
      }
      setStatusMessage("Último bloque completo. Ya puedes cerrar la sesión.");
      return;
    }

    const stepFlow = getTrainingStepFlow(activeTrainingMode, currentStep, nextStep);
    const shouldRest =
      stepFlow === "rest-between-rounds" ||
      stepFlow === "rest-between-sets" ||
      stepFlow === "rest-between-exercises";

    if ("vibrate" in navigator) {
      navigator.vibrate(shouldRest ? 70 : [80, 50, 100]);
    }

    if (shouldRest) {
      setSecondsLeft(currentExercise.plannedRestSeconds);
      setAdvanceAfterRest(true);
      setIsRunning(true);
      setStatusMessage(
        stepFlow === "rest-between-rounds"
          ? "Ronda cerrada. Descansa y seguimos."
          : stepFlow === "rest-between-exercises"
            ? "Descansa. El siguiente ejercicio va enseguida."
            : "Descansa. Luego sigue la siguiente serie."
      );
      return;
    }

    setAdvanceAfterRest(false);
    setIsRunning(false);
    setSecondsLeft(currentExercise.plannedRestSeconds);
    setStatusMessage(
      activeTrainingMode === "alternated"
        ? "Seguimos con la misma ronda."
        : "Bloque listo. Pasando al siguiente ejercicio..."
    );
    advanceTimeoutRef.current = window.setTimeout(() => {
      advanceTimeoutRef.current = null;
      onAdvance();
    }, activeTrainingMode === "alternated" ? 520 : 860);
  };

  return (
    <div className="space-y-5">
      <SectionIntro
        eyebrow={`Semana ${currentWeek}`}
        title={currentExercise.name}
        description={currentExercise.muscleGroup}
        side={<span className="badge-soft">Ej. {currentExerciseIndex + 1}/{exerciseCount}</span>}
      />

      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mode-capsule">
            <ModeIcon className="h-4 w-4" />
            <span>{modeDefinition.title}</span>
          </span>
          <span className="badge-soft">Serie {currentStep.setIndex + 1}/{currentExercise.plannedSets}</span>
          {activeTrainingMode === "alternated" && roundSummary && (
            <span className="badge-soft">Ronda {roundSummary.currentRound}/{roundSummary.totalRounds}</span>
          )}
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <ProgressBar value={progressValue} max={100} />
            <p className="mt-3 text-sm text-fog-300">{statusMessage}</p>
          </div>
          {canGoPrevious && (
            <button
              type="button"
              onClick={onGoPrevious}
              aria-label="Volver al paso anterior"
              className="secondary-button h-11 w-11 shrink-0 rounded-full p-0"
            >
              <ArrowLeftIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        {activeTrainingMode === "alternated" && roundSummary && (
          <Card className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="eyebrow">Progreso por rondas</p>
                <h2 className="mt-2 text-[1.35rem] font-semibold tracking-[-0.04em] text-fog-100">
                  Ronda {roundSummary.currentRound} de {roundSummary.totalRounds}
                </h2>
              </div>
              <span className="badge-soft">
                {roundSummary.currentRoundStep}/{roundSummary.roundStepCount} ejercicios
              </span>
            </div>

            <ProgressBar value={roundProgressValue} max={100} />
            <p className="text-sm leading-6 text-fog-300">
              {completedStepCount}/{totalStepCount} series registradas.
            </p>
          </Card>
        )}

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
                  placeholder={suggestedInputValue || "Ej. 20"}
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
                  : suggestedWeightPair
                    ? `Sugerencia base: ${suggestedWeightPair.primary} · ${suggestedWeightPair.secondary}`
                    : "En cuanto registres una carga, verás su equivalente automático en kg y lb."}
              </p>
            </div>

            <ExerciseHistoryCard
              date={lastExerciseDate}
              displayWeight={lastExerciseWeight}
              rpe={lastExerciseRpe}
              sparklinePoints={sparklinePoints}
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
                  className={cn(
                    "set-bubble",
                    currentSetIndex === index && !isDone && "set-bubble-focus",
                    isDone && "set-bubble-active"
                  )}
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
                  className={cn(
                    "choice-chip min-h-[46px] px-4 py-3",
                    state.rpe === value && "choice-chip-active"
                  )}
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
                {getFlowDescription(activeTrainingMode, isLastStep, nextExerciseName)}
              </h3>
            </div>
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-500/12 text-accent-300">
              <TimerIcon className="h-5 w-5" />
            </span>
          </div>

          <p className="text-sm leading-6 text-fog-300">{getFlowMicrocopy(activeTrainingMode)}</p>

          <button
            type="button"
            onClick={onCompleteWorkout}
            disabled={!isWorkoutComplete}
            className="primary-button w-full"
          >
            {isLastStep ? "Finalizar entrenamiento" : "Guardar avance completo"}
          </button>
        </Card>
      </div>
    </div>
  );
};
