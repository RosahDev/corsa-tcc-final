import { cn } from "@/lib/utils";

const variants = {
  wine: "bg-corsa-wine text-white",
  vinho: "bg-corsa-wine text-white",
  sand: "bg-corsa-sand text-corsa-wine",
  areia: "bg-corsa-sand text-corsa-wine",
  rose: "bg-corsa-rose text-corsa-wine",
  outline: "border border-corsa-border bg-white text-corsa-ink",
  muted: "bg-corsa-cream text-corsa-muted",
  default: "bg-corsa-rose text-corsa-wine",
  success: "bg-corsa-success-light text-corsa-success",
} as const;

export type BadgeVariant = keyof typeof variants;

export type BadgeProps = React.ComponentProps<"span"> & {
  variant?: BadgeVariant;
};

export function Badge({
  className,
  variant = "wine",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
