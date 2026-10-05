export const dynamic = "force-dynamic";

import { ImageIcon, ShoppingBag, TrendingUp, Wallet } from "lucide-react";
import { getPhotographerSharePercent } from "@/lib/constants";
import { requirePhotographer } from "@/lib/auth/current-user";
import {
  getMonthlySales,
  getPhotographerStats,
} from "@/lib/queries/photographers";
import { listSalesByPhotographer } from "@/lib/queries/orders";
import { formatCurrency } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SalesChart } from "@/components/studio/SalesChart";

export default async function PainelPage() {
  const user = await requirePhotographer();
  if (!user.photographerProfileId) {
    return <p>Perfil não encontrado</p>;
  }

  const [stats, sales, sharePercent, recentSales] = await Promise.all([
    getPhotographerStats(user.photographerProfileId),
    getMonthlySales(user.photographerProfileId),
    getPhotographerSharePercent(),
    listSalesByPhotographer(user.photographerProfileId),
  ]);

  const shareRate = sharePercent / 100;
  const latestSales = recentSales.slice(0, 5);

  const chartData = sales;

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-corsa-wine">Painel</h1>
      <p className="mt-1 text-sm text-corsa-muted">
        Olá, {user.name.split(" ")[0]}. Acompanhe seu desempenho.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5">
          <Wallet className="size-5 text-corsa-wine" />
          <p className="mt-2 text-sm text-corsa-muted">Saldo disponível para saque</p>
          <p className="text-2xl font-bold text-corsa-wine">
            {formatCurrency(stats.balanceCents)}
          </p>
          {stats.revenueCents > stats.balanceCents && (
            <p className="mt-1 text-xs text-corsa-muted">
              {formatCurrency(stats.revenueCents - stats.balanceCents)} já sacados
            </p>
          )}
        </Card>
        <Card className="p-5">
          <TrendingUp className="size-5 text-corsa-wine" />
          <p className="mt-2 text-sm text-corsa-muted">
            Receita acumulada ({sharePercent}%)
          </p>
          <p className="text-2xl font-bold text-corsa-ink">
            {formatCurrency(stats.revenueCents)}
          </p>
        </Card>
        <Card className="p-5">
          <ImageIcon className="size-5 text-corsa-wine" />
          <p className="mt-2 text-sm text-corsa-muted">Álbuns publicados</p>
          <p className="text-2xl font-bold text-corsa-ink">{stats.albumCount}</p>
        </Card>
        <Card className="p-5">
          <ShoppingBag className="size-5 text-corsa-wine" />
          <p className="mt-2 text-sm text-corsa-muted">Vendas</p>
          <p className="text-2xl font-bold text-corsa-ink">{stats.salesCount}</p>
        </Card>
      </div>

      <Card className="mt-6 p-6">
        <h2 className="font-heading font-semibold text-corsa-ink">
          Desempenho mensal
        </h2>
        <SalesChart data={chartData} />
      </Card>

      {latestSales.length > 0 && (
        <Card className="mt-6 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-heading font-semibold text-corsa-ink">
              Vendas recentes
            </h2>
            <Button href="/painel/vendas" variant="outline" size="sm">
              Ver histórico completo
            </Button>
          </div>
          <ul className="mt-4 flex flex-col gap-3">
            {latestSales.map((sale) => (
              <li
                key={sale.id}
                className="flex items-center justify-between gap-3 border-b border-corsa-sand/60 pb-3 last:border-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-corsa-ink">
                    {sale.photo_title || "Foto sem título"}
                  </p>
                  <p className="truncate text-sm text-corsa-muted">
                    {sale.album_title}
                  </p>
                </div>
                <p className="shrink-0 font-medium text-corsa-wine">
                  {formatCurrency(
                    Math.floor(sale.unit_price_cents * shareRate),
                  )}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {stats.albumCount === 0 && (
        <Card className="mt-6 border-dashed p-6 text-center">
          <p className="font-semibold text-corsa-ink">
            Publique seu primeiro álbum
          </p>
          <p className="mt-2 text-sm text-corsa-muted">
            Crie um álbum, faça upload das fotos e defina preços avulsos e pacote.
          </p>
          <Button href="/painel/albuns" className="mt-4">
            Criar álbum
          </Button>
        </Card>
      )}
    </div>
  );
}
