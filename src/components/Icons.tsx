import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const defaultProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round"
} satisfies Partial<IconProps>;

export const HomeIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...defaultProps} {...props}>
    <path d="M3 10.8 12 4l9 6.8" />
    <path d="M5.8 9.7V20h12.4V9.7" />
    <path d="M9.6 20v-5.8h4.8V20" />
  </svg>
);

export const CalendarIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...defaultProps} {...props}>
    <path d="M7 3v4M17 3v4M4 9h16" />
    <rect x="4" y="5" width="16" height="15" rx="3" />
  </svg>
);

export const DumbbellIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...defaultProps} {...props}>
    <path d="M3 10v4M6 8v8M10 9.5h4M18 8v8M21 10v4" />
    <path d="M8 8h2v8H8zM14 8h2v8h-2z" />
  </svg>
);

export const ChartIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...defaultProps} {...props}>
    <path d="M5 19V9M12 19V5M19 19v-7" />
    <path d="M3 19h18" />
  </svg>
);

export const SettingsIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...defaultProps} {...props}>
    <path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" />
    <path d="m19.4 15-.9 2.1-2.3.4-1.3 1.9.4 2.4-2.3 1-1.8-1.5h-2.4L7.1 23l-2.3-1 .4-2.4-1.3-1.9-2.3-.4L.6 15l1.6-1.8v-2.4L.6 9l.9-2.1 2.3-.4 1.3-1.9-.4-2.4 2.3-1 1.8 1.5h2.4L13.9 1l2.3 1-.4 2.4 1.3 1.9 2.3.4.9 2.1-1.6 1.8v2.4L19.4 15Z" />
  </svg>
);

export const SparkIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...defaultProps} {...props}>
    <path d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z" />
    <path d="m19 14 .8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14ZM5 14l.6 1.6L7 16l-1.4.4L5 18l-.6-1.6L3 16l1.4-.4L5 14Z" />
  </svg>
);

export const CheckIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...defaultProps} {...props}>
    <path d="m5 12.5 4.2 4.2L19 7.4" />
  </svg>
);

export const ArrowRightIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...defaultProps} {...props}>
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </svg>
);

export const ArrowLeftIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...defaultProps} {...props}>
    <path d="M19 12H5" />
    <path d="m11 6-6 6 6 6" />
  </svg>
);

export const ResetIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...defaultProps} {...props}>
    <path d="M3 12a9 9 0 1 0 3-6.7" />
    <path d="M3 4v5h5" />
  </svg>
);

export const TimerIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...defaultProps} {...props}>
    <path d="M9 2h6M12 8v5l3 2" />
    <path d="M5.5 6.5 4 5M18.5 6.5 20 5" />
    <circle cx="12" cy="14" r="8" />
  </svg>
);

export const BellIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...defaultProps} {...props}>
    <path d="M6 17h12l-1.3-1.6a3.2 3.2 0 0 1-.7-2V10a4 4 0 0 0-8 0v3.4a3.2 3.2 0 0 1-.7 2L6 17Z" />
    <path d="M10 19a2 2 0 0 0 4 0" />
  </svg>
);

export const TrendIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...defaultProps} {...props}>
    <path d="m4 16 5-5 4 4 7-7" />
    <path d="M15 8h5v5" />
  </svg>
);

export const WeightIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...defaultProps} {...props}>
    <path d="M9 7a3 3 0 1 1 6 0" />
    <path d="M7 9h10l3 10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2L7 9Z" />
    <path d="M12 13v3" />
  </svg>
);

export const HistoryIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...defaultProps} {...props}>
    <path d="M3 12a9 9 0 1 0 3-6.7" />
    <path d="M3 4v5h5" />
    <path d="M12 8v4l2.5 1.5" />
  </svg>
);
