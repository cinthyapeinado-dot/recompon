import { cn } from "../utils/cn";

type ProgressBarProps = {
  value: number;
  max: number;
  className?: string;
};

export const ProgressBar = ({ value, max, className }: ProgressBarProps) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const width = percentage === 0 ? "0%" : `${Math.max(percentage, 8)}%`;

  return (
    <div className={cn("progress-track", className)}>
      <div
        className="progress-fill"
        style={{ width }}
      >
        <span className="progress-sheen" />
      </div>
    </div>
  );
};
