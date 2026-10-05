"use server";

import { revalidatePath } from "next/cache";
import { requirePhotographer } from "@/lib/auth/current-user";
import {
  deletePhoto,
  insertPhoto,
  updatePhotoMetadata,
  updatePhotoPrice,
} from "@/lib/queries/photos";
import { savePhotoFromBuffer, deletePhotoFiles } from "@/lib/media/storage";
import { photoMetadataSchema, photoPriceSchema } from "@/lib/validation/schemas";
import {
  type DeleteActionState,
  toDeleteActionState,
} from "@/lib/actions/delete";

export type PhotoActionState = { error?: string; success?: boolean };

export async function uploadPhotosFormAction(
  albumId: string,
  formData: FormData,
): Promise<void> {
  await uploadPhotosAction(albumId, formData);
}

export async function uploadPhotosAction(
  albumId: string,
  formData: FormData,
): Promise<void> {
  const user = await requirePhotographer();
  if (!user.photographerProfileId) return;

  const files = formData.getAll("photos").filter((f) => f instanceof File) as File[];
  if (files.length === 0) return;

  const defaultPrice = Number(formData.get("defaultPriceCents") ?? 1500);

  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const saved = await savePhotoFromBuffer(buffer, file.name);
    await insertPhoto({
      albumId,
      originalKey: saved.originalKey,
      previewKey: saved.previewKey,
      width: saved.width,
      height: saved.height,
      priceCents: defaultPrice,
      takenAt: new Date(),
    });
  }

  revalidatePath(`/painel/albuns/${albumId}`);
  revalidatePath("/marketplace");
}

export async function updatePhotoPriceAction(
  albumId: string,
  formData: FormData,
): Promise<void> {
  const user = await requirePhotographer();
  if (!user.photographerProfileId) return;

  const parsed = photoPriceSchema.safeParse({
    photoId: formData.get("photoId"),
    priceCents: formData.get("priceCents"),
  });

  if (!parsed.success) return;

  await updatePhotoPrice(
    parsed.data.photoId,
    albumId,
    user.photographerProfileId,
    parsed.data.priceCents,
  );

  revalidatePath(`/painel/albuns/${albumId}`);
}

export async function updatePhotoMetadataAction(
  albumId: string,
  _prev: PhotoActionState,
  formData: FormData,
): Promise<PhotoActionState> {
  const user = await requirePhotographer();
  if (!user.photographerProfileId) return { error: "Perfil não encontrado" };

  const parsed = photoMetadataSchema.safeParse({
    photoId: formData.get("photoId"),
    title: formData.get("title") || undefined,
    description: formData.get("description") || undefined,
    carBrand: formData.get("carBrand") || undefined,
    carModel: formData.get("carModel") || undefined,
    carColor: formData.get("carColor") || undefined,
    vehicleType: formData.get("vehicleType") || undefined,
  });

  if (!parsed.success) return { error: "Dados inválidos" };

  await updatePhotoMetadata(
    parsed.data.photoId,
    albumId,
    user.photographerProfileId,
    {
      title: parsed.data.title,
      description: parsed.data.description,
      carBrand: parsed.data.carBrand,
      carModel: parsed.data.carModel,
      carColor: parsed.data.carColor,
      vehicleType: parsed.data.vehicleType,
    },
  );

  revalidatePath(`/painel/albuns/${albumId}`);
  revalidatePath("/marketplace");
  return { success: true };
}

export async function deletePhotoAction(
  albumId: string,
  photoId: string,
  _prev: DeleteActionState,
  _formData: FormData,
): Promise<DeleteActionState> {
  const user = await requirePhotographer();
  if (!user.photographerProfileId) {
    return { error: "Perfil não encontrado" };
  }

  let photo;
  try {
    photo = await deletePhoto(photoId, albumId, user.photographerProfileId);
  } catch (error) {
    return toDeleteActionState(error);
  }

  if (photo) {
    await deletePhotoFiles(photo.original_key, photo.preview_key);
  }

  revalidatePath(`/painel/albuns/${albumId}`);
  revalidatePath("/marketplace");
  return {};
}
