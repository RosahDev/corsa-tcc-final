"use client";

import { useActionState, useEffect, useState } from "react";
import {
  updateAlbumAction,
  type AlbumActionState,
} from "@/lib/actions/albums";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { CharCounter } from "@/components/ui/CharCounter";
import { MoneyInput } from "@/components/ui/MoneyInput";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { StateCitySelect } from "@/components/ui/StateCitySelect";
import { getModalityLabel, SESSION_MODALITIES } from "@/lib/labels";
import type { AlbumListItem } from "@/lib/queries/albums";
import {
  ALBUM_DESCRIPTION_MAX,
  ALBUM_TITLE_MAX,
} from "@/lib/validation/schemas";

type EditAlbumFormProps = {
  album: AlbumListItem;
  onSuccess?: () => void;
};

function toDateInputValue(date: Date | string | null): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function EditAlbumForm({ album, onSuccess }: EditAlbumFormProps) {
  const [title, setTitle] = useState(album.title);
  const [description, setDescription] = useState(album.description ?? "");
  const boundAction = updateAlbumAction.bind(null, album.id);
  const [state, action, pending] = useActionState(
    boundAction,
    {} as AlbumActionState,
  );

  useEffect(() => {
    if (state.success) onSuccess?.();
  }, [state.success, onSuccess]);

  return (
    <form action={action} className="flex flex-col gap-5">
      {state.error && (
        <p className="text-sm text-corsa-wine">{state.error}</p>
      )}
      {state.success && (
        <p className="text-sm text-corsa-success">Álbum atualizado com sucesso</p>
      )}
      <Field label="Título" htmlFor={`edit-title-${album.id}`}>
        <Input
          id={`edit-title-${album.id}`}
          name="title"
          required
          maxLength={ALBUM_TITLE_MAX}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <CharCounter
          current={title.length}
          max={ALBUM_TITLE_MAX}
          className="self-end"
        />
      </Field>
      <Field label="Descrição" htmlFor={`edit-description-${album.id}`}>
        <Textarea
          id={`edit-description-${album.id}`}
          name="description"
          maxLength={ALBUM_DESCRIPTION_MAX}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <CharCounter
          current={description.length}
          max={ALBUM_DESCRIPTION_MAX}
          className="self-end"
        />
      </Field>
      <StateCitySelect
        defaultState={album.state}
        defaultCity={album.city}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Modalidade" htmlFor={`edit-modality-${album.id}`}>
          <Select
            id={`edit-modality-${album.id}`}
            name="modality"
            defaultValue={album.modality}
            required
            searchable
          >
            <option value="">Selecione</option>
            {SESSION_MODALITIES.map((m) => (
              <option key={m} value={m}>
                {getModalityLabel(m)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Data da cobertura" htmlFor={`edit-coverage-${album.id}`}>
          <Input
            id={`edit-coverage-${album.id}`}
            name="coverageDate"
            type="date"
            defaultValue={toDateInputValue(album.coverage_date)}
          />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Categoria de veículo" htmlFor={`edit-vehicle-${album.id}`}>
          <Input
            id={`edit-vehicle-${album.id}`}
            name="vehicleType"
            defaultValue={album.vehicle_type}
            required
          />
        </Field>
        <Field label="Preço do pacote" htmlFor={`edit-bundle-${album.id}`}>
          <MoneyInput
            id={`edit-bundle-${album.id}`}
            name="bundlePriceCents"
            defaultValueCents={album.bundle_price_cents}
            required
          />
        </Field>
      </div>
      <Checkbox
        name="publish"
        value="on"
        defaultChecked={!!album.published_at}
        label="Publicado no marketplace"
      />
      <div className="flex justify-end pt-1">
        <Button type="submit" disabled={pending}>
          Salvar alterações
        </Button>
      </div>
    </form>
  );
}
