import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/format";
import { getModalityLabel } from "@/lib/labels";
import type { AlbumListItem } from "@/lib/queries/albums";

type AlbumCardProps = {
  album: AlbumListItem;
};

export function AlbumCard({ album }: AlbumCardProps) {
  const savings = album.photos_total_cents - album.bundle_price_cents;

  return (
    <Link
      href={`/marketplace/${album.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-corsa-border bg-white shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-elevated)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-corsa-sand">
        {album.cover_photo_id ? (
          <Image
            src={`/api/fotos/${album.cover_photo_id}/preview`}
            alt={album.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 25vw"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-corsa-muted">
            Sem preview
          </div>
        )}
        <div className="absolute left-3 top-3">
          <Badge variant="wine">
            {getModalityLabel(album.modality)}
          </Badge>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 bg-corsa-sand/40 p-4">
        <h3 className="line-clamp-2 font-semibold text-corsa-ink group-hover:text-corsa-wine">
          {album.title}
        </h3>
        <p className="text-xs text-corsa-muted">
          {album.city}/{album.state}
        </p>
        <p className="text-xs text-corsa-muted">
          por @{album.photographer_handle}
        </p>
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div>
            <p className="text-lg font-bold text-corsa-wine">
              {formatCurrency(album.bundle_price_cents)}
            </p>
            <p className="text-xs text-corsa-muted line-through">
              {formatCurrency(album.photos_total_cents)} avulsas
            </p>
          </div>
          {savings > 0 && (
            <Badge variant="success">-{formatCurrency(savings)}</Badge>
          )}
        </div>
      </div>
    </Link>
  );
}
