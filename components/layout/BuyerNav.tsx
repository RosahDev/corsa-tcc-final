import { TabNav, type TabNavItem } from "@/components/layout/TabNav";

const buyerLinks: TabNavItem[] = [
  { href: "/minha-galeria", label: "Minha galeria", shortLabel: "Galeria" },
  { href: "/favoritos", label: "Favoritos" },
  { href: "/meus-pedidos", label: "Meus pedidos", shortLabel: "Pedidos" },
  { href: "/minha-conta", label: "Minha conta", shortLabel: "Conta" },
];

export function BuyerNav() {
  return (
    <TabNav
      items={buyerLinks}
      ariaLabel="Área do comprador"
    />
  );
}
