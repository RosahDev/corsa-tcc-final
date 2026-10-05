"use client";

import { forwardRef, useState } from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.ComponentProps<"input"> & {
  invalid?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ className, invalid, onFocus, onBlur, ...props }, ref) {
    const [focused, setFocused] = useState(false);

    return (
      <div
        className={cn(
          "transition-[transform,box-shadow] duration-200 ease-out",
          focused && "scale-[1.01]",
        )}
      >
        <input
          ref={ref}
          className={cn(
            "h-11 w-full rounded-xl border border-corsa-border bg-white px-3.5 text-sm text-corsa-ink",
            "placeholder:text-corsa-muted",
            "transition-[border-color,background-color,box-shadow] duration-200 ease-out",
            "hover:border-corsa-wine/25",
            "focus:border-corsa-wine/40 focus:outline-none focus:ring-2 focus:ring-corsa-wine/10",
            "disabled:pointer-events-none disabled:opacity-50",
            invalid && "border-corsa-wine/50 bg-corsa-rose",
            className,
          )}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          {...props}
        />
      </div>
    );
  },
);
