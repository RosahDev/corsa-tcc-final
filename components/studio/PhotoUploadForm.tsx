"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { Field } from "@/components/ui/Field";
import { MoneyInput } from "@/components/ui/MoneyInput";
import { Button } from "@/components/ui/Button";
import { ConfirmAction } from "@/components/ui/ConfirmAction";
import { cn } from "@/lib/utils";

type PhotoUploadFormProps = {
  action: (formData: FormData) => void | Promise<void>;
};

type PreviewItem = {
  file: File;
  url: string;
};

export function PhotoUploadForm({ action }: PhotoUploadFormProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<PreviewItem[]>([]);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    return () => {
      previews.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [previews]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    setPreviews((current) => {
      current.forEach((item) => URL.revokeObjectURL(item.url));
      return selected.map((file) => ({
        file,
        url: URL.createObjectURL(file),
      }));
    });
  }

  function removeFile(index: number) {
    setPreviews((current) => {
      const next = [...current];
      URL.revokeObjectURL(next[index].url);
      next.splice(index, 1);
      return next;
    });
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (previews.length === 0) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.delete("photos");
    previews.forEach((item) => formData.append("photos", item.file));

    setPending(true);
    try {
      await action(formData);
      setPreviews((current) => {
        current.forEach((item) => URL.revokeObjectURL(item.url));
        return [];
      });
      form.reset();
      if (inputRef.current) inputRef.current.value = "";
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 flex flex-col gap-4"
      encType="multipart/form-data"
    >
      <Field label="Imagens" htmlFor="photos">
        <input
          ref={inputRef}
          id="photos"
          name="photos"
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={handleFileChange}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-corsa-border",
            "bg-corsa-cream/50 px-4 py-8 text-sm text-corsa-muted transition-colors",
            "hover:border-corsa-wine/30 hover:bg-corsa-rose/20 hover:text-corsa-ink",
          )}
        >
          <ImagePlus className="size-8 text-corsa-wine/60" />
          <span>Clique para selecionar imagens</span>
          <span className="text-xs">JPG, PNG ou WebP · múltiplos arquivos</span>
        </button>
      </Field>

      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
          {previews.map((item, index) => (
            <div
              key={`${item.file.name}-${index}`}
              className="group relative aspect-square overflow-hidden rounded-xl bg-corsa-sand"
            >
              <Image
                src={item.url}
                alt={item.file.name}
                fill
                className="object-cover"
                unoptimized
              />
              <ConfirmAction
                title="Remover imagem"
                description={`"${item.file.name}" será removida da seleção de upload.`}
                confirmLabel="Remover"
                onConfirm={() => removeFile(index)}
              >
                <button
                  type="button"
                  className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-corsa-ink/70 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label={`Remover ${item.file.name}`}
                >
                  <X className="size-3.5" />
                </button>
              </ConfirmAction>
            </div>
          ))}
        </div>
      )}

      <Field label="Preço padrão por foto" htmlFor="defaultPriceCents">
        <MoneyInput
          id="defaultPriceCents"
          name="defaultPriceCents"
          defaultValueCents={1800}
        />
      </Field>

      <Button type="submit" disabled={pending || previews.length === 0}>
        {pending
          ? "Enviando..."
          : `Enviar ${previews.length > 0 ? `${previews.length} foto${previews.length > 1 ? "s" : ""}` : "fotos"}`}
      </Button>
    </form>
  );
}
