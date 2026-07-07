import { Card } from "../components/Card";
import { CircularProgress } from "../components/CircularProgress";
import { HistoryList } from "../components/HistoryList";
import { ArrowRightIcon, SparkIcon, TrendIcon } from "../components/Icons";
import { ProgressBar } from "../components/ProgressBar";
import { SectionIntro } from "../components/SectionIntro";
import { StatTile } from "../components/StatTile";
import { TOTAL_PROGRAM_WEEKS, getProgressionPhase, workouts } from "../data/workouts";
import type { WorkoutDay, WorkoutHistoryEntry } from "../types";

type HomeScreenProps = {
  activeWeeks: number;
  completedDaysCount: number;
  currentWeek: number;
  onOpenAgenda: () => void;
  onOpenProgression: () => void;
  onOpenToday: () => void;
  recentHistory: WorkoutHistoryEntry[];
  todayWorkout: WorkoutDay;
  totalSessions: number;
  weeksRemaining: number;
};

export const HomeScreen = ({
  activeWeeks,
  completedDaysCount,
  currentWeek,
  onOpenAgenda,
  onOpenProgression,
  onOpenToday,
  recentHistory,
  todayWorkout,
  totalSessions,
  weeksRemaining
}: HomeScreenProps) => {
  const currentPhase = getProgressionPhase(currentWeek);
  const highPriorityExercises = todayWorkout.exercises.filter(
    (exercise) => exercise.priority === "alta"
  ).length;
  const isStrengthDay = todayWorkout.kind === "strength";

  return (
    <div className="space-y-5">
      <SectionIntro
        eyebrow="Programa personal"
        title="Hola, Cinthya"
        description="Tu plan ahora registra semanas, historial, pesos y progreso real para que la app se sienta útil dentro del gym."
        side={
          <span className="top-pill hidden sm:inline-flex">
            <SparkIcon className="h-3.5 w-3.5" />
            Activa
          </span>
        }
      />

      <Card className="overflow-hidden px-5 py-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-50">
              Contador de semanas
            </p>
            <h2 className="mt-2 text-[2rem] font-semibold tracking-[-0.05em] text-ink-200">
              Semana {currentWeek} de {TOTAL_PROGRAM_WEEKS}
            </h2>
            <p className="mt-3 max-w-[16rem] text-[0.95rem] leading-7 text-ink-50">
              {currentPhase.description}
            </p>
          </div>
          <CircularProgress
            value={currentWeek}
            max={TOTAL_PROGRAM_WEEKS}
            label="Bloque"
            detail={`${weeksRemaining} restantes`}
          />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <StatTile
            label="Etapa activa"
            value={currentPhase.title}
            detail={currentPhase.weeks}
            tone="tint"
          />
          <StatTile
            label="Semanas activas"
            value={String(activeWeeks)}
            detail="Semanas con progreso guardado"
            tone="dark"
          />
        </div>

        <div className="mt-6 rounded-[28px] bg-[linear-gradient(160deg,rgba(34,28,25,0.95),rgba(84,66,60,0.92))] px-4 py-4 text-white shadow-[0_24px_50px_rgba(41,30,24,0.18)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/56">Enfoque</p>
              <p className="mt-1 text-lg font-semibold tracking-[-0.03em]">
                {currentPhase.title}
              </p>
            </div>
            <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
              {currentPhase.weeks}
            </span>
          </div>
          <p className="mt-3 text-sm leading-6 text-white/74">{currentPhase.emphasis}</p>
        </div>
      </Card>

      <Card className="p-0">
        <div className="px-5 pt-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-50">
                Estadísticas rápidas
              </p>
              <h2 className="mt-2 text-[1.7rem] font-semibold tracking-[-0.04em] text-ink-200">
                {totalSessions} sesiones totales
              </h2>
            </div>
            <span className="ios-chip text-ink-50">
              <TrendIcon className="h-3.5 w-3.5" />
              Actual
            </span>
          </div>
        </div>

        <div className="px-5 pb-5 pt-4">
          <ProgressBar value={completedDaysCount} max={workouts.length} />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <StatTile
              label="Semana actual"
              value={`${completedDaysCount}/${workouts.length}`}
              detail="Días completados"
            />
            <StatTile
              label="Historial"
              value={String(recentHistory.length)}
              detail="Últimos entrenamientos visibles"
              tone="tint"
            />
          </div>
        </div>

        <div className="soft-separator mx-5" />

        <div className="flex gap-3 px-5 py-5">
          <button type="button" onClick={onOpenAgenda} className="secondary-button flex-1">
            Ver agenda
          </button>
          <button type="button" onClick={onOpenProgression} className="primary-button flex-1">
            Ver estadísticas
          </button>
        </div>
      </Card>

      <Card className="p-0">
        <div className="flex items-center justify-between gap-3">
          <div className="px-5 pt-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-50">
              Hoy toca
            </p>
            <h2 className="mt-2 text-[1.9rem] font-semibold tracking-[-0.04em] text-ink-200">
              {todayWorkout.title}
            </h2>
            <p className="mt-2 max-w-[18rem] text-[0.95rem] leading-7 text-ink-50">
              {todayWorkout.focus}
            </p>
          </div>
          <span className="mr-5 mt-5 rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-50 shadow-[0_16px_32px_rgba(35,24,20,0.08)]">
            {todayWorkout.label}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 px-5">
          <StatTile
            label={isStrengthDay ? "Calentamiento" : "Modalidad"}
            value={isStrengthDay ? "Elíptica 15 min" : todayWorkout.kind === "active" ? "Activo" : "Descanso"}
            detail={
              isStrengthDay
                ? "Entrada en calor"
                : todayWorkout.kind === "active"
                  ? "Movimiento suave"
                  : "Recuperación total"
            }
            tone="light"
          />
          <StatTile
            label={isStrengthDay ? "Prioridad" : "Plan"}
            value={
              isStrengthDay
                ? `${highPriorityExercises} clave`
                : todayWorkout.kind === "active"
                  ? "45-60 min"
                  : "Sueño + comida"
            }
            detail={isStrengthDay ? "Ejercicios de enfoque" : "Objetivo del día"}
            tone="tint"
          />
        </div>

        <div className="mx-5 mt-5 rounded-[28px] bg-white/78 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.82)]">
          <p className="text-[0.95rem] leading-7 text-ink-50">{todayWorkout.microcopy}</p>
        </div>

        <div className="px-5 pb-5 pt-5">
          <button type="button" onClick={onOpenToday} className="primary-button w-full">
            <span className="inline-flex items-center gap-2">
              Abrir sesión
              <ArrowRightIcon className="h-4 w-4" />
            </span>
          </button>
        </div>
      </Card>

      <Card className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-50">
              Historial reciente
            </p>
            <h2 className="mt-2 text-[1.45rem] font-semibold tracking-[-0.04em] text-ink-200">
              Tus últimos entrenamientos
            </h2>
          </div>
        </div>

        <HistoryList
          title="Historial reciente"
          entries={recentHistory}
          emptyCopy="Cuando completes entrenamientos, aquí aparecerá tu rastro de sesiones."
        />
      </Card>
    </div>
  );
};
