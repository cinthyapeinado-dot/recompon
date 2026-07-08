import type { TrainingMode } from "../types";
import { TrainingModeOptionCard } from "./TrainingModeOptionCard";

type TrainingModeSheetProps = {
  currentMode: TrainingMode;
  onClose: () => void;
  onSaveAsPreference: () => void;
  onSelectMode: (mode: TrainingMode) => void;
  onUseForToday: () => void;
  open: boolean;
  preferenceMode: TrainingMode | null;
  selectedMode: TrainingMode;
  sessionLocked: boolean;
  todayMode: TrainingMode | null;
};

const modes: TrainingMode[] = ["traditional", "alternated", "circuit"];

export const TrainingModeSheet = ({
  currentMode,
  onClose,
  onSaveAsPreference,
  onSelectMode,
  onUseForToday,
  open,
  preferenceMode,
  selectedMode,
  sessionLocked,
  todayMode
}: TrainingModeSheetProps) => {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/48 px-4 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-6 backdrop-blur-md">
      <button
        type="button"
        aria-label="Cerrar selector de modo"
        className="absolute inset-0"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Cambiar estilo de entrenamiento"
        className="sheet-surface animate-[sheet-up_260ms_cubic-bezier(0.22,1,0.36,1)_both] w-full max-w-[430px] p-5"
      >
        <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-white/10" />
        <p className="eyebrow">Estilo de entrenamiento</p>
        <div className="mt-3 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold tracking-[-0.04em] text-fog-100">
              Elige el ritmo de hoy
            </h2>
            <p className="mt-2 text-sm leading-6 text-fog-300">
              Cambia solo esta sesión o guarda tu nuevo predeterminado.
            </p>
          </div>
          <span className="badge-soft">Activo ahora</span>
        </div>

        <div className="mt-5 space-y-3">
          {modes.map((mode) => {
            const statusLabel =
              todayMode === mode ? "Hoy" : preferenceMode === mode ? "Base" : null;

            return (
              <TrainingModeOptionCard
                key={mode}
                compact
                mode={mode}
                onClick={() => onSelectMode(mode)}
                selected={selectedMode === mode}
                statusLabel={statusLabel}
              />
            );
          })}
        </div>

        <div className="mt-5 rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-3">
          <p className="text-sm leading-6 text-fog-300">
            {sessionLocked
              ? "La sesión de hoy ya está en curso. Solo puedes guardar el nuevo modo para la próxima."
              : currentMode === selectedMode
                ? "Este ya es el flujo activo para hoy."
                : "Puedes cambiar este modo en tu próxima sesión."}
          </p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onUseForToday}
            disabled={sessionLocked}
            className="secondary-button"
          >
            Usar solo hoy
          </button>
          <button type="button" onClick={onSaveAsPreference} className="primary-button">
            Guardar predeterminado
          </button>
        </div>
      </div>
    </div>
  );
};
