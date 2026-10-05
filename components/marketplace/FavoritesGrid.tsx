"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ImageIcon } from "lucide-react";
import { toggleFavoriteAction } from "@/lib/actions/favorites";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmAction } from "@/components/ui/ConfirmAction";
import { EmptyState } from "@/components/ui/EmptyState";
import type { PhotoRow } from "@/lib/queries/photos";
import { cn } from "@/lib/utils";

type FavoritePhoto = PhotoRow & {
  album_title: string;
  album_slug: string;
  album_city: string;
  album_state: string;
  favorited_at: Date;
};

type FavoritesGridProps = {
  photos: FavoritePhoto[];
};

export function FavoritesGrid({ photos }: FavoritesGridProps) {
  if (photos.length === 0) {
    return (
      <EmptyState
        icon={<Heart className="size-7" />}
        title="Nenhum favorito ainda"
        description="Marque fotos com o coração nos álbuns do marketplace para vê-las aqui."
        actionLabel="Explorar marketplace"
        actionHref="/marketplace"
        className="mt-8"
      />
    );
  }

  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {photos.map((photo) => (
        <Card key={photo.id} className="overflow-hidden p-0">
          <Link
            href={`/marketplace/${photo.album_slug}?foto=${photo.id}`}
            className="relative block aspect-[4/3] bg-corsa-sand"
          >
            <Image
              src={`/api/fotos/${photo.id}/preview`}
              alt={photo.title ?? photo.album_title}
              fill
              className="object-cover"
              unoptimized
            />
          </Link>
          <div className="p-4">
            <p className="font-semibold text-corsa-ink">
              {photo.title || photo.album_title}
            </p>
            <p className="mt-1 text-xs text-corsa-muted">
              <Link
                href={`/marketplace/${photo.album_slug}`}
                className="hover:text-corsa-wine hover:underline"
              >
                {photo.album_title}
              </Link>
              {" · "}
              {photo.album_city}/{photo.album_state}
            </p>
            <div className="mt-3 flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-corsa-wine">
                {formatCurrency(photo.price_cents)}
              </span>
              <ConfirmAction
                title="Remover favorito"
                description={`"${photo.title || photo.album_title}" será removida dos seus favoritos.`}
                confirmLabel="Remover"
                onConfirm={() => toggleFavoriteAction(photo.id)}
              >
                <button
                  type="button"
                  className={cn(
                    "rounded-lg p-1.5 text-corsa-wine transition-colors",
                    "hover:bg-corsa-rose",
                  )}
                  aria-label="Remover dos favoritos"
                >
                  <Heart className="size-4 fill-current" />
                </button>
              </ConfirmAction>
            </div>
            <Button
              size="sm"
              variant="outline"
              href={`/marketplace/${photo.album_slug}?foto=${photo.id}`}
              className="mt-3 w-full"
            >
              <ImageIcon className="size-4" />
              Ver no álbum
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
