import { trainingModeById } from "../data/trainingModes";
import type { TrainingMode } from "../types";
import { cn } from "../utils/cn";
import { CheckIcon, DumbbellIcon, LoopIcon, ZapIcon } from "./Icons";

type TrainingModeOptionCardProps = {
  compact?: boolean;
  mode: TrainingMode;
  onClick: () => void;
  selected: boolean;
  statusLabel?: string | null;
};

const iconMap = {
  alternated: LoopIcon,
  circuit: ZapIcon,
  traditional: DumbbellIcon
} as const;

export const TrainingModeOptionCard = ({
  compact = false,
  mode,
  onClick,
  selected,
  statusLabel
}: TrainingModeOptionCardProps) => {
  const definition = trainingModeById[mode];
  const Icon = iconMap[definition.icon];

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "training-mode-card w-full text-left",
        compact && "training-mode-card-compact",
        selected && "training-mode-card-active"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="training-mode-icon">
            <Icon className="h-5 w-5" />
          </span>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[1.02rem] font-semibold tracking-[-0.03em] text-fog-100">
                {definition.title}
              </h3>
              {definition.isRecommended && !compact && (
                <span className="badge-soft">Recomendado</span>
              )}
              {statusLabel && <span className="badge-soft">{statusLabel}</span>}
            </div>

            <p className="mt-2 text-sm leading-6 text-fog-300">
              {compact ? definition.compactDescription : definition.description}
            </p>
          </div>
        </div>

        {selected && (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-500/12 text-accent-300">
            <CheckIcon className="h-4 w-4" />
          </span>
        )}
      </div>

      <div className="training-mode-flow mt-4">
        {definition.diagram.map((step) => (
          <span
            key={`${mode}-${step.label}`}
            className={cn(
              "training-mode-flow-node",
              step.tone === "rest" && "training-mode-flow-node-rest",
              step.tone === "round" && "training-mode-flow-node-round"
            )}
          >
            {step.label}
          </span>
        ))}
      </div>
    </button>
  );
};
