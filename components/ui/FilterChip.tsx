"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type FilterChipProps = {
  label: string;
  onRemove: () => void;
  className?: string;
};

export function FilterChip({ label, onRemove, className }: FilterChipProps) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1 rounded-full border border-corsa-wine/15 bg-corsa-rose/70 px-2.5 py-1 text-xs font-medium text-corsa-wine",
        "animate-[fade-in_0.2s_ease-out]",
        className,
      )}
    >
      <span className="truncate">{label}</span>
      <button
        type="button"
        onClick={onRemove}
        className="rounded-full p-0.5 text-corsa-wine/70 transition-colors hover:bg-corsa-wine/10 hover:text-corsa-wine"
        aria-label={`Remover filtro ${label}`}
      >
        <X className="size-3" />
      </button>
    </span>
  );
}
