export const dynamic = "force-dynamic";

import { getCurrentUser } from "@/lib/auth/current-user";
import { resolveCart } from "@/lib/actions/checkout";
import { CheckoutForm } from "@/components/cart/CheckoutForm";

export default async function CheckoutPage() {
  const cart = await resolveCart();
  const user = await getCurrentUser();

  return (
    <div className="page-container page-section">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-corsa-wine sm:text-4xl">
          Checkout
        </h1>
        <p className="mt-2 text-corsa-muted">Linha de chegada!</p>
      </div>
      <CheckoutForm cart={cart} isLoggedIn={!!user} />
    </div>
  );
}
