export type MarketplaceTipo = "albuns" | "fotos";

export type MarketplaceSearchFilters = {
  tipo?: MarketplaceTipo;
  q?: string;
  modality?: string;
  vehicleType?: string;
  carBrand?: string;
  tag?: string;
  city?: string;
  state?: string;
  photographer?: string;
  sort?: string;
  page?: string;
};

export function parseMultiValue(value?: string): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function serializeMultiValue(values: string[]): string {
  return values.filter(Boolean).join(",");
}

export function normalizeMarketplaceTipo(value?: string): MarketplaceTipo {
  return value === "fotos" ? "fotos" : "albuns";
}

export const FILTER_PARAM_KEYS = [
  "q",
  "modality",
  "vehicleType",
  "carBrand",
  "tag",
  "city",
  "state",
  "photographer",
  "sort",
] as const;

export function countActiveFilters(
  filters: MarketplaceSearchFilters,
): number {
  return FILTER_PARAM_KEYS.reduce((count, key) => {
    const value = filters[key];
    if (!value || value === "recent") return count;
    return count + (key === "q" ? 1 : parseMultiValue(value).length || 1);
  }, 0);
}
