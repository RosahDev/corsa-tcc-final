"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type SegmentedControlOption<T extends string> = {
  value: T;
  label: string;
  icon?: React.ReactNode;
};

export type SegmentedControlVariant = "surface" | "wine";

type SegmentedControlProps<T extends string> = {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  variant?: SegmentedControlVariant;
  fullWidth?: boolean;
  "aria-label"?: string;
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
  variant = "surface",
  fullWidth = false,
  "aria-label": ariaLabel,
}: SegmentedControlProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef(new Map<string, HTMLButtonElement>());
  const [pill, setPill] = useState({ width: 0, x: 0, visible: false });

  const updatePill = useCallback(() => {
    const container = containerRef.current;
    const activeButton = buttonRefs.current.get(value);
    if (!container || !activeButton) {
      setPill((current) => ({ ...current, visible: false }));
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const buttonRect = activeButton.getBoundingClientRect();

    setPill({
      width: buttonRect.width,
      x: buttonRect.left - containerRect.left + container.scrollLeft,
      visible: true,
    });
  }, [value]);

  useLayoutEffect(() => {
    updatePill();
  }, [updatePill]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(updatePill);
    observer.observe(container);
    window.addEventListener("resize", updatePill);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updatePill);
    };
  }, [updatePill]);

  const isWine = variant === "wine";

  return (
    <div
      ref={containerRef}
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "relative flex overflow-x-auto rounded-2xl border border-corsa-border bg-corsa-cream p-1",
        "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "auth-role-pill pointer-events-none absolute top-1 bottom-1 left-0 rounded-xl",
          pill.visible ? "opacity-100" : "opacity-0",
          isWine
            ? "bg-corsa-wine shadow-sm"
            : "bg-white shadow-[var(--shadow-card)]",
        )}
        style={{
          width: pill.width,
          transform: `translateX(${pill.x}px)`,
        }}
      />
      {options.map((option) => {
        const isActive = option.value === value;

        return (
          <button
            key={option.value}
            ref={(node) => {
              if (node) {
                buttonRefs.current.set(option.value, node);
              } else {
                buttonRefs.current.delete(option.value);
              }
            }}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative z-10 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors duration-500 ease-out",
              fullWidth ? "min-w-0 flex-1" : "shrink-0",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-corsa-wine",
              isWine
                ? isActive
                  ? "text-white"
                  : "text-corsa-muted hover:text-corsa-ink"
                : isActive
                  ? "text-corsa-wine"
                  : "text-corsa-muted hover:text-corsa-ink",
            )}
          >
            {option.icon}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
