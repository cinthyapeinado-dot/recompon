import type { ReactNode } from "react";

type SectionIntroProps = {
  eyebrow: string;
  title: string;
  description: string;
  side?: ReactNode;
};

export const SectionIntro = ({
  eyebrow,
  title,
  description,
  side
}: SectionIntroProps) => (
  <div className="space-y-3">
    <div className="flex items-start justify-between gap-3">
      <span className="ios-chip text-ink-50">{eyebrow}</span>
      {side}
    </div>

    <div className="space-y-2">
      <h1 className="max-w-[14ch] text-[2.2rem] font-semibold tracking-[-0.05em] text-ink-200">
        {title}
      </h1>
      <p className="max-w-[22rem] text-[0.95rem] leading-7 text-ink-50">{description}</p>
    </div>
  </div>
);
