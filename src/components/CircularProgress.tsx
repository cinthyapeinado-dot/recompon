type CircularProgressProps = {
  value: number;
  max: number;
  label: string;
  detail: string;
  size?: number;
};

export const CircularProgress = ({
  value,
  max,
  label,
  detail,
  size = 92
}: CircularProgressProps) => {
  const percentage = Math.round(Math.min(100, Math.max(0, (value / Math.max(max, 1)) * 100)));
  const angle = `${percentage * 3.6}deg`;

  return (
    <div
      className="relative shrink-0 rounded-full p-[7px] shadow-[0_24px_48px_rgba(42,29,23,0.08)]"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(#b9788f 0deg ${angle}, rgba(255,255,255,0.62) ${angle} 360deg)`
      }}
    >
      <div className="absolute inset-[7px] rounded-full bg-white/88 shadow-[inset_0_1px_0_rgba(255,255,255,0.96)] backdrop-blur-xl" />
      <div className="relative flex h-full w-full flex-col items-center justify-center text-center">
        <span className="text-[1.2rem] font-semibold tracking-[-0.05em] text-ink-200">
          {percentage}%
        </span>
        <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-50">
          {label}
        </span>
        <span className="mt-1 text-[10px] text-ink-50">{detail}</span>
      </div>
    </div>
  );
};
