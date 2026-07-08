import { Card } from "../components/Card";
import { SectionIntro } from "../components/SectionIntro";
import { TrainingModeOptionCard } from "../components/TrainingModeOptionCard";
import type { TrainingMode } from "../types";

type TrainingModeOnboardingScreenProps = {
  onContinue: () => void;
  onSelectMode: (mode: TrainingMode) => void;
  selectedMode: TrainingMode;
};

const modes: TrainingMode[] = ["traditional", "alternated", "circuit"];

export const TrainingModeOnboardingScreen = ({
  onContinue,
  onSelectMode,
  selectedMode
}: TrainingModeOnboardingScreenProps) => (
  <div className="flex min-h-[calc(100vh-6.5rem)] flex-col justify-between gap-6 pb-6 pt-4">
    <div className="space-y-6">
      <SectionIntro
        eyebrow="Tu ritmo"
        title="¿Cómo entrenas normalmente?"
        description="Elige tu flujo base. Luego podrás ajustarlo desde Inicio."
        side={<span className="badge-soft">Primera vez</span>}
      />

      <div className="space-y-4">
        {modes.map((mode) => (
          <TrainingModeOptionCard
            key={mode}
            mode={mode}
            onClick={() => onSelectMode(mode)}
            selected={selectedMode === mode}
          />
        ))}
      </div>
    </div>

    <Card className="space-y-4">
      <p className="text-sm leading-6 text-fog-300">
        Puedes cambiarlo después desde Inicio.
      </p>
      <button type="button" onClick={onContinue} className="primary-button w-full">
        Continuar
      </button>
    </Card>
  </div>
);
