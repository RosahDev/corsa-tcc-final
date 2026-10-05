import { query, withTransaction } from "@/lib/db/client";
import { getPlatformFeeRate } from "@/lib/constants";
import type { PoolClient } from "pg";

export type OrderRow = {
  id: string;
  buyer_id: string;
  status: string;
  subtotal_cents: number;
  platform_fee_cents: number;
  total_cents: number;
  payment_method: string;
  paid_at: Date | null;
  created_at: Date;
  item_count?: number;
};

export type OrderItemRow = {
  id: string;
  order_id: string;
  photo_id: string;
  album_id: string | null;
  photographer_id: string;
  unit_price_cents: number;
  photo_preview_key?: string;
  photo_title?: string | null;
  album_title?: string;
};

export type PhotographerSaleRow = {
  id: string;
  order_id: string;
  photo_id: string;
  unit_price_cents: number;
  created_at: Date;
  paid_at: Date | null;
  photo_title: string | null;
  album_title: string;
  album_id: string;
};

export async function listOrdersByBuyer(userId: string): Promise<OrderRow[]> {
  const result = await query<OrderRow>(
    `SELECT o.*, COUNT(oi.id)::int AS item_count
     FROM orders o
     LEFT JOIN order_items oi ON oi.order_id = o.id
     WHERE o.buyer_id = $1
     GROUP BY o.id
     ORDER BY o.created_at DESC`,
    [userId],
  );
  return result.rows;
}

export async function findOrderById(
  orderId: string,
  buyerId: string,
): Promise<OrderRow | null> {
  const result = await query<OrderRow>(
    `SELECT * FROM orders WHERE id = $1 AND buyer_id = $2`,
    [orderId, buyerId],
  );
  return result.rows[0] ?? null;
}

export async function listOrderItems(orderId: string): Promise<OrderItemRow[]> {
  const result = await query<OrderItemRow>(
    `SELECT oi.*, ph.preview_key AS photo_preview_key, ph.title AS photo_title, a.title AS album_title
     FROM order_items oi
     JOIN photos ph ON ph.id = oi.photo_id
     JOIN albums a ON a.id = ph.album_id
     WHERE oi.order_id = $1
     ORDER BY a.title, ph.taken_at`,
    [orderId],
  );
  return result.rows;
}

export async function listSalesByPhotographer(
  photographerId: string,
): Promise<PhotographerSaleRow[]> {
  const result = await query<PhotographerSaleRow>(
    `SELECT
      oi.id,
      oi.order_id,
      oi.photo_id,
      oi.unit_price_cents,
      oi.created_at,
      o.paid_at,
      ph.title AS photo_title,
      a.title AS album_title,
      a.id AS album_id
     FROM order_items oi
     JOIN orders o ON o.id = oi.order_id
     JOIN photos ph ON ph.id = oi.photo_id
     JOIN albums a ON a.id = ph.album_id
     WHERE oi.photographer_id = $1 AND o.status = 'paid'
     ORDER BY o.paid_at DESC NULLS LAST, oi.created_at DESC`,
    [photographerId],
  );
  return result.rows;
}

export async function countSalesByAlbum(albumId: string): Promise<number> {
  const result = await query<{ count: string }>(
    `SELECT COUNT(*)::int AS count
     FROM order_items oi
     JOIN photos ph ON ph.id = oi.photo_id
     JOIN orders o ON o.id = oi.order_id
     WHERE ph.album_id = $1 AND o.status = 'paid'`,
    [albumId],
  );
  return Number(result.rows[0]?.count ?? 0);
}

export async function countSalesByAlbums(
  photographerId: string,
): Promise<Record<string, number>> {
  const result = await query<{ album_id: string; sales_count: string }>(
    `SELECT ph.album_id, COUNT(*)::int AS sales_count
     FROM order_items oi
     JOIN photos ph ON ph.id = oi.photo_id
     JOIN orders o ON o.id = oi.order_id
     WHERE oi.photographer_id = $1 AND o.status = 'paid'
     GROUP BY ph.album_id`,
    [photographerId],
  );
  return Object.fromEntries(
    result.rows.map((row) => [row.album_id, Number(row.sales_count)]),
  );
}

export async function countSalesByPhotos(
  albumId: string,
): Promise<Record<string, number>> {
  const result = await query<{ photo_id: string; sales_count: string }>(
    `SELECT oi.photo_id, COUNT(*)::int AS sales_count
     FROM order_items oi
     JOIN photos ph ON ph.id = oi.photo_id
     JOIN orders o ON o.id = oi.order_id
     WHERE ph.album_id = $1 AND o.status = 'paid'
     GROUP BY oi.photo_id`,
    [albumId],
  );
  return Object.fromEntries(
    result.rows.map((row) => [row.photo_id, Number(row.sales_count)]),
  );
}

export type CheckoutLine = {
  photoId: string;
  albumId: string;
  photographerId: string;
  unitPriceCents: number;
};

export async function createPaidOrder(input: {
  buyerId: string;
  paymentMethod: "card" | "pix";
  lines: CheckoutLine[];
}): Promise<{ orderId: string }> {
  const subtotal = input.lines.reduce((sum, line) => sum + line.unitPriceCents, 0);
  const platformFeeRate = await getPlatformFeeRate();
  const platformFee = Math.round(subtotal * platformFeeRate);
  const total = subtotal;

  return withTransaction(async (client: PoolClient) => {
    const orderResult = await client.query<{ id: string }>(
      `INSERT INTO orders (buyer_id, status, subtotal_cents, platform_fee_cents, total_cents, payment_method, paid_at)
       VALUES ($1, 'paid', $2, $3, $4, $5, NOW())
       RETURNING id`,
      [input.buyerId, subtotal, platformFee, total, input.paymentMethod],
    );
    const orderId = orderResult.rows[0].id;

    for (const line of input.lines) {
      await client.query(
        `INSERT INTO order_items (order_id, photo_id, album_id, photographer_id, unit_price_cents)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          orderId,
          line.photoId,
          line.albumId,
          line.photographerId,
          line.unitPriceCents,
        ],
      );
    }

    return { orderId };
  });
}

export async function countPaidOrders(): Promise<number> {
  const result = await query<{ count: string }>(
    `SELECT COUNT(*)::int AS count FROM orders WHERE status = 'paid'`,
  );
  return Number(result.rows[0]?.count ?? 0);
}

export async function countDailyUploads(): Promise<number> {
  return 128;
}

export async function countPublishedAlbums(): Promise<number> {
  const result = await query<{ count: string }>(
    `SELECT COUNT(*)::int AS count FROM albums WHERE published_at IS NOT NULL`,
  );
  return Number(result.rows[0]?.count ?? 0);
}

export async function countCitiesCovered(): Promise<number> {
  const result = await query<{ count: string }>(
    `SELECT COUNT(DISTINCT (state, city))::int AS count FROM albums WHERE published_at IS NOT NULL`,
  );
  return Number(result.rows[0]?.count ?? 0);
}
