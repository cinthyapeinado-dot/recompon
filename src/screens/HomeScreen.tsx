type HomeScreenProps = {
  athleteName: string;
  currentWeek: number;
  estimatedDurationMinutes: number;
  expectedEnergy: string;
  focus: string;
  onOpenToday: () => void;
  todayLabel: string;
  todayTitle: string;
};

export const HomeScreen = ({
  athleteName,
  currentWeek,
  estimatedDurationMinutes,
  expectedEnergy,
  focus,
  onOpenToday,
  todayLabel,
  todayTitle
}: HomeScreenProps) => (
  <div className="flex min-h-[calc(100vh-10.5rem)] flex-col justify-between gap-8 pb-6">
    <div className="space-y-6 pt-4">
      <div className="flex items-center justify-between gap-3">
        <span className="top-pill">Semana {currentWeek}</span>
        <span className="badge-soft">Modo coach</span>
      </div>

      <div className="space-y-3">
        <p className="text-[0.98rem] font-medium text-fog-300">Buenos días, {athleteName}.</p>
        <h1 className="max-w-[10ch] text-[3rem] font-semibold tracking-[-0.07em] text-fog-100">
          Hoy toca:
        </h1>
        <p className="text-[2.45rem] font-semibold tracking-[-0.07em] text-fog-100">
          {todayTitle}.
        </p>
      </div>
    </div>

    <section className="glass-card px-5 py-6">
      <div className="space-y-4">
        <div>
          <p className="eyebrow">{todayLabel}</p>
          <p className="mt-3 text-[1rem] leading-7 text-fog-300">{focus}</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="metric-tile px-3 py-4">
            <p className="eyebrow">Duración</p>
            <p className="mt-2 text-[1.25rem] font-semibold text-fog-100">
              {estimatedDurationMinutes} min
            </p>
          </div>
          <div className="metric-tile px-3 py-4">
            <p className="eyebrow">Tiempo</p>
            <p className="mt-2 text-[1.25rem] font-semibold text-fog-100">
              {estimatedDurationMinutes <= 35
                ? "Corto"
                : estimatedDurationMinutes <= 55
                  ? "Medio"
                  : "Completo"}
            </p>
          </div>
          <div className="metric-tile metric-tile-tint px-3 py-4">
            <p className="eyebrow">Energía</p>
            <p className="mt-2 text-[1.25rem] font-semibold text-fog-100">{expectedEnergy}</p>
          </div>
        </div>
      </div>

      <button type="button" onClick={onOpenToday} className="primary-button mt-6 w-full py-4">
        COMENZAR ENTRENAMIENTO
      </button>
    </section>
  </div>
);
