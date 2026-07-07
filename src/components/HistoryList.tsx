import type { WorkoutHistoryEntry } from "../types";
import { formatHistoryDate } from "../utils/date";

type HistoryListProps = {
  emptyCopy: string;
  entries: WorkoutHistoryEntry[];
  onOpenEntry?: (entry: WorkoutHistoryEntry) => void;
  title?: string;
};

export const HistoryList = ({
  emptyCopy,
  entries,
  onOpenEntry,
  title = "Historial"
}: HistoryListProps) => {
  if (entries.length === 0) {
    return (
      <div className="card-subtle text-center">
        <p className="eyebrow">{title}</p>
        <p className="mt-3 text-sm leading-6 text-fog-300">{emptyCopy}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="rounded-[24px] border border-white/6 bg-white/[0.02] px-4 py-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="eyebrow">Semana {entry.week}</p>
              <h3 className="mt-2 text-[1.05rem] font-semibold text-fog-100">{entry.title}</h3>
              <p className="mt-2 text-sm leading-6 text-fog-300">{entry.focus}</p>
            </div>
            <span className="badge-soft">{entry.kind === "strength" ? "Gym" : "Recuperación"}</span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="badge-soft">{formatHistoryDate(entry.calendarDate)}</span>
            <span className="badge-soft">{entry.checkedExerciseIds.length} ejercicios</span>
            <span className="badge-soft">
              {entry.totalVolumeKg != null ? `${Math.round(entry.totalVolumeKg)} kg` : "Sin volumen"}
            </span>
          </div>

          {onOpenEntry && (
            <button
              type="button"
              onClick={() => onOpenEntry(entry)}
              className="secondary-button mt-4 w-full"
            >
              Abrir rutina
            </button>
          )}
        </div>
      ))}
    </div>
  );
};
