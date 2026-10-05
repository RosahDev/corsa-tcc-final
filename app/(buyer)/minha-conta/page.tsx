export const dynamic = "force-dynamic";

import { requireBuyer } from "@/lib/auth/current-user";
import { AccountForms } from "@/components/cart/AccountForms";

export default async function MinhaContaPage() {
  const user = await requireBuyer();

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-corsa-wine">
        Minha conta
      </h1>
      <p className="mt-1 text-sm text-corsa-muted">
        Gerencie seus dados e segurança
      </p>
      <div className="mt-8">
        <AccountForms user={user} />
      </div>
    </div>
  );
}
