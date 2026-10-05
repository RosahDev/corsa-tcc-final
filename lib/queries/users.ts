import { query } from "@/lib/db/client";
import { DeletionBlockedError } from "@/lib/errors/deletion";

export type UserRow = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: "buyer" | "photographer" | "admin";
  billing_street: string | null;
  billing_number: string | null;
  billing_complement: string | null;
  billing_neighborhood: string | null;
  billing_city: string | null;
  billing_state: string | null;
  billing_zip: string | null;
  accepted_terms_at: Date | null;
  created_at: Date;
  photographer_profile_id?: string | null;
  handle?: string | null;
};

const userSelect = `
  SELECT u.*, pp.id AS photographer_profile_id, pp.handle
  FROM users u
  LEFT JOIN photographer_profiles pp ON pp.user_id = u.id
`;

export async function findUserByEmail(email: string): Promise<UserRow | null> {
  const result = await query<UserRow>(
    `${userSelect} WHERE LOWER(u.email) = LOWER($1) LIMIT 1`,
    [email],
  );
  return result.rows[0] ?? null;
}

export async function findUserById(id: string): Promise<UserRow | null> {
  const result = await query<UserRow>(
    `${userSelect} WHERE u.id = $1 LIMIT 1`,
    [id],
  );
  return result.rows[0] ?? null;
}

export async function createUser(input: {
  name: string;
  email: string;
  passwordHash: string;
  role: "buyer" | "photographer" | "admin";
}): Promise<UserRow> {
  const result = await query<UserRow>(
    `INSERT INTO users (name, email, password_hash, role, accepted_terms_at)
     VALUES ($1, $2, $3, $4, NOW())
     RETURNING *`,
    [input.name, input.email, input.passwordHash, input.role],
  );
  return result.rows[0];
}

export async function updateUserProfile(
  userId: string,
  data: {
    name: string;
    billingStreet?: string;
    billingNumber?: string;
    billingComplement?: string;
    billingNeighborhood?: string;
    billingCity?: string;
    billingState?: string;
    billingZip?: string;
  },
): Promise<void> {
  await query(
    `UPDATE users SET
      name = $2,
      billing_street = $3,
      billing_number = $4,
      billing_complement = $5,
      billing_neighborhood = $6,
      billing_city = $7,
      billing_state = $8,
      billing_zip = $9,
      updated_at = NOW()
     WHERE id = $1`,
    [
      userId,
      data.name,
      data.billingStreet ?? null,
      data.billingNumber ?? null,
      data.billingComplement ?? null,
      data.billingNeighborhood ?? null,
      data.billingCity ?? null,
      data.billingState ?? null,
      data.billingZip ?? null,
    ],
  );
}

export async function updateUserPassword(
  userId: string,
  passwordHash: string,
): Promise<void> {
  await query(
    `UPDATE users SET password_hash = $2, updated_at = NOW() WHERE id = $1`,
    [userId, passwordHash],
  );
}

export async function deleteUser(userId: string): Promise<void> {
  const buyerOrders = await query<{ exists: boolean }>(
    `SELECT EXISTS(SELECT 1 FROM orders WHERE buyer_id = $1) AS exists`,
    [userId],
  );
  if (buyerOrders.rows[0]?.exists) {
    throw new DeletionBlockedError(
      "Sua conta não pode ser excluída porque você possui pedidos registrados. Entre em contato com o suporte se precisar de ajuda.",
    );
  }

  const photographerSales = await query<{ exists: boolean }>(
    `SELECT EXISTS(
      SELECT 1
      FROM order_items oi
      JOIN photographer_profiles pp ON pp.id = oi.photographer_id
      WHERE pp.user_id = $1
    ) AS exists`,
    [userId],
  );
  if (photographerSales.rows[0]?.exists) {
    throw new DeletionBlockedError(
      "Sua conta não pode ser excluída porque existem vendas vinculadas ao seu perfil de fotógrafo. O histórico de pedidos precisa ser preservado.",
    );
  }

  await query(`DELETE FROM users WHERE id = $1`, [userId]);
}

export async function isHandleTaken(handle: string): Promise<boolean> {
  const result = await query<{ exists: boolean }>(
    `SELECT EXISTS(SELECT 1 FROM photographer_profiles WHERE handle = $1) AS exists`,
    [handle],
  );
  return result.rows[0]?.exists ?? false;
}

export async function isEmailTaken(email: string): Promise<boolean> {
  const result = await query<{ exists: boolean }>(
    `SELECT EXISTS(SELECT 1 FROM users WHERE LOWER(email) = LOWER($1)) AS exists`,
    [email],
  );
  return result.rows[0]?.exists ?? false;
}
