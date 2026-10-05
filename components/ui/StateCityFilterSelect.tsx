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

type StateCityFilterSelectProps = {
  state?: string;
  city?: string;
  onStateChange: (state: string) => void;
  onCityChange: (city: string) => void;
  idPrefix?: string;
};

export function StateCityFilterSelect({
  state = "",
  city = "",
  onStateChange,
  onCityChange,
  idPrefix = "",
}: StateCityFilterSelectProps) {
  const listId = useId();
  const cityContainerRef = useRef<HTMLDivElement>(null);
  const [cityQuery, setCityQuery] = useState(city);
  const [cityOpen, setCityOpen] = useState(false);

  const cities = useMemo(() => getCitiesForState(state), [state]);

  const filteredCities = useMemo(() => {
    const query = cityQuery.trim().toLowerCase();
    if (!query) return cities.slice(0, 80);
    return cities.filter((item) => item.toLowerCase().includes(query)).slice(0, 80);
  }, [cities, cityQuery]);

  useEffect(() => {
    setCityQuery(city);
  }, [city]);

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
    setCityQuery(selected);
    onCityChange(selected);
    setCityOpen(false);
  }

  function normalizeCityOnBlur() {
    const match = cities.find(
      (item) => item.toLowerCase() === cityQuery.trim().toLowerCase(),
    );
    if (match) {
      setCityQuery(match);
      onCityChange(match);
      return;
    }

    if (!cityQuery.trim()) {
      onCityChange("");
    }
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Estado" htmlFor={`${idPrefix}${listId}-state`}>
        <AnimatedSelect
          id={`${idPrefix}${listId}-state`}
          value={state}
          searchable
          onChange={(event) => {
            onStateChange(event.target.value);
            setCityQuery("");
            setCityOpen(false);
          }}
        >
          <option value="">Todos os estados</option>
          {BRAZILIAN_STATES.map((item) => (
            <option key={item.uf} value={item.uf}>
              {item.name} ({item.uf})
            </option>
          ))}
        </AnimatedSelect>
      </Field>

      <Field label="Cidade" htmlFor={`${idPrefix}${listId}-city`}>
        <div ref={cityContainerRef} className="relative">
          <Input
            id={`${idPrefix}${listId}-city`}
            value={cityQuery}
            disabled={!state}
            placeholder={
              state ? "Buscar cidade..." : "Selecione o estado primeiro"
            }
            role="combobox"
            aria-expanded={cityOpen}
            aria-controls={`${idPrefix}${listId}-city-listbox`}
            aria-autocomplete="list"
            autoComplete="off"
            className="h-11 rounded-xl pr-10"
            onFocus={() => {
              if (state) setCityOpen(true);
            }}
            onChange={(event) => {
              setCityQuery(event.target.value);
              onCityChange(event.target.value);
              if (state) setCityOpen(true);
            }}
            onBlur={normalizeCityOnBlur}
          />
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-corsa-muted"
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
              id={`${idPrefix}${listId}-city-listbox`}
              role="listbox"
              className="max-h-48 overflow-y-auto py-1"
            >
              <li role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={!city}
                  className="w-full px-3 py-2 text-left text-sm text-corsa-muted transition-colors hover:bg-corsa-rose/40"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    selectCity("");
                  }}
                >
                  Todas as cidades
                </button>
              </li>
              {filteredCities.length > 0 ? (
                filteredCities.map((item) => (
                  <li key={item} role="presentation">
                    <button
                      type="button"
                      role="option"
                      aria-selected={city === item}
                      className={cn(
                        "w-full px-3 py-2 text-left text-sm text-corsa-ink transition-colors",
                        "hover:bg-corsa-rose/40 focus:bg-corsa-rose/40 focus:outline-none",
                        city === item && "bg-corsa-rose/30 font-medium",
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
      </Field>
    </div>
  );
}
