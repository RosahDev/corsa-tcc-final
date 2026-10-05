import { Button } from "@/components/ui/Button";
import { AlbumCard } from "@/components/marketplace/AlbumCard";
import { ScrollReveal } from "./ScrollReveal";
import type { AlbumListItem } from "@/lib/queries/albums";

type FeaturedAlbumsSectionProps = {
  albums: AlbumListItem[];
};

export function FeaturedAlbumsSection({ albums }: FeaturedAlbumsSectionProps) {
  if (albums.length === 0) return null;

  return (
    <section className="page-container page-section">
      <ScrollReveal>
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-corsa-wine">
              Marketplace
            </p>
            <h2 className="mt-2 font-heading text-3xl font-bold text-corsa-ink">
              Álbuns em destaque
            </h2>
            <p className="mt-2 max-w-lg text-corsa-muted">
              Pacotes com desconto em relação às fotos avulsas. Curadoria por
              local, modalidade e marca.
            </p>
          </div>
          <Button variant="wineGhost" size="sm" href="/marketplace">
            Ver todos
          </Button>
        </div>
      </ScrollReveal>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {albums.slice(0, 4).map((album, index) => (
          <ScrollReveal key={album.id} delay={index * 80} className="reveal-child">
            <div className="card-hover-lift h-full">
              <AlbumCard album={album} />
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
