import { formatTimer } from "../utils/training";
import { TimerIcon } from "./Icons";

type RestTimerCardProps = {
  isRunning: boolean;
  notificationsEnabled: boolean;
  onReset: () => void;
  onSelectPreset: (seconds: number) => void;
  onToggle: () => void;
  presets: number[];
  secondsLeft: number;
  selectedPreset: number;
};

export const RestTimerCard = ({
  isRunning,
  notificationsEnabled,
  onReset,
  onSelectPreset,
  onToggle,
  presets,
  secondsLeft,
  selectedPreset
}: RestTimerCardProps) => (
  <div className="rounded-[28px] border border-white/70 bg-white/72 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.86)]">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-50">
          Cronómetro de descanso
        </p>
        <h3 className="mt-2 text-[2rem] font-semibold tracking-[-0.05em] text-ink-200">
          {formatTimer(secondsLeft)}
        </h3>
        <p className="mt-2 text-sm leading-6 text-ink-50">
          {notificationsEnabled
            ? "Te avisamos cuando el descanso termine."
            : "Puedes activarlo con una notificación local al finalizar."}
        </p>
      </div>

      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blush-100 text-blush-500">
        <TimerIcon className="h-5 w-5" />
      </span>
    </div>

    <div className="mt-4 flex flex-wrap gap-2">
      {presets.map((preset) => (
        <button
          key={preset}
          type="button"
          onClick={() => onSelectPreset(preset)}
          className={`rounded-full px-3 py-2 text-sm font-semibold transition ${
            preset === selectedPreset ? "bg-ink-200 text-white" : "bg-sand-50 text-ink-50"
          }`}
        >
          {preset} s
        </button>
      ))}
    </div>

    <div className="mt-4 grid grid-cols-2 gap-3">
      <button type="button" onClick={onToggle} className="primary-button">
        {isRunning ? "Pausar" : "Iniciar"}
      </button>
      <button type="button" onClick={onReset} className="secondary-button">
        Reiniciar
      </button>
    </div>
  </div>
);
