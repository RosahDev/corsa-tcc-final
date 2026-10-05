import { redirect } from "next/navigation";

export default function CriarContaFotografoPage() {
  redirect("/criar-conta?tipo=fotografo");
}
