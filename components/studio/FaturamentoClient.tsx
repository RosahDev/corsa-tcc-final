"use client";

import { useActionState, useRef, useState } from "react";
import { requestPayoutAction, type PayoutActionState } from "@/lib/actions/payouts";
import { formatCurrency, formatShortDate } from "@/lib/format";
import type { PayoutRow } from "@/lib/queries/payouts";
import { Field } from "@/components/ui/Field";
import { MoneyInput } from "@/components/ui/MoneyInput";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SuccessOverlay } from "@/components/ui/SuccessOverlay";

type FaturamentoClientProps = {
  balanceCents: number;
  revenueCents: number;
  payouts: PayoutRow[];
  photographerSharePercent: number;
};

export function FaturamentoClient({
  balanceCents,
  revenueCents,
  payouts,
  photographerSharePercent,
}: FaturamentoClientProps) {
  const [state, action, pending] = useActionState(
    requestPayoutAction,
    {} as PayoutActionState,
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [amountCents, setAmountCents] = useState(0);
  const payoutFormRef = useRef<HTMLFormElement>(null);

  const canWithdraw =
    amountCents > 0 && amountCents <= balanceCents && balanceCents > 0;
  const withdrawnCents = revenueCents - balanceCents;

  return (
    <>
      <SuccessOverlay
        open={!!state.success}
        title="Saque solicitado"
        description={`Transferência simulada de ${formatCurrency(state.amountCents ?? 0)} registrada.`}
        onClose={() => window.location.reload()}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <p className="text-sm text-corsa-muted">Saldo disponível para saque</p>
          <p className="text-3xl font-bold text-corsa-wine">
            {formatCurrency(balanceCents)}
          </p>
          <p className="mt-2 text-xs text-corsa-muted">
            Vendas pagas ficam disponíveis imediatamente, sem período de carência.
            {withdrawnCents > 0 && (
              <>
                {" "}
                Já sacado: {formatCurrency(withdrawnCents)}.
              </>
            )}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-corsa-muted">
            Receita acumulada ({photographerSharePercent}%)
          </p>
          <p className="text-3xl font-bold text-corsa-ink">
            {formatCurrency(revenueCents)}
          </p>
          <p className="mt-2 text-xs text-corsa-muted">
            Sua parte líquida de todas as vendas pagas.
          </p>
        </Card>
      </div>

      <Card className="mt-6 p-6">
        <h2 className="font-heading font-semibold text-corsa-ink">
          Solicitar saque
        </h2>
        <form
          ref={payoutFormRef}
          action={action}
          className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end"
        >
          {state.error && (
            <p className="w-full text-sm text-corsa-wine">{state.error}</p>
          )}
          <Field label="Valor do saque" htmlFor="amountCents" className="flex-1">
            <MoneyInput
              id="amountCents"
              name="amountCents"
              maxCents={balanceCents}
              onValueChange={setAmountCents}
              required
            />
          </Field>
          <Button
            type="button"
            disabled={pending || !canWithdraw}
            onClick={() => setConfirmOpen(true)}
          >
            Sacar
          </Button>
        </form>
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title="Confirmar saque"
          description="O valor será debitado do seu saldo disponível. Esta operação é simulada e não pode ser desfeita."
          confirmLabel="Confirmar saque"
          pending={pending}
          onConfirm={() => {
            payoutFormRef.current?.requestSubmit();
            setConfirmOpen(false);
          }}
        />
        <p className="mt-2 text-xs text-corsa-muted">
          Saques simulados para demonstração. Repasse de {photographerSharePercent}% já aplicado no saldo.
        </p>
      </Card>

      <Card className="mt-6 p-6">
        <h2 className="font-heading font-semibold text-corsa-ink">
          Histórico de saques
        </h2>
        {payouts.length === 0 ? (
          <p className="mt-4 text-sm text-corsa-muted">Nenhum saque registrado</p>
        ) : (
          <ul className="mt-4 divide-y divide-corsa-border">
            {payouts.map((p) => (
              <li key={p.id} className="flex justify-between py-3 text-sm">
                <span>{formatShortDate(p.requested_at)}</span>
                <span className="font-semibold">{formatCurrency(p.amount_cents)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
