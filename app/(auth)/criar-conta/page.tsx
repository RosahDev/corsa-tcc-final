import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";
import type { AuthRole } from "@/components/auth/AuthRoleSelector";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Criar conta",
  description:
    "Cadastre-se no Corsa como comprador ou fotógrafo e comece a explorar ou vender fotografia automotiva.",
  path: "/criar-conta",
});

export default async function CriarContaPage({
  searchParams,
}: PageProps<"/criar-conta">) {
  const params = await searchParams;
  const defaultRole: AuthRole =
    params.role === "photographer" || params.tipo === "fotografo"
      ? "photographer"
      : "buyer";

  return <RegisterForm defaultRole={defaultRole} />;
}
