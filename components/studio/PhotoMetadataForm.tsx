"use client";

import { useActionState, useEffect } from "react";
import {
  updatePhotoMetadataAction,
  type PhotoActionState,
} from "@/lib/actions/photos";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { PhotoRow } from "@/lib/queries/photos";

type PhotoMetadataFormProps = {
  albumId: string;
  photo: PhotoRow;
  onSuccess?: () => void;
  className?: string;
};

export function PhotoMetadataForm({
  albumId,
  photo,
  onSuccess,
  className,
}: PhotoMetadataFormProps) {
  const boundAction = updatePhotoMetadataAction.bind(null, albumId);
  const [state, action, pending] = useActionState(
    boundAction,
    {} as PhotoActionState,
  );

  useEffect(() => {
    if (state.success) onSuccess?.();
  }, [state.success, onSuccess]);

  return (
    <form action={action} className={className ?? "mt-3 flex flex-col gap-2"}>
      <input type="hidden" name="photoId" value={photo.id} />
      {state.error && (
        <p className="text-xs text-corsa-wine">{state.error}</p>
      )}
      {state.success && (
        <p className="text-xs text-corsa-success">Metadados salvos</p>
      )}
      <Field label="Título" htmlFor={`title-${photo.id}`}>
        <Input
          id={`title-${photo.id}`}
          name="title"
          defaultValue={photo.title ?? ""}
          className="h-9 rounded-xl"
        />
      </Field>
      <Field label="Descrição" htmlFor={`desc-${photo.id}`}>
        <Input
          id={`desc-${photo.id}`}
          name="description"
          defaultValue={photo.description ?? ""}
          className="h-9 rounded-xl"
        />
      </Field>
      <Field label="Marca" htmlFor={`brand-${photo.id}`}>
        <Input
          id={`brand-${photo.id}`}
          name="carBrand"
          defaultValue={photo.car_brand ?? ""}
          placeholder="Ex.: Porsche"
          className="h-9 rounded-xl"
        />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Modelo" htmlFor={`model-${photo.id}`}>
          <Input
            id={`model-${photo.id}`}
            name="carModel"
            defaultValue={photo.car_model ?? ""}
            placeholder="911"
            className="h-9 rounded-xl"
          />
        </Field>
        <Field label="Cor" htmlFor={`color-${photo.id}`}>
          <Input
            id={`color-${photo.id}`}
            name="carColor"
            defaultValue={photo.car_color ?? ""}
            placeholder="Vermelho"
            className="h-9 rounded-xl"
          />
        </Field>
      </div>
      <Field label="Tipo" htmlFor={`type-${photo.id}`}>
        <Input
          id={`type-${photo.id}`}
          name="vehicleType"
          defaultValue={photo.vehicle_type ?? ""}
          placeholder="Cupê, Sedan, Pickup"
          className="h-9 rounded-xl"
        />
      </Field>
      <Button type="submit" size="sm" disabled={pending} className="mt-1">
        Salvar metadados
      </Button>
    </form>
  );
}
