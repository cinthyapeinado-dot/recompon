import { useState } from "react";
import { CalendarMonth } from "../components/CalendarMonth";
import { Card } from "../components/Card";
import { HistoryList } from "../components/HistoryList";
import { ArrowRightIcon, CheckIcon } from "../components/Icons";
import { ProgressBar } from "../components/ProgressBar";
import { SectionIntro } from "../components/SectionIntro";
import type { DayId, WorkoutDay, WorkoutHistoryEntry } from "../types";
import { cn } from "../utils/cn";
import {
  formatCalendarDate,
  formatHistoryDate,
  parseCalendarDate,
  shiftMonth
} from "../utils/date";
import { getMonthlySessionCount, groupHistoryByDate } from "../utils/training";

type AgendaScreenProps = {
  completedDays: DayId[];
  currentWeek: number;
  history: WorkoutHistoryEntry[];
  onOpenHistoryEntry: (entry: WorkoutHistoryEntry) => void;
  onSelectDay: (dayId: DayId) => void;
  todayDayId: DayId;
  workouts: WorkoutDay[];
};

export const AgendaScreen = ({
  completedDays,
  currentWeek,
  history,
  onOpenHistoryEntry,
  onSelectDay,
  todayDayId,
  workouts
}: AgendaScreenProps) => {
  const completionPercentage = Math.round((completedDays.length / workouts.length) * 100);
  const historyByDate = groupHistoryByDate(history);
  const todayDateKey = formatCalendarDate();
  const [monthDate, setMonthDate] = useState(() => parseCalendarDate(todayDateKey));
  const [selectedDateKey, setSelectedDateKey] = useState(todayDateKey);

  const sessionCountByDate = Object.fromEntries(
    Object.entries(historyByDate).map(([calendarDate, entries]) => [calendarDate, entries.length])
  );
  const selectedEntries = historyByDate[selectedDateKey] ?? [];
  const monthlySessions = getMonthlySessionCount(history, monthDate);

  return (
    <div className="space-y-5">
      <SectionIntro
        eyebrow={`Semana ${currentWeek}`}
        title="Agenda y calendario"
        description="Aquí puedes ver tu bloque semanal y también el historial real por fecha en formato calendario."
        side={<span className="top-pill">{completionPercentage}%</span>}
      />

      <Card className="space-y-5">
        <CalendarMonth
          monthDate={monthDate}
          onNextMonth={() => setMonthDate((current) => shiftMonth(current, 1))}
          onPreviousMonth={() => setMonthDate((current) => shiftMonth(current, -1))}
          onSelectDate={setSelectedDateKey}
          selectedDateKey={selectedDateKey}
          sessionCountByDate={sessionCountByDate}
          todayDateKey={todayDateKey}
        />

        <div className="soft-separator" />

        <div className="grid grid-cols-2 gap-3">
          <div className="metric-tile px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-50">
              Mes actual
            </p>
            <p className="mt-2 text-[1.35rem] font-semibold tracking-[-0.04em] text-ink-200">
              {monthlySessions} sesiones
            </p>
            <p className="mt-2 text-sm leading-6 text-ink-50">
              Entrenamientos registrados este mes.
            </p>
          </div>
          <div className="metric-tile metric-tile-tint px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-50">
              Día seleccionado
            </p>
            <p className="mt-2 text-[1.35rem] font-semibold tracking-[-0.04em] text-ink-200">
              {formatHistoryDate(selectedDateKey)}
            </p>
            <p className="mt-2 text-sm leading-6 text-ink-50">
              {selectedEntries.length > 0
                ? `${selectedEntries.length} registro(s) encontrados`
                : "Sin sesiones guardadas"}
            </p>
          </div>
        </div>

        <HistoryList
          title="Detalle del día"
          entries={selectedEntries}
          emptyCopy="Cuando entrenes en esta fecha, aquí verás el resumen de esa sesión."
          onOpenEntry={onOpenHistoryEntry}
        />
      </Card>

      <Card className="p-0">
        <div className="px-5 pt-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-50">
                Agenda semanal
              </p>
              <h2 className="mt-2 text-[1.7rem] font-semibold tracking-[-0.04em] text-ink-200">
                {completedDays.length} de {workouts.length} días
              </h2>
            </div>
            <span className="ios-chip text-ink-50">Bloque activo</span>
          </div>
          <ProgressBar className="mt-5" value={completedDays.length} max={workouts.length} />
        </div>

        <div className="soft-separator mx-5 mt-5" />

        <div className="space-y-2 px-3 py-3">
          {workouts.map((workout, index) => {
            const isToday = workout.id === todayDayId;
            const isCompleted = completedDays.includes(workout.id);
            const detail =
              workout.kind === "strength"
                ? `${workout.exercises.length} ejercicios · ${workout.warmup}`
                : workout.details ?? workout.focus;

            return (
              <button
                key={workout.id}
                type="button"
                onClick={() => onSelectDay(workout.id)}
                className={cn(
                  "flex w-full items-center gap-4 rounded-[28px] px-3 py-4 text-left transition duration-300",
                  isToday
                    ? "bg-[linear-gradient(180deg,rgba(252,246,247,0.94),rgba(245,229,234,0.86))] shadow-[0_20px_38px_rgba(196,141,160,0.12)]"
                    : "bg-white/52 hover:bg-white/72",
                  isCompleted && "ring-1 ring-blush-200/60"
                )}
              >
                <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-[22px] border border-white/70 bg-white/72 text-ink-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-50">
                    {workout.shortLabel}
                  </span>
                  <span className="mt-0.5 text-lg font-semibold tracking-[-0.04em]">
                    {index + 1}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-[1.02rem] font-semibold tracking-[-0.03em] text-ink-200">
                      {workout.title}
                    </h2>
                    {isToday && (
                      <span className="rounded-full bg-ink-200 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
                        Hoy
                      </span>
                    )}
                    {isCompleted && (
                      <span className="rounded-full bg-blush-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-blush-500">
                        Hecho
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm leading-6 text-ink-50">{detail}</p>
                </div>

                <span
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                    isCompleted
                      ? "bg-blush-100 text-blush-500"
                      : "bg-white/76 text-ink-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.88)]"
                  )}
                >
                  {isCompleted ? (
                    <CheckIcon className="h-4 w-4" />
                  ) : (
                    <ArrowRightIcon className="h-4 w-4" />
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
