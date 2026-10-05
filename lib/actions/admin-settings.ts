"use server";

import { revalidatePath, updateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth/current-user";
import {
  updateSettings,
  type ContentBlock,
  type SocialLink,
} from "@/lib/queries/site-settings";
import {
  adminContentBlocksSchema,
  adminPlatformFeeSchema,
  adminSocialLinksSchema,
} from "@/lib/validation/schemas";
import { firstZodError } from "@/lib/validation/schemas";

export type AdminSettingsState = {
  error?: string;
  success?: boolean;
};

function revalidateSiteSettings() {
  updateTag("site-settings");
  revalidatePath("/", "layout");
  revalidatePath("/termos");
  revalidatePath("/privacidade");
}

export async function updatePlatformFeeAction(
  _prev: AdminSettingsState,
  formData: FormData,
): Promise<AdminSettingsState> {
  await requireAdmin();

  const parsed = adminPlatformFeeSchema.safeParse({
    platformFeePercent: formData.get("platformFeePercent"),
  });

  if (!parsed.success) {
    return { error: firstZodError(parsed.error) };
  }

  await updateSettings({
    platform_fee_percent: parsed.data.platformFeePercent,
  });
  revalidateSiteSettings();

  return { success: true };
}

export async function updateSocialLinksAction(
  _prev: AdminSettingsState,
  formData: FormData,
): Promise<AdminSettingsState> {
  await requireAdmin();

  const raw = formData.get("socialLinks");
  if (typeof raw !== "string") {
    return { error: "Dados inválidos" };
  }

  let links: SocialLink[];
  try {
    links = JSON.parse(raw) as SocialLink[];
  } catch {
    return { error: "Formato inválido das redes sociais" };
  }

  const parsed = adminSocialLinksSchema.safeParse({ socialLinks: links });
  if (!parsed.success) {
    return { error: firstZodError(parsed.error) };
  }

  await updateSettings({ social_links: parsed.data.socialLinks });
  revalidateSiteSettings();

  return { success: true };
}

export async function updateTermsContentAction(
  _prev: AdminSettingsState,
  formData: FormData,
): Promise<AdminSettingsState> {
  await requireAdmin();

  const raw = formData.get("content");
  if (typeof raw !== "string") {
    return { error: "Dados inválidos" };
  }

  let blocks: ContentBlock[];
  try {
    blocks = JSON.parse(raw) as ContentBlock[];
  } catch {
    return { error: "Formato inválido do conteúdo" };
  }

  const parsed = adminContentBlocksSchema.safeParse({ blocks });
  if (!parsed.success) {
    return { error: firstZodError(parsed.error) };
  }

  await updateSettings({ terms_content: parsed.data.blocks });
  revalidateSiteSettings();

  return { success: true };
}

export async function updatePrivacyContentAction(
  _prev: AdminSettingsState,
  formData: FormData,
): Promise<AdminSettingsState> {
  await requireAdmin();

  const raw = formData.get("content");
  if (typeof raw !== "string") {
    return { error: "Dados inválidos" };
  }

  let blocks: ContentBlock[];
  try {
    blocks = JSON.parse(raw) as ContentBlock[];
  } catch {
    return { error: "Formato inválido do conteúdo" };
  }

  const parsed = adminContentBlocksSchema.safeParse({ blocks });
  if (!parsed.success) {
    return { error: firstZodError(parsed.error) };
  }

  await updateSettings({ privacy_content: parsed.data.blocks });
  revalidateSiteSettings();

  return { success: true };
}
