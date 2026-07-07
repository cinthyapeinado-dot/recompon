import { formatHistoryDate } from "../utils/date";
import { Sparkline } from "./Sparkline";

type ExerciseHistoryCardProps = {
  date: string | null;
  displayWeight: string | null;
  rpe: number | null;
  sparklinePoints: number[];
};

export const ExerciseHistoryCard = ({
  date,
  displayWeight,
  rpe,
  sparklinePoints
}: ExerciseHistoryCardProps) => {
  const normalizedWeight = displayWeight || "Sin registro";

  return (
    <section className="card-subtle space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Última sesión</p>
          <h3 className="mt-2 text-[1rem] font-semibold text-fog-100">{normalizedWeight}</h3>
        </div>
        <div className="text-right">
          <p className="eyebrow">RPE</p>
          <p className="mt-2 text-[1rem] font-semibold text-fog-100">
            {rpe != null ? rpe : "—"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_auto] items-end gap-3">
        <div>
          <p className="text-sm text-fog-300">
            {date ? `Fecha: ${formatHistoryDate(date)}` : "Todavía no hay historial suficiente."}
          </p>
        </div>
        <span className="badge-soft">Evolución</span>
      </div>

      <Sparkline points={sparklinePoints} />
    </section>
  );
};
