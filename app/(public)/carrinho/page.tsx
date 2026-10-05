export const dynamic = "force-dynamic";

import Image from "next/image";
import { ArrowRight, ShoppingBag, X } from "lucide-react";
import { resolveCart } from "@/lib/actions/checkout";
import { removeCartItem, clearCartAction } from "@/lib/actions/cart";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { ConfirmDeleteForm } from "@/components/ui/ConfirmDeleteForm";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card } from "@/components/ui/Card";

export default async function CarrinhoPage() {
  const cart = await resolveCart();

  if (cart.lines.length === 0) {
    return (
      <div className="page-container page-section">
        <EmptyState
          icon={<ShoppingBag className="size-7" />}
          title="Seu carrinho está vazio"
          description="Explore o marketplace e adicione fotos ou álbuns."
          actionLabel="Ir ao marketplace"
          actionHref="/marketplace"
        />
      </div>
    );
  }

  const itemCount = cart.lines.length;

  return (
    <div className="page-container page-section">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-corsa-wine sm:text-4xl">
          Seu carrinho
        </h1>
        <p className="mt-2 text-corsa-muted">
          Revise suas capturas selecionadas antes do checkout.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-end">
            <ConfirmDeleteForm
              action={clearCartAction}
              title="Limpar carrinho"
              description="Todos os itens serão removidos do carrinho. Você precisará adicioná-los novamente."
              confirmLabel="Limpar carrinho"
            >
              <Button variant="ghost" size="sm">
                Limpar carrinho
              </Button>
            </ConfirmDeleteForm>
          </div>

          {cart.lines.map((line) => (
            <Card
              key={line.key}
              className="flex gap-4 p-4 sm:gap-5 sm:p-5"
            >
              <div className="relative size-24 shrink-0 overflow-hidden rounded-xl border border-corsa-border bg-corsa-sand sm:size-28">
                {line.previewKey && line.kind === "photo" ? (
                  <Image
                    src={`/api/fotos/${line.id}/preview`}
                    alt={line.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ShoppingBag className="size-8 text-corsa-muted" />
                  </div>
                )}
              </div>

              <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
                <div>
                  <p className="font-semibold text-corsa-ink">{line.title}</p>
                  <p className="mt-1 text-sm text-corsa-muted">{line.subtitle}</p>
                </div>
                <p className="text-lg font-bold text-corsa-wine">
                  {formatCurrency(line.priceCents)}
                </p>
              </div>

              <ConfirmDeleteForm
                action={removeCartItem.bind(null, line.kind, line.id)}
                className="shrink-0"
                title="Remover item"
                description={`"${line.title}" será removido do seu carrinho.`}
                confirmLabel="Remover"
              >
                <Button
                  variant="danger"
                  size="iconSm"
                  aria-label={`Remover ${line.title}`}
                >
                  <X className="size-4" />
                </Button>
              </ConfirmDeleteForm>
            </Card>
          ))}
        </div>

        <Card variant="sand" className="sticky top-24 p-6">
          <h2 className="font-heading text-lg font-semibold text-corsa-wine">
            Resumo do pedido
          </h2>

          <div className="flex justify-between text-sm">
            <span className="text-corsa-ink">
              Subtotal ({itemCount} {itemCount === 1 ? "item" : "itens"})
            </span>
            <span className="font-medium">
              {formatCurrency(cart.subtotalCents)}
            </span>
          </div>

          <div className="mt-4 flex justify-between border-t border-corsa-border/60 pt-4">
            <span className="text-lg font-semibold text-corsa-ink">Total</span>
            <span className="text-2xl font-bold text-corsa-wine">
              {formatCurrency(cart.totalCents)}
            </span>
          </div>

          <p className="mt-3 text-xs leading-relaxed text-corsa-muted">
            Entrega digital instantânea após confirmação do pagamento.
          </p>

          <Button href="/checkout" size="lg" className="mt-6 w-full">
            Ir para o checkout
            <ArrowRight className="size-4" />
          </Button>
        </Card>
      </div>
    </div>
  );
}
