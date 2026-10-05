"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  BRAZILIAN_STATES,
  getCitiesForState,
} from "@/lib/data/brazil-locations";
import { AnimatedSelect } from "@/components/ui/AnimatedSelect";
import { Input } from "@/components/ui/Input";
import { Field } from "@/components/ui/Field";
import { cn } from "@/lib/utils";

type StateCitySelectProps = {
  defaultState?: string;
  defaultCity?: string;
  stateName?: string;
  cityName?: string;
  required?: boolean;
};

export function StateCitySelect({
  defaultState = "",
  defaultCity = "",
  stateName = "state",
  cityName = "city",
  required = true,
}: StateCitySelectProps) {
  const listId = useId();
  const cityContainerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState(defaultState.toUpperCase());
  const [city, setCity] = useState(defaultCity);
  const [cityQuery, setCityQuery] = useState(defaultCity);
  const [cityOpen, setCityOpen] = useState(false);
  const [cityFocused, setCityFocused] = useState(false);

  const cities = useMemo(() => getCitiesForState(state), [state]);

  const filteredCities = useMemo(() => {
    const query = cityQuery.trim().toLowerCase();
    if (!query) return cities.slice(0, 80);
    return cities.filter((item) => item.toLowerCase().includes(query)).slice(0, 80);
  }, [cities, cityQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        cityContainerRef.current &&
        !cityContainerRef.current.contains(event.target as Node)
      ) {
        setCityOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function selectCity(selected: string) {
    setCity(selected);
    setCityQuery(selected);
    setCityOpen(false);
  }

  function normalizeCityOnBlur() {
    const match = cities.find(
      (item) => item.toLowerCase() === cityQuery.trim().toLowerCase(),
    );
    if (match) {
      setCity(match);
      setCityQuery(match);
    }
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Estado" htmlFor={`${listId}-state`}>
        <AnimatedSelect
          id={`${listId}-state`}
          name={stateName}
          value={state}
          searchable
          required={required}
          onChange={(event) => {
            setState(event.target.value);
            setCity("");
            setCityQuery("");
            setCityOpen(false);
          }}
        >
          <option value="">Selecione o estado</option>
          {BRAZILIAN_STATES.map((item) => (
            <option key={item.uf} value={item.uf}>
              {item.name} ({item.uf})
            </option>
          ))}
        </AnimatedSelect>
      </Field>

      <Field label="Cidade" htmlFor={`${listId}-city`}>
        <div ref={cityContainerRef} className="relative">
          <Input
            id={`${listId}-city`}
            value={cityQuery}
            required={required && !!state}
            disabled={!state}
            placeholder={
              state ? "Buscar cidade..." : "Selecione o estado primeiro"
            }
            role="combobox"
            aria-expanded={cityOpen}
            aria-controls={`${listId}-city-listbox`}
            aria-autocomplete="list"
            autoComplete="off"
            className="pr-10"
            onFocus={() => {
              setCityFocused(true);
              if (state) setCityOpen(true);
            }}
            onChange={(event) => {
              setCityQuery(event.target.value);
              setCity(event.target.value);
              if (state) setCityOpen(true);
            }}
            onBlur={() => {
              setCityFocused(false);
              normalizeCityOnBlur();
            }}
          />
          <ChevronDown
            className={cn(
              "pointer-events-none absolute right-3 top-1/2 z-10 size-4 -translate-y-1/2 text-corsa-muted transition-transform duration-200 ease-out",
              (cityFocused || cityOpen) && "rotate-180 text-corsa-wine",
            )}
            aria-hidden="true"
          />
          <div
            className={cn(
              "absolute z-50 mt-1.5 w-full origin-top overflow-hidden rounded-xl border border-corsa-border bg-white shadow-[var(--shadow-elevated)]",
              "transition-[opacity,transform] duration-200 ease-out",
              cityOpen && state
                ? "pointer-events-auto scale-100 opacity-100"
                : "pointer-events-none scale-95 opacity-0",
            )}
          >
            <ul
              id={`${listId}-city-listbox`}
              role="listbox"
              className="max-h-48 overflow-y-auto py-1"
            >
              {filteredCities.length > 0 ? (
                filteredCities.map((item) => (
                  <li key={item} role="presentation">
                    <button
                      type="button"
                      role="option"
                      aria-selected={city === item}
                      className={cn(
                        "w-full px-3 py-2 text-left text-sm text-corsa-ink transition-colors duration-150 ease-out",
                        "hover:bg-corsa-rose/40 focus:bg-corsa-rose/40 focus:outline-none",
                        city === item && "bg-corsa-rose/30 font-medium text-corsa-wine",
                      )}
                      onMouseDown={(event) => {
                        event.preventDefault();
                        selectCity(item);
                      }}
                    >
                      {item}
                    </button>
                  </li>
                ))
              ) : (
                <li
                  className="px-3 py-2 text-sm text-corsa-muted"
                  role="presentation"
                >
                  Nenhuma cidade encontrada
                </li>
              )}
            </ul>
          </div>
        </div>
        <input type="hidden" name={cityName} value={city} />
      </Field>
    </div>
  );
}
