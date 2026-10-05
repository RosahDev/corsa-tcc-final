"use client";

import { Dialog } from "./Dialog";
import { Button } from "./Button";

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  error?: string;
  onConfirm: () => void;
  pending?: boolean;
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  error,
  onConfirm,
  pending = false,
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
    >
      {error ? (
        <p className="mb-4 rounded-xl bg-corsa-wine/10 px-4 py-3 text-sm text-corsa-wine">
          {error}
        </p>
      ) : null}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={pending}
        >
          {cancelLabel}
        </Button>
        <Button
          variant="primary"
          onClick={onConfirm}
          disabled={pending}
        >
          {pending ? "Processando..." : confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
}
