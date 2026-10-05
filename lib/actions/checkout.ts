"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser, requireUser } from "@/lib/auth/current-user";
import { getCartItems, setCartItems } from "@/lib/cart/cookie-cart";
import { getPlatformFeeRate } from "@/lib/constants";
import { createPaidOrder, type CheckoutLine } from "@/lib/queries/orders";
import {
  listPhotosForAlbumPurchase,
  resolveCartAlbums,
  resolveCartPhotos,
} from "@/lib/queries/photos";
import { checkoutSchema } from "@/lib/validation/schemas";

export type CheckoutState = {
  error?: string;
  success?: boolean;
  orderId?: string;
  totalCents?: number;
  paymentMethod?: "card" | "pix";
};

export type ResolvedCart = {
  lines: {
    key: string;
    kind: "photo" | "album";
    id: string;
    title: string;
    subtitle: string;
    priceCents: number;
    previewKey?: string;
  }[];
  subtotalCents: number;
  platformFeeCents: number;
  totalCents: number;
};

export async function resolveCart(): Promise<ResolvedCart> {
  const items = await getCartItems();
  const photoIds = items.filter((i) => i.kind === "photo").map((i) => i.id);
  const albumIds = items.filter((i) => i.kind === "album").map((i) => i.id);

  const photos = await resolveCartPhotos(photoIds);
  const albums = await resolveCartAlbums(albumIds);

  const lines: ResolvedCart["lines"] = [];
  const seenPhotoIds = new Set<string>();

  for (const photo of photos) {
    seenPhotoIds.add(photo.id);
    lines.push({
      key: `photo-${photo.id}`,
      kind: "photo",
      id: photo.id,
      title: photo.album_title,
      subtitle: "Foto avulsa",
      priceCents: photo.price_cents,
      previewKey: photo.preview_key,
    });
  }

  for (const album of albums) {
    const albumPhotos = await listPhotosForAlbumPurchase(album.id);
    const count = albumPhotos.length || 1;

    lines.push({
      key: `album-${album.id}`,
      kind: "album",
      id: album.id,
      title: album.title,
      subtitle: `Album completo (${count} fotos)`,
      priceCents: album.bundle_price_cents,
    });

    for (const photo of albumPhotos) {
      seenPhotoIds.add(photo.id);
    }
  }

  const subtotalCents = lines.reduce((sum, line) => sum + line.priceCents, 0);
  const platformFeeRate = await getPlatformFeeRate();
  const platformFeeCents = Math.round(subtotalCents * platformFeeRate);

  return {
    lines,
    subtotalCents,
    platformFeeCents,
    totalCents: subtotalCents,
  };
}

async function buildCheckoutLines(): Promise<CheckoutLine[]> {
  const items = await getCartItems();
  const checkoutLines: CheckoutLine[] = [];
  const addedPhotos = new Set<string>();

  const photoIds = items.filter((i) => i.kind === "photo").map((i) => i.id);
  const photos = await resolveCartPhotos(photoIds);

  for (const photo of photos) {
    if (addedPhotos.has(photo.id)) continue;
    addedPhotos.add(photo.id);
    checkoutLines.push({
      photoId: photo.id,
      albumId: photo.album_id,
      photographerId: photo.photographer_id,
      unitPriceCents: photo.price_cents,
    });
  }

  const albumIds = items.filter((i) => i.kind === "album").map((i) => i.id);
  const albums = await resolveCartAlbums(albumIds);

  for (const album of albums) {
    const albumPhotos = await listPhotosForAlbumPurchase(album.id);
    const count = albumPhotos.length || 1;
    const unitPrice = Math.floor(album.bundle_price_cents / count);
    const remainder = album.bundle_price_cents - unitPrice * count;

    albumPhotos.forEach((photo, index) => {
      if (addedPhotos.has(photo.id)) return;
      addedPhotos.add(photo.id);
      const price =
        index === 0 ? unitPrice + remainder : unitPrice;
      checkoutLines.push({
        photoId: photo.id,
        albumId: album.id,
        photographerId: album.photographer_id,
        unitPriceCents: price,
      });
    });
  }

  return checkoutLines;
}

export async function checkoutAction(
  _prev: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar?redirect=/checkout");

  const parsed = checkoutSchema.safeParse({
    paymentMethod: formData.get("paymentMethod"),
    cardNumber: formData.get("cardNumber") || undefined,
    cardName: formData.get("cardName") || undefined,
    cardExpiry: formData.get("cardExpiry") || undefined,
    cardCvv: formData.get("cardCvv") || undefined,
  });

  if (!parsed.success) {
    return { error: "Verifique os dados de pagamento" };
  }

  if (parsed.data.paymentMethod === "card") {
    const card = parsed.data.cardNumber?.replace(/\s/g, "") ?? "";
    if (card.length < 13) {
      return { error: "Numero do cartao invalido" };
    }
  }

  const lines = await buildCheckoutLines();
  if (lines.length === 0) {
    return { error: "Seu carrinho esta vazio" };
  }

  const totalCents = lines.reduce(
    (sum, line) => sum + line.unitPriceCents,
    0,
  );

  const { orderId } = await createPaidOrder({
    buyerId: user.id,
    paymentMethod: parsed.data.paymentMethod,
    lines,
  });

  await setCartItems([]);
  revalidatePath("/carrinho");
  revalidatePath("/minha-galeria");
  revalidatePath("/meus-pedidos");

  return {
    success: true,
    orderId,
    totalCents,
    paymentMethod: parsed.data.paymentMethod,
  };
}

export async function requireCheckoutUser() {
  return requireUser();
}
