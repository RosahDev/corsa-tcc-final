"use client";

import { useState } from "react";
import { Check, Link, Share2 } from "lucide-react";
import { buildAbsoluteUrl, copyToClipboard, shareOrCopyUrl } from "@/lib/share-url";
import { cn } from "@/lib/utils";

type ShareLinkButtonProps = {
  path: string;
  title?: string;
  className?: string;
  size?: "sm" | "md";
  variant?: "default" | "overlay";
};

const actionButtonStyles =
  "inline-flex shrink-0 cursor-pointer items-center justify-center rounded-xl border border-corsa-border bg-white text-corsa-ink transition-colors hover:bg-corsa-cream active:bg-corsa-rose focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-corsa-wine focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-50";

export function ShareLinkButton({
  path,
  title,
  className,
  size = "sm",
  variant = "default",
}: ShareLinkButtonProps) {
  const [feedback, setFeedback] = useState<"shared" | "copied" | null>(null);

  function showFeedback(kind: "shared" | "copied") {
    setFeedback(kind);
    window.setTimeout(() => setFeedback(null), 2000);
  }

  async function handleShare() {
    const url = buildAbsoluteUrl(path);
    const result = await shareOrCopyUrl(url, title);
    if (result === "copied") showFeedback("copied");
  }

  async function handleCopy() {
    await copyToClipboard(buildAbsoluteUrl(path));
    showFeedback("copied");
  }

  const buttonSize = size === "sm" ? "size-9" : "size-10";

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <div
        className={cn(
          "inline-flex items-center gap-1 rounded-2xl p-1",
          variant === "overlay"
            ? "border border-corsa-border/50 bg-white/90 shadow-sm backdrop-blur-sm"
            : "border border-corsa-border bg-corsa-cream",
        )}
      >
        <button
          type="button"
          className={cn(actionButtonStyles, buttonSize)}
          onClick={handleShare}
          aria-label="Compartilhar link"
          title="Compartilhar"
        >
          <Share2 className="size-4" />
        </button>
        <button
          type="button"
          className={cn(actionButtonStyles, buttonSize)}
          onClick={handleCopy}
          aria-label="Copiar link"
          title="Copiar link"
        >
          {feedback === "copied" ? (
            <Check className="size-4 text-corsa-success" />
          ) : (
            <Link className="size-4" />
          )}
        </button>
      </div>
      {feedback && (
        <span className="text-xs font-medium text-corsa-success" role="status">
          {feedback === "shared" ? "Compartilhado!" : "Link copiado!"}
        </span>
      )}
    </div>
  );
}
