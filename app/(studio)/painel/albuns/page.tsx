export const dynamic = "force-dynamic";

import { requirePhotographer } from "@/lib/auth/current-user";
import { listAlbumsByPhotographer } from "@/lib/queries/albums";
import { countSalesByAlbums } from "@/lib/queries/orders";
import { AlbumList } from "@/components/studio/AlbumList";

export default async function AlbunsPage() {
  const user = await requirePhotographer();
  if (!user.photographerProfileId) return null;

  const [albums, salesByAlbum] = await Promise.all([
    listAlbumsByPhotographer(user.photographerProfileId, false),
    countSalesByAlbums(user.photographerProfileId),
  ]);

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-corsa-wine">Álbuns</h1>
      <p className="mt-1 text-sm text-corsa-muted">
        Gerencie seus anúncios no marketplace
      </p>

      <div className="mt-8">
        <AlbumList albums={albums} salesByAlbum={salesByAlbum} />
      </div>
    </div>
  );
}
