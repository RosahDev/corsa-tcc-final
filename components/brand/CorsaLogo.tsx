import {
  CORSA_LOGO_SOURCES,
  corsaLogoDimensions,
  type CorsaLogoVariant,
} from "@/lib/brand/logo";
import { cn } from "@/lib/utils";

type CorsaLogoProps = {
  variant?: CorsaLogoVariant;
  height?: number;
  className?: string;
  priority?: boolean;
};

export function CorsaLogo({
  variant = "primary",
  height = 28,
  className,
  priority = false,
}: CorsaLogoProps) {
  const { width } = corsaLogoDimensions(height);

  return (
    <img
      src={CORSA_LOGO_SOURCES[variant]}
      alt="Corsa"
      width={width}
      height={height}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
      draggable={false}
      className={cn("h-auto w-auto shrink-0", className)}
      style={{ height }}
    />
  );
}
