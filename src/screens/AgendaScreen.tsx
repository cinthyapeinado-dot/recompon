import { useState } from "react";
import { CalendarMonth } from "../components/CalendarMonth";
import { Card } from "../components/Card";
import { HistoryList } from "../components/HistoryList";
import { SectionIntro } from "../components/SectionIntro";
import type { DayId, WorkoutDay, WorkoutHistoryEntry } from "../types";
import { cn } from "../utils/cn";
import {
  formatCalendarDate,
  formatHistoryDate,
  parseCalendarDate,
  shiftMonth
} from "../utils/date";
import {
  getCurrentStreak,
  getMonthlySessionCount,
  getWeeklyVolumeKg,
  groupHistoryByDate
} from "../utils/training";

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
  const historyByDate = groupHistoryByDate(history);
  const todayDateKey = formatCalendarDate();
  const [monthDate, setMonthDate] = useState(() => parseCalendarDate(todayDateKey));
  const [selectedDateKey, setSelectedDateKey] = useState(todayDateKey);

  const sessionCountByDate = Object.fromEntries(
    Object.entries(historyByDate).map(([calendarDate, entries]) => [calendarDate, entries.length])
  );
  const selectedEntries = historyByDate[selectedDateKey] ?? [];
  const monthlySessions = getMonthlySessionCount(history, monthDate);
  const streak = getCurrentStreak(history);
  const weeklyVolume = getWeeklyVolumeKg(history, currentWeek);

  return (
    <div className="space-y-5">
      <SectionIntro
        eyebrow={`Semana ${currentWeek}`}
        title="Calendario y carga"
        description="Aquí ves qué días ya quedaron hechos, cuánto volumen moviste y cómo viene la constancia."
        side={<span className="badge-soft">{completedDays.length}/7</span>}
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

        <div className="grid grid-cols-2 gap-3">
          <div className="metric-tile px-4 py-4">
            <p className="eyebrow">Racha</p>
            <p className="mt-2 text-[1.35rem] font-semibold text-fog-100">{streak} días</p>
            <p className="mt-2 text-sm leading-6 text-fog-300">Días seguidos con sesiones guardadas.</p>
          </div>
          <div className="metric-tile metric-tile-tint px-4 py-4">
            <p className="eyebrow">Volumen semanal</p>
            <p className="mt-2 text-[1.35rem] font-semibold text-fog-100">
              {weeklyVolume > 0 ? `${Math.round(weeklyVolume)} kg` : "Sin dato"}
            </p>
            <p className="mt-2 text-sm leading-6 text-fog-300">Estimación basada en las series completadas.</p>
          </div>
          <div className="metric-tile px-4 py-4">
            <p className="eyebrow">Mes actual</p>
            <p className="mt-2 text-[1.35rem] font-semibold text-fog-100">{monthlySessions} sesiones</p>
            <p className="mt-2 text-sm leading-6 text-fog-300">Entrenamientos registrados este mes.</p>
          </div>
          <div className="metric-tile px-4 py-4">
            <p className="eyebrow">Día seleccionado</p>
            <p className="mt-2 text-[1.35rem] font-semibold text-fog-100">
              {formatHistoryDate(selectedDateKey)}
            </p>
            <p className="mt-2 text-sm leading-6 text-fog-300">
              {selectedEntries.length > 0
                ? `${selectedEntries.length} sesión(es) en esa fecha.`
                : "Aún no hay sesión guardada ese día."}
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

      <Card className="space-y-3 p-3">
        {workouts.map((workout, index) => {
          const isToday = workout.id === todayDayId;
          const isCompleted = completedDays.includes(workout.id);
          const detail =
            workout.kind === "strength"
              ? `${workout.exercises.length} ejercicios · ${workout.estimatedDurationMinutes} min`
              : workout.details ?? workout.focus;

          return (
            <button
              key={workout.id}
              type="button"
              onClick={() => onSelectDay(workout.id)}
              className={cn(
                "rounded-[24px] border px-4 py-4 text-left transition duration-300",
                isToday
                  ? "border-accent-400/20 bg-accent-500/10"
                  : "border-white/6 bg-white/[0.02]",
                isCompleted && "shadow-[inset_0_0_0_1px_rgba(69,228,183,0.15)]"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="badge-soft">{workout.shortLabel}</span>
                    {isToday && <span className="badge-strong">Hoy</span>}
                    {isCompleted && <span className="badge-soft">Hecho</span>}
                  </div>
                  <h2 className="mt-3 text-[1.08rem] font-semibold text-fog-100">
                    {index + 1}. {workout.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-fog-300">{detail}</p>
                </div>
              </div>
            </button>
          );
        })}
      </Card>
    </div>
  );
};
