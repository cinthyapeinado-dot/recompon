import type { DayId } from "../types";
import { workoutsById } from "../data/workouts";
import { ArrowRightIcon, DumbbellIcon } from "./Icons";

type FloatingTodayButtonProps = {
  todayDayId: DayId;
  onOpenToday: () => void;
};

export const FloatingTodayButton = ({
  todayDayId,
  onOpenToday
}: FloatingTodayButtonProps) => (
  <div className="pointer-events-none fixed bottom-[calc(env(safe-area-inset-bottom)+92px)] left-1/2 z-20 w-full max-w-[430px] -translate-x-1/2 px-4">
    <button
      type="button"
      onClick={onOpenToday}
      aria-label={`Abrir rutina de hoy: ${workoutsById[todayDayId].title}`}
      className="floating-action pointer-events-auto ml-auto flex items-center gap-3 px-3 py-3 text-sm font-semibold text-white"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
        <DumbbellIcon className="h-5 w-5" />
      </span>
      <span className="text-left leading-tight">
        <span className="block text-[10px] uppercase tracking-[0.2em] text-white/56">Hoy</span>
        <span className="block text-[0.95rem] tracking-[-0.02em]">
          {workoutsById[todayDayId].title}
        </span>
      </span>
      <ArrowRightIcon className="h-4 w-4" />
    </button>
  </div>
);
