"use client";

import {
  Children,
  forwardRef,
  isValidElement,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

export type AnimatedSelectProps = Omit<
  React.ComponentProps<"select">,
  "onChange"
> & {
  invalid?: boolean;
  searchable?: boolean;
  onChange?: React.ChangeEventHandler<HTMLSelectElement>;
};

function parseOptions(children: React.ReactNode) {
  const options: { value: string; label: string }[] = [];

  Children.forEach(children, (child) => {
    if (!isValidElement<{ value?: string; children?: React.ReactNode }>(child)) {
      return;
    }

    if (child.type === "option") {
      options.push({
        value: String(child.props.value ?? ""),
        label: String(child.props.children ?? ""),
      });
    }
  });

  return options;
}

function createChangeEvent(
  value: string,
): React.ChangeEvent<HTMLSelectElement> {
  return {
    target: { value } as HTMLSelectElement,
    currentTarget: { value } as HTMLSelectElement,
  } as React.ChangeEvent<HTMLSelectElement>;
}

export const AnimatedSelect = forwardRef<HTMLButtonElement, AnimatedSelectProps>(
  function AnimatedSelect(
    {
      className,
      invalid,
      children,
      value,
      defaultValue,
      onChange,
      onFocus,
      onBlur,
      id,
      disabled,
      searchable = false,
      name,
      required,
      ...props
    },
    ref,
  ) {
    const generatedId = useId();
    const selectId = id ?? generatedId;
    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const [open, setOpen] = useState(false);
    const [focused, setFocused] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const options = useMemo(() => parseOptions(children), [children]);
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState(() =>
      String(defaultValue ?? ""),
    );

    const currentValue = isControlled ? String(value) : internalValue;

    const selectedOption = useMemo(
      () => options.find((option) => option.value === currentValue),
      [options, currentValue],
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

      if (searchable) {
        const frame = requestAnimationFrame(() => {
          searchInputRef.current?.focus();
        });
        return () => cancelAnimationFrame(frame);
      }
    }, [open, searchable]);

    function selectOption(nextValue: string) {
      if (!isControlled) {
        setInternalValue(nextValue);
      }
      onChange?.(createChangeEvent(nextValue));
      setOpen(false);
      setFocused(false);
    }

    function handleToggle() {
      if (disabled) return;
      setOpen((current) => !current);
    }

    return (
      <div
        ref={containerRef}
        className={cn(
          "relative transition-[transform,box-shadow] duration-200 ease-out",
          focused && "scale-[1.01]",
        )}
      >
        {name && (
          <input
            type="hidden"
            name={name}
            value={currentValue ?? ""}
            required={required}
          />
        )}

        <button
          ref={ref}
          id={selectId}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          disabled={disabled}
          onClick={handleToggle}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event as unknown as React.FocusEvent<HTMLSelectElement>);
          }}
          onBlur={(event) => {
            if (!containerRef.current?.contains(event.relatedTarget as Node)) {
              setFocused(false);
            }
            onBlur?.(event as unknown as React.FocusEvent<HTMLSelectElement>);
          }}
          className={cn(
            "flex h-11 w-full items-center justify-between gap-2 rounded-xl border bg-white px-3.5 pr-10 text-left text-sm text-corsa-ink",
            "transition-[border-color,background-color,box-shadow] duration-200 ease-out",
            "hover:border-corsa-wine/25",
            "focus:border-corsa-wine/40 focus:outline-none focus:ring-2 focus:ring-corsa-wine/10",
            "disabled:pointer-events-none disabled:opacity-50",
            invalid
              ? "border-corsa-wine/50 bg-corsa-rose"
              : "border-corsa-border",
            open && "border-corsa-wine/40 ring-2 ring-corsa-wine/10",
            className,
          )}
          {...(props as React.ComponentProps<"button">)}
        >
          <span
            className={cn(
              "min-w-0 truncate",
              !selectedOption?.label && "text-corsa-muted",
            )}
          >
            {selectedOption?.label || options[0]?.label || "Selecionar..."}
          </span>
        </button>

        <ChevronDown
          className={cn(
            "pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-corsa-muted transition-transform duration-200 ease-out",
            (focused || open) && "rotate-180 text-corsa-wine",
          )}
          aria-hidden="true"
        />

        <div
          className={cn(
            "absolute z-50 mt-1.5 w-full origin-top overflow-hidden rounded-xl border border-corsa-border bg-white shadow-[var(--shadow-elevated)]",
            "transition-[opacity,transform] duration-200 ease-out",
            open
              ? "pointer-events-auto scale-100 opacity-100"
              : "pointer-events-none scale-95 opacity-0",
          )}
        >
          {searchable && (
            <div className="border-b border-corsa-border p-2">
              <Input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Buscar..."
                className="h-9 rounded-xl text-sm"
                aria-label="Buscar opções"
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setOpen(false);
                  }
                }}
              />
            </div>
          )}
          <ul
            role="listbox"
            className="max-h-52 overflow-y-auto py-1"
            aria-labelledby={selectId}
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const selected = option.value === currentValue;
                return (
                  <li key={option.value || "__empty__"} role="presentation">
                    <button
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onClick={() => selectOption(option.value)}
                      className={cn(
                        "w-full px-3 py-2 text-left text-sm text-corsa-ink transition-colors duration-150 ease-out",
                        "hover:bg-corsa-rose/40 focus:bg-corsa-rose/40 focus:outline-none",
                        selected && "bg-corsa-rose/30 font-medium text-corsa-wine",
                      )}
                    >
                      {option.label}
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
  },
);
