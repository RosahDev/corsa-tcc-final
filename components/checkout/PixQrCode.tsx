"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

type PixQrCodeProps = {
  payload: string;
  size?: number;
};

export function PixQrCode({ payload, size = 168 }: PixQrCodeProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    QRCode.toDataURL(payload, {
      width: size,
      margin: 2,
      color: {
        dark: "#5d1923",
        light: "#f5f0e8",
      },
    })
      .then((url) => {
        if (!cancelled) setDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setDataUrl(null);
      });

    return () => {
      cancelled = true;
    };
  }, [payload, size]);

  if (!dataUrl) {
    return (
      <div
        className="mx-auto animate-pulse rounded-lg bg-corsa-border/40"
        style={{ width: size, height: size }}
        aria-hidden
      />
    );
  }

  return (
    <img
      src={dataUrl}
      alt="QR Code Pix simulado"
      width={size}
      height={size}
      className="mx-auto rounded-lg border border-corsa-border/40 bg-white p-2"
    />
  );
}
