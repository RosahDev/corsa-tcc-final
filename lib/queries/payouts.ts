import { query } from "@/lib/db/client";

export type PayoutRow = {
  id: string;
  photographer_id: string;
  amount_cents: number;
  status: "pending" | "completed" | "failed";
  requested_at: Date;
  completed_at: Date | null;
};

export async function listPayoutsByPhotographer(
  profileId: string,
): Promise<PayoutRow[]> {
  const result = await query<PayoutRow>(
    `SELECT * FROM payouts WHERE photographer_id = $1 ORDER BY requested_at DESC`,
    [profileId],
  );
  return result.rows;
}

export async function createPayout(
  profileId: string,
  amountCents: number,
): Promise<PayoutRow> {
  const result = await query<PayoutRow>(
    `INSERT INTO payouts (photographer_id, amount_cents, status, completed_at)
     VALUES ($1, $2, 'completed', NOW())
     RETURNING *`,
    [profileId, amountCents],
  );
  return result.rows[0];
}

export async function getPendingPayoutTotal(profileId: string): Promise<number> {
  const result = await query<{ total: string }>(
    `SELECT COALESCE(SUM(amount_cents), 0)::int AS total
     FROM payouts WHERE photographer_id = $1 AND status = 'pending'`,
    [profileId],
  );
  return Number(result.rows[0]?.total ?? 0);
}
