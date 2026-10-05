"use client";

import Image from "next/image";
import { useState } from "react";
import { Pencil } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { PhotoEditModal } from "@/components/studio/PhotoEditModal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { PhotoRow } from "@/lib/queries/photos";

type PhotoGridProps = {
  albumId: string;
  photos: PhotoRow[];
  salesByPhoto?: Record<string, number>;
};

export function PhotoGrid({ albumId, photos, salesByPhoto = {} }: PhotoGridProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoRow | null>(null);

  if (photos.length === 0) {
    return (
      <p className="mt-8 text-center text-sm text-corsa-muted">
        Nenhuma foto neste álbum ainda. Use o upload acima para adicionar fotos.
      </p>
    );
  }

  return (
    <>
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {photos.map((photo) => {
          const salesCount = salesByPhoto[photo.id] ?? 0;

          return (
          <div
            key={photo.id}
            className="group relative aspect-square overflow-hidden rounded-2xl bg-corsa-sand"
          >
            <button
              type="button"
              className="absolute inset-0 cursor-pointer"
              onClick={() => setSelectedPhoto(photo)}
              aria-label="Editar foto"
            >
              <Image
                src={`/api/fotos/${photo.id}/preview`}
                alt=""
                fill
                className="object-cover transition-transform duration-200 group-hover:scale-105"
                unoptimized
              />
            </button>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-corsa-ink/60 to-transparent px-2 pb-2 pt-6">
              <p className="truncate text-xs font-medium text-white">
                {formatCurrency(photo.price_cents)}
              </p>
            </div>
            {salesCount > 0 && (
              <Badge
                variant="success"
                className="absolute left-2 top-2 shadow-sm"
              >
                {salesCount} {salesCount === 1 ? "venda" : "vendas"}
              </Badge>
            )}
            <Button
              size="iconSm"
              variant="secondary"
              className="absolute right-2 top-2 opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
              onClick={() => setSelectedPhoto(photo)}
              aria-label="Editar foto"
            >
              <Pencil className="size-3.5" />
            </Button>
          </div>
          );
        })}
      </div>

      {selectedPhoto && (
        <PhotoEditModal
          albumId={albumId}
          photo={selectedPhoto}
          open={!!selectedPhoto}
          onOpenChange={(open) => {
            if (!open) setSelectedPhoto(null);
          }}
        />
      )}
    </>
  );
}
