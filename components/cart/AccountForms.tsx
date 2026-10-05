"use client";

import { useActionState } from "react";
import {
  changePasswordAction,
  deleteAccountAction,
  updateBuyerProfileAction,
  type ProfileActionState,
} from "@/lib/actions/profile";
import type { UserRow } from "@/lib/queries/users";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDeleteForm } from "@/components/ui/ConfirmDeleteForm";

export function AccountForms({ user }: { user: UserRow }) {
  const [profileState, profileAction, profilePending] = useActionState(
    updateBuyerProfileAction,
    {} as ProfileActionState,
  );
  const [passwordState, passwordAction, passwordPending] = useActionState(
    changePasswordAction,
    {} as ProfileActionState,
  );

  return (
    <div className="flex flex-col gap-8">
      <Card className="p-6">
        <h2 className="font-heading font-semibold text-corsa-ink">
          Dados pessoais
        </h2>
        <form action={profileAction} className="mt-4 flex flex-col gap-4">
          {profileState.success && (
            <p className="text-sm text-corsa-success">Dados atualizados</p>
          )}
          {profileState.error && (
            <p className="text-sm text-corsa-wine">{profileState.error}</p>
          )}
          <Field label="Nome" htmlFor="name">
            <Input id="name" name="name" defaultValue={user.name} required />
          </Field>
          <Field label="E-mail" htmlFor="email">
            <Input id="email" value={user.email} disabled />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Rua" htmlFor="billingStreet">
              <Input
                id="billingStreet"
                name="billingStreet"
                defaultValue={user.billing_street ?? ""}
              />
            </Field>
            <Field label="Número" htmlFor="billingNumber">
              <Input
                id="billingNumber"
                name="billingNumber"
                defaultValue={user.billing_number ?? ""}
              />
            </Field>
            <Field label="Complemento" htmlFor="billingComplement">
              <Input
                id="billingComplement"
                name="billingComplement"
                defaultValue={user.billing_complement ?? ""}
              />
            </Field>
            <Field label="Bairro" htmlFor="billingNeighborhood">
              <Input
                id="billingNeighborhood"
                name="billingNeighborhood"
                defaultValue={user.billing_neighborhood ?? ""}
              />
            </Field>
            <Field label="Cidade" htmlFor="billingCity">
              <Input
                id="billingCity"
                name="billingCity"
                defaultValue={user.billing_city ?? ""}
              />
            </Field>
            <Field label="UF" htmlFor="billingState">
              <Input
                id="billingState"
                name="billingState"
                maxLength={2}
                defaultValue={user.billing_state ?? ""}
              />
            </Field>
            <Field label="CEP" htmlFor="billingZip">
              <Input
                id="billingZip"
                name="billingZip"
                defaultValue={user.billing_zip ?? ""}
              />
            </Field>
          </div>
          <Button type="submit" disabled={profilePending}>
            Salvar alterações
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <h2 className="font-heading font-semibold text-corsa-ink">
          Alterar senha
        </h2>
        <form action={passwordAction} className="mt-4 flex flex-col gap-4">
          {passwordState.success && (
            <p className="text-sm text-corsa-success">Senha alterada</p>
          )}
          {passwordState.error && (
            <p className="text-sm text-corsa-wine">{passwordState.error}</p>
          )}
          <Field label="Senha atual" htmlFor="currentPassword">
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              required
            />
          </Field>
          <Field label="Nova senha" htmlFor="newPassword">
            <Input id="newPassword" name="newPassword" type="password" required />
          </Field>
          <Field label="Confirmar senha" htmlFor="confirmPassword">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
            />
          </Field>
          <Button type="submit" disabled={passwordPending}>
            Atualizar senha
          </Button>
        </form>
      </Card>

      <Card className="border-corsa-wine/20 p-6">
        <h2 className="font-heading font-semibold text-corsa-wine">
          Excluir conta
        </h2>
        <p className="mt-2 text-sm text-corsa-muted">
          Esta ação é permanente e remove seus dados de compra.
        </p>
        <ConfirmDeleteForm
          action={deleteAccountAction}
          title="Excluir conta"
          description="Sua conta e todos os dados de compra serão removidos permanentemente. Esta ação não pode ser desfeita."
          confirmLabel="Excluir conta"
          className="mt-4"
        >
          <Button
            variant="outline"
            className="border-corsa-wine text-corsa-wine"
          >
            Excluir minha conta
          </Button>
        </ConfirmDeleteForm>
      </Card>
    </div>
  );
}
