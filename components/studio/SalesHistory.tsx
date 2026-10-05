"use client";

import Image from "next/image";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ShoppingBag } from "lucide-react";

export type SaleHistoryItem = {
  id: string;
  photo_id: string;
  unit_price_cents: number;
  net_cents: number;
  paid_at: string | null;
  photo_title: string | null;
  album_title: string;
};

type SalesHistoryProps = {
  sales: SaleHistoryItem[];
  photographerSharePercent: number;
};

export function SalesHistory({
  sales,
  photographerSharePercent,
}: SalesHistoryProps) {
  if (sales.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingBag className="size-7" />}
        title="Nenhuma venda ainda"
        description="Quando alguém comprar suas fotos, o histórico aparecerá aqui."
        actionLabel="Gerenciar álbuns"
        actionHref="/painel/albuns"
        className="mt-8"
      />
    );
  }

  return (
    <Card className="mt-8 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead>
            <tr className="border-b border-corsa-sand bg-corsa-cream/40 text-corsa-muted">
              <th className="px-5 py-3 font-medium">Data</th>
              <th className="px-5 py-3 font-medium">Foto</th>
              <th className="px-5 py-3 font-medium">Título</th>
              <th className="px-5 py-3 font-medium">Álbum</th>
              <th className="px-5 py-3 text-right font-medium">
                Valor ({photographerSharePercent}%)
              </th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => (
              <tr
                key={sale.id}
                className="border-b border-corsa-sand/60 last:border-0"
              >
                <td className="whitespace-nowrap px-5 py-3 text-corsa-muted">
                  {sale.paid_at
                    ? formatDateTime(sale.paid_at)
                    : "—"}
                </td>
                <td className="px-5 py-3">
                  <div className="relative size-12 overflow-hidden rounded-lg bg-corsa-sand">
                    <Image
                      src={`/api/fotos/${sale.photo_id}/preview`}
                      alt=""
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                </td>
                <td className="px-5 py-3 font-medium text-corsa-ink">
                  {sale.photo_title || "Foto sem título"}
                </td>
                <td className="px-5 py-3 text-corsa-muted">
                  {sale.album_title}
                </td>
                <td className="px-5 py-3 text-right font-medium text-corsa-wine">
                  {formatCurrency(sale.net_cents)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
