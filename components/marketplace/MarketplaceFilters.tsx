"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Filter, ImageIcon, Layers, Search } from "lucide-react";
import { useState } from "react";
import { ActiveFilters } from "@/components/ui/ActiveFilters";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { AlbumCard } from "@/components/marketplace/AlbumCard";
import { MarketplaceFilterFields } from "@/components/marketplace/MarketplaceFilterFields";
import { PhotoCard } from "@/components/marketplace/PhotoCard";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  countActiveFilters,
  FILTER_PARAM_KEYS,
  parseMultiValue,
  serializeMultiValue,
  type MarketplaceSearchFilters,
  type MarketplaceTipo,
} from "@/lib/marketplace-filters";
import type { AlbumListItem } from "@/lib/queries/albums";
import type { PhotoListItem } from "@/lib/queries/photos";
import { cn } from "@/lib/utils";

type MarketplaceFiltersProps = {
  tipo: MarketplaceTipo;
  albums: AlbumListItem[];
  photos: PhotoListItem[];
  total: number;
  page: number;
  totalPages: number;
  filters: MarketplaceSearchFilters;
  vehicleTypes: string[];
  carBrands: string[];
  tags: { slug: string; name: string }[];
  photographers: { handle: string; name: string }[];
};

function buildPageHref(
  filters: MarketplaceSearchFilters,
  page: number,
): string {
  const params = new URLSearchParams();
  if (filters.tipo === "fotos") params.set("tipo", "fotos");

  for (const key of FILTER_PARAM_KEYS) {
    const value = filters[key];
    if (value && !(key === "sort" && value === "recent")) {
      params.set(key, value);
    }
  }

  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/marketplace?${query}` : "/marketplace";
}

export function MarketplaceFilters({
  tipo,
  albums,
  photos,
  total,
  page,
  totalPages,
  filters,
  vehicleTypes,
  carBrands,
  tags,
  photographers,
}: MarketplaceFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const activeFilterCount = countActiveFilters(filters);
  const isPhotosMode = tipo === "fotos";
  const results = isPhotosMode ? photos : albums;

  function pushParams(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    params.delete("page");
    const query = params.toString();
    router.push(query ? `/marketplace?${query}` : "/marketplace");
  }

  function updateFilter(key: string, value: string) {
    pushParams((params) => {
      if (value) params.set(key, value);
      else params.delete(key);

      if (key === "state") params.delete("city");
    });
  }

  function removeFilter(key: string, value?: string) {
    if (
      key === "q" ||
      key === "state" ||
      key === "city" ||
      key === "photographer" ||
      key === "sort"
    ) {
      updateFilter(key, "");
      return;
    }

    const multiValueKeys = {
      modality: filters.modality,
      vehicleType: filters.vehicleType,
      carBrand: filters.carBrand,
      tag: filters.tag,
    } as const;

    if (!(key in multiValueKeys)) return;

    const current = parseMultiValue(
      multiValueKeys[key as keyof typeof multiValueKeys],
    );
    const next = value ? current.filter((item) => item !== value) : [];
    updateFilter(key, serializeMultiValue(next));
  }

  function clearAllFilters() {
    pushParams((params) => {
      for (const key of FILTER_PARAM_KEYS) {
        params.delete(key);
      }
    });
  }

  function setTipo(nextTipo: MarketplaceTipo) {
    pushParams((params) => {
      if (nextTipo === "fotos") params.set("tipo", "fotos");
      else params.delete("tipo");
    });
  }

  return (
    <div className="page-container page-section">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-corsa-wine sm:text-4xl">
            A coleção
          </h1>
          <p className="mt-2 text-corsa-muted">
            {total} {isPhotosMode ? "foto" : "álbum"}
            {total !== 1 ? "s" : ""} publicada
            {total !== 1 ? "s" : ""} no marketplace
          </p>
        </div>

        <SegmentedControl
          aria-label="Tipo de busca"
          value={tipo}
          onChange={setTipo}
          options={[
            {
              value: "albuns",
              label: "Álbuns",
              icon: <Layers className="size-4" />,
            },
            {
              value: "fotos",
              label: "Fotos",
              icon: <ImageIcon className="size-4" />,
            },
          ]}
        />
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <form
          className="relative flex-1"
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            updateFilter("q", String(formData.get("q") ?? ""));
          }}
        >
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-corsa-muted" />
          <Input
            key={`${tipo}-${filters.q ?? ""}`}
            name="q"
            defaultValue={filters.q ?? ""}
            placeholder={
              isPhotosMode
                ? "Buscar fotos por marca, modelo, cor, título..."
                : "Buscar álbuns, cidades, marcas..."
            }
            className="h-12 rounded-2xl pl-10 transition-shadow duration-200 ease-out focus:shadow-[var(--shadow-card)]"
            aria-label="Buscar"
          />
        </form>
        <Button
          variant="outline"
          className="relative lg:hidden"
          onClick={() => setDrawerOpen(true)}
        >
          <Filter className="size-4" />
          Filtros
          {activeFilterCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-corsa-wine text-[10px] font-semibold text-white">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      <ActiveFilters
        filters={filters}
        tags={tags}
        photographers={photographers}
        onRemove={removeFilter}
        onClearAll={clearAllFilters}
      />

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <Card className="sticky top-24 overflow-hidden p-0">
            <div className="border-b border-corsa-border bg-corsa-cream/80 px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-heading text-lg font-semibold text-corsa-wine">
                  Filtros
                </p>
                {activeFilterCount > 0 && (
                  <span className="rounded-full bg-corsa-wine px-2.5 py-0.5 text-xs font-medium text-white">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-corsa-muted">
                Refine por modalidade, local, veículo e mais
              </p>
            </div>
            <div className="p-5">
              <MarketplaceFilterFields
                idPrefix="desktop-"
                filters={filters}
                vehicleTypes={vehicleTypes}
                carBrands={carBrands}
                tags={tags}
                photographers={photographers}
                tipo={tipo}
                onFilterChange={updateFilter}
              />
            </div>
          </Card>
        </aside>

        <div>
          {results.length === 0 ? (
            <EmptyState
              icon={isPhotosMode ? <ImageIcon className="size-7" /> : <Search className="size-7" />}
              title={
                isPhotosMode
                  ? "Nenhuma foto encontrada"
                  : "Nenhum álbum encontrado"
              }
              description="Ajuste os filtros ou busque por outro termo."
            />
          ) : (
            <>
              <div
                className={cn(
                  "grid gap-6 sm:grid-cols-2 xl:grid-cols-3",
                  "animate-[fade-in_0.25s_ease-out]",
                )}
              >
                {isPhotosMode
                  ? photos.map((photo) => (
                      <PhotoCard key={photo.id} photo={photo} />
                    ))
                  : albums.map((album) => (
                      <AlbumCard key={album.id} album={album} />
                    ))}
              </div>
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-3">
                  {page > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      href={buildPageHref(filters, page - 1)}
                    >
                      Anterior
                    </Button>
                  )}
                  <span className="text-sm text-corsa-muted">
                    Página {page} de {totalPages}
                  </span>
                  {page < totalPages && (
                    <Button
                      variant="outline"
                      size="sm"
                      href={buildPageHref(filters, page + 1)}
                    >
                      Próxima
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Dialog
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title="Filtros"
        contentClassName="max-w-lg"
      >
        <MarketplaceFilterFields
          idPrefix="mobile-"
          filters={filters}
          vehicleTypes={vehicleTypes}
          carBrands={carBrands}
          tags={tags}
          photographers={photographers}
          tipo={tipo}
          onFilterChange={updateFilter}
        />
        <Button className="mt-6 w-full" onClick={() => setDrawerOpen(false)}>
          Aplicar filtros
        </Button>
      </Dialog>
    </div>
  );
}
