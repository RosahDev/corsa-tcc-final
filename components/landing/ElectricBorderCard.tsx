import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type ElectricBorderCardProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Borda com glow rotativo (conic-gradient), inspirado em:
 * https://codehim.com/animation-effects/css-glowing-border-animation/
 */
export function ElectricBorderCard({
  children,
  className,
}: ElectricBorderCardProps) {
  return (
    <div className={cn("glow-border-card relative rounded-3xl", className)}>
      <div className="glow-border-content">{children}</div>
      <div className="glow-border-glow" aria-hidden="true" />
      <div className="glow-border-ring" aria-hidden="true" />
    </div>
  );
}
