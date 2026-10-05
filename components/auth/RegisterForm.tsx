"use client";

import Link from "next/link";
import { useState } from "react";
import { useActionState } from "react";
import { registerAction, type AuthState } from "@/lib/actions/auth";
import {
  AuthRoleSelector,
  type AuthRole,
} from "@/components/auth/AuthRoleSelector";
import { AuthPasswordInput } from "@/components/auth/AuthPasswordInput";
import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";

function AuthField({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm text-corsa-muted">
        {label}
      </label>
      {children}
    </div>
  );
}

export function RegisterForm({
  defaultRole = "buyer",
}: {
  defaultRole?: AuthRole;
}) {
  const [role, setRole] = useState<AuthRole>(defaultRole);
  const [state, formAction, pending] = useActionState(
    registerAction,
    {} as AuthState,
  );
  const isPhotographer = role === "photographer";

  return (
    <AuthSplitLayout
      title={"Criar conta"}
      imagePosition="left"
      subtitleLink={
        <>
          Já tem uma conta?{" "}
          <Link
            href="/entrar"
            className="font-medium text-corsa-wine underline underline-offset-2 hover:text-corsa-wine-hover"
          >
            Entre agora
          </Link>
        </>
      }
    >
      <AuthRoleSelector role={role} onRoleChange={setRole} />
      <form action={formAction} className="mt-6 flex flex-col gap-5">
        <input type="hidden" name="role" value={role} />
        {state.error && (
          <p
            className="rounded-xl border border-corsa-wine/20 bg-corsa-rose px-4 py-3 text-sm text-corsa-wine"
            role="alert"
          >
            {state.error}
          </p>
        )}
        <AuthField label="Nome" htmlFor="name">
          <Input
            id="name"
            name="name"
            required
            autoComplete="name"
            placeholder="Nome completo"
          />
        </AuthField>
        <AuthField label="E-mail" htmlFor="email">
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder={
              isPhotographer ? "fotografo@gmail.com" : "usuario@gmail.com"
            }
          />
        </AuthField>
        <AuthField label="Senha" htmlFor="password">
          <AuthPasswordInput
            id="password"
            name="password"
            required
            minLength={6}
            autoComplete="new-password"
          />
        </AuthField>
        <label className="flex items-start gap-2.5 text-sm leading-relaxed text-corsa-muted">
          <Checkbox name="acceptTerms" value="on" required className="mt-0.5" />
          <span>
            Li e aceito os{" "}
            <Link
              href="/termos"
              className="font-medium text-corsa-wine underline underline-offset-2 hover:text-corsa-wine-hover"
              target="_blank"
            >
              termos de uso
            </Link>{" "}
            e a{" "}
            <Link
              href="/privacidade"
              className="font-medium text-corsa-wine underline underline-offset-2 hover:text-corsa-wine-hover"
              target="_blank"
            >
              política de privacidade
            </Link>{" "}
            do Corsa
          </span>
        </label>
        <Button
          type="submit"
          size="lg"
          className="mt-1 w-full rounded-lg"
          disabled={pending}
        >
          {pending ? "Cadastrando..." : "Cadastrar no Corsa"}
        </Button>
      </form>
    </AuthSplitLayout>
  );
}
