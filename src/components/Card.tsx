import type { PropsWithChildren } from "react";
import { cn } from "../utils/cn";

type CardProps = PropsWithChildren<{
  className?: string;
  tone?: "glass" | "dark";
}>;

export const Card = ({ children, className, tone = "glass" }: CardProps) => (
  <section
    className={cn(
      tone === "dark" ? "glass-card-dark" : "glass-card",
      "p-5",
      className
    )}
  >
    {children}
  </section>
);
