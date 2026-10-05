"use client";

import { FilterChip } from "@/components/ui/FilterChip";
import {
  FILTER_PARAM_KEYS,
  parseMultiValue,
  type MarketplaceSearchFilters,
} from "@/lib/marketplace-filters";
import { getModalityLabel } from "@/lib/labels";

type ActiveFiltersProps = {
  filters: MarketplaceSearchFilters;
  tags: { slug: string; name: string }[];
  photographers: { handle: string; name: string }[];
  onRemove: (key: string, value?: string) => void;
  onClearAll: () => void;
};

type ActiveFilterItem = {
  key: string;
  value?: string;
  label: string;
};

function buildActiveFilters(
  filters: MarketplaceSearchFilters,
  tags: { slug: string; name: string }[],
  photographers: { handle: string; name: string }[],
): ActiveFilterItem[] {
  const items: ActiveFilterItem[] = [];

  if (filters.q) {
    items.push({ key: "q", label: `Busca: ${filters.q}` });
  }

  for (const modality of parseMultiValue(filters.modality)) {
    items.push({
      key: "modality",
      value: modality,
      label: getModalityLabel(modality),
    });
  }

  for (const vehicleType of parseMultiValue(filters.vehicleType)) {
    items.push({
      key: "vehicleType",
      value: vehicleType,
      label: vehicleType,
    });
  }

  for (const carBrand of parseMultiValue(filters.carBrand)) {
    items.push({
      key: "carBrand",
      value: carBrand,
      label: carBrand,
    });
  }

  for (const tagSlug of parseMultiValue(filters.tag)) {
    const tag = tags.find((item) => item.slug === tagSlug);
    items.push({
      key: "tag",
      value: tagSlug,
      label: tag?.name ?? tagSlug,
    });
  }

  if (filters.state) {
    items.push({ key: "state", label: `UF: ${filters.state}` });
  }

  if (filters.city) {
    items.push({ key: "city", label: `Cidade: ${filters.city}` });
  }

  if (filters.photographer) {
    const photographer = photographers.find(
      (item) => item.handle === filters.photographer,
    );
    items.push({
      key: "photographer",
      label: photographer?.name ?? `@${filters.photographer}`,
    });
  }

  if (filters.sort && filters.sort !== "recent") {
    const sortLabels: Record<string, string> = {
      date_desc: "Data da cobertura",
      price_asc: "Menor preço",
      price_desc: "Maior preço",
    };
    items.push({
      key: "sort",
      label: `Ordem: ${sortLabels[filters.sort] ?? filters.sort}`,
    });
  }

  return items;
}

export function ActiveFilters({
  filters,
  tags,
  photographers,
  onRemove,
  onClearAll,
}: ActiveFiltersProps) {
  const activeItems = buildActiveFilters(filters, tags, photographers);

  if (activeItems.length === 0) return null;

  return (
    <div className="mb-5 flex flex-wrap items-center gap-2 rounded-2xl border border-corsa-border/80 bg-corsa-cream/70 px-3 py-2.5">
      <span className="text-xs font-medium uppercase tracking-wide text-corsa-muted">
        Filtros ativos
      </span>
      {activeItems.map((item) => (
        <FilterChip
          key={`${item.key}-${item.value ?? "single"}`}
          label={item.label}
          onRemove={() => onRemove(item.key, item.value)}
        />
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="ml-auto text-xs font-medium text-corsa-wine transition-colors hover:text-corsa-wine-hover"
      >
        Limpar tudo
      </button>
    </div>
  );
}

export function hasClearableFilters(filters: MarketplaceSearchFilters): boolean {
  return FILTER_PARAM_KEYS.some((key) => {
    const value = filters[key];
    if (!value) return false;
    if (key === "sort") return value !== "recent";
    return true;
  });
}
