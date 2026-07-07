import { cn } from "../utils/cn";

type StatTileProps = {
  label: string;
  value: string;
  detail: string;
  tone?: "light" | "tint" | "dark";
  className?: string;
};

export const StatTile = ({
  label,
  value,
  detail,
  tone = "light",
  className
}: StatTileProps) => {
  const isDark = tone === "dark";

  return (
    <div
      className={cn(
        "metric-tile px-4 py-4",
        tone === "tint" && "metric-tile-tint",
        tone === "dark" && "metric-tile-dark",
        className
      )}
    >
      <p className={cn("eyebrow", isDark && "text-white/60")}>{label}</p>
      <p className={cn("mt-2 text-[1.35rem] font-semibold tracking-[-0.04em]", isDark ? "text-white" : "text-fog-100")}>
        {value}
      </p>
      <p className={cn("mt-2 text-sm leading-6", isDark ? "text-white/72" : "text-fog-300")}>
        {detail}
      </p>
    </div>
  );
};
