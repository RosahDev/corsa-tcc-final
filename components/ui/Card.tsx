import { cn } from "@/lib/utils";

const variants = {
  default: "bg-white shadow-[var(--shadow-card)]",
  sand: "bg-corsa-sand shadow-[var(--shadow-card)]",
  rose: "bg-corsa-rose",
  elevated: "bg-white shadow-[var(--shadow-elevated)]",
} as const;

export type CardVariant = keyof typeof variants;

export type CardProps = React.ComponentProps<"div"> & {
  variant?: CardVariant;
};

export function Card({ className, variant = "default", ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-corsa-border",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col gap-1.5 p-5 pb-0", className)}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  ...props
}: React.ComponentProps<"h3">) {
  return (
    <h3
      className={cn(
        "font-heading text-lg font-semibold leading-tight text-corsa-ink",
        className,
      )}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p className={cn("text-sm text-corsa-muted", className)} {...props} />
  );
}

export function CardContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={cn("p-5", className)} {...props} />;
}

export function CardFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex items-center gap-3 p-5 pt-0", className)}
      {...props}
    />
  );
}
