type SparklineProps = {
  points: number[];
};

export const Sparkline = ({ points }: SparklineProps) => {
  if (points.length === 0) {
    return (
      <div className="flex h-12 items-center justify-center rounded-[18px] border border-dashed border-white/10 bg-white/[0.02] text-[11px] text-fog-400">
        Sin datos
      </div>
    );
  }

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const path = points
    .map((point, index) => {
      const x = (index / Math.max(points.length - 1, 1)) * 100;
      const y = 100 - ((point - min) / range) * 100;
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="h-12 w-full overflow-visible"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="sparklineGradient" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#53d5ff" />
          <stop offset="100%" stopColor="#35e5b6" />
        </linearGradient>
      </defs>
      <path
        d={path}
        fill="none"
        stroke="url(#sparklineGradient)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
