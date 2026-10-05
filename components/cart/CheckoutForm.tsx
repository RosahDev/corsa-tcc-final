"use client";

import { Fragment, useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, QrCode, Shield } from "lucide-react";
import { checkoutAction, type CheckoutState } from "@/lib/actions/checkout";
import { formatCurrency } from "@/lib/format";
import type { ResolvedCart } from "@/lib/actions/checkout";
import { PixQrCode } from "@/components/checkout/PixQrCode";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { SuccessOverlay } from "@/components/ui/SuccessOverlay";
import { cn } from "@/lib/utils";

type CheckoutFormProps = {
  cart: ResolvedCart;
  isLoggedIn: boolean;
};

function getSuccessCopy(state: CheckoutState, fallbackTotal: number) {
  const total = state.totalCents ?? fallbackTotal;

  if (state.paymentMethod === "pix") {
    return {
      title: "Pagamento confirmado",
      description: `Pix simulado de ${formatCurrency(total)} recebido. Suas fotos já estão na sua galeria.`,
    };
  }

  if (state.paymentMethod === "card") {
    return {
      title: "Pagamento aprovado",
      description: `Compra de ${formatCurrency(total)} no cartão confirmada. Suas fotos já estão na sua galeria.`,
    };
  }

  return {
    title: "Pagamento confirmado",
    description: `Compra de ${formatCurrency(total)} concluída. Suas fotos já estão na sua galeria.`,
  };
}

export function CheckoutForm({ cart, isLoggedIn }: CheckoutFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState<"card" | "pix">("card");
  const [state, action, pending] = useActionState(checkoutAction, {} as CheckoutState);
  const successCopy = getSuccessCopy(state, cart.totalCents);
  const cartIsEmpty = cart.lines.length === 0;

  useEffect(() => {
    if (cartIsEmpty && !state.success && !pending) {
      router.replace("/carrinho");
    }
  }, [cartIsEmpty, state.success, pending, router]);

  const pixPayload = useMemo(
    () =>
      `00020126580014br.gov.bcb.pix0136corsa-simulado@checkout52040000530398654${String(cart.totalCents).padStart(4, "0")}5802BR5925Corsa Fotografia6009SAO PAULO62070503***6304ABCD`,
    [cart.totalCents],
  );

  if (cartIsEmpty && !state.success) {
    return null;
  }

  if (!isLoggedIn) {
    return (
      <Card className="p-8 text-center">
        <p className="text-corsa-muted">
          Entre ou crie uma conta para finalizar a compra.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button variant="outline" href="/entrar?redirect=/checkout">
            Entrar
          </Button>
          <Button href="/criar-conta?redirect=/checkout">Criar conta</Button>
        </div>
      </Card>
    );
  }

  return (
    <>
      <SuccessOverlay
        open={!!state.success}
        title={successCopy.title}
        description={successCopy.description}
        duration={3200}
        onComplete={() => router.push("/minha-galeria")}
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
        <div>
          <div className="mb-6 flex items-center">
            {[1, 2].map((s, index) => (
              <Fragment key={s}>
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                    step >= s
                      ? "bg-corsa-wine text-white"
                      : "border border-corsa-border bg-corsa-sand text-corsa-muted",
                  )}
                >
                  {s}
                </span>
                {index < 1 && (
                  <div
                    className={cn(
                      "mx-3 h-0.5 w-16 shrink-0 rounded-full sm:w-24",
                      step > 1 ? "bg-corsa-wine" : "bg-corsa-muted/50",
                    )}
                    aria-hidden
                  />
                )}
              </Fragment>
            ))}
          </div>

          {step === 1 && (
            <Card className="p-6">
              <h2 className="font-heading text-lg font-semibold text-corsa-wine">
                Método de pagamento
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setMethod("card")}
                  className={cn(
                    "flex flex-col items-start gap-2 rounded-2xl border-2 p-4 text-left transition-colors",
                    method === "card"
                      ? "border-corsa-wine bg-corsa-rose"
                      : "border-corsa-border bg-white hover:bg-corsa-cream",
                  )}
                >
                  <CreditCard className="size-5 text-corsa-wine" />
                  <span className="text-sm font-semibold text-corsa-ink">
                    Cartão de crédito
                  </span>
                  <span className="text-xs text-corsa-muted">
                    Visa, Mastercard, Elo
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setMethod("pix")}
                  className={cn(
                    "flex flex-col items-start gap-2 rounded-2xl border-2 p-4 text-left transition-colors",
                    method === "pix"
                      ? "border-corsa-wine bg-corsa-rose"
                      : "border-corsa-border bg-white hover:bg-corsa-cream",
                  )}
                >
                  <QrCode className="size-5 text-corsa-wine" />
                  <span className="text-sm font-semibold text-corsa-ink">
                    Pagamento via Pix
                  </span>
                  <span className="text-xs text-corsa-muted">
                    Confirmação instantânea
                  </span>
                </button>
              </div>
              <Button className="mt-6 w-full" onClick={() => setStep(2)}>
                Continuar
              </Button>
            </Card>
          )}

          {step === 2 && (
            <Card className="p-6">
              <form action={action} className="flex flex-col gap-4">
                <input type="hidden" name="paymentMethod" value={method} />
                {state.error && (
                  <p
                    className="rounded-xl border border-corsa-wine/20 bg-corsa-rose px-4 py-3 text-sm text-corsa-wine"
                    role="alert"
                  >
                    {state.error}
                  </p>
                )}
                {method === "card" ? (
                  <>
                    <Field label="Número do cartão" htmlFor="cardNumber">
                      <Input
                        id="cardNumber"
                        name="cardNumber"
                        placeholder="0000 0000 0000 0000"
                        required
                      />
                    </Field>
                    <Field label="Nome no cartão" htmlFor="cardName">
                      <Input id="cardName" name="cardName" required />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Validade" htmlFor="cardExpiry">
                        <Input
                          id="cardExpiry"
                          name="cardExpiry"
                          placeholder="MM/AA"
                          required
                        />
                      </Field>
                      <Field label="CVV" htmlFor="cardCvv">
                        <Input id="cardCvv" name="cardCvv" required />
                      </Field>
                    </div>
                  </>
                ) : (
                  <div className="rounded-xl border border-corsa-border bg-corsa-sand/50 p-6 text-center">
                    <PixQrCode payload={pixPayload} />
                    <p className="mt-3 text-sm text-corsa-muted">
                      Pagamento Pix simulado. Clique em confirmar para concluir.
                    </p>
                  </div>
                )}
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                  >
                    Voltar
                  </Button>
                  <Button type="submit" className="flex-1" disabled={pending}>
                    {pending ? "Processando..." : "Finalizar compra"}
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </div>

        <Card variant="sand" className="sticky top-24 p-6">
          <h2 className="font-heading text-lg font-semibold text-corsa-wine">
            Resumo do pedido
          </h2>
          <ul className="mt-5 space-y-3 text-sm">
            {cart.lines.map((line) => (
              <li key={line.key} className="flex justify-between gap-3">
                <span className="text-corsa-muted">{line.title}</span>
                <span className="shrink-0 font-medium">
                  {formatCurrency(line.priceCents)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 border-t border-corsa-border/60 pt-4">
            <div className="flex justify-between">
              <span className="text-lg font-semibold text-corsa-ink">Total</span>
              <span className="text-2xl font-bold text-corsa-wine">
                {formatCurrency(cart.totalCents)}
              </span>
            </div>
          </div>
          <p className="mt-4 flex items-center justify-center gap-1.5 text-xs uppercase tracking-wide text-corsa-muted">
            <Shield className="size-3.5" />
            Transação criptografada
          </p>
        </Card>
      </div>
    </>
  );
}
