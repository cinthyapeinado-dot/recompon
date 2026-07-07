import type { Exercise } from "../types";
import { cn } from "../utils/cn";
import { CheckIcon, TimerIcon, WeightIcon } from "./Icons";

type ExerciseChecklistProps = {
  checkedIds: string[];
  exercises: Exercise[];
  onStartRest: (exercise: Exercise) => void;
  onToggle: (exerciseId: string) => void;
  onWeightChange: (exerciseId: string, value: string) => void;
  previousWeights: Record<string, string>;
  weights: Record<string, string>;
};

export const ExerciseChecklist = ({
  checkedIds,
  exercises,
  onStartRest,
  onToggle,
  onWeightChange,
  previousWeights,
  weights
}: ExerciseChecklistProps) => (
  <div className="space-y-3">
    {exercises.map((exercise, index) => {
      const isChecked = checkedIds.includes(exercise.id);
      const currentWeight = weights[exercise.id] ?? "";
      const previousWeight = previousWeights[exercise.id] ?? "";

      return (
        <article
          key={exercise.id}
          className={cn(
            "rounded-[28px] border p-4 transition duration-300",
            isChecked
              ? "border-blush-200 bg-[linear-gradient(180deg,rgba(255,248,250,0.96),rgba(247,233,237,0.9))] shadow-[0_20px_34px_rgba(196,141,160,0.14)]"
              : "border-white/70 bg-white/72 shadow-[inset_0_1px_0_rgba(255,255,255,0.82)] hover:border-blush-100 hover:bg-white/82"
          )}
        >
          <button
            type="button"
            onClick={() => onToggle(exercise.id)}
            aria-pressed={isChecked}
            className="group flex w-full items-start gap-3 text-left"
          >
            <span
              className={cn(
                "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition",
                isChecked
                  ? "border-blush-400 bg-blush-400 text-white shadow-[0_10px_22px_rgba(185,120,143,0.28)]"
                  : "border-white/70 bg-white/92 text-transparent"
              )}
            >
              <CheckIcon className="h-4 w-4" />
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-50">
                    Ejercicio {index + 1}
                  </p>
                  <h3 className="mt-1 text-[1.02rem] font-semibold tracking-[-0.03em] text-ink-200">
                    {exercise.name}
                  </h3>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]",
                    exercise.priority === "alta" ? "bg-ink-200 text-white" : "bg-sand-50 text-ink-50"
                  )}
                >
                  {exercise.priority}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2 text-sm">
                <div className="rounded-full bg-sand-50 px-3 py-2">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-ink-50">Series</p>
                  <p className="mt-0.5 font-semibold text-ink-200">{exercise.sets}</p>
                </div>
                <div className="rounded-full bg-sand-50 px-3 py-2">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-ink-50">Reps</p>
                  <p className="mt-0.5 font-semibold text-ink-200">{exercise.reps}</p>
                </div>
                <div className="rounded-full bg-sand-50 px-3 py-2">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-ink-50">Descanso</p>
                  <p className="mt-0.5 font-semibold text-ink-200">{exercise.rest}</p>
                </div>
              </div>
            </div>
          </button>

          <div className="mt-4 grid grid-cols-[1fr_auto] gap-3">
            <label className="rounded-[22px] border border-white/70 bg-white/74 px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.88)]">
              <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-50">
                <WeightIcon className="h-3.5 w-3.5" />
                Peso usado
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={currentWeight}
                onChange={(event) => onWeightChange(exercise.id, event.target.value)}
                placeholder="Ej. 80 kg"
                className="mt-2 w-full border-0 bg-transparent p-0 text-sm font-semibold text-ink-200 outline-none placeholder:text-ink-50/70"
              />
              {previousWeight && (
                <span className="mt-2 block text-xs text-ink-50">Último: {previousWeight}</span>
              )}
            </label>

            <button
              type="button"
              onClick={() => onStartRest(exercise)}
              aria-label={`Iniciar descanso de ${exercise.rest} para ${exercise.name}`}
              className="secondary-button min-w-[88px] px-3 py-3"
            >
              <span className="flex flex-col items-center gap-1">
                <TimerIcon className="h-4 w-4" />
                <span className="text-[11px]">{exercise.rest}</span>
              </span>
            </button>
          </div>
        </article>
      );
    })}
  </div>
);
