export const dynamic = "force-dynamic";

import { requirePhotographer } from "@/lib/auth/current-user";
import { getPhotographerSharePercent } from "@/lib/constants";
import { getPhotographerStats } from "@/lib/queries/photographers";
import { listPayoutsByPhotographer } from "@/lib/queries/payouts";
import { FaturamentoClient } from "@/components/studio/FaturamentoClient";

export default async function FaturamentoPage() {
  const user = await requirePhotographer();
  if (!user.photographerProfileId) return null;

  const [stats, payouts, sharePercent] = await Promise.all([
    getPhotographerStats(user.photographerProfileId),
    listPayoutsByPhotographer(user.photographerProfileId),
    getPhotographerSharePercent(),
  ]);

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-corsa-wine">
        Faturamento
      </h1>
      <p className="mt-1 text-sm text-corsa-muted">
        Carteira e saques simulados
      </p>
      <div className="mt-8">
        <FaturamentoClient
          balanceCents={stats.balanceCents}
          revenueCents={stats.revenueCents}
          payouts={payouts}
          photographerSharePercent={sharePercent}
        />
      </div>
    </div>
  );
}
