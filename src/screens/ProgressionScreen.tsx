import { Card } from "../components/Card";
import { HistoryList } from "../components/HistoryList";
import { SectionIntro } from "../components/SectionIntro";
import { StatTile } from "../components/StatTile";
import { getProgressionPhase, progressionPhases } from "../data/workouts";
import type { DayId, WorkoutHistoryEntry } from "../types";
import { cn } from "../utils/cn";
import {
  getBestWeekCount,
  getMonthlySessionCount,
  getPersonalBests,
  getTotalLoggedWeights,
  getWeeksWithActivity,
  getWeeklyVolumeKg
} from "../utils/training";

type ProgressionScreenProps = {
  completedDaysByWeek: Record<string, DayId[]>;
  currentWeek: number;
  history: WorkoutHistoryEntry[];
  onOpenHistoryEntry: (entry: WorkoutHistoryEntry) => void;
};

export const ProgressionScreen = ({
  completedDaysByWeek,
  currentWeek,
  history,
  onOpenHistoryEntry
}: ProgressionScreenProps) => {
  const activePhase = getProgressionPhase(currentWeek);
  const activeWeeks = getWeeksWithActivity(completedDaysByWeek);
  const bestWeekCount = getBestWeekCount(completedDaysByWeek);
  const totalLoggedWeights = getTotalLoggedWeights(history);
  const personalBests = getPersonalBests(history).slice(0, 4);
  const currentMonthSessions = getMonthlySessionCount(history, new Date());
  const weeklyVolume = getWeeklyVolumeKg(history, currentWeek);

  return (
    <div className="space-y-5">
      <SectionIntro
        eyebrow={`Semana ${currentWeek}`}
        title="Progreso real"
        description="Aquí se junta adherencia, volumen, mejores marcas y el bloque actual del programa."
        side={<span className="badge-soft">{history.length} sesiones</span>}
      />

      <Card className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <StatTile
            label="Sesiones"
            value={String(history.length)}
            detail="Entrenamientos completados"
            tone="tint"
          />
          <StatTile
            label="Semanas activas"
            value={String(activeWeeks)}
            detail="Semanas con avance guardado"
          />
          <StatTile
            label="Mejor semana"
            value={`${bestWeekCount}/7`}
            detail="Máximo de días completados"
          />
          <StatTile
            label="Pesos guardados"
            value={String(totalLoggedWeights)}
            detail="Registros de carga"
            tone="dark"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <StatTile
            label="Mes actual"
            value={String(currentMonthSessions)}
            detail="Sesiones registradas"
            tone="tint"
          />
          <StatTile
            label="Volumen"
            value={weeklyVolume > 0 ? `${Math.round(weeklyVolume)} kg` : "Sin dato"}
            detail="Semana actual"
          />
        </div>
      </Card>

      <Card className="space-y-4">
        <div>
          <p className="eyebrow">Fase actual</p>
          <h2 className="mt-2 text-[1.65rem] font-semibold text-fog-100">{activePhase.title}</h2>
          <p className="mt-3 text-sm leading-6 text-fog-300">{activePhase.description}</p>
        </div>

        <div className="card-subtle">
          <p className="text-sm font-semibold text-fog-100">{activePhase.emphasis}</p>
        </div>

        <div className="space-y-3">
          {progressionPhases.map((phase) => {
            const isActive = phase.title === activePhase.title;

            return (
              <div
                key={phase.title}
                className={cn(
                  "rounded-[24px] border px-4 py-4",
                  isActive
                    ? "border-accent-400/18 bg-accent-500/10"
                    : "border-white/6 bg-white/[0.02]"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="eyebrow">{phase.weeks}</p>
                    <h3 className="mt-2 text-[1.08rem] font-semibold text-fog-100">
                      {phase.title}
                    </h3>
                  </div>
                  {isActive && <span className="badge-strong">En curso</span>}
                </div>
                <p className="mt-3 text-sm leading-6 text-fog-300">{phase.emphasis}</p>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="space-y-4">
        <div>
          <p className="eyebrow">Mejores pesos</p>
          <h2 className="mt-2 text-[1.45rem] font-semibold text-fog-100">
            Referencias más sólidas
          </h2>
        </div>

        {personalBests.length > 0 ? (
          <div className="space-y-3">
            {personalBests.map((personalBest) => (
              <div
                key={personalBest.exerciseId}
                className="rounded-[22px] border border-white/6 bg-white/[0.02] px-4 py-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-fog-100">
                      {personalBest.exerciseName}
                    </p>
                    <p className="mt-1 text-sm text-fog-300">{personalBest.date}</p>
                  </div>
                  <span className="badge-strong">{personalBest.displayWeight}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card-subtle text-sm leading-6 text-fog-300">
            Cuando empieces a registrar pesos con más constancia, aquí aparecerán tus referencias.
          </div>
        )}
      </Card>

      <Card className="space-y-4">
        <div>
          <p className="eyebrow">Historial reciente</p>
          <h2 className="mt-2 text-[1.45rem] font-semibold text-fog-100">
            Sesiones más recientes
          </h2>
        </div>

        <HistoryList
          title="Historial"
          entries={history.slice(0, 4)}
          emptyCopy="Todavía no hay sesiones cerradas. En cuanto completes un bloque, aparecerá aquí."
          onOpenEntry={onOpenHistoryEntry}
        />
      </Card>
    </div>
  );
};
