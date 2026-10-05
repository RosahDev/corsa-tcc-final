export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findPhotographerByHandle } from "@/lib/queries/photographers";
import { listAlbumsByPhotographer } from "@/lib/queries/albums";
import { AlbumCard } from "@/components/marketplace/AlbumCard";
import { PhotographerAvatar } from "@/components/photographer/PhotographerAvatar";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ImageIcon } from "lucide-react";
import { createPageMetadata, DEFAULT_OG_IMAGE } from "@/lib/seo";

export async function generateMetadata({
  params,
}: PageProps<"/fotografos/[handle]">): Promise<Metadata> {
  const { handle } = await params;
  const photographer = await findPhotographerByHandle(handle);

  if (!photographer) {
    return { title: "Fotógrafo não encontrado" };
  }

  const description =
    photographer.bio?.trim() ||
    `Álbuns e fotos de ${photographer.name} (@${photographer.handle}) no Corsa.`;

  const image = photographer.avatar_key
    ? `/api/avatars/${photographer.avatar_key}`
    : DEFAULT_OG_IMAGE;

  return createPageMetadata({
    title: photographer.name,
    description,
    path: `/fotografos/${handle}`,
    image,
  });
}

export default async function FotografoProfilePage({
  params,
}: PageProps<"/fotografos/[handle]">) {
  const { handle } = await params;
  const photographer = await findPhotographerByHandle(handle);
  if (!photographer) notFound();

  const albums = await listAlbumsByPhotographer(photographer.id);

  return (
    <div className="page-container page-section">
      <div className="rounded-2xl bg-corsa-wine p-8 text-white sm:p-10">
        <div className="flex items-start gap-4">
          <PhotographerAvatar
            avatarKey={photographer.avatar_key}
            name={photographer.name}
            size="lg"
            variant="onDark"
          />
          <div>
            <h1 className="font-heading text-3xl font-bold">{photographer.name}</h1>
            <p className="text-white/70">@{photographer.handle}</p>
            {photographer.bio && (
              <p className="mt-4 max-w-2xl text-white/80">{photographer.bio}</p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              {photographer.specialties.map((s) => (
                <Badge key={s} className="bg-white/10 text-white">
                  {s}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      <h2 className="mt-10 font-heading text-xl font-bold text-corsa-ink">
        Álbuns publicados
      </h2>
      {albums.length === 0 ? (
        <EmptyState
          icon={<ImageIcon className="size-7" />}
          title="Nenhum álbum publicado"
          description="Este fotógrafo ainda não publicou álbuns no marketplace."
          actionLabel="Ver marketplace"
          actionHref="/marketplace"
          className="mt-6"
        />
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {albums.map((album) => (
            <AlbumCard key={album.id} album={album} />
          ))}
        </div>
      )}
    </div>
  );
}
