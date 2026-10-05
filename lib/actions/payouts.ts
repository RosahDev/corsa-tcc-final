"use server";

import { revalidatePath } from "next/cache";
import { requirePhotographer } from "@/lib/auth/current-user";
import { createPayout } from "@/lib/queries/payouts";
import { getPhotographerStats } from "@/lib/queries/photographers";
import { firstZodError, payoutSchema } from "@/lib/validation/schemas";

export type PayoutActionState = {
  error?: string;
  success?: boolean;
  amountCents?: number;
};

export async function requestPayoutAction(
  _prev: PayoutActionState,
  formData: FormData,
): Promise<PayoutActionState> {
  const user = await requirePhotographer();
  if (!user.photographerProfileId) return { error: "Perfil nao encontrado" };

  const parsed = payoutSchema.safeParse({
    amountCents: formData.get("amountCents"),
  });

  if (!parsed.success) {
    return { error: firstZodError(parsed.error) };
  }

  const stats = await getPhotographerStats(user.photographerProfileId);
  if (parsed.data.amountCents <= 0) {
    return { error: "Informe um valor maior que zero" };
  }
  if (parsed.data.amountCents > stats.balanceCents) {
    return { error: "Saldo insuficiente para este saque" };
  }

  await createPayout(user.photographerProfileId, parsed.data.amountCents);
  revalidatePath("/painel/faturamento");

  return { success: true, amountCents: parsed.data.amountCents };
}
