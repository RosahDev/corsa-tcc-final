"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

export type OrderListItem = {
  id: string;
  status: string;
  total_cents: number;
  payment_method: string;
  created_at: string;
  items: {
    id: string;
    photo_id: string;
    unit_price_cents: number;
    photo_title: string | null;
    album_title: string;
  }[];
};

type OrderListProps = {
  orders: OrderListItem[];
};

export function OrderList({ orders }: OrderListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="mt-6 flex flex-col gap-4">
      {orders.map((order) => {
        const isExpanded = expandedId === order.id;

        return (
          <Card key={order.id} className="overflow-hidden">
            <button
              type="button"
              className="flex w-full items-start justify-between gap-3 p-5 text-left transition-colors hover:bg-corsa-cream/50"
              onClick={() =>
                setExpandedId(isExpanded ? null : order.id)
              }
              aria-expanded={isExpanded}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-corsa-ink">
                      Pedido #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-sm text-corsa-muted">
                      {formatDateTime(order.created_at)}
                    </p>
                  </div>
                  <Badge
                    variant={order.status === "paid" ? "success" : "muted"}
                  >
                    {order.status === "paid" ? "Pago" : order.status}
                  </Badge>
                </div>
                <p className="mt-2 text-lg font-bold text-corsa-wine">
                  {formatCurrency(order.total_cents)}
                </p>
                <p className="text-sm text-corsa-muted">
                  {order.items.length} item
                  {order.items.length !== 1 ? "s" : ""} ·{" "}
                  {order.payment_method === "pix" ? "Pix" : "Cartão"}
                </p>
              </div>
              <ChevronDown
                className={cn(
                  "mt-1 size-5 shrink-0 text-corsa-muted transition-transform",
                  isExpanded && "rotate-180",
                )}
                aria-hidden="true"
              />
            </button>

            {isExpanded && (
              <div className="border-t border-corsa-sand px-5 pb-5 pt-4">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[32rem] text-left text-sm">
                    <thead>
                      <tr className="border-b border-corsa-sand text-corsa-muted">
                        <th className="pb-2 pr-3 font-medium">Foto</th>
                        <th className="pb-2 pr-3 font-medium">Título</th>
                        <th className="pb-2 pr-3 font-medium">Álbum</th>
                        <th className="pb-2 text-right font-medium">Preço</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item) => (
                        <tr
                          key={item.id}
                          className="border-b border-corsa-sand/60 last:border-0"
                        >
                          <td className="py-3 pr-3">
                            <div className="relative size-12 overflow-hidden rounded-lg bg-corsa-sand">
                              <Image
                                src={`/api/fotos/${item.photo_id}/preview`}
                                alt=""
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                          </td>
                          <td className="py-3 pr-3 font-medium text-corsa-ink">
                            {item.photo_title || "Foto sem título"}
                          </td>
                          <td className="py-3 pr-3 text-corsa-muted">
                            {item.album_title}
                          </td>
                          <td className="py-3 text-right font-medium text-corsa-ink">
                            {formatCurrency(item.unit_price_cents)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
