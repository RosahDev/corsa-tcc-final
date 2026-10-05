"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";

export type SuccessOverlayProps = {
  open: boolean;
  title?: string;
  description?: string;
  onComplete?: () => void;
  onClose?: () => void;
  action?: React.ReactNode;
  duration?: number;
  className?: string;
};

export function SuccessOverlay({
  open,
  title = "Pagamento confirmado",
  description = "Suas fotos ja estao disponiveis na Minha Galeria.",
  onComplete,
  onClose,
  action,
  duration = 2800,
  className,
}: SuccessOverlayProps) {
  const finish = onComplete ?? onClose;

  useEffect(() => {
    if (!open || !finish || action) return;

    const timer = window.setTimeout(finish, duration);
    return () => window.clearTimeout(timer);
  }, [open, finish, duration, action]);

  if (!open) return null;

  return (
    <div
      className={cn(
        "success-overlay-enter fixed inset-0 z-[60] flex items-center justify-center bg-corsa-ink/50 p-6",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="success-circle-animate flex size-24 items-center justify-center rounded-full bg-corsa-success-light">
          <svg viewBox="0 0 52 52" className="size-14" aria-hidden="true">
            <circle
              cx="26"
              cy="26"
              r="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-corsa-success/20"
            />
            <path
              d="M14 27 L22 35 L38 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="success-check-animate text-corsa-success"
            />
          </svg>
        </div>
        <div className="success-content-animate flex flex-col gap-2 max-w-xs">
          <h2 className="font-heading text-2xl font-semibold text-white">
            {title}
          </h2>
          {description && (
            <p className="text-sm text-white/80">{description}</p>
          )}
        </div>
        {action}
      </div>
    </div>
  );
}
