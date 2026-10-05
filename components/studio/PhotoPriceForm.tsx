"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import { updatePhotoPriceAction } from "@/lib/actions/photos";
import { MoneyInput } from "@/components/ui/MoneyInput";
import { Button } from "@/components/ui/Button";

type PhotoPriceFormProps = {
  albumId: string;
  photoId: string;
  priceCents: number;
};

export function PhotoPriceForm({
  albumId,
  photoId,
  priceCents,
}: PhotoPriceFormProps) {
  const [currentCents, setCurrentCents] = useState(priceCents);
  const isDirty = currentCents !== priceCents;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (!isDirty) {
      event.preventDefault();
    }
  };

  const handleFormKeyDown = (event: KeyboardEvent<HTMLFormElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
    }
  };

  return (
    <form
      action={updatePhotoPriceAction.bind(null, albumId)}
      onSubmit={handleSubmit}
      onKeyDown={handleFormKeyDown}
      className="flex items-center gap-2"
    >
      <input type="hidden" name="photoId" value={photoId} />
      <MoneyInput
        name="priceCents"
        defaultValueCents={priceCents}
        onValueChange={setCurrentCents}
        className="min-w-0 flex-1 [&_input]:h-9 [&_input]:rounded-xl"
        aria-label="Preço da foto"
      />
      {isDirty ? (
        <Button type="submit" size="sm" className="shrink-0">
          Salvar
        </Button>
      ) : null}
    </form>
  );
}
