import { cn } from "@/lib/utils";

export type FieldProps = React.ComponentProps<"div"> & {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  htmlFor?: string;
};

export function Field({
  className,
  label,
  hint,
  error,
  required,
  htmlFor,
  children,
  ...props
}: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)} {...props}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="text-xs font-medium uppercase tracking-wide text-corsa-wine"
        >
          {label}
          {required && (
            <span className="ml-0.5 text-corsa-wine-muted" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      {children}
      {error && (
        <p className="text-sm text-corsa-wine" role="alert">{error}</p>
      )}
      {hint && !error && (
        <p className="text-sm text-corsa-muted">{hint}</p>
      )}
    </div>
  );
}
