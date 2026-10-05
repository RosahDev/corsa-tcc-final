import Link from "next/link";
import { Calendar, MapPin, User } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/lib/format";
import { getModalityLabel } from "@/lib/labels";
import type { AlbumDetail } from "@/lib/queries/albums";

type AlbumMetadataProps = {
  album: AlbumDetail;
};

export function AlbumMetadata({ album }: AlbumMetadataProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Badge>{album.vehicle_type}</Badge>
        <Badge variant="wine">{getModalityLabel(album.modality)}</Badge>
        {album.tags.map((tag) => (
          <Badge key={tag} variant="sand">
            {tag}
          </Badge>
        ))}
      </div>

      <div>
        <h1 className="font-heading text-3xl font-bold text-corsa-ink">
          {album.title}
        </h1>
        <p className="mt-2 text-corsa-muted">
          <Link
            href={`/fotografos/${album.photographer_handle}`}
            className="font-medium text-corsa-wine hover:underline"
          >
            @{album.photographer_handle}
          </Link>
          <span className="mx-2">·</span>
          {album.photographer_name}
        </p>
      </div>

      <Card variant="sand" className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex gap-3">
          <MapPin className="mt-0.5 size-4 shrink-0 text-corsa-wine" />
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-corsa-muted">
              Local
            </p>
            <p className="text-sm font-medium text-corsa-ink">
              {album.city}/{album.state}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Calendar className="mt-0.5 size-4 shrink-0 text-corsa-wine" />
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-corsa-muted">
              Cobertura
            </p>
            <p className="text-sm font-medium text-corsa-ink">
              {album.coverage_date
                ? formatDate(album.coverage_date)
                : "Data não informada"}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <User className="mt-0.5 size-4 shrink-0 text-corsa-wine" />
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-corsa-muted">
              Modalidade
            </p>
            <p className="text-sm font-medium text-corsa-ink">
              {getModalityLabel(album.modality)}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <MapPin className="mt-0.5 size-4 shrink-0 text-corsa-wine" />
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-corsa-muted">
              Categoria
            </p>
            <p className="text-sm font-medium text-corsa-ink">
              {album.vehicle_type}
            </p>
          </div>
        </div>
      </Card>

      {album.description && (
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-corsa-muted">
            Sobre o álbum
          </p>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-corsa-ink">
            {album.description}
          </p>
        </div>
      )}
    </div>
  );
}
