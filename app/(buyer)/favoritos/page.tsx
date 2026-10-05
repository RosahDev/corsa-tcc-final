export const dynamic = "force-dynamic";

import { requireBuyer } from "@/lib/auth/current-user";
import { listFavoritePhotos } from "@/lib/queries/photos";
import { FavoritesGrid } from "@/components/marketplace/FavoritesGrid";

export default async function FavoritosPage() {
  const user = await requireBuyer();
  const photos = await listFavoritePhotos(user.id);

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-corsa-wine">
        Favoritos
      </h1>
      <p className="mt-1 text-sm text-corsa-muted">
        Fotos que você salvou para comprar depois
      </p>
      <FavoritesGrid photos={photos} />
    </div>
  );
}
