"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Heart, Info, ShoppingCart } from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmAction } from "@/components/ui/ConfirmAction";
import { ShareLinkButton } from "@/components/ui/ShareLinkButton";
import { AlbumMetadata } from "@/components/marketplace/AlbumMetadata";
import { PhotoInfoModal } from "@/components/marketplace/PhotoInfoModal";
import { formatCurrency } from "@/lib/format";
import {
  addAlbumToCart,
  addPhotosToCart,
} from "@/lib/actions/cart";
import { toggleFavoriteAction } from "@/lib/actions/favorites";
import type { AlbumDetail } from "@/lib/queries/albums";
import type { PhotoRow } from "@/lib/queries/photos";
import { cn } from "@/lib/utils";

type UserRole = "buyer" | "photographer" | "admin" | null;

type AlbumGalleryProps = {
  album: AlbumDetail;
  photos: PhotoRow[];
  favoriteIds: string[];
  userRole: UserRole;
};

export function AlbumGallery({
  album,
  photos,
  favoriteIds,
  userRole,
}: AlbumGalleryProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [infoPhoto, setInfoPhoto] = useState<PhotoRow | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();
  const highlightedPhotoId = searchParams.get("foto");

  const canPurchase = userRole !== "photographer";
  const canFavorite = userRole === "buyer" || userRole === null;

  const selectedTotal = useMemo(() => {
    return photos
      .filter((p) => selected.has(p.id))
      .reduce((sum, p) => sum + p.price_cents, 0);
  }, [photos, selected]);

  useEffect(() => {
    if (!highlightedPhotoId) return;
    const element = document.getElementById(`photo-${highlightedPhotoId}`);
    element?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [highlightedPhotoId]);

  function togglePhoto(id: string) {
    if (!canPurchase) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() {
    if (!canPurchase) return;
    setSelected(new Set(photos.map((p) => p.id)));
  }

  const albumPath = `/marketplace/${album.slug}`;

  return (
    <>
      <div className="page-container page-section">
        <div className="mb-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <ShareLinkButton path={albumPath} title={album.title} />
          </div>

          <AlbumMetadata album={album} />

          {canPurchase && (
            <Card variant="sand" className="mt-6 flex flex-wrap items-end gap-6 p-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-corsa-muted">
                  Álbum completo
                </p>
                <p className="text-2xl font-bold text-corsa-wine">
                  {formatCurrency(album.bundle_price_cents)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-corsa-muted">
                  Soma avulsas
                </p>
                <p className="text-lg text-corsa-muted line-through">
                  {formatCurrency(album.photos_total_cents)}
                </p>
              </div>
              <Button
                onClick={() =>
                  startTransition(async () => {
                    await addAlbumToCart(album.id);
                  })
                }
                disabled={pending}
              >
                <ShoppingCart className="size-4" />
                Comprar álbum completo
              </Button>
            </Card>
          )}
        </div>

        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-medium text-corsa-ink">
            {photos.length} fotos
            {canPurchase
              ? " · selecione avulsas ou leve o pacote"
              : " · visualização do álbum"}
          </p>
          {canPurchase && (
            <Button variant="ghost" size="sm" onClick={selectAll}>
              Selecionar todas
            </Button>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {photos.map((photo) => {
            const isSelected = selected.has(photo.id);
            const isFavorite = favoriteIds.includes(photo.id);
            const isHighlighted = highlightedPhotoId === photo.id;
            const photoPath = `${albumPath}?foto=${photo.id}`;

            return (
              <Card
                key={photo.id}
                id={`photo-${photo.id}`}
                className={cn(
                  "overflow-hidden p-0 transition-colors",
                  isSelected && "border-corsa-wine ring-1 ring-corsa-wine/20",
                  isHighlighted && "ring-2 ring-corsa-wine",
                )}
              >
                <div className="relative aspect-[4/3] w-full">
                  <button
                    type="button"
                    className={cn(
                      "relative block h-full w-full",
                      canPurchase && "cursor-pointer",
                    )}
                    onClick={() => togglePhoto(photo.id)}
                    aria-pressed={canPurchase ? isSelected : undefined}
                    aria-label={
                      canPurchase
                        ? `Selecionar foto ${formatCurrency(photo.price_cents)}`
                        : `Foto ${formatCurrency(photo.price_cents)}`
                    }
                    disabled={!canPurchase}
                  >
                    <Image
                      src={`/api/fotos/${photo.id}/preview`}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 25vw"
                      unoptimized
                    />
                    {isSelected && (
                      <span className="absolute left-2 top-2 flex size-7 items-center justify-center rounded-full bg-corsa-wine text-white">
                        <Check className="size-4" />
                      </span>
                    )}
                  </button>
                  <div className="absolute right-2 top-2">
                    <ShareLinkButton
                      path={photoPath}
                      title={photo.title ?? album.title}
                      size="sm"
                      variant="overlay"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-corsa-border p-3">
                  <span className="text-sm font-semibold text-corsa-wine">
                    {formatCurrency(photo.price_cents)}
                  </span>
                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      className="rounded-lg p-1.5 text-corsa-muted transition-colors hover:bg-corsa-rose hover:text-corsa-wine"
                      aria-label="Informações da foto"
                      onClick={() => setInfoPhoto(photo)}
                    >
                      <Info className="size-4" />
                    </button>
                    {canFavorite &&
                      (isFavorite ? (
                        <ConfirmAction
                          title="Remover favorito"
                          description={`"${photo.title || album.title}" será removida dos seus favoritos.`}
                          confirmLabel="Remover"
                          onConfirm={() => toggleFavoriteAction(photo.id)}
                        >
                          <button
                            type="button"
                            className="rounded-lg p-1.5 text-corsa-wine transition-colors"
                            aria-label="Remover favorito"
                          >
                            <Heart className="size-4 fill-current" />
                          </button>
                        </ConfirmAction>
                      ) : (
                        <button
                          type="button"
                          className="rounded-lg p-1.5 text-corsa-muted transition-colors hover:bg-corsa-rose hover:text-corsa-wine"
                          aria-label="Favoritar"
                          onClick={() =>
                            startTransition(async () => {
                              if (userRole === null) {
                                router.push(
                                  `/criar-conta?favorito=${photo.id}`,
                                );
                                return;
                              }
                              await toggleFavoriteAction(photo.id);
                            })
                          }
                        >
                          <Heart className="size-4" />
                        </button>
                      ))}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {canPurchase && selected.size > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-corsa-border bg-white p-4 shadow-[var(--shadow-elevated)]">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-corsa-ink">
                {selected.size} foto{selected.size > 1 ? "s" : ""} selecionada
                {selected.size > 1 ? "s" : ""}
              </p>
              <p className="text-sm text-corsa-muted">
                Total avulso: {formatCurrency(selectedTotal)}
                {selectedTotal > album.bundle_price_cents && (
                  <span className="ml-2 text-corsa-success">
                    Álbum completo sai por{" "}
                    {formatCurrency(album.bundle_price_cents)}
                  </span>
                )}
              </p>
            </div>
            <div className="flex gap-2">
              {selectedTotal >= album.bundle_price_cents && (
                <Button
                  variant="secondary"
                  onClick={() =>
                    startTransition(async () => {
                      await addAlbumToCart(album.id);
                      setSelected(new Set());
                    })
                  }
                  disabled={pending}
                >
                  Pegar álbum completo
                </Button>
              )}
              <Button
                onClick={() =>
                  startTransition(async () => {
                    await addPhotosToCart([...selected]);
                    setSelected(new Set());
                  })
                }
                disabled={pending}
              >
                <ShoppingCart className="size-4" />
                Adicionar ao carrinho
              </Button>
            </div>
          </div>
        </div>
      )}

      <PhotoInfoModal
        photo={infoPhoto}
        open={infoPhoto !== null}
        onClose={() => setInfoPhoto(null)}
      />
    </>
  );
}
