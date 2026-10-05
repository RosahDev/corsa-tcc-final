import { unstable_cache } from "next/cache";
import { query } from "@/lib/db/client";
import { DEFAULT_PLATFORM_FEE_PERCENT } from "@/lib/share";

export type ContentBlockType =
  | "heading"
  | "subheading"
  | "paragraph"
  | "separator";

export type ContentBlock = {
  type: ContentBlockType;
  content?: string;
};

export type SocialLink = {
  label: string;
  url: string;
  icon?: string;
};

export type SiteSettingsRow = {
  id: number;
  platform_fee_percent: number;
  social_links: SocialLink[];
  terms_content: ContentBlock[];
  privacy_content: ContentBlock[];
  updated_at: Date;
};

function parseJsonArray<T>(value: unknown, fallback: T[]): T[] {
  if (Array.isArray(value)) return value as T[];
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? (parsed as T[]) : fallback;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

function mapRow(row: SiteSettingsRow): SiteSettingsRow {
  return {
    ...row,
    social_links: parseJsonArray(row.social_links, []),
    terms_content: parseJsonArray(row.terms_content, []),
    privacy_content: parseJsonArray(row.privacy_content, []),
  };
}

async function getSettingsFromDb(): Promise<SiteSettingsRow> {
  const result = await query<SiteSettingsRow>(
    `SELECT id, platform_fee_percent, social_links, terms_content, privacy_content, updated_at
     FROM site_settings WHERE id = 1`,
  );
  const row = result.rows[0];
  if (!row) {
    return {
      id: 1,
      platform_fee_percent: DEFAULT_PLATFORM_FEE_PERCENT,
      social_links: [],
      terms_content: [],
      privacy_content: [],
      updated_at: new Date(),
    };
  }
  return mapRow(row);
}

export const getSettings = unstable_cache(
  async () => getSettingsFromDb(),
  ["site-settings"],
  { tags: ["site-settings"] },
);

export async function updateSettings(
  data: Partial<
    Pick<
      SiteSettingsRow,
      | "platform_fee_percent"
      | "social_links"
      | "terms_content"
      | "privacy_content"
    >
  >,
): Promise<SiteSettingsRow> {
  const current = await getSettingsFromDb();
  const platformFeePercent =
    data.platform_fee_percent ?? current.platform_fee_percent;
  const socialLinks = data.social_links ?? current.social_links;
  const termsContent = data.terms_content ?? current.terms_content;
  const privacyContent = data.privacy_content ?? current.privacy_content;

  const result = await query<SiteSettingsRow>(
    `UPDATE site_settings SET
      platform_fee_percent = $1,
      social_links = $2::jsonb,
      terms_content = $3::jsonb,
      privacy_content = $4::jsonb,
      updated_at = NOW()
     WHERE id = 1
     RETURNING id, platform_fee_percent, social_links, terms_content, privacy_content, updated_at`,
    [
      platformFeePercent,
      JSON.stringify(socialLinks),
      JSON.stringify(termsContent),
      JSON.stringify(privacyContent),
    ],
  );

  return mapRow(result.rows[0]);
}
