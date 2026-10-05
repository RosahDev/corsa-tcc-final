"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

export type MultiSelectOption = {
  value: string;
  label: string;
};

type MultiSelectProps = {
  id?: string;
  label?: string;
  placeholder?: string;
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  className?: string;
  maxVisibleChips?: number;
};

export function MultiSelect({
  id,
  label,
  placeholder = "Selecionar...",
  options,
  value,
  onChange,
  className,
  maxVisibleChips = 2,
}: MultiSelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedOptions = useMemo(
    () => options.filter((option) => value.includes(option.value)),
    [options, value],
  );

  const filteredOptions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return options;
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(query) ||
        option.value.toLowerCase().includes(query),
    );
  }, [options, searchQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      return;
    }

    const frame = requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [open]);

  function toggleOption(optionValue: string) {
    if (value.includes(optionValue)) {
      onChange(value.filter((item) => item !== optionValue));
      return;
    }
    onChange([...value, optionValue]);
  }

  function removeValue(optionValue: string) {
    onChange(value.filter((item) => item !== optionValue));
  }

  const hiddenCount = Math.max(0, selectedOptions.length - maxVisibleChips);
  const visibleChips = selectedOptions.slice(0, maxVisibleChips);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {label && (
        <label
          htmlFor={selectId}
          className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-corsa-wine"
        >
          {label}
        </label>
      )}
      <button
        id={selectId}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "flex min-h-11 w-full items-center justify-between gap-2 rounded-xl border border-corsa-border bg-white px-3.5 py-2 text-left text-sm",
          "transition-[border-color,box-shadow,transform] duration-200 ease-out",
          "hover:border-corsa-wine/25",
          open && "border-corsa-wine/40 ring-2 ring-corsa-wine/10",
        )}
      >
        <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
          {selectedOptions.length === 0 ? (
            <span className="text-corsa-muted">{placeholder}</span>
          ) : (
            <>
              {visibleChips.map((option) => (
                <span
                  key={option.value}
                  className="inline-flex max-w-[9rem] items-center gap-1 rounded-full bg-corsa-rose/80 px-2 py-0.5 text-xs font-medium text-corsa-wine"
                >
                  <span className="truncate">{option.label}</span>
                  <span
                    role="button"
                    tabIndex={0}
                    className="rounded-full p-0.5 hover:bg-corsa-wine/10"
                    onClick={(event) => {
                      event.stopPropagation();
                      removeValue(option.value);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        event.stopPropagation();
                        removeValue(option.value);
                      }
                    }}
                    aria-label={`Remover ${option.label}`}
                  >
                    <X className="size-3" />
                  </span>
                </span>
              ))}
              {hiddenCount > 0 && (
                <span className="rounded-full bg-corsa-sand px-2 py-0.5 text-xs font-medium text-corsa-wine">
                  +{hiddenCount}
                </span>
              )}
            </>
          )}
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-corsa-muted transition-transform duration-200 ease-out",
            open && "rotate-180 text-corsa-wine",
          )}
          aria-hidden="true"
        />
      </button>

      <div
        className={cn(
          "absolute z-50 mt-1.5 w-full origin-top overflow-hidden rounded-xl border border-corsa-border bg-white shadow-[var(--shadow-elevated)]",
          "transition-[opacity,transform] duration-200 ease-out",
          open
            ? "pointer-events-auto scale-100 opacity-100"
            : "pointer-events-none scale-95 opacity-0",
        )}
      >
        <div className="border-b border-corsa-border p-2">
          <Input
            ref={searchInputRef}
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Buscar..."
            className="h-9 rounded-xl text-sm"
            aria-label={`Buscar ${label ?? "opções"}`}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setOpen(false);
              }
            }}
          />
        </div>
        <ul
          role="listbox"
          aria-multiselectable="true"
          className="max-h-52 overflow-y-auto py-1"
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => {
              const selected = value.includes(option.value);
              return (
                <li key={option.value} role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => toggleOption(option.value)}
                    className={cn(
                      "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors duration-150 ease-out",
                      "hover:bg-corsa-rose/40 focus:bg-corsa-rose/40 focus:outline-none",
                      selected && "bg-corsa-rose/25 font-medium text-corsa-wine",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-4 items-center justify-center rounded border transition-colors duration-150 ease-out",
                        selected
                          ? "border-corsa-wine bg-corsa-wine text-white"
                          : "border-corsa-border bg-white",
                      )}
                    >
                      {selected && <Check className="size-3" />}
                    </span>
                    <span className="truncate">{option.label}</span>
                  </button>
                </li>
              );
            })
          ) : (
            <li
              className="px-3 py-2 text-sm text-corsa-muted"
              role="presentation"
            >
              Nenhuma opção encontrada
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
