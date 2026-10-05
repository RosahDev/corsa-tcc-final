import { cn } from "@/lib/utils";

type CharCounterProps = {
  current: number;
  max: number;
  className?: string;
};

export function CharCounter({ current, max, className }: CharCounterProps) {
  const ratio = current / max;
  const nearLimit = ratio >= 0.8;
  const atLimit = current >= max;

  return (
    <p
      className={cn(
        "text-xs tabular-nums",
        atLimit
          ? "text-corsa-wine"
          : nearLimit
            ? "text-corsa-wine-muted"
            : "text-corsa-muted",
        className,
      )}
      aria-live="polite"
    >
      {current}/{max}
    </p>
  );
}
