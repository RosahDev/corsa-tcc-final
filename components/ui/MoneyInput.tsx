"use client";

import {
  useState,
  type KeyboardEvent,
  type ClipboardEvent,
  type FocusEvent,
} from "react";
import { cn } from "@/lib/utils";
import {
  appendMoneyDigit,
  backspaceMoneyDigit,
  digitsToCents,
  formatCentsAsMoney,
  MAX_MONEY_CENTS,
} from "@/lib/money";

export type MoneyInputProps = {
  name: string;
  id?: string;
  defaultValueCents?: number;
  minCents?: number;
  maxCents?: number;
  required?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  className?: string;
  "aria-label"?: string;
  onValueChange?: (cents: number) => void;
};

export function MoneyInput({
  name,
  id,
  defaultValueCents = 0,
  minCents = 0,
  maxCents = MAX_MONEY_CENTS,
  required,
  disabled,
  invalid,
  className,
  "aria-label": ariaLabel,
  onValueChange,
}: MoneyInputProps) {
  const [focused, setFocused] = useState(false);
  const [cents, setCents] = useState(() =>
    Math.min(Math.max(defaultValueCents, minCents), maxCents),
  );

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (event.key === "Enter") {
      event.preventDefault();
      return;
    }

    if (event.key >= "0" && event.key <= "9") {
      event.preventDefault();
      setCents((current) => {
        const next = appendMoneyDigit(current, Number(event.key), maxCents);
        const clamped = Math.min(Math.max(next, minCents), maxCents);
        onValueChange?.(clamped);
        return clamped;
      });
      return;
    }

    if (event.key === "Backspace") {
      event.preventDefault();
      setCents((current) => {
        const next = backspaceMoneyDigit(current);
        const clamped = Math.min(Math.max(next, minCents), maxCents);
        onValueChange?.(clamped);
        return clamped;
      });
      return;
    }

    if (event.key === "Delete") {
      event.preventDefault();
      setCents(minCents);
      onValueChange?.(minCents);
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    event.preventDefault();
    const next = digitsToCents(event.clipboardData.getData("text"), {
      minCents,
      maxCents,
    });
    setCents(next);
    onValueChange?.(next);
  };

  return (
    <>
      <input type="hidden" name={name} value={cents} required={required} />
      <div
        className={cn(
          "relative transition-[transform,box-shadow] duration-200 ease-out",
          focused && "scale-[1.01]",
          className,
        )}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-corsa-muted"
        >
          R$
        </span>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          aria-label={ariaLabel}
          value={formatCentsAsMoney(cents)}
          readOnly
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onFocus={(event: FocusEvent<HTMLInputElement>) => {
            setFocused(true);
            event.currentTarget.select();
          }}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          className={cn(
            "h-11 w-full rounded-xl border border-corsa-border bg-white py-0 pl-11 pr-3.5 text-right text-sm tabular-nums text-corsa-ink",
            "transition-[border-color,background-color,box-shadow] duration-200 ease-out",
            "hover:border-corsa-wine/25",
            "focus:border-corsa-wine/40 focus:outline-none focus:ring-2 focus:ring-corsa-wine/10",
            "disabled:pointer-events-none disabled:opacity-50",
            invalid && "border-corsa-wine/50 bg-corsa-rose",
          )}
        />
      </div>
    </>
  );
}
