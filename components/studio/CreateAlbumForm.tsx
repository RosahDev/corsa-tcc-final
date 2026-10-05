"use client";

import { useActionState, useEffect, useState } from "react";
import { createAlbumAction, type AlbumActionState } from "@/lib/actions/albums";
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
import {
  ALBUM_DESCRIPTION_MAX,
  ALBUM_TITLE_MAX,
} from "@/lib/validation/schemas";

type CreateAlbumFormProps = {
  onSuccess?: () => void;
};

export function CreateAlbumForm({ onSuccess }: CreateAlbumFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [state, action, pending] = useActionState(
    createAlbumAction,
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
        <p className="text-sm text-corsa-success">Álbum criado com sucesso</p>
      )}
      <Field label="Título" htmlFor="title">
        <Input
          id="title"
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
      <Field label="Descrição" htmlFor="description">
        <Textarea
          id="description"
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
      <StateCitySelect />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Modalidade" htmlFor="modality">
          <Select id="modality" name="modality" required searchable>
            <option value="">Selecione</option>
            {SESSION_MODALITIES.map((m) => (
              <option key={m} value={m}>
                {getModalityLabel(m)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Data da cobertura" htmlFor="coverageDate">
          <Input id="coverageDate" name="coverageDate" type="date" />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Categoria de veículo" htmlFor="vehicleType">
          <Input
            id="vehicleType"
            name="vehicleType"
            placeholder="Ex.: Drift, GT, Muscle, JDM"
            required
          />
        </Field>
        <Field label="Preço do pacote" htmlFor="bundlePriceCents">
          <MoneyInput
            id="bundlePriceCents"
            name="bundlePriceCents"
            defaultValueCents={9900}
            required
          />
        </Field>
      </div>
      <Checkbox
        name="publish"
        value="on"
        label="Publicar imediatamente"
      />
      <div className="flex justify-end pt-1">
        <Button type="submit" disabled={pending}>
          Criar álbum
        </Button>
      </div>
    </form>
  );
}
