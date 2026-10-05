import { query } from "@/lib/db/client";
import { getPhotographerShareRate } from "@/lib/constants";

export type PhotographerRow = {
  id: string;
  user_id: string;
  handle: string;
  bio: string | null;
  avatar_key: string | null;
  cover_key: string | null;
  specialties: string[];
  name: string;
  album_count: number;
  photo_count: number;
};

export async function createPhotographerProfile(input: {
  userId: string;
  handle: string;
  bio?: string;
  specialties?: string[];
}): Promise<{ id: string; handle: string }> {
  const result = await query<{ id: string; handle: string }>(
    `INSERT INTO photographer_profiles (user_id, handle, bio, specialties)
     VALUES ($1, $2, $3, $4::jsonb)
     RETURNING id, handle`,
    [
      input.userId,
      input.handle,
      input.bio ?? null,
      JSON.stringify(input.specialties ?? []),
    ],
  );
  return result.rows[0];
}

export async function listPhotographers(): Promise<PhotographerRow[]> {
  const result = await query<PhotographerRow>(
    `SELECT
      pp.*,
      u.name,
      COUNT(DISTINCT a.id)::int AS album_count,
      COUNT(DISTINCT ph.id)::int AS photo_count
     FROM photographer_profiles pp
     JOIN users u ON u.id = pp.user_id
     LEFT JOIN albums a ON a.photographer_id = pp.id AND a.published_at IS NOT NULL
     LEFT JOIN photos ph ON ph.album_id = a.id
     GROUP BY pp.id, u.name
     ORDER BY u.name`,
  );
  return result.rows.map((row) => ({
    ...row,
    specialties: Array.isArray(row.specialties)
      ? row.specialties
      : JSON.parse(String(row.specialties ?? "[]")),
  }));
}

export async function findPhotographerByHandle(
  handle: string,
): Promise<PhotographerRow | null> {
  const result = await query<PhotographerRow>(
    `SELECT
      pp.*,
      u.name,
      COUNT(DISTINCT a.id)::int AS album_count,
      COUNT(DISTINCT ph.id)::int AS photo_count
     FROM photographer_profiles pp
     JOIN users u ON u.id = pp.user_id
     LEFT JOIN albums a ON a.photographer_id = pp.id AND a.published_at IS NOT NULL
     LEFT JOIN photos ph ON ph.album_id = a.id
     WHERE pp.handle = $1
     GROUP BY pp.id, u.name`,
    [handle],
  );
  const row = result.rows[0];
  if (!row) return null;
  return {
    ...row,
    specialties: Array.isArray(row.specialties)
      ? row.specialties
      : JSON.parse(String(row.specialties ?? "[]")),
  };
}

export async function findPhotographerByUserId(
  userId: string,
): Promise<PhotographerRow | null> {
  const result = await query<PhotographerRow>(
    `SELECT pp.*, u.name, 0 AS album_count, 0 AS photo_count
     FROM photographer_profiles pp
     JOIN users u ON u.id = pp.user_id
     WHERE pp.user_id = $1`,
    [userId],
  );
  const row = result.rows[0];
  if (!row) return null;
  return {
    ...row,
    specialties: Array.isArray(row.specialties)
      ? row.specialties
      : JSON.parse(String(row.specialties ?? "[]")),
  };
}

export async function updatePhotographerProfile(
  profileId: string,
  data: { handle: string; bio?: string; specialties: string[] },
): Promise<void> {
  await query(
    `UPDATE photographer_profiles SET
      handle = $2,
      bio = $3,
      specialties = $4::jsonb,
      updated_at = NOW()
     WHERE id = $1`,
    [profileId, data.handle, data.bio ?? null, JSON.stringify(data.specialties)],
  );
}

export async function updatePhotographerAvatar(
  profileId: string,
  avatarKey: string | null,
): Promise<void> {
  await query(
    `UPDATE photographer_profiles SET avatar_key = $2, updated_at = NOW() WHERE id = $1`,
    [profileId, avatarKey],
  );
}

export async function getPhotographerStats(profileId: string): Promise<{
  albumCount: number;
  photoCount: number;
  salesCount: number;
  revenueCents: number;
  balanceCents: number;
}> {
  const result = await query<{
    album_count: string;
    photo_count: string;
    sales_count: string;
    revenue_cents: string;
    paid_out_cents: string;
  }>(
    `SELECT
      (SELECT COUNT(*) FROM albums WHERE photographer_id = $1 AND published_at IS NOT NULL)::int AS album_count,
      (SELECT COUNT(*) FROM photos ph JOIN albums a ON a.id = ph.album_id WHERE a.photographer_id = $1)::int AS photo_count,
      (SELECT COUNT(DISTINCT oi.order_id) FROM order_items oi WHERE oi.photographer_id = $1)::int AS sales_count,
      COALESCE((SELECT SUM(oi.unit_price_cents) FROM order_items oi JOIN orders o ON o.id = oi.order_id WHERE oi.photographer_id = $1 AND o.status = 'paid'), 0)::int AS revenue_cents,
      COALESCE((SELECT SUM(amount_cents) FROM payouts WHERE photographer_id = $1 AND status = 'completed'), 0)::int AS paid_out_cents`,
    [profileId],
  );
  const row = result.rows[0];
  const revenueCents = Number(row?.revenue_cents ?? 0);
  const shareRate = await getPhotographerShareRate();
  const photographerShare = Math.floor(revenueCents * shareRate);
  const paidOut = Number(row?.paid_out_cents ?? 0);
  return {
    albumCount: Number(row?.album_count ?? 0),
    photoCount: Number(row?.photo_count ?? 0),
    salesCount: Number(row?.sales_count ?? 0),
    revenueCents: photographerShare,
    balanceCents: photographerShare - paidOut,
  };
}

export async function getMonthlySales(profileId: string): Promise<
  { month: string; total: number }[]
> {
  const result = await query<{ month: string; total: string }>(
    `SELECT TO_CHAR(o.paid_at, 'YYYY-MM') AS month,
            COALESCE(SUM(oi.unit_price_cents), 0)::int AS total
     FROM order_items oi
     JOIN orders o ON o.id = oi.order_id
     WHERE oi.photographer_id = $1 AND o.status = 'paid' AND o.paid_at IS NOT NULL
       AND o.paid_at >= NOW() - INTERVAL '6 months'
     GROUP BY 1
     ORDER BY 1`,
    [profileId],
  );
  const shareRate = await getPhotographerShareRate();
  return result.rows.map((r) => ({
    month: r.month,
    total: Math.floor(Number(r.total) * shareRate),
  }));
}
