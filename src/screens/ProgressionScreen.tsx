import { Card } from "../components/Card";
import { HistoryList } from "../components/HistoryList";
import { SectionIntro } from "../components/SectionIntro";
import { TrendIcon, WeightIcon } from "../components/Icons";
import { StatTile } from "../components/StatTile";
import { getProgressionPhase, progressionPhases } from "../data/workouts";
import type { DayId, WorkoutHistoryEntry } from "../types";
import { cn } from "../utils/cn";
import {
  getBestWeekCount,
  getMonthlySessionCount,
  getPersonalBests,
  getTotalLoggedWeights,
  getWeeksWithActivity
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

  return (
    <div className="space-y-5">
      <SectionIntro
        eyebrow={`Semana actual ${currentWeek}`}
        title="Estadísticas"
        description="Aquí se junta lo que has hecho: sesiones, historial, pesos usados y el punto actual del programa."
        side={<span className="top-pill">{history.length} sesiones</span>}
      />

      <Card className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-50">
              Resumen de avance
            </p>
            <h2 className="mt-2 text-[1.7rem] font-semibold tracking-[-0.04em] text-ink-200">
              Métricas del programa
            </h2>
          </div>
          <span className="ios-chip text-ink-50">
            <TrendIcon className="h-3.5 w-3.5" />
            Actual
          </span>
        </div>

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
            detail="Registros de carga en historial"
            tone="dark"
          />
        </div>
      </Card>

      <Card className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <StatTile
            label="Mes actual"
            value={String(currentMonthSessions)}
            detail="Sesiones registradas este mes"
            tone="tint"
          />
          <StatTile
            label="Fase"
            value={activePhase.title}
            detail={activePhase.weeks}
            tone="dark"
          />
        </div>

        {personalBests.length > 0 ? (
          <div className="rounded-[28px] border border-white/70 bg-white/64 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.84)]">
            <div className="flex items-center gap-2">
              <WeightIcon className="h-4 w-4 text-ink-50" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-50">
                Mejores pesos registrados
              </p>
            </div>

            <div className="mt-4 space-y-3">
              {personalBests.map((personalBest) => (
                <div
                  key={personalBest.exerciseId}
                  className="flex items-center justify-between rounded-[22px] bg-sand-50 px-3 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-ink-200">
                      {personalBest.exerciseName}
                    </p>
                    <p className="mt-1 text-xs text-ink-50">{personalBest.date}</p>
                  </div>
                  <span className="rounded-full bg-ink-200 px-3 py-1 text-sm font-semibold text-white">
                    {personalBest.displayWeight}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-[28px] border border-dashed border-white/70 bg-white/52 px-4 py-5 text-center text-sm leading-6 text-ink-50">
            Cuando empieces a registrar pesos, aquí aparecerán tus mejores marcas.
          </div>
        )}
      </Card>

      <Card className="space-y-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-50">
            Historial
          </p>
          <h2 className="mt-2 text-[1.45rem] font-semibold tracking-[-0.04em] text-ink-200">
            Últimas sesiones completadas
          </h2>
        </div>

        <HistoryList
          title="Historial"
          entries={history.slice(0, 4)}
          emptyCopy="Todavía no hay sesiones cerradas. En cuanto marques días como completos, aparecerán aquí."
          onOpenEntry={onOpenHistoryEntry}
        />
      </Card>

      <Card className="p-0">
        <div className="px-5 pt-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-50">
            Progresión del plan
          </p>
          <h2 className="mt-2 text-[1.8rem] font-semibold tracking-[-0.04em] text-ink-200">
            {activePhase.title}
          </h2>
          <p className="mt-2 text-[0.95rem] leading-7 text-ink-50">{activePhase.emphasis}</p>
        </div>

        <div className="soft-separator mx-5 mt-5" />

        <div className="space-y-1 px-4 py-4">
          {progressionPhases.map((phase, index) => {
            const isActive = phase.title === activePhase.title;
            const isLast = index === progressionPhases.length - 1;

            return (
              <div key={phase.title} className="relative pl-10 pr-1">
                {!isLast && (
                  <span className="absolute left-[15px] top-10 h-[calc(100%-12px)] w-px bg-[linear-gradient(180deg,rgba(185,120,143,0.32),rgba(255,255,255,0))]" />
                )}

                <span
                  className={cn(
                    "absolute left-0 top-4 h-8 w-8 rounded-full border",
                    isActive
                      ? "border-blush-300 bg-blush-300 shadow-[0_14px_26px_rgba(185,120,143,0.22)]"
                      : "border-white/70 bg-white/75"
                  )}
                />

                <div
                  className={cn(
                    "mb-3 rounded-[28px] border px-4 py-4",
                    isActive
                      ? "border-blush-200 bg-[linear-gradient(180deg,rgba(252,246,247,0.96),rgba(245,231,236,0.88))] shadow-[0_18px_34px_rgba(196,141,160,0.12)]"
                      : "border-white/70 bg-white/64"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-50">
                        {phase.weeks}
                      </p>
                      <h2 className="mt-2 text-[1.2rem] font-semibold tracking-[-0.03em] text-ink-200">
                        {phase.title}
                      </h2>
                    </div>
                    {isActive && (
                      <span className="rounded-full bg-ink-200 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
                        En curso
                      </span>
                    )}
                  </div>

                  <p className="mt-3 text-sm leading-6 text-ink-50">{phase.description}</p>
                  <div className="mt-4 rounded-[22px] bg-white/76 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.86)]">
                    <p className="text-sm font-semibold text-ink-200">{phase.emphasis}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
