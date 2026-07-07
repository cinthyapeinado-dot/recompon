import { useMemo, useState } from "react";
import type {
  DailyCheckIn,
  DiscomfortArea,
  SleepQuality,
  TimeAvailability,
  EnergyLevel,
  WorkoutDay,
  WorkoutHistoryEntry
} from "../types";
import { Card } from "../components/Card";
import { SectionIntro } from "../components/SectionIntro";
import { buildWorkoutCoachPlan } from "../utils/recommendations";
import { cn } from "../utils/cn";

type CheckInScreenProps = {
  calendarDate: string;
  currentWeek: number;
  history: WorkoutHistoryEntry[];
  initialValue: DailyCheckIn | null;
  onComplete: (
    value: Omit<DailyCheckIn, "calendarDate" | "createdAt" | "dayId" | "week">,
    strategy: "applied" | "kept"
  ) => void;
  workout: WorkoutDay;
};

const sleepOptions: SleepQuality[] = ["excelente", "bien", "regular", "mal"];
const energyOptions: EnergyLevel[] = ["alta", "media", "baja"];
const timeOptions: TimeAvailability[] = ["completo", "45_min", "30_min"];
const discomfortOptions: DiscomfortArea[] = ["rodilla", "espalda", "hombro", "otra"];

const optionLabelMap: Record<string, string> = {
  excelente: "Excelente",
  bien: "Bien",
  regular: "Regular",
  mal: "Mal",
  alta: "Alta",
  media: "Media",
  baja: "Baja",
  completo: "Completo",
  "45_min": "45 minutos",
  "30_min": "30 minutos",
  rodilla: "Rodilla",
  espalda: "Espalda",
  hombro: "Hombro",
  otra: "Otra"
};

export const CheckInScreen = ({
  calendarDate,
  currentWeek,
  history,
  initialValue,
  onComplete,
  workout
}: CheckInScreenProps) => {
  const [sleep, setSleep] = useState<SleepQuality | null>(initialValue?.sleep ?? null);
  const [energy, setEnergy] = useState<EnergyLevel | null>(initialValue?.energy ?? null);
  const [timeAvailable, setTimeAvailable] = useState<TimeAvailability | null>(
    initialValue?.timeAvailable ?? null
  );
  const [discomforts, setDiscomforts] = useState<DiscomfortArea[]>(
    initialValue?.discomforts ?? []
  );

  const isReady = sleep != null && energy != null && timeAvailable != null;
  const draftCheckIn = useMemo(() => {
    if (!isReady || sleep == null || energy == null || timeAvailable == null) {
      return null;
    }

    return {
      calendarDate,
      createdAt: new Date().toISOString(),
      dayId: workout.id,
      energy,
      discomforts,
      sleep,
      timeAvailable,
      week: currentWeek
    } satisfies DailyCheckIn;
  }, [calendarDate, currentWeek, discomforts, energy, isReady, sleep, timeAvailable, workout.id]);

  const previewPlan = useMemo(
    () =>
      draftCheckIn
        ? buildWorkoutCoachPlan({
            history: history.filter((entry) => entry.dayId === workout.id),
            strategy: "applied",
            workout,
            checkIn: draftCheckIn
          })
        : null,
    [draftCheckIn, history, workout]
  );

  const toggleDiscomfort = (value: DiscomfortArea) => {
    setDiscomforts((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
    );
  };

  const renderOptions = <T extends string>({
    options,
    selectedValue,
    onSelect,
    multiple = false
  }: {
    multiple?: boolean;
    onSelect: (value: T) => void;
    options: T[];
    selectedValue: T | T[] | null;
  }) => (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {options.map((option) => {
        const isActive = Array.isArray(selectedValue)
          ? selectedValue.includes(option)
          : selectedValue === option;

        return (
          <button
            key={option}
            type="button"
            onClick={() => onSelect(option)}
            aria-pressed={isActive}
            className={cn("choice-chip", isActive && "choice-chip-active", multiple && "text-left")}
          >
            {optionLabelMap[option]}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-5">
      <SectionIntro
        eyebrow="Check-in"
        title="Antes de empezar"
        description="Responde esto en menos de 10 segundos y ajustamos el contexto sin tocar tu rutina base."
        side={<span className="badge-soft">Rápido</span>}
      />

      <Card className="space-y-5">
        <div className="space-y-3">
          <p className="eyebrow">😴 ¿Cómo dormiste?</p>
          {renderOptions({
            options: sleepOptions,
            selectedValue: sleep,
            onSelect: setSleep
          })}
        </div>

        <div className="divider-line" />

        <div className="space-y-3">
          <p className="eyebrow">⚡ ¿Cómo está tu energía?</p>
          {renderOptions({
            options: energyOptions,
            selectedValue: energy,
            onSelect: setEnergy
          })}
        </div>

        <div className="divider-line" />

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="eyebrow">🦵 ¿Tienes alguna molestia?</p>
            <button
              type="button"
              onClick={() => setDiscomforts([])}
              className="text-sm text-fog-400 transition hover:text-fog-200"
            >
              Ninguna
            </button>
          </div>
          {renderOptions({
            multiple: true,
            options: discomfortOptions,
            selectedValue: discomforts,
            onSelect: toggleDiscomfort
          })}
        </div>

        <div className="divider-line" />

        <div className="space-y-3">
          <p className="eyebrow">⏱ ¿Cuánto tiempo tienes hoy?</p>
          {renderOptions({
            options: timeOptions,
            selectedValue: timeAvailable,
            onSelect: setTimeAvailable
          })}
        </div>
      </Card>

      {draftCheckIn && previewPlan && (
        <Card tone="dark" className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="eyebrow text-white/60">Recomendación inteligente</p>
              <h2 className="mt-2 text-[1.4rem] font-semibold tracking-[-0.04em] text-white">
                {previewPlan.summary}
              </h2>
            </div>
            <span className="badge-strong">{previewPlan.confidence}%</span>
          </div>

          <div className="space-y-2">
            {previewPlan.adjustments.length > 0 ? (
              previewPlan.adjustments.map((adjustment) => (
                <div key={`${adjustment.title}-${adjustment.exerciseId ?? "general"}`} className="coach-note">
                  <p className="text-sm font-semibold text-white">{adjustment.title}</p>
                  <p className="mt-1 text-sm leading-6 text-white/72">{adjustment.reason}</p>
                </div>
              ))
            ) : (
              <div className="coach-note">
                <p className="text-sm leading-6 text-white/72">
                  No hace falta recortar ni proteger nada hoy. Mantén el plan y usa las sugerencias de peso ejercicio por ejercicio.
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() =>
                onComplete(
                  {
                    energy: draftCheckIn.energy,
                    discomforts: draftCheckIn.discomforts,
                    sleep: draftCheckIn.sleep,
                    timeAvailable: draftCheckIn.timeAvailable
                  },
                  "applied"
                )
              }
              className="primary-button"
            >
              Aplicar recomendación
            </button>
            <button
              type="button"
              onClick={() =>
                onComplete(
                  {
                    energy: draftCheckIn.energy,
                    discomforts: draftCheckIn.discomforts,
                    sleep: draftCheckIn.sleep,
                    timeAvailable: draftCheckIn.timeAvailable
                  },
                  "kept"
                )
              }
              className="secondary-button"
            >
              Mantener rutina
            </button>
          </div>
        </Card>
      )}
    </div>
  );
};
