"use client";

import { Dialog } from "@/components/ui/Dialog";
import { formatCurrency } from "@/lib/format";
import type { PhotoRow } from "@/lib/queries/photos";

type PhotoInfoModalProps = {
  photo: PhotoRow | null;
  open: boolean;
  onClose: () => void;
};

function MetaRow({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs font-medium uppercase tracking-wide text-corsa-muted">
        {label}
      </dt>
      <dd className="text-sm text-corsa-ink">{value}</dd>
    </div>
  );
}

export function PhotoInfoModal({ photo, open, onClose }: PhotoInfoModalProps) {
  if (!photo) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={photo.title || "Detalhes da foto"}
      contentClassName="max-w-md"
    >
      <dl className="grid gap-4 sm:grid-cols-2">
        <MetaRow label="Preço" value={formatCurrency(photo.price_cents)} />
        <MetaRow label="Marca" value={photo.car_brand} />
        <MetaRow label="Modelo" value={photo.car_model} />
        <MetaRow label="Cor" value={photo.car_color} />
        <MetaRow label="Tipo de veículo" value={photo.vehicle_type} />
      </dl>
      {photo.description && (
        <div className="mt-4 border-t border-corsa-border pt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-corsa-muted">
            Descrição
          </p>
          <p className="mt-1 text-sm leading-relaxed text-corsa-ink">
            {photo.description}
          </p>
        </div>
      )}
    </Dialog>
  );
}
