export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { findAlbumBySlug } from "@/lib/queries/albums";
import { listPhotosByAlbum, listFavoritePhotoIds } from "@/lib/queries/photos";
import { getCurrentUser } from "@/lib/auth/current-user";
import { AlbumGallery } from "@/components/marketplace/AlbumGallery";
import { getModalityLabel } from "@/lib/labels";
import { createPageMetadata, DEFAULT_OG_IMAGE } from "@/lib/seo";

export async function generateMetadata({
  params,
}: PageProps<"/marketplace/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const album = await findAlbumBySlug(slug);

  if (!album) {
    return { title: "Álbum não encontrado" };
  }

  const description =
    album.description?.trim() ||
    `${album.photo_count} foto${album.photo_count === 1 ? "" : "s"} de ${getModalityLabel(album.modality)} em ${album.city}/${album.state}, por @${album.photographer_handle}.`;

  const image = album.cover_photo_id
    ? `/api/fotos/${album.cover_photo_id}/preview`
    : DEFAULT_OG_IMAGE;

  return createPageMetadata({
    title: album.title,
    description,
    path: `/marketplace/${slug}`,
    image,
  });
}

export default async function AlbumPage({
  params,
}: PageProps<"/marketplace/[slug]">) {
  const { slug } = await params;
  const album = await findAlbumBySlug(slug);
  if (!album) notFound();

  const user = await getCurrentUser();
  const [photos, favoriteIds] = await Promise.all([
    listPhotosByAlbum(album.id),
    user?.role === "buyer"
      ? listFavoritePhotoIds(user.id)
      : Promise.resolve([]),
  ]);

  return (
    <Suspense>
      <AlbumGallery
        album={album}
        photos={photos}
        favoriteIds={favoriteIds}
        userRole={user?.role ?? null}
      />
    </Suspense>
  );
}
