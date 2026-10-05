import { query, withTransaction } from "@/lib/db/client";
import { DeletionBlockedError } from "@/lib/errors/deletion";
import type { PoolClient } from "pg";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import type { SessionModality } from "@/lib/labels";
import { parseMultiValue } from "@/lib/marketplace-filters";

export type AlbumListItem = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  vehicle_type: string;
  bundle_price_cents: number;
  published_at: Date;
  photo_count: number;
  photos_total_cents: number;
  cover_preview_key: string | null;
  cover_photo_id: string | null;
  photographer_handle: string;
  photographer_name: string;
  modality: SessionModality;
  city: string;
  state: string;
  coverage_date: Date | null;
};

export type AlbumDetail = AlbumListItem & {
  photographer_id: string;
  tags: string[];
};

export type AlbumFilters = {
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

function buildAlbumWhere(filters: AlbumFilters): {
  clauses: string[];
  params: unknown[];
} {
  const clauses = ["a.published_at IS NOT NULL"];
  const params: unknown[] = [];

  if (filters.q) {
    params.push(`%${filters.q}%`);
    clauses.push(
      `(a.title ILIKE $${params.length} OR a.description ILIKE $${params.length} OR a.city ILIKE $${params.length})`,
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
    clauses.push(`a.vehicle_type = $${params.length}`);
  } else if (vehicleTypes.length > 1) {
    params.push(vehicleTypes);
    clauses.push(`a.vehicle_type = ANY($${params.length}::text[])`);
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
    clauses.push(
      `EXISTS (SELECT 1 FROM photos ph WHERE ph.album_id = a.id AND ph.car_brand ILIKE $${params.length})`,
    );
  } else if (carBrands.length > 1) {
    params.push(carBrands);
    clauses.push(
      `EXISTS (SELECT 1 FROM photos ph WHERE ph.album_id = a.id AND ph.car_brand = ANY($${params.length}::text[]))`,
    );
  }

  return { clauses, params };
}

function buildOrderBy(sort?: string): string {
  switch (sort) {
    case "price_asc":
      return "a.bundle_price_cents ASC";
    case "price_desc":
      return "a.bundle_price_cents DESC";
    case "date_asc":
      return "a.coverage_date ASC NULLS LAST";
    case "date_desc":
      return "a.coverage_date DESC NULLS LAST";
    default:
      return "a.published_at DESC";
  }
}

const albumSelect = `
  SELECT
    a.id,
    a.title,
    a.slug,
    a.description,
    a.vehicle_type,
    a.bundle_price_cents,
    a.published_at,
    a.photographer_id,
    a.modality,
    a.city,
    a.state,
    a.coverage_date,
    COUNT(ph.id)::int AS photo_count,
    COALESCE(SUM(ph.price_cents), 0)::int AS photos_total_cents,
    (SELECT p.preview_key FROM photos p WHERE p.album_id = a.id ORDER BY p.taken_at LIMIT 1) AS cover_preview_key,
    (SELECT p.id FROM photos p WHERE p.album_id = a.id ORDER BY p.taken_at LIMIT 1) AS cover_photo_id,
    pp.handle AS photographer_handle,
    u.name AS photographer_name
  FROM albums a
  JOIN photographer_profiles pp ON pp.id = a.photographer_id
  JOIN users u ON u.id = pp.user_id
  LEFT JOIN photos ph ON ph.album_id = a.id
`;

export async function listPublishedAlbums(filters: AlbumFilters = {}): Promise<{
  albums: AlbumListItem[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const page = Math.max(1, filters.page ?? 1);
  const { clauses, params } = buildAlbumWhere(filters);
  const where = clauses.join(" AND ");
  const orderBy = buildOrderBy(filters.sort);

  const countResult = await query<{ count: string }>(
    `SELECT COUNT(DISTINCT a.id)::int AS count
     FROM albums a
     JOIN photographer_profiles pp ON pp.id = a.photographer_id
     WHERE ${where}`,
    params,
  );
  const total = Number(countResult.rows[0]?.count ?? 0);
  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
  const offset = (page - 1) * ITEMS_PER_PAGE;

  const listParams = [...params, ITEMS_PER_PAGE, offset];
  const result = await query<AlbumListItem>(
    `${albumSelect}
     WHERE ${where}
     GROUP BY a.id, pp.handle, u.name
     ORDER BY ${orderBy}
     LIMIT $${listParams.length - 1} OFFSET $${listParams.length}`,
    listParams,
  );

  return { albums: result.rows, total, page, totalPages };
}

export async function findAlbumBySlug(slug: string): Promise<AlbumDetail | null> {
  const result = await query<AlbumDetail>(
    `${albumSelect}
     WHERE a.slug = $1 AND a.published_at IS NOT NULL
     GROUP BY a.id, pp.handle, u.name`,
    [slug],
  );
  const row = result.rows[0];
  if (!row) return null;

  const tagsResult = await query<{ name: string }>(
    `SELECT t.name FROM album_tags at
     JOIN tags t ON t.id = at.tag_id
     WHERE at.album_id = $1`,
    [row.id],
  );

  return { ...row, tags: tagsResult.rows.map((t) => t.name) };
}

export async function listAlbumsByPhotographer(
  profileId: string,
  publishedOnly = true,
): Promise<AlbumListItem[]> {
  const publishedClause = publishedOnly ? "AND a.published_at IS NOT NULL" : "";
  const result = await query<AlbumListItem>(
    `${albumSelect}
     WHERE a.photographer_id = $1 ${publishedClause}
     GROUP BY a.id, pp.handle, u.name
     ORDER BY a.created_at DESC`,
    [profileId],
  );
  return result.rows;
}

export async function listVehicleTypes(): Promise<string[]> {
  const result = await query<{ vehicle_type: string }>(
    `SELECT DISTINCT vehicle_type FROM albums WHERE published_at IS NOT NULL ORDER BY 1`,
  );
  return result.rows.map((r) => r.vehicle_type);
}

export async function listCarBrands(): Promise<string[]> {
  const result = await query<{ car_brand: string }>(
    `SELECT DISTINCT ph.car_brand
     FROM photos ph
     JOIN albums a ON a.id = ph.album_id
     WHERE a.published_at IS NOT NULL AND ph.car_brand IS NOT NULL
     ORDER BY 1`,
  );
  return result.rows.map((r) => r.car_brand);
}

export async function listTagOptions(): Promise<{ slug: string; name: string }[]> {
  const result = await query<{ slug: string; name: string }>(
    `SELECT DISTINCT t.slug, t.name FROM tags t
     JOIN album_tags at ON at.tag_id = t.id
     JOIN albums a ON a.id = at.album_id
     WHERE a.published_at IS NOT NULL
     ORDER BY t.name`,
  );
  return result.rows;
}

export async function findAlbumByIdForPhotographer(
  albumId: string,
  profileId: string,
): Promise<AlbumDetail | null> {
  const result = await query<AlbumDetail>(
    `${albumSelect}
     WHERE a.id = $1 AND a.photographer_id = $2
     GROUP BY a.id, pp.handle, u.name`,
    [albumId, profileId],
  );
  const row = result.rows[0];
  if (!row) return null;

  const tagsResult = await query<{ name: string }>(
    `SELECT t.name FROM album_tags at
     JOIN tags t ON t.id = at.tag_id
     WHERE at.album_id = $1`,
    [row.id],
  );

  return { ...row, tags: tagsResult.rows.map((t) => t.name) };
}

export async function createAlbum(input: {
  photographerId: string;
  title: string;
  slug: string;
  description?: string;
  state: string;
  city: string;
  modality: SessionModality;
  coverageDate?: string;
  vehicleType: string;
  bundlePriceCents: number;
  publish?: boolean;
}): Promise<{ id: string; slug: string }> {
  const result = await query<{ id: string; slug: string }>(
    `INSERT INTO albums (
       photographer_id, title, slug, description, state, city, modality,
       coverage_date, vehicle_type, bundle_price_cents, published_at
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING id, slug`,
    [
      input.photographerId,
      input.title,
      input.slug,
      input.description ?? null,
      input.state.toUpperCase(),
      input.city,
      input.modality,
      input.coverageDate ?? null,
      input.vehicleType,
      input.bundlePriceCents,
      input.publish ? new Date() : null,
    ],
  );
  return result.rows[0];
}

export async function updateAlbum(
  albumId: string,
  profileId: string,
  data: {
    title: string;
    description?: string;
    state: string;
    city: string;
    modality: SessionModality;
    coverageDate?: string;
    vehicleType: string;
    bundlePriceCents: number;
    published: boolean;
  },
): Promise<void> {
  await query(
    `UPDATE albums SET
      title = $3,
      description = $4,
      state = $5,
      city = $6,
      modality = $7,
      coverage_date = $8,
      vehicle_type = $9,
      bundle_price_cents = $10,
      published_at = CASE WHEN $11 THEN COALESCE(published_at, NOW()) ELSE NULL END,
      updated_at = NOW()
     WHERE id = $1 AND photographer_id = $2`,
    [
      albumId,
      profileId,
      data.title,
      data.description ?? null,
      data.state.toUpperCase(),
      data.city,
      data.modality,
      data.coverageDate ?? null,
      data.vehicleType,
      data.bundlePriceCents,
      data.published,
    ],
  );
}

async function albumHasSales(
  client: PoolClient,
  albumId: string,
): Promise<boolean> {
  const result = await client.query<{ has_sales: boolean }>(
    `SELECT EXISTS(
      SELECT 1
      FROM order_items oi
      JOIN photos ph ON ph.id = oi.photo_id
      WHERE ph.album_id = $1
    ) AS has_sales`,
    [albumId],
  );
  return result.rows[0]?.has_sales ?? false;
}

export type DeletedAlbumPhotos = {
  original_key: string;
  preview_key: string;
};

export async function deleteAlbum(
  albumId: string,
  profileId: string,
): Promise<DeletedAlbumPhotos[]> {
  return withTransaction(async (client) => {
    const album = await client.query<{ id: string }>(
      `SELECT id FROM albums WHERE id = $1 AND photographer_id = $2`,
      [albumId, profileId],
    );
    if (!album.rows[0]) return [];

    if (await albumHasSales(client, albumId)) {
      throw new DeletionBlockedError(
        "Este álbum não pode ser excluído porque contém fotos que já foram vendidas. O histórico de pedidos precisa ser preservado.",
      );
    }

    const photos = await client.query<DeletedAlbumPhotos>(
      `SELECT original_key, preview_key FROM photos WHERE album_id = $1`,
      [albumId],
    );

    const deleted = await client.query(
      `DELETE FROM albums WHERE id = $1 AND photographer_id = $2`,
      [albumId, profileId],
    );
    if ((deleted.rowCount ?? 0) === 0) return [];

    return photos.rows;
  });
}

export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
