import { TabNav, type TabNavItem } from "@/components/layout/TabNav";

const studioLinks: TabNavItem[] = [
  { href: "/painel", label: "Dashboard", shortLabel: "Início" },
  { href: "/painel/albuns", label: "Álbuns" },
  { href: "/painel/vendas", label: "Vendas" },
  { href: "/painel/faturamento", label: "Faturamento", shortLabel: "Fatura" },
  { href: "/painel/perfil", label: "Perfil público", shortLabel: "Perfil" },
];

export function StudioNav() {
  return (
    <TabNav
      items={studioLinks}
      ariaLabel="Painel do fotógrafo"
      exactRoot="/painel"
    />
  );
}
