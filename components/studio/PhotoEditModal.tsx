"use client";

import Image from "next/image";
import { Dialog } from "@/components/ui/Dialog";
import { PhotoPriceForm } from "@/components/studio/PhotoPriceForm";
import { PhotoMetadataForm } from "@/components/studio/PhotoMetadataForm";
import { STUDIO_FORM_DIALOG_CLASS } from "@/components/studio/studioFormDialog";
import { ConfirmDeleteForm } from "@/components/ui/ConfirmDeleteForm";
import { Button } from "@/components/ui/Button";
import { deletePhotoAction } from "@/lib/actions/photos";
import type { PhotoRow } from "@/lib/queries/photos";

type PhotoEditModalProps = {
  albumId: string;
  photo: PhotoRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function PhotoEditModal({
  albumId,
  photo,
  open,
  onOpenChange,
}: PhotoEditModalProps) {
  const label = photo.title || photo.car_brand || "Foto";

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Editar foto"
      description={label}
      contentClassName={STUDIO_FORM_DIALOG_CLASS}
    >
      <div className="grid gap-6 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:items-start">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-corsa-sand md:sticky md:top-0">
          <Image
            src={`/api/fotos/${photo.id}/preview`}
            alt=""
            fill
            className="object-cover"
            unoptimized
          />
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <div>
            <p className="mb-2 text-sm font-medium text-corsa-ink">Preço</p>
            <PhotoPriceForm
              key={`${photo.id}-${photo.price_cents}`}
              albumId={albumId}
              photoId={photo.id}
              priceCents={photo.price_cents}
            />
          </div>

          <PhotoMetadataForm
            key={photo.id}
            albumId={albumId}
            photo={photo}
            className="flex flex-col gap-3"
          />
        </div>
      </div>

      <div className="mt-6 border-t border-corsa-sand pt-4">
        <ConfirmDeleteForm
          action={deletePhotoAction.bind(null, albumId, photo.id)}
          title="Excluir foto"
          description="Esta foto será removida do álbum e do marketplace. Esta ação não pode ser desfeita."
          confirmLabel="Excluir foto"
        >
          <Button size="sm" variant="wineGhost" className="w-full md:w-auto">
            Excluir foto
          </Button>
        </ConfirmDeleteForm>
      </div>
    </Dialog>
  );
}
