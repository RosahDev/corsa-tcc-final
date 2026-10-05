"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { toggleFavorite } from "@/lib/queries/photos";

export async function toggleFavoriteAction(photoId: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/criar-conta?favorito=${photoId}`);
  }
  if (user.role !== "buyer") {
    return;
  }
  await toggleFavorite(user.id, photoId);
  revalidatePath("/marketplace", "layout");
  revalidatePath("/favoritos");
}
