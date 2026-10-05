"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePhotographer } from "@/lib/auth/current-user";
import {
  createAlbum,
  deleteAlbum,
  findAlbumByIdForPhotographer,
  slugify,
  updateAlbum,
} from "@/lib/queries/albums";
import { albumSchema, firstZodError } from "@/lib/validation/schemas";
import type { SessionModality } from "@/lib/labels";
import {
  type DeleteActionState,
  toDeleteActionState,
} from "@/lib/actions/delete";
import { deletePhotoFiles } from "@/lib/media/storage";

export type AlbumActionState = { error?: string; success?: boolean };

function parseAlbumForm(formData: FormData) {
  return albumSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    state: formData.get("state"),
    city: formData.get("city"),
    modality: formData.get("modality"),
    coverageDate: formData.get("coverageDate") || undefined,
    vehicleType: formData.get("vehicleType"),
    bundlePriceCents: formData.get("bundlePriceCents"),
  });
}

export async function createAlbumAction(
  _prev: AlbumActionState,
  formData: FormData,
): Promise<AlbumActionState> {
  const user = await requirePhotographer();
  if (!user.photographerProfileId) return { error: "Perfil não encontrado" };

  const parsed = parseAlbumForm(formData);
  if (!parsed.success) {
    return { error: firstZodError(parsed.error) };
  }

  const slug = slugify(parsed.data.title);
  await createAlbum({
    photographerId: user.photographerProfileId,
    title: parsed.data.title,
    slug,
    description: parsed.data.description,
    state: parsed.data.state,
    city: parsed.data.city,
    modality: parsed.data.modality as SessionModality,
    coverageDate: parsed.data.coverageDate,
    vehicleType: parsed.data.vehicleType,
    bundlePriceCents: parsed.data.bundlePriceCents,
    publish: formData.get("publish") === "on",
  });

  revalidatePath("/painel/albuns");
  revalidatePath("/marketplace");
  return { success: true };
}

export async function updateAlbumAction(
  albumId: string,
  _prev: AlbumActionState,
  formData: FormData,
): Promise<AlbumActionState> {
  const user = await requirePhotographer();
  if (!user.photographerProfileId) return { error: "Perfil não encontrado" };

  const parsed = parseAlbumForm(formData);
  if (!parsed.success) {
    return { error: firstZodError(parsed.error) };
  }

  await updateAlbum(albumId, user.photographerProfileId, {
    title: parsed.data.title,
    description: parsed.data.description,
    state: parsed.data.state,
    city: parsed.data.city,
    modality: parsed.data.modality as SessionModality,
    coverageDate: parsed.data.coverageDate,
    vehicleType: parsed.data.vehicleType,
    bundlePriceCents: parsed.data.bundlePriceCents,
    published: formData.get("publish") === "on",
  });

  revalidatePath("/painel/albuns");
  revalidatePath(`/painel/albuns/${albumId}`);
  revalidatePath("/marketplace");
  return { success: true };
}

export async function deleteAlbumAction(
  albumId: string,
  _prev: DeleteActionState,
  _formData: FormData,
): Promise<DeleteActionState> {
  const user = await requirePhotographer();
  if (!user.photographerProfileId) {
    return { error: "Perfil não encontrado" };
  }

  let deletedPhotos;
  try {
    deletedPhotos = await deleteAlbum(albumId, user.photographerProfileId);
  } catch (error) {
    return toDeleteActionState(error);
  }

  await Promise.all(
    deletedPhotos.map((photo) =>
      deletePhotoFiles(photo.original_key, photo.preview_key),
    ),
  );
  revalidatePath("/painel/albuns");
  revalidatePath("/marketplace");
  redirect("/painel/albuns");
}

export async function getAlbumForStudio(albumId: string) {
  const user = await requirePhotographer();
  if (!user.photographerProfileId) return null;
  return findAlbumByIdForPhotographer(albumId, user.photographerProfileId);
}
