"use server";

import { revalidatePath } from "next/cache";
import { getCartItems, setCartItems, type CartItem } from "@/lib/cart/cookie-cart";
import type { DeleteActionState } from "@/lib/actions/delete";
import { getCurrentUser } from "@/lib/auth/current-user";

export type CartActionState = { error?: string; success?: boolean };

async function assertCanPurchase(): Promise<void> {
  const user = await getCurrentUser();
  if (user?.role === "photographer") {
    throw new Error("Fotógrafos não podem comprar fotos na plataforma.");
  }
}

export async function addPhotoToCart(photoId: string): Promise<void> {
  await assertCanPurchase();
  const items = await getCartItems();
  const filtered = items.filter(
    (item) => !(item.kind === "album" && item.id === photoId),
  );
  if (!filtered.some((item) => item.kind === "photo" && item.id === photoId)) {
    filtered.push({ kind: "photo", id: photoId });
  }
  await setCartItems(filtered);
  revalidatePath("/carrinho");
}

export async function addAlbumToCart(albumId: string): Promise<void> {
  await assertCanPurchase();
  const items = await getCartItems();
  const withoutPhotosFromAlbum = items.filter(
    (item) => item.kind !== "photo",
  );
  const filtered = withoutPhotosFromAlbum.filter(
    (item) => !(item.kind === "album" && item.id === albumId),
  );
  filtered.push({ kind: "album", id: albumId });
  await setCartItems(filtered);
  revalidatePath("/carrinho");
}

export async function addPhotosToCart(photoIds: string[]): Promise<void> {
  await assertCanPurchase();
  const items = await getCartItems();
  const next: CartItem[] = [...items];
  for (const photoId of photoIds) {
    if (!next.some((item) => item.kind === "photo" && item.id === photoId)) {
      next.push({ kind: "photo", id: photoId });
    }
  }
  await setCartItems(next);
  revalidatePath("/carrinho");
}

export async function removeCartItem(
  kind: "photo" | "album",
  id: string,
  _prev: DeleteActionState,
  _formData: FormData,
): Promise<DeleteActionState> {
  const items = await getCartItems();
  await setCartItems(
    items.filter((item) => !(item.kind === kind && item.id === id)),
  );
  revalidatePath("/carrinho");
  return {};
}

export async function clearCartAction(
  _prev: DeleteActionState,
  _formData: FormData,
): Promise<DeleteActionState> {
  await setCartItems([]);
  revalidatePath("/carrinho");
  return {};
}

export async function getCartCount(): Promise<number> {
  const items = await getCartItems();
  return items.length;
}
