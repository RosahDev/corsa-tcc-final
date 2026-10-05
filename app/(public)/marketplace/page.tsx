export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { Suspense } from "react";
import {
  listCarBrands,
  listPublishedAlbums,
  listTagOptions,
  listVehicleTypes,
} from "@/lib/queries/albums";
import { listPublishedPhotos } from "@/lib/queries/photos";
import { listPhotographers } from "@/lib/queries/photographers";
import { MarketplaceFilters } from "@/components/marketplace/MarketplaceFilters";
import { createPageMetadata } from "@/lib/seo";
import {
  normalizeMarketplaceTipo,
  type MarketplaceSearchFilters,
} from "@/lib/marketplace-filters";

export const metadata: Metadata = createPageMetadata({
  title: "Marketplace",
  description:
    "Explore álbuns e fotos avulsas de fotografia automotiva publicados por fotógrafos profissionais. Filtre por evento, cidade, modalidade e veículo.",
  path: "/marketplace",
});

export default async function MarketplacePage({
  searchParams,
}: PageProps<"/marketplace">) {
  const params = await searchParams;
  const tipo = normalizeMarketplaceTipo(
    typeof params.tipo === "string" ? params.tipo : undefined,
  );

  const filters: MarketplaceSearchFilters = {
    tipo,
    q: typeof params.q === "string" ? params.q : undefined,
    modality: typeof params.modality === "string" ? params.modality : undefined,
    vehicleType:
      typeof params.vehicleType === "string" ? params.vehicleType : undefined,
    carBrand: typeof params.carBrand === "string" ? params.carBrand : undefined,
    tag: typeof params.tag === "string" ? params.tag : undefined,
    city: typeof params.city === "string" ? params.city : undefined,
    state: typeof params.state === "string" ? params.state : undefined,
    photographer:
      typeof params.photographer === "string" ? params.photographer : undefined,
    sort: typeof params.sort === "string" ? params.sort : undefined,
    page: typeof params.page === "string" ? params.page : undefined,
  };

  const page = Number(filters.page ?? 1);
  const queryFilters = {
    q: filters.q,
    modality: filters.modality,
    vehicleType: filters.vehicleType,
    carBrand: filters.carBrand,
    tag: filters.tag,
    city: filters.city,
    state: filters.state,
    photographer: filters.photographer,
    sort: filters.sort,
    page,
  };

  const [albumResult, photoResult, vehicleTypes, carBrands, tags, photographers] =
    await Promise.all([
      tipo === "albuns"
        ? listPublishedAlbums(queryFilters)
        : Promise.resolve({ albums: [], total: 0, page, totalPages: 1 }),
      tipo === "fotos"
        ? listPublishedPhotos(queryFilters)
        : Promise.resolve({ photos: [], total: 0, page, totalPages: 1 }),
      listVehicleTypes(),
      listCarBrands(),
      listTagOptions(),
      listPhotographers(),
    ]);

  const result = tipo === "fotos" ? photoResult : albumResult;

  return (
    <Suspense
      fallback={
        <div className="page-container py-16 text-center text-corsa-muted">
          Carregando...
        </div>
      }
    >
      <MarketplaceFilters
        tipo={tipo}
        albums={albumResult.albums}
        photos={photoResult.photos}
        total={result.total}
        page={result.page}
        totalPages={result.totalPages}
        filters={filters}
        vehicleTypes={vehicleTypes}
        carBrands={carBrands}
        tags={tags}
        photographers={photographers.map((photographer) => ({
          handle: photographer.handle,
          name: photographer.name,
        }))}
      />
    </Suspense>
  );
}
