"use client";

import { forwardRef } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type CheckboxProps = Omit<React.ComponentProps<"input">, "type"> & {
  label?: string;
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox({ className, label, id, ...props }, ref) {
    const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <label
        className={cn(
          "group inline-flex items-start gap-3 cursor-pointer",
          props.disabled && "cursor-not-allowed opacity-50",
          className,
        )}
        htmlFor={inputId}
      >
        <span className="relative mt-0.5 flex shrink-0">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            className="peer size-5 appearance-none rounded-md border border-corsa-border bg-white transition-colors"
            {...props}
          />
          <span
            className={cn(
              "pointer-events-none absolute inset-0 flex items-center justify-center rounded-md",
              "bg-corsa-wine text-white opacity-0 transition-opacity",
              "peer-checked:opacity-100",
              "peer-focus-visible:ring-2 peer-focus-visible:ring-corsa-wine peer-focus-visible:ring-offset-2",
            )}
          >
            <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
          </span>
        </span>
        {label && (
          <span className="text-sm leading-snug text-corsa-ink">{label}</span>
        )}
      </label>
    );
  },
);
