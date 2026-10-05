"use client";

import Image from "next/image";
import { useActionState, useEffect, useRef, useState } from "react";
import { Camera, Trash2 } from "lucide-react";
import {
  removeAvatarDeleteAction,
  uploadAvatarAction,
  type ProfileActionState,
} from "@/lib/actions/profile";
import { getAvatarUrl } from "@/lib/media/avatar-url";
import type { PhotographerRow } from "@/lib/queries/photographers";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDeleteForm } from "@/components/ui/ConfirmDeleteForm";
import { cn } from "@/lib/utils";

export function AvatarUploadForm({ profile }: { profile: PhotographerRow }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadState, uploadAction, uploadPending] = useActionState(
    uploadAvatarAction,
    {} as ProfileActionState,
  );
  const currentAvatarUrl = getAvatarUrl(profile.avatar_key);
  const displayUrl = previewUrl ?? currentAvatarUrl;
  const feedback = uploadState.error;
  const success = uploadState.success;

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return file ? URL.createObjectURL(file) : null;
    });
  }

  async function handleUpload() {
    if (!selectedFile) {
      inputRef.current?.click();
      return;
    }

    const formData = new FormData();
    formData.set("avatar", selectedFile);
    await uploadAction(formData);
    setSelectedFile(null);
    setPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <Card className="p-6">
      <h2 className="font-heading font-semibold text-corsa-ink">Foto de perfil</h2>
      <p className="mt-1 text-sm text-corsa-muted">
        Aparece na sua página pública e nas listagens
      </p>

      <div className="mt-5 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cn(
            "group relative size-24 overflow-hidden rounded-full border-2 border-dashed border-corsa-border",
            "bg-corsa-cream/50 transition-colors hover:border-corsa-wine/30 hover:bg-corsa-rose/20",
          )}
          aria-label="Alterar foto de perfil"
        >
          {displayUrl ? (
            <Image
              src={displayUrl}
              alt="Foto de perfil"
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <span className="flex size-full items-center justify-center text-corsa-muted">
              <Camera className="size-8" />
            </span>
          )}
          <span className="absolute inset-0 flex items-center justify-center bg-corsa-ink/0 text-xs font-medium text-white opacity-0 transition group-hover:bg-corsa-ink/40 group-hover:opacity-100">
            Alterar
          </span>
        </button>

        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            onChange={handleFileChange}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploadPending}
            onClick={handleUpload}
          >
            {uploadPending
              ? "Enviando..."
              : selectedFile
                ? "Salvar foto"
                : "Escolher foto"}
          </Button>
          {profile.avatar_key && (
            <ConfirmDeleteForm
              action={removeAvatarDeleteAction}
              title="Remover foto de perfil"
              description="Sua foto de perfil será removida da página pública e das listagens."
              confirmLabel="Remover foto"
            >
              <Button
                variant="outline"
                size="sm"
                className="border-corsa-wine text-corsa-wine"
              >
                <Trash2 className="size-3.5" />
                Remover foto
              </Button>
            </ConfirmDeleteForm>
          )}
          <p className="text-xs text-corsa-muted">JPG, PNG ou WebP · até 5 MB</p>
        </div>
      </div>

      {feedback && (
        <p className="mt-4 text-sm text-corsa-wine">{feedback}</p>
      )}
      {success && (
        <p className="mt-4 text-sm text-corsa-success">Foto atualizada</p>
      )}
    </Card>
  );
}
