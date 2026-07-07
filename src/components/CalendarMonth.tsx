import { buildMonthGrid, getMonthLabel, weekdayLabels } from "../utils/date";
import { cn } from "../utils/cn";
import { ArrowLeftIcon, ArrowRightIcon } from "./Icons";

type CalendarMonthProps = {
  monthDate: Date;
  onNextMonth: () => void;
  onPreviousMonth: () => void;
  onSelectDate: (dateKey: string) => void;
  selectedDateKey: string;
  sessionCountByDate: Record<string, number>;
  todayDateKey: string;
};

export const CalendarMonth = ({
  monthDate,
  onNextMonth,
  onPreviousMonth,
  onSelectDate,
  selectedDateKey,
  sessionCountByDate,
  todayDateKey
}: CalendarMonthProps) => {
  const monthCells = buildMonthGrid(monthDate);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-50">
            Calendario
          </p>
          <h2 className="mt-2 text-[1.55rem] font-semibold capitalize tracking-[-0.04em] text-ink-200">
            {getMonthLabel(monthDate)}
          </h2>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onPreviousMonth}
            aria-label="Ir al mes anterior"
            className="secondary-button px-3 py-3"
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onNextMonth}
            aria-label="Ir al mes siguiente"
            className="secondary-button px-3 py-3"
          >
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {weekdayLabels.map((label) => (
          <span
            key={label}
            className="text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-50"
          >
            {label}
          </span>
        ))}

        {monthCells.map((cell) => {
          const sessionCount = sessionCountByDate[cell.key] ?? 0;
          const isSelected = selectedDateKey === cell.key;
          const isToday = todayDateKey === cell.key;

          return (
            <button
              key={cell.key}
              type="button"
              onClick={() => onSelectDate(cell.key)}
              aria-label={`${cell.date.getDate()} de ${getMonthLabel(cell.date)}`}
              aria-pressed={isSelected}
              className={cn(
                "relative aspect-square rounded-[22px] border text-sm font-semibold transition duration-300",
                isSelected
                  ? "border-blush-300 bg-[linear-gradient(180deg,rgba(252,246,247,0.96),rgba(245,231,236,0.9))] text-ink-200 shadow-[0_18px_30px_rgba(196,141,160,0.12)]"
                  : "border-white/70 bg-white/64 text-ink-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.88)]",
                !cell.inCurrentMonth && "opacity-35",
                isToday && !isSelected && "ring-1 ring-blush-200"
              )}
            >
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                {cell.date.getDate()}
              </span>

              {sessionCount > 0 && (
                <span className="absolute bottom-2 left-1/2 flex h-5 min-w-[1.25rem] -translate-x-1/2 items-center justify-center rounded-full bg-ink-200 px-1 text-[10px] font-semibold text-white">
                  {sessionCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
