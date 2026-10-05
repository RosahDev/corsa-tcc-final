export const dynamic = "force-dynamic";

import { requirePhotographer } from "@/lib/auth/current-user";
import { getPhotographerSharePercent } from "@/lib/constants";
import { listSalesByPhotographer } from "@/lib/queries/orders";
import { SalesHistory } from "@/components/studio/SalesHistory";

export default async function VendasPage() {
  const user = await requirePhotographer();
  if (!user.photographerProfileId) return null;

  const [sales, sharePercent] = await Promise.all([
    listSalesByPhotographer(user.photographerProfileId),
    getPhotographerSharePercent(),
  ]);

  const shareRate = sharePercent / 100;

  const salesWithNet = sales.map((sale) => ({
    id: sale.id,
    photo_id: sale.photo_id,
    unit_price_cents: sale.unit_price_cents,
    net_cents: Math.floor(sale.unit_price_cents * shareRate),
    paid_at: sale.paid_at?.toISOString() ?? null,
    photo_title: sale.photo_title,
    album_title: sale.album_title,
  }));

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-corsa-wine">Vendas</h1>
      <p className="mt-1 text-sm text-corsa-muted">
        Histórico de fotos vendidas · você recebe {sharePercent}% de cada venda
      </p>
      <SalesHistory
        sales={salesWithNet}
        photographerSharePercent={sharePercent}
      />
    </div>
  );
}
