import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Entrar",
  description:
    "Acesse sua conta Corsa para comprar fotos, gerenciar pedidos ou publicar álbuns como fotógrafo.",
  path: "/entrar",
});

export default function EntrarPage() {
  return <LoginForm />;
}
