import { query, withTransaction } from "@/lib/db/client";
import { DeletionBlockedError } from "@/lib/errors/deletion";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import type { SessionModality } from "@/lib/labels";
import { parseMultiValue } from "@/lib/marketplace-filters";

export type PhotoListItem = {
  id: string;
  title: string | null;
  description: string | null;
  car_brand: string | null;
  car_model: string | null;
  car_color: string | null;
  vehicle_type: string | null;
  price_cents: number;
  taken_at: Date;
  preview_key: string;
  album_id: string;
  album_title: string;
  album_slug: string;
  album_city: string;
  album_state: string;
  album_modality: SessionModality;
  photographer_handle: string;
  photographer_name: string;
};

export type PhotoFilters = {
  q?: string;
  modality?: string;
  vehicleType?: string;
  tag?: string;
  city?: string;
  state?: string;
  photographer?: string;
  carBrand?: string;
  sort?: string;
  page?: number;
};

export type PhotoRow = {
  id: string;
  album_id: string;
  original_key: string;
  preview_key: string;
  width: number;
  height: number;
  price_cents: number;
  taken_at: Date;
  title: string | null;
  description: string | null;
  car_brand: string | null;
  car_model: string | null;
  car_color: string | null;
  vehicle_type: string | null;
};

function buildPhotoWhere(filters: PhotoFilters): {
  clauses: string[];
  params: unknown[];
} {
  const clauses = ["a.published_at IS NOT NULL"];
  const params: unknown[] = [];

  if (filters.q) {
    params.push(`%${filters.q}%`);
    clauses.push(
      `(ph.title ILIKE $${params.length}
        OR ph.description ILIKE $${params.length}
        OR ph.car_brand ILIKE $${params.length}
        OR ph.car_model ILIKE $${params.length}
        OR ph.car_color ILIKE $${params.length}
        OR a.title ILIKE $${params.length}
        OR a.city ILIKE $${params.length})`,
    );
  }

  const modalities = parseMultiValue(filters.modality);
  if (modalities.length === 1) {
    params.push(modalities[0]);
    clauses.push(`a.modality = $${params.length}`);
  } else if (modalities.length > 1) {
    params.push(modalities);
    clauses.push(`a.modality = ANY($${params.length}::text[])`);
  }

  const vehicleTypes = parseMultiValue(filters.vehicleType);
  if (vehicleTypes.length === 1) {
    params.push(vehicleTypes[0]);
    clauses.push(
      `COALESCE(ph.vehicle_type, a.vehicle_type) = $${params.length}`,
    );
  } else if (vehicleTypes.length > 1) {
    params.push(vehicleTypes);
    clauses.push(
      `COALESCE(ph.vehicle_type, a.vehicle_type) = ANY($${params.length}::text[])`,
    );
  }

  const tags = parseMultiValue(filters.tag);
  if (tags.length === 1) {
    params.push(tags[0]);
    clauses.push(
      `EXISTS (SELECT 1 FROM album_tags at JOIN tags t ON t.id = at.tag_id WHERE at.album_id = a.id AND t.slug = $${params.length})`,
    );
  } else if (tags.length > 1) {
    params.push(tags);
    clauses.push(
      `EXISTS (SELECT 1 FROM album_tags at JOIN tags t ON t.id = at.tag_id WHERE at.album_id = a.id AND t.slug = ANY($${params.length}::text[]))`,
    );
  }

  if (filters.city) {
    params.push(`%${filters.city}%`);
    clauses.push(`a.city ILIKE $${params.length}`);
  }
  if (filters.state) {
    params.push(filters.state.toUpperCase());
    clauses.push(`a.state = $${params.length}`);
  }
  if (filters.photographer) {
    params.push(filters.photographer);
    clauses.push(`pp.handle = $${params.length}`);
  }

  const carBrands = parseMultiValue(filters.carBrand);
  if (carBrands.length === 1) {
    params.push(carBrands[0]);
    clauses.push(`ph.car_brand ILIKE $${params.length}`);
  } else if (carBrands.length > 1) {
    params.push(carBrands);
    clauses.push(`ph.car_brand = ANY($${params.length}::text[])`);
  }

  return { clauses, params };
}

function buildPhotoOrderBy(sort?: string): string {
  switch (sort) {
    case "price_asc":
      return "ph.price_cents ASC";
    case "price_desc":
      return "ph.price_cents DESC";
    case "date_desc":
      return "ph.taken_at DESC";
    default:
      return "a.published_at DESC, ph.taken_at DESC";
  }
}

const photoListSelect = `
  SELECT
    ph.id,
    ph.title,
    ph.description,
    ph.car_brand,
    ph.car_model,
    ph.car_color,
    ph.vehicle_type,
    ph.price_cents,
    ph.taken_at,
    ph.preview_key,
    a.id AS album_id,
    a.title AS album_title,
    a.slug AS album_slug,
    a.city AS album_city,
    a.state AS album_state,
    a.modality AS album_modality,
    pp.handle AS photographer_handle,
    u.name AS photographer_name
  FROM photos ph
  JOIN albums a ON a.id = ph.album_id
  JOIN photographer_profiles pp ON pp.id = a.photographer_id
  JOIN users u ON u.id = pp.user_id
`;

export async function listPublishedPhotos(filters: PhotoFilters = {}): Promise<{
  photos: PhotoListItem[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const page = Math.max(1, filters.page ?? 1);
  const { clauses, params } = buildPhotoWhere(filters);
  const where = clauses.join(" AND ");
  const orderBy = buildPhotoOrderBy(filters.sort);

  const countResult = await query<{ count: string }>(
    `SELECT COUNT(*)::int AS count
     FROM photos ph
     JOIN albums a ON a.id = ph.album_id
     JOIN photographer_profiles pp ON pp.id = a.photographer_id
     WHERE ${where}`,
    params,
  );
  const total = Number(countResult.rows[0]?.count ?? 0);
  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
  const offset = (page - 1) * ITEMS_PER_PAGE;

  const listParams = [...params, ITEMS_PER_PAGE, offset];
  const result = await query<PhotoListItem>(
    `${photoListSelect}
     WHERE ${where}
     ORDER BY ${orderBy}
     LIMIT $${listParams.length - 1} OFFSET $${listParams.length}`,
    listParams,
  );

  return { photos: result.rows, total, page, totalPages };
}

export async function listPhotosByAlbum(albumId: string): Promise<PhotoRow[]> {
  const result = await query<PhotoRow>(
    `SELECT * FROM photos WHERE album_id = $1 ORDER BY taken_at`,
    [albumId],
  );
  return result.rows;
}

export async function findPhotoById(id: string): Promise<
  (PhotoRow & {
    album_slug: string;
    album_title: string;
    photographer_id: string;
  }) | null
> {
  const result = await query<
    PhotoRow & {
      album_slug: string;
      album_title: string;
      photographer_id: string;
    }
  >(
    `SELECT ph.*, a.slug AS album_slug, a.title AS album_title, a.photographer_id
     FROM photos ph
     JOIN albums a ON a.id = ph.album_id
     WHERE ph.id = $1`,
    [id],
  );
  return result.rows[0] ?? null;
}

export async function insertPhoto(input: {
  albumId: string;
  originalKey: string;
  previewKey: string;
  width: number;
  height: number;
  priceCents: number;
  takenAt: Date;
  title?: string;
  description?: string;
  carBrand?: string;
  carModel?: string;
  carColor?: string;
  vehicleType?: string;
}): Promise<PhotoRow> {
  const result = await query<PhotoRow>(
    `INSERT INTO photos (
       album_id, original_key, preview_key, width, height, price_cents, taken_at,
       title, description, car_brand, car_model, car_color, vehicle_type
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
     RETURNING *`,
    [
      input.albumId,
      input.originalKey,
      input.previewKey,
      input.width,
      input.height,
      input.priceCents,
      input.takenAt,
      input.title ?? null,
      input.description ?? null,
      input.carBrand ?? null,
      input.carModel ?? null,
      input.carColor ?? null,
      input.vehicleType ?? null,
    ],
  );
  return result.rows[0];
}

export async function updatePhotoPrice(
  photoId: string,
  albumId: string,
  profileId: string,
  priceCents: number,
): Promise<boolean> {
  const result = await query(
    `UPDATE photos ph SET price_cents = $4
     FROM albums a
     WHERE ph.id = $1 AND ph.album_id = $2 AND a.id = ph.album_id AND a.photographer_id = $3`,
    [photoId, albumId, profileId, priceCents],
  );
  return (result.rowCount ?? 0) > 0;
}

export async function updatePhotoMetadata(
  photoId: string,
  albumId: string,
  profileId: string,
  data: {
    title?: string;
    description?: string;
    carBrand?: string;
    carModel?: string;
    carColor?: string;
    vehicleType?: string;
  },
): Promise<boolean> {
  const result = await query(
    `UPDATE photos ph SET
       title = $4,
       description = $5,
       car_brand = $6,
       car_model = $7,
       car_color = $8,
       vehicle_type = $9
     FROM albums a
     WHERE ph.id = $1 AND ph.album_id = $2 AND a.id = ph.album_id AND a.photographer_id = $3`,
    [
      photoId,
      albumId,
      profileId,
      data.title ?? null,
      data.description ?? null,
      data.carBrand ?? null,
      data.carModel ?? null,
      data.carColor ?? null,
      data.vehicleType ?? null,
    ],
  );
  return (result.rowCount ?? 0) > 0;
}

export async function deletePhoto(
  photoId: string,
  albumId: string,
  profileId: string,
): Promise<PhotoRow | null> {
  return withTransaction(async (client) => {
    const photoResult = await client.query<PhotoRow>(
      `SELECT ph.*
       FROM photos ph
       JOIN albums a ON a.id = ph.album_id
       WHERE ph.id = $1 AND ph.album_id = $2 AND a.photographer_id = $3`,
      [photoId, albumId, profileId],
    );
    const photo = photoResult.rows[0];
    if (!photo) return null;

    const sales = await client.query<{ has_sales: boolean }>(
      `SELECT EXISTS(SELECT 1 FROM order_items WHERE photo_id = $1) AS has_sales`,
      [photoId],
    );
    if (sales.rows[0]?.has_sales) {
      throw new DeletionBlockedError(
        "Esta foto não pode ser excluída porque já foi vendida. O histórico de pedidos precisa ser preservado.",
      );
    }

    await client.query(`DELETE FROM photos WHERE id = $1`, [photoId]);
    return photo;
  });
}

export async function userOwnsPhoto(
  userId: string,
  photoId: string,
): Promise<boolean> {
  const result = await query<{ exists: boolean }>(
    `SELECT EXISTS(
      SELECT 1 FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE o.buyer_id = $1 AND oi.photo_id = $2 AND o.status = 'paid'
    ) AS exists`,
    [userId, photoId],
  );
  return result.rows[0]?.exists ?? false;
}

export async function listPurchasedPhotos(
  userId: string,
  filters: { q?: string; albumId?: string } = {},
): Promise<
  (PhotoRow & {
    album_title: string;
    album_slug: string;
    album_city: string;
    album_state: string;
    order_id: string;
    purchased_at: Date;
  })[]
> {
  const clauses = [`o.buyer_id = $1`, `o.status = 'paid'`];
  const params: unknown[] = [userId];

  if (filters.q) {
    params.push(`%${filters.q}%`);
    clauses.push(
      `(a.title ILIKE $${params.length} OR ph.title ILIKE $${params.length} OR ph.car_brand ILIKE $${params.length})`,
    );
  }
  if (filters.albumId) {
    params.push(filters.albumId);
    clauses.push(`a.id = $${params.length}`);
  }

  const result = await query<
    PhotoRow & {
      album_title: string;
      album_slug: string;
      album_city: string;
      album_state: string;
      order_id: string;
      purchased_at: Date;
    }
  >(
    `SELECT DISTINCT ON (ph.id)
      ph.*,
      a.title AS album_title,
      a.slug AS album_slug,
      a.city AS album_city,
      a.state AS album_state,
      o.id AS order_id,
      o.paid_at AS purchased_at
     FROM order_items oi
     JOIN orders o ON o.id = oi.order_id
     JOIN photos ph ON ph.id = oi.photo_id
     JOIN albums a ON a.id = ph.album_id
     WHERE ${clauses.join(" AND ")}
     ORDER BY ph.id, o.paid_at DESC`,
    params,
  );
  return result.rows;
}

export async function listFavoritePhotoIds(userId: string): Promise<string[]> {
  const result = await query<{ photo_id: string }>(
    `SELECT photo_id FROM favorites WHERE user_id = $1`,
    [userId],
  );
  return result.rows.map((r) => r.photo_id);
}

export async function listFavoritePhotos(userId: string): Promise<
  (PhotoRow & {
    album_title: string;
    album_slug: string;
    album_city: string;
    album_state: string;
    favorited_at: Date;
  })[]
> {
  const result = await query<
    PhotoRow & {
      album_title: string;
      album_slug: string;
      album_city: string;
      album_state: string;
      favorited_at: Date;
    }
  >(
    `SELECT ph.*,
            a.title AS album_title,
            a.slug AS album_slug,
            a.city AS album_city,
            a.state AS album_state,
            f.created_at AS favorited_at
     FROM favorites f
     JOIN photos ph ON ph.id = f.photo_id
     JOIN albums a ON a.id = ph.album_id
     WHERE f.user_id = $1 AND a.published_at IS NOT NULL
     ORDER BY f.created_at DESC`,
    [userId],
  );
  return result.rows;
}

export async function toggleFavorite(
  userId: string,
  photoId: string,
): Promise<boolean> {
  const existing = await query(
    `SELECT 1 FROM favorites WHERE user_id = $1 AND photo_id = $2`,
    [userId, photoId],
  );
  if ((existing.rowCount ?? 0) > 0) {
    await query(`DELETE FROM favorites WHERE user_id = $1 AND photo_id = $2`, [
      userId,
      photoId,
    ]);
    return false;
  }
  await query(
    `INSERT INTO favorites (user_id, photo_id) VALUES ($1, $2)`,
    [userId, photoId],
  );
  return true;
}

export async function resolveCartPhotos(
  photoIds: string[],
): Promise<
  (PhotoRow & {
    album_title: string;
    photographer_id: string;
    bundle_price_cents: number;
  })[]
> {
  if (photoIds.length === 0) return [];
  const result = await query<
    PhotoRow & {
      album_title: string;
      photographer_id: string;
      bundle_price_cents: number;
    }
  >(
    `SELECT ph.*, a.title AS album_title, a.photographer_id, a.bundle_price_cents
     FROM photos ph
     JOIN albums a ON a.id = ph.album_id
     WHERE ph.id = ANY($1::uuid[]) AND a.published_at IS NOT NULL`,
    [photoIds],
  );
  return result.rows;
}

export async function resolveCartAlbums(albumIds: string[]): Promise<
  {
    id: string;
    title: string;
    slug: string;
    bundle_price_cents: number;
    photographer_id: string;
    photo_count: number;
  }[]
> {
  if (albumIds.length === 0) return [];
  const result = await query<{
    id: string;
    title: string;
    slug: string;
    bundle_price_cents: number;
    photographer_id: string;
    photo_count: string;
  }>(
    `SELECT a.id, a.title, a.slug, a.bundle_price_cents, a.photographer_id,
            COUNT(ph.id)::int AS photo_count
     FROM albums a
     LEFT JOIN photos ph ON ph.album_id = a.id
     WHERE a.id = ANY($1::uuid[]) AND a.published_at IS NOT NULL
     GROUP BY a.id`,
    [albumIds],
  );
  return result.rows.map((r) => ({
    ...r,
    photo_count: Number(r.photo_count),
  }));
}

export async function listPhotosForAlbumPurchase(
  albumId: string,
): Promise<PhotoRow[]> {
  return listPhotosByAlbum(albumId);
}
