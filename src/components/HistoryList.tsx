import type { WorkoutHistoryEntry } from "../types";
import { formatHistoryDate } from "../utils/date";
import { countLoggedWeights } from "../utils/training";
import { CalendarIcon, CheckIcon, HistoryIcon, WeightIcon } from "./Icons";

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
      <div className="rounded-[28px] border border-dashed border-white/70 bg-white/54 px-4 py-5 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.82)]">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/80 text-ink-50">
          <HistoryIcon className="h-5 w-5" />
        </div>
        <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-50">
          {title}
        </p>
        <p className="mt-2 text-sm leading-6 text-ink-50">{emptyCopy}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => {
        const loggedWeights = countLoggedWeights(entry.weightsByExercise);

        return (
          <div
            key={entry.id}
            className="rounded-[28px] border border-white/70 bg-white/68 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.84)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-50">
                  Semana {entry.week}
                </p>
                <h3 className="mt-1 text-[1.05rem] font-semibold tracking-[-0.03em] text-ink-200">
                  {entry.title}
                </h3>
                <p className="mt-1 text-sm leading-6 text-ink-50">{entry.focus}</p>
              </div>

              <span className="rounded-full bg-blush-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-blush-500">
                {entry.kind === "strength" ? "Gym" : "Recuperación"}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="ios-chip text-ink-50">
                <CalendarIcon className="h-3.5 w-3.5" />
                {formatHistoryDate(entry.calendarDate)}
              </span>
              <span className="ios-chip text-ink-50">
                <CheckIcon className="h-3.5 w-3.5" />
                {entry.checkedExerciseIds.length} marcados
              </span>
              <span className="ios-chip text-ink-50">
                <WeightIcon className="h-3.5 w-3.5" />
                {loggedWeights} pesos
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
        );
      })}
    </div>
  );
};
