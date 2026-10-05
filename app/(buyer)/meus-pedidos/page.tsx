export const dynamic = "force-dynamic";

import { requireBuyer } from "@/lib/auth/current-user";
import { listOrdersByBuyer, listOrderItems } from "@/lib/queries/orders";
import { OrderList } from "@/components/buyer/OrderList";
import { EmptyState } from "@/components/ui/EmptyState";
import { Receipt } from "lucide-react";

export default async function MeusPedidosPage() {
  const user = await requireBuyer();
  const orders = await listOrdersByBuyer(user.id);

  if (orders.length === 0) {
    return (
      <div>
        <h1 className="font-heading text-2xl font-bold text-corsa-wine">
          Meus pedidos
        </h1>
        <EmptyState
          icon={<Receipt className="size-7" />}
          title="Nenhum pedido"
          description="Seu histórico de compras aparecerá aqui."
          actionLabel="Ir ao marketplace"
          actionHref="/marketplace"
          className="mt-8"
        />
      </div>
    );
  }

  const ordersWithItems = await Promise.all(
    orders.map(async (order) => ({
      id: order.id,
      status: order.status,
      total_cents: order.total_cents,
      payment_method: order.payment_method,
      created_at: order.created_at.toISOString(),
      items: (await listOrderItems(order.id)).map((item) => ({
        id: item.id,
        photo_id: item.photo_id,
        unit_price_cents: item.unit_price_cents,
        photo_title: item.photo_title ?? null,
        album_title: item.album_title ?? "",
      })),
    })),
  );

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-corsa-wine">
        Meus pedidos
      </h1>
      <p className="mt-1 text-sm text-corsa-muted">
        Clique em um pedido para ver os itens comprados
      </p>
      <OrderList orders={ordersWithItems} />
    </div>
  );
}
