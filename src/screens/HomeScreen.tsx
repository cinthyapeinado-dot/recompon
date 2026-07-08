import { ChevronDownIcon, DumbbellIcon, LoopIcon, ZapIcon } from "../components/Icons";
import { trainingModeById } from "../data/trainingModes";
import type { TrainingMode } from "../types";

type HomeScreenProps = {
  athleteName: string;
  currentWeek: number;
  estimatedDurationMinutes: number;
  expectedEnergy: string;
  focus: string;
  onOpenToday: () => void;
  onOpenTrainingModeOptions: () => void;
  todayLabel: string;
  todayTitle: string;
  trainingMode: TrainingMode;
};

const iconMap = {
  alternated: LoopIcon,
  circuit: ZapIcon,
  traditional: DumbbellIcon
} as const;

export const HomeScreen = ({
  athleteName,
  currentWeek,
  estimatedDurationMinutes,
  expectedEnergy,
  focus,
  onOpenToday,
  onOpenTrainingModeOptions,
  todayLabel,
  todayTitle,
  trainingMode
}: HomeScreenProps) => {
  const modeDefinition = trainingModeById[trainingMode];
  const Icon = iconMap[trainingMode];

  return (
    <div className="flex min-h-[calc(100vh-10.5rem)] flex-col justify-between gap-8 pb-6">
      <div className="space-y-6 pt-4">
        <div className="flex items-center justify-between gap-3">
          <span className="top-pill">Semana {currentWeek}</span>
          <button
            type="button"
            onClick={onOpenTrainingModeOptions}
            className="mode-pill"
            aria-label={`Cambiar modo de entrenamiento. Activo: ${modeDefinition.title}`}
          >
            <Icon className="h-4 w-4" />
            <span>{modeDefinition.title}</span>
            <ChevronDownIcon className="h-4 w-4 text-fog-400" />
          </button>
        </div>

        <div className="space-y-3">
          <p className="text-[0.98rem] font-medium text-fog-300">Buenos días, {athleteName}.</p>
          <h1 className="max-w-[10ch] text-[3rem] font-semibold tracking-[-0.07em] text-fog-100">
            Hoy toca:
          </h1>
          <p className="text-[2.45rem] font-semibold tracking-[-0.07em] text-fog-100">
            {todayTitle}.
          </p>
        </div>
      </div>

      <section className="glass-card px-5 py-6">
        <div className="space-y-4">
          <div>
            <p className="eyebrow">{todayLabel}</p>
            <p className="mt-3 text-[1rem] leading-7 text-fog-300">{focus}</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="metric-tile px-3 py-4">
              <p className="eyebrow">Duración</p>
              <p className="mt-2 text-[1.25rem] font-semibold text-fog-100">
                {estimatedDurationMinutes} min
              </p>
            </div>
            <div className="metric-tile px-3 py-4">
              <p className="eyebrow">Tiempo</p>
              <p className="mt-2 text-[1.25rem] font-semibold text-fog-100">
                {estimatedDurationMinutes <= 35
                  ? "Corto"
                  : estimatedDurationMinutes <= 55
                    ? "Medio"
                    : "Completo"}
              </p>
            </div>
            <div className="metric-tile metric-tile-tint px-3 py-4">
              <p className="eyebrow">Energía</p>
              <p className="mt-2 text-[1.25rem] font-semibold text-fog-100">{expectedEnergy}</p>
            </div>
          </div>

          <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-3">
            <p className="text-sm leading-6 text-fog-300">
              {modeDefinition.compactDescription}
            </p>
          </div>
        </div>

        <button type="button" onClick={onOpenToday} className="primary-button mt-6 w-full py-4">
          COMENZAR ENTRENAMIENTO
        </button>
      </section>
    </div>
  );
};
