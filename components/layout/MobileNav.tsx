"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { LogOut, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { CorsaLogo } from "@/components/brand/CorsaLogo";
import { getMainNavLinks, type NavLink } from "./nav-links";
import { logoutAction } from "@/lib/actions/auth";

export type MobileNavLink = NavLink & {
  icon?: LucideIcon;
};

export type MobileNavProps = {
  open: boolean;
  onClose: () => void;
  links?: MobileNavLink[];
  navLinks?: MobileNavLink[];
  user?: { name: string; role: "buyer" | "photographer" | "admin"; handle?: string | null } | null;
};

export function MobileNav({
  open,
  onClose,
  links,
  navLinks,
  user,
}: MobileNavProps) {
  const pathname = usePathname();
  const resolvedLinks: MobileNavLink[] =
    navLinks ?? links ?? getMainNavLinks(user?.role ?? null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    onClose();
    // Fecha ao trocar de rota; não depende de `onClose` para evitar fechar ao abrir.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
      <button
        type="button"
        className="overlay-enter absolute inset-0 bg-corsa-ink/40"
        onClick={onClose}
        aria-label="Fechar menu"
      />
      <nav
        className={cn(
          "mobile-nav-enter absolute right-0 top-0 flex h-full w-[min(100%,20rem)] flex-col",
          "bg-white shadow-[var(--shadow-elevated)]",
        )}
      >
        <div className="flex items-center justify-between border-b border-corsa-border px-5 py-4">
          <CorsaLogo height={24} />
          <Button
            variant="ghost"
            size="iconSm"
            onClick={onClose}
            aria-label="Fechar menu"
          >
            <X className="size-5" />
          </Button>
        </div>

        <ul className="flex flex-col gap-1 p-4">
          {resolvedLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));
            const Icon = link.icon;

            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-corsa-rose text-corsa-wine"
                      : "text-corsa-ink hover:bg-corsa-cream",
                  )}
                  onClick={onClose}
                >
                  {Icon && <Icon className="size-4 shrink-0" aria-hidden="true" />}
                  {link.label}
                </Link>
              </li>
            );
          })}
          {user?.role === "admin" && (
            <li>
              <Link
                href="/admin"
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                  pathname.startsWith("/admin")
                    ? "bg-corsa-rose text-corsa-wine"
                    : "text-corsa-ink hover:bg-corsa-cream",
                )}
                onClick={onClose}
              >
                Admin
              </Link>
            </li>
          )}
        </ul>

        <div className="mt-auto flex flex-col gap-3 border-t border-corsa-border p-4">
          {user ? (
            <>
              <p className="px-2 text-sm text-corsa-muted">
                Olá, {user.name.split(" ")[0]}
              </p>
              {user.role === "buyer" ? (
                <Button variant="outline" className="w-full" href="/minha-conta">
                  Minha conta
                </Button>
              ) : user.role === "admin" ? (
                <Button variant="outline" className="w-full" href="/admin">
                  Configurações
                </Button>
              ) : (
                <Button variant="outline" className="w-full" href="/painel/perfil">
                  Perfil público
                </Button>
              )}
              <form action={logoutAction}>
                <Button
                  variant="ghost"
                  className="w-full"
                  type="submit"
                >
                  <LogOut className="size-4" />
                  Sair
                </Button>
              </form>
            </>
          ) : (
            <>
              <Button variant="outline" className="w-full" href="/entrar">
                Entrar
              </Button>
              <Button className="w-full" href="/criar-conta">
                Criar conta
              </Button>
            </>
          )}
        </div>
      </nav>
    </div>
  );
}

export type MobileNavTriggerProps = {
  onOpen: () => void;
  className?: string;
};

export function MobileNavTrigger({ onOpen, className }: MobileNavTriggerProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("lg:hidden", className)}
      onClick={onOpen}
      aria-label="Abrir menu"
    >
      <svg
        viewBox="0 0 24 24"
        className="size-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
      </svg>
    </Button>
  );
}
