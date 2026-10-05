"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { clearSession } from "@/lib/auth/session";
import {
  requireBuyer,
  requirePhotographer,
  requireUser,
} from "@/lib/auth/current-user";
import {
  deleteUser,
  isHandleTaken,
  updateUserPassword,
  updateUserProfile,
} from "@/lib/queries/users";
import {
  findPhotographerByUserId,
  updatePhotographerProfile,
  updatePhotographerAvatar,
} from "@/lib/queries/photographers";
import {
  deleteAvatarFile,
  saveAvatarFromBuffer,
} from "@/lib/media/avatars";
import {
  firstZodError,
  passwordChangeSchema,
  photographerProfileSchema,
  profileSchema,
} from "@/lib/validation/schemas";
import {
  type DeleteActionState,
  toDeleteActionState,
} from "@/lib/actions/delete";

export type ProfileActionState = { error?: string; success?: boolean };

export async function updateBuyerProfileAction(
  _prev: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const user = await requireBuyer();

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    billingStreet: formData.get("billingStreet") || undefined,
    billingNumber: formData.get("billingNumber") || undefined,
    billingComplement: formData.get("billingComplement") || undefined,
    billingNeighborhood: formData.get("billingNeighborhood") || undefined,
    billingCity: formData.get("billingCity") || undefined,
    billingState: formData.get("billingState") || undefined,
    billingZip: formData.get("billingZip") || undefined,
  });

  if (!parsed.success) {
    return { error: firstZodError(parsed.error) };
  }

  await updateUserProfile(user.id, {
    name: parsed.data.name,
    billingStreet: parsed.data.billingStreet,
    billingNumber: parsed.data.billingNumber,
    billingComplement: parsed.data.billingComplement,
    billingNeighborhood: parsed.data.billingNeighborhood,
    billingCity: parsed.data.billingCity,
    billingState: parsed.data.billingState,
    billingZip: parsed.data.billingZip,
  });

  revalidatePath("/minha-conta");
  return { success: true };
}

export async function changePasswordAction(
  _prev: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const user = await requireUser();

  const parsed = passwordChangeSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: firstZodError(parsed.error) };
  }

  if (!verifyPassword(parsed.data.currentPassword, user.password_hash)) {
    return { error: "Senha atual incorreta" };
  }

  await updateUserPassword(user.id, hashPassword(parsed.data.newPassword));
  return { success: true };
}

export async function deleteAccountAction(
  _prev: DeleteActionState,
  _formData: FormData,
): Promise<DeleteActionState> {
  const user = await requireUser();

  try {
    await deleteUser(user.id);
  } catch (error) {
    return toDeleteActionState(error);
  }

  await clearSession();
  redirect("/");
}

export async function updatePhotographerProfileAction(
  _prev: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const user = await requirePhotographer();
  const profile = await findPhotographerByUserId(user.id);
  if (!profile) return { error: "Perfil nao encontrado" };

  const parsed = photographerProfileSchema.safeParse({
    handle: formData.get("handle"),
    bio: formData.get("bio") || undefined,
    specialties: formData.get("specialties") || undefined,
  });

  if (!parsed.success) {
    return { error: firstZodError(parsed.error) };
  }

  if (
    parsed.data.handle !== profile.handle &&
    (await isHandleTaken(parsed.data.handle))
  ) {
    return { error: "Este handle ja esta em uso" };
  }

  const specialties = parsed.data.specialties
    ? parsed.data.specialties.split(",").map((s) => s.trim()).filter(Boolean)
    : profile.specialties;

  await updatePhotographerProfile(profile.id, {
    handle: parsed.data.handle,
    bio: parsed.data.bio,
    specialties,
  });

  revalidatePath("/painel/perfil");
  revalidatePath("/fotografos");
  revalidatePath(`/fotografos/${parsed.data.handle}`);
  return { success: true };
}

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export async function uploadAvatarAction(
  _prev: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const user = await requirePhotographer();
  const profile = await findPhotographerByUserId(user.id);
  if (!profile) return { error: "Perfil nao encontrado" };

  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Selecione uma imagem" };
  }
  if (!ALLOWED_AVATAR_TYPES.has(file.type)) {
    return { error: "Formato invalido. Use JPG, PNG ou WebP" };
  }
  if (file.size > MAX_AVATAR_SIZE) {
    return { error: "Imagem muito grande. Maximo 5 MB" };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const avatarKey = await saveAvatarFromBuffer(buffer);

  if (profile.avatar_key) {
    await deleteAvatarFile(profile.avatar_key);
  }

  await updatePhotographerAvatar(profile.id, avatarKey);

  revalidatePath("/painel/perfil");
  revalidatePath("/fotografos");
  revalidatePath(`/fotografos/${profile.handle}`);
  return { success: true };
}

export async function removeAvatarFormAction(
  _prev: ProfileActionState,
): Promise<ProfileActionState> {
  return removeAvatarAction();
}

export async function removeAvatarDeleteAction(
  _prev: DeleteActionState,
  _formData: FormData,
): Promise<DeleteActionState> {
  const result = await removeAvatarAction();
  return result.error ? { error: result.error } : {};
}

async function removeAvatarAction(): Promise<ProfileActionState> {
  const user = await requirePhotographer();
  const profile = await findPhotographerByUserId(user.id);
  if (!profile) return { error: "Perfil nao encontrado" };
  if (!profile.avatar_key) return { success: true };

  await deleteAvatarFile(profile.avatar_key);
  await updatePhotographerAvatar(profile.id, null);

  revalidatePath("/painel/perfil");
  revalidatePath("/fotografos");
  revalidatePath(`/fotografos/${profile.handle}`);
  return { success: true };
}
