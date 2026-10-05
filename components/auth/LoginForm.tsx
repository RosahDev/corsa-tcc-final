"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, type AuthState } from "@/lib/actions/auth";
import { AuthPasswordInput } from "@/components/auth/AuthPasswordInput";
import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

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

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, {} as AuthState);

  return (
    <AuthSplitLayout
      title="Entrar"
      imagePosition="right"
      subtitleLink={
        <>
          Não tem uma conta?{" "}
          <Link
            href="/criar-conta"
            className="font-medium text-corsa-wine underline underline-offset-2 hover:text-corsa-wine-hover"
          >
            Crie agora
          </Link>
        </>
      }
    >
      <form action={action} className="flex flex-col gap-5">
        {state.error && (
          <p
            className="rounded-xl border border-corsa-wine/20 bg-corsa-rose px-4 py-3 text-sm text-corsa-wine"
            role="alert"
          >
            {state.error}
          </p>
        )}
        <AuthField label="E-mail" htmlFor="email">
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="usuario@gmail.com"
          />
        </AuthField>
        <AuthField label="Senha" htmlFor="password">
          <AuthPasswordInput
            id="password"
            name="password"
            required
            autoComplete="current-password"
          />
        </AuthField>
        <Button
          type="submit"
          size="lg"
          className="mt-1 w-full rounded-lg"
          disabled={pending}
        >
          {pending ? "Entrando..." : "Entrar no Corsa"}
        </Button>
      </form>
    </AuthSplitLayout>
  );
}
