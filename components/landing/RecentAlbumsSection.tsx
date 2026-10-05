import Link from "next/link";
import { Calendar, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getModalityLabel } from "@/lib/labels";
import { formatShortDate } from "@/lib/format";
import { ScrollReveal } from "./ScrollReveal";
import type { AlbumListItem } from "@/lib/queries/albums";

type RecentAlbumsSectionProps = {
  albums: AlbumListItem[];
};

export function RecentAlbumsSection({ albums }: RecentAlbumsSectionProps) {
  if (albums.length === 0) return null;

  return (
    <section className="page-container page-section">
      <ScrollReveal>
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-corsa-wine">
              Coberturas recentes
            </p>
            <h2 className="mt-2 font-heading text-3xl font-bold text-corsa-ink">
              Álbuns recentes
            </h2>
            <p className="mt-2 text-corsa-muted">
              Novas sessões publicadas no marketplace.
            </p>
          </div>
          <Button variant="wineGhost" size="sm" href="/marketplace">
            Ver todos
          </Button>
        </div>
      </ScrollReveal>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {albums.slice(0, 3).map((album, index) => (
          <ScrollReveal key={album.id} delay={index * 80}>
            <Link
              href={`/marketplace/${album.slug}`}
              className="card-hover-lift group flex h-full flex-col rounded-2xl border border-corsa-border bg-white p-6 shadow-[var(--shadow-card)]"
            >
              <Badge variant="wine" className="mb-4 w-fit">
                {getModalityLabel(album.modality)}
              </Badge>
              <h3 className="font-heading text-lg font-bold text-corsa-ink transition-colors group-hover:text-corsa-wine">
                {album.title}
              </h3>
              <div className="mt-4 flex flex-col gap-2 text-sm text-corsa-muted">
                <span className="flex items-center gap-2">
                  <MapPin className="size-4 shrink-0 text-corsa-wine" />
                  {album.city}/{album.state}
                </span>
                {album.coverage_date && (
                  <span className="flex items-center gap-2">
                    <Calendar className="size-4 shrink-0 text-corsa-wine" />
                    {formatShortDate(album.coverage_date)}
                  </span>
                )}
              </div>
              <p className="mt-auto pt-4 text-xs font-medium text-corsa-wine-muted">
                {album.photo_count} foto{album.photo_count !== 1 ? "s" : ""} · @
                {album.photographer_handle}
              </p>
            </Link>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
