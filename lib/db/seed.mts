import pg from "pg";
import { hashPassword } from "../auth/password";
import { getPoolConfig } from "./pool-config";
import {
  downloadImage,
  ensureStorageDirs,
  savePhotoFromBuffer,
} from "../media/storage";

import sharp from "sharp";

async function loadSeedImage(url: string, index: number): Promise<Buffer> {
  try {
    return await downloadImage(url);
  } catch {
    return sharp({
      create: {
        width: 1400,
        height: 933,
        channels: 3,
        background: {
          r: 40 + (index % 5) * 40,
          g: 50,
          b: 60 + (index % 3) * 30,
        },
      },
    })
      .jpeg()
      .toBuffer();
  }
}

const { Pool } = pg;

const SAMPLE_IMAGES = [
  "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1400&q=80",
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1400&q=80",
  "https://images.unsplash.com/photo-1583121274602-3e2820c587ab?w=1400&q=80",
  "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1400&q=80",
  "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1400&q=80",
  "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1400&q=80",
  "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=1400&q=80",
  "https://images.unsplash.com/photo-1494976388531-d1058498cdd8?w=1400&q=80",
  "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=1400&q=80",
  "https://images.unsplash.com/photo-1619767886555-efeb59887337?w=1400&q=80",
  "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=1400&q=80",
  "https://images.unsplash.com/photo-1563720223185-11003a516935?w=1400&q=80",
];

const PHOTO_METADATA = [
  { car_brand: "Nissan", car_model: "Silvia S15", car_color: "Verde", vehicle_type: "Cupê" },
  { car_brand: "Chevrolet", car_model: "Camaro SS", car_color: "Amarelo", vehicle_type: "Muscle" },
  { car_brand: "Porsche", car_model: "911 GT3", car_color: "Branco", vehicle_type: "Cupê" },
  { car_brand: "Toyota", car_model: "Supra MK4", car_color: "Laranja", vehicle_type: "Cupê" },
  { car_brand: "BMW", car_model: "M3 E46", car_color: "Azul", vehicle_type: "Sedan" },
  { car_brand: "Ford", car_model: "Mustang", car_color: "Vermelho", vehicle_type: "Muscle" },
];

async function clearDatabase(pool: pg.Pool): Promise<void> {
  await pool.query(`
    TRUNCATE favorites, order_items, orders, payouts, photos, album_tags, tags, albums, photographer_profiles, users RESTART IDENTITY CASCADE
  `);
}

async function main(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set");

  const pool = new Pool(getPoolConfig(connectionString));
  const passwordHash = hashPassword("senha123");

  try {
    await clearDatabase(pool);
    await ensureStorageDirs();

    await pool.query(
      `INSERT INTO users (name, email, password_hash, role, accepted_terms_at)
       VALUES ('Admin Corsa', 'admin@corsa.dev', $1, 'admin', NOW())
       ON CONFLICT (email) DO NOTHING`,
      [passwordHash],
    );

    const settingsResult = await pool.query<{ platform_fee_percent: number }>(
      `SELECT platform_fee_percent FROM site_settings WHERE id = 1`,
    );
    const platformFeePercent =
      settingsResult.rows[0]?.platform_fee_percent ?? 15;

    const photographers = [
      {
        name: "Marcos Silva",
        email: "marcos@corsa.dev",
        handle: "marcos-silva",
        bio: "Fotografo de drift e arrancada no sudeste. Cobertura de paddock e acao na pista.",
      },
      {
        name: "Ana Costa",
        email: "ana@corsa.dev",
        handle: "ana-costa",
        bio: "Retratos de exibicao e detalhes de preparacao. Olhar sensivel para classics e tuning.",
      },
      {
        name: "Ricardo Mendes",
        email: "ricardo@corsa.dev",
        handle: "ricardo-mendes",
        bio: "Cobertura de autodromo e endurance. Foco em curvas, boxes e chegadas.",
      },
    ];

    const photographerIds: string[] = [];

    for (const p of photographers) {
      const userResult = await pool.query<{ id: string }>(
        `INSERT INTO users (name, email, password_hash, role, accepted_terms_at)
         VALUES ($1, $2, $3, 'photographer', NOW()) RETURNING id`,
        [p.name, p.email, passwordHash],
      );
      const userId = userResult.rows[0].id;
      const profileResult = await pool.query<{ id: string }>(
        `INSERT INTO photographer_profiles (user_id, handle, bio, specialties)
         VALUES ($1, $2, $3, $4::jsonb) RETURNING id`,
        [
          userId,
          p.handle,
          p.bio,
          JSON.stringify(["Pista", "Drift", "Exibicao"]),
        ],
      );
      photographerIds.push(profileResult.rows[0].id);
    }

    const buyerResult = await pool.query<{ id: string }>(
      `INSERT INTO users (name, email, password_hash, role, billing_city, billing_state, accepted_terms_at)
       VALUES ($1, $2, $3, 'buyer', 'Sao Paulo', 'SP', NOW()) RETURNING id`,
      ["Felipe Rocha", "felipe@corsa.dev", passwordHash],
    );
    const buyerId = buyerResult.rows[0].id;

    const tags = [
      { name: "Drift", slug: "drift" },
      { name: "Muscle", slug: "muscle" },
      { name: "JDM", slug: "jdm" },
      { name: "Clássicos", slug: "classicos" },
    ];

    const tagIds: Record<string, string> = {};
    for (const t of tags) {
      const result = await pool.query<{ id: string }>(
        `INSERT INTO tags (name, slug) VALUES ($1, $2) RETURNING id`,
        [t.name, t.slug],
      );
      tagIds[t.slug] = result.rows[0].id;
    }

    const albums = [
      {
        photographerIndex: 0,
        title: "Fumaca e angulo na curva do S",
        slug: "fumaca-angulo-curva-s",
        modality: "drift",
        city: "Sao Paulo",
        state: "SP",
        coverage_date: "2025-11-15",
        vehicle_type: "Drift",
        bundle_price_cents: 8900,
        tags: ["drift", "jdm"],
      },
      {
        photographerIndex: 0,
        title: "Largadas Velopark",
        slug: "largadas-velopark",
        modality: "arrancada",
        city: "Nova Santa Rita",
        state: "RS",
        coverage_date: "2025-09-08",
        vehicle_type: "Arrancada",
        bundle_price_cents: 7500,
        tags: ["muscle"],
      },
      {
        photographerIndex: 1,
        title: "Stand e detalhes Expo Low",
        slug: "stand-detalhes-expo-low",
        modality: "exibicao",
        city: "Curitiba",
        state: "PR",
        coverage_date: "2025-10-20",
        vehicle_type: "Exibicao",
        bundle_price_cents: 9900,
        tags: ["classicos", "jdm"],
      },
      {
        photographerIndex: 1,
        title: "Encontro noturno de classics",
        slug: "encontro-noturno-classics",
        modality: "exibicao",
        city: "Curitiba",
        state: "PR",
        coverage_date: "2025-10-20",
        vehicle_type: "Exibicao",
        bundle_price_cents: 8200,
        tags: ["classicos"],
      },
      {
        photographerIndex: 2,
        title: "Boxes e pit lane Cascavel",
        slug: "boxes-pit-lane-cascavel",
        modality: "autodromo",
        city: "Cascavel",
        state: "PR",
        coverage_date: "2025-08-30",
        vehicle_type: "GT",
        bundle_price_cents: 11200,
        tags: ["muscle"],
      },
      {
        photographerIndex: 2,
        title: "Bandeirada e chegada",
        slug: "bandeirada-chegada",
        modality: "autodromo",
        city: "Cascavel",
        state: "PR",
        coverage_date: "2025-08-30",
        vehicle_type: "Endurance",
        bundle_price_cents: 10500,
        tags: ["muscle", "drift"],
      },
    ];

    const albumIds: string[] = [];
    const allPhotoRows: {
      id: string;
      album_id: string;
      price_cents: number;
      photographer_id: string;
    }[] = [];

    let imageIndex = 0;

    for (const album of albums) {
      const result = await pool.query<{ id: string }>(
        `INSERT INTO albums (
           photographer_id, title, slug, description, state, city, modality,
           coverage_date, vehicle_type, bundle_price_cents, published_at
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW()) RETURNING id`,
        [
          photographerIds[album.photographerIndex],
          album.title,
          album.slug,
          "Cobertura completa com fotos selecionadas para entrega digital.",
          album.state,
          album.city,
          album.modality,
          album.coverage_date,
          album.vehicle_type,
          album.bundle_price_cents,
        ],
      );
      const albumId = result.rows[0].id;
      albumIds.push(albumId);

      for (const tagSlug of album.tags) {
        await pool.query(
          `INSERT INTO album_tags (album_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [albumId, tagIds[tagSlug]],
        );
      }

      const photoCount = 4 + (albumIds.length % 3);
      for (let i = 0; i < photoCount; i++) {
        const url = SAMPLE_IMAGES[imageIndex % SAMPLE_IMAGES.length];
        imageIndex += 1;
        console.log(`Downloading ${url}`);
        const buffer = await loadSeedImage(url, imageIndex);
        const saved = await savePhotoFromBuffer(buffer);
        const price = 1800 + i * 200;
        const meta = PHOTO_METADATA[imageIndex % PHOTO_METADATA.length];
        const photoResult = await pool.query<{
          id: string;
          album_id: string;
          price_cents: number;
        }>(
          `INSERT INTO photos (
             album_id, original_key, preview_key, width, height, price_cents, taken_at,
             title, car_brand, car_model, car_color, vehicle_type
           )
           VALUES ($1, $2, $3, $4, $5, $6, NOW() - ($7 || ' hours')::interval, $8, $9, $10, $11, $12)
           RETURNING id, album_id, price_cents`,
          [
            albumId,
            saved.originalKey,
            saved.previewKey,
            saved.width,
            saved.height,
            price,
            String(i * 2),
            `${meta.car_brand} ${meta.car_model}`,
            meta.car_brand,
            meta.car_model,
            meta.car_color,
            meta.vehicle_type,
          ],
        );
        allPhotoRows.push({
          ...photoResult.rows[0],
          photographer_id: photographerIds[album.photographerIndex],
        });
      }
    }

    const purchasedPhotos = allPhotoRows.slice(0, 6);
    const subtotal = purchasedPhotos.reduce((s, p) => s + p.price_cents, 0);
    const platformFee = Math.round(subtotal * platformFeePercent / 100);

    const orderResult = await pool.query<{ id: string }>(
      `INSERT INTO orders (buyer_id, status, subtotal_cents, platform_fee_cents, total_cents, payment_method, paid_at)
       VALUES ($1, 'paid', $2, $3, $4, 'pix', NOW() - INTERVAL '3 days') RETURNING id`,
      [buyerId, subtotal, platformFee, subtotal],
    );
    const orderId = orderResult.rows[0].id;

    for (const photo of purchasedPhotos) {
      await pool.query(
        `INSERT INTO order_items (order_id, photo_id, album_id, photographer_id, unit_price_cents)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          orderId,
          photo.id,
          photo.album_id,
          photo.photographer_id,
          photo.price_cents,
        ],
      );
    }

    await pool.query(
      `INSERT INTO payouts (photographer_id, amount_cents, status, completed_at)
       VALUES ($1, 4500, 'completed', NOW() - INTERVAL '10 days')`,
      [photographerIds[0]],
    );

    await pool.query(
      `INSERT INTO payouts (photographer_id, amount_cents, status, completed_at)
       VALUES ($1, 3200, 'completed', NOW() - INTERVAL '5 days')`,
      [photographerIds[1]],
    );

    console.log("Seed concluido");
    console.log("Admin: admin@corsa.dev");
    console.log("Fotografos: marcos@corsa.dev, ana@corsa.dev, ricardo@corsa.dev");
    console.log("Comprador: felipe@corsa.dev");
    console.log("Senha padrao: senha123");
  } finally {
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
