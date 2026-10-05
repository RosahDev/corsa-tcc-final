import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/format";
import { getModalityLabel } from "@/lib/labels";
import type { PhotoListItem } from "@/lib/queries/photos";

type PhotoCardProps = {
  photo: PhotoListItem;
};

function photoTitle(photo: PhotoListItem): string {
  if (photo.title) return photo.title;
  const parts = [photo.car_brand, photo.car_model].filter(Boolean);
  if (parts.length > 0) return parts.join(" ");
  return photo.album_title;
}

export function PhotoCard({ photo }: PhotoCardProps) {
  const metadata = [photo.car_brand, photo.car_model, photo.car_color]
    .filter(Boolean)
    .join(" · ");

  return (
    <Link
      href={`/marketplace/${photo.album_slug}?foto=${photo.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-corsa-border bg-white shadow-[var(--shadow-card)] transition-[box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-corsa-sand">
        <Image
          src={`/api/fotos/${photo.id}/preview`}
          alt={photoTitle(photo)}
          fill
          className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 25vw"
          unoptimized
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <Badge variant="wine">{getModalityLabel(photo.album_modality)}</Badge>
          {photo.vehicle_type && (
            <Badge variant="sand">{photo.vehicle_type}</Badge>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 bg-corsa-sand/40 p-4">
        <h3 className="line-clamp-2 font-semibold text-corsa-ink transition-colors group-hover:text-corsa-wine">
          {photoTitle(photo)}
        </h3>
        {metadata && (
          <p className="line-clamp-1 text-xs text-corsa-muted">{metadata}</p>
        )}
        <p className="text-xs text-corsa-muted">
          {photo.album_city}/{photo.album_state}
        </p>
        <p className="text-xs text-corsa-muted">
          em{" "}
          <span className="font-medium text-corsa-ink">{photo.album_title}</span>
          {" · "}@{photo.photographer_handle}
        </p>
        <div className="mt-auto pt-2">
          <p className="text-lg font-bold text-corsa-wine">
            {formatCurrency(photo.price_cents)}
          </p>
        </div>
      </div>
    </Link>
  );
}
