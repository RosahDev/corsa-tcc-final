export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { requirePhotographer } from "@/lib/auth/current-user";
import { findAlbumByIdForPhotographer } from "@/lib/queries/albums";
import { listPhotosByAlbum } from "@/lib/queries/photos";
import { countSalesByAlbum, countSalesByPhotos } from "@/lib/queries/orders";
import { uploadPhotosFormAction } from "@/lib/actions/photos";
import { deleteAlbumAction } from "@/lib/actions/albums";
import { formatCurrency } from "@/lib/format";
import { PhotoGrid } from "@/components/studio/PhotoGrid";
import { PhotoUploadForm } from "@/components/studio/PhotoUploadForm";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ConfirmDeleteForm } from "@/components/ui/ConfirmDeleteForm";

export default async function AlbumDetailStudioPage({
  params,
}: PageProps<"/painel/albuns/[id]">) {
  const { id } = await params;
  const user = await requirePhotographer();
  if (!user.photographerProfileId) notFound();

  const album = await findAlbumByIdForPhotographer(
    id,
    user.photographerProfileId,
  );
  if (!album) notFound();

  const [photos, albumSalesCount, salesByPhoto] = await Promise.all([
    listPhotosByAlbum(album.id),
    countSalesByAlbum(album.id),
    countSalesByPhotos(album.id),
  ]);

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-corsa-wine">
        {album.title}
      </h1>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-corsa-muted">
          Pacote: {formatCurrency(album.bundle_price_cents)} · {photos.length}{" "}
          fotos
          {albumSalesCount > 0 && (
            <>
              {" "}
              · {albumSalesCount}{" "}
              {albumSalesCount === 1 ? "venda" : "vendas"}
            </>
          )}
        </p>
        <ConfirmDeleteForm
          action={deleteAlbumAction.bind(null, album.id)}
          title="Excluir álbum"
          description={`O álbum "${album.title}" e todas as fotos associadas serão removidos permanentemente.`}
          confirmLabel="Excluir álbum"
        >
          <Button
            variant="outline"
            size="sm"
            className="border-corsa-wine text-corsa-wine"
          >
            Excluir álbum
          </Button>
        </ConfirmDeleteForm>
      </div>

      <Card className="mt-8 p-6">
        <h2 className="font-heading font-semibold text-corsa-ink">
          Upload de fotos
        </h2>
        <PhotoUploadForm
          action={uploadPhotosFormAction.bind(null, album.id)}
        />
      </Card>

      <h2 className="mt-8 font-heading font-semibold text-corsa-ink">
        Fotos do álbum
      </h2>
      <PhotoGrid
        albumId={album.id}
        photos={photos}
        salesByPhoto={salesByPhoto}
      />
    </div>
  );
}
