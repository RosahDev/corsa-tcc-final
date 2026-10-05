"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

export type DialogProps = {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  contentClassName?: string;
};

export function Dialog({
  open,
  onOpenChange,
  onClose,
  title,
  description,
  children,
  className,
  contentClassName,
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  function handleClose() {
    onOpenChange?.(false);
    onClose?.();
  }

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className={cn(
        "fixed inset-0 z-50 m-0 h-full max-h-none w-full max-w-none",
        "bg-transparent p-0 backdrop:bg-corsa-ink/40",
        className,
      )}
      onClose={handleClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) {
          handleClose();
        }
      }}
    >
      <div className="overlay-enter flex h-full items-center justify-center p-4">
        <div
          className={cn(
            "relative w-full rounded-2xl bg-white p-6 shadow-[var(--shadow-elevated)]",
            "animate-[fade-in_0.2s_ease-out]",
            contentClassName ?? "max-w-md",
          )}
          onClick={(event) => event.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="iconSm"
            className="absolute right-3 top-3 text-corsa-muted"
            onClick={handleClose}
            aria-label="Fechar"
          >
            <X className="size-4" />
          </Button>
          <div className="flex flex-col gap-2 pr-8">
            <h2 className="font-heading text-xl font-semibold text-corsa-ink">
              {title}
            </h2>
            {description && (
              <p className="text-sm text-corsa-muted">{description}</p>
            )}
          </div>
          {children && <div className="mt-5">{children}</div>}
        </div>
      </div>
    </dialog>
  );
}
