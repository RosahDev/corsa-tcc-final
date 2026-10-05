export type NavLink = {
  href: string;
  label: string;
};

export type UserRole = "buyer" | "photographer" | "admin" | null;

export const publicNavLinks: NavLink[] = [
  { href: "/marketplace", label: "Marketplace" },
  { href: "/fotografos", label: "Fotógrafos" },
];

export const buyerAreaNavLinks: NavLink[] = [
  { href: "/minha-galeria", label: "Minha Galeria" },
  { href: "/favoritos", label: "Favoritos" },
];

/** @deprecated Use getMainNavLinks(role) */
export const mainNavLinks: NavLink[] = [
  ...publicNavLinks,
  { href: "/minha-galeria", label: "Minha Galeria" },
];

export function getMainNavLinks(role: UserRole): NavLink[] {
  if (role === "photographer") {
    return [...publicNavLinks, { href: "/painel", label: "Painel" }];
  }
  if (role === "buyer") {
    return [...publicNavLinks, ...buyerAreaNavLinks];
  }
  return publicNavLinks;
}
