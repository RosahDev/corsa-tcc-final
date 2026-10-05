"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { CorsaLogo } from "@/components/brand/CorsaLogo";
import { MobileNav, MobileNavTrigger } from "./MobileNav";
import { getMainNavLinks, type NavLink } from "./nav-links";
import { logoutAction } from "@/lib/actions/auth";

type SiteHeaderClientProps = {
  user: {
    name: string;
    role: "buyer" | "photographer" | "admin";
    handle?: string | null;
  } | null;
  cartCount: number;
};

function isNavLinkActive(pathname: string, href: string) {
  return pathname === href || (href !== "/" && pathname.startsWith(href));
}

function FloatingNavLinks({
  links,
  pathname,
  glass,
}: {
  links: NavLink[];
  pathname: string;
  glass: boolean;
}) {
  const navRef = useRef<HTMLElement>(null);
  const linkRefs = useRef(new Map<string, HTMLAnchorElement>());
  const [pill, setPill] = useState({ width: 0, x: 0, visible: false });

  const activeHref = links.find((link) =>
    isNavLinkActive(pathname, link.href),
  )?.href;

  const updatePill = useCallback(() => {
    if (!activeHref) {
      setPill((current) => ({ ...current, visible: false }));
      return;
    }

    const container = navRef.current;
    const activeLink = linkRefs.current.get(activeHref);
    if (!container || !activeLink) return;

    const containerRect = container.getBoundingClientRect();
    const linkRect = activeLink.getBoundingClientRect();

    setPill({
      width: linkRect.width,
      x: linkRect.left - containerRect.left,
      visible: true,
    });
  }, [activeHref]);

  useLayoutEffect(() => {
    updatePill();
  }, [updatePill]);

  useLayoutEffect(() => {
    const container = navRef.current;
    if (!container) return;

    const observer = new ResizeObserver(updatePill);
    observer.observe(container);
    window.addEventListener("resize", updatePill);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updatePill);
    };
  }, [updatePill]);

  return (
    <nav
      ref={navRef}
      className="relative hidden items-center rounded-full p-1 lg:flex"
      aria-label="Navegacao principal"
    >
      <span
        aria-hidden
        className={cn(
          "auth-role-pill pointer-events-none absolute top-1 bottom-1 left-0 rounded-full shadow-sm",
          pill.visible ? "opacity-100" : "opacity-0",
          glass ? "bg-corsa-wine/90" : "bg-corsa-rose",
        )}
        style={{
          width: pill.width,
          transform: `translateX(${pill.x}px)`,
        }}
      />
      {links.map((link) => {
        const isActive = isNavLinkActive(pathname, link.href);

        return (
          <Link
            key={link.href}
            ref={(node) => {
              if (node) {
                linkRefs.current.set(link.href, node);
              } else {
                linkRefs.current.delete(link.href);
              }
            }}
            href={link.href}
            className={cn(
              "relative z-10 rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-500 ease-out",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-corsa-wine",
              isActive
                ? glass
                  ? "text-white"
                  : "text-corsa-wine"
                : glass
                  ? "text-white/70 hover:text-white"
                  : "text-corsa-ink/80 hover:text-corsa-wine",
            )}
            aria-current={isActive ? "page" : undefined}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function SiteHeaderClient({ user, cartCount }: SiteHeaderClientProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobileNav = useCallback(() => setMobileOpen(false), []);
  const isHome = pathname === "/";
  const [heroInView, setHeroInView] = useState(isHome);
  const navLinks = getMainNavLinks(user?.role ?? null);
  const showCart = user?.role !== "photographer";
  const glass = isHome && heroInView;

  useEffect(() => {
    if (!isHome) {
      setHeroInView(false);
      return;
    }

    const hero = document.querySelector("[data-site-hero]");
    if (!hero) {
      setHeroInView(false);
      return;
    }

    setHeroInView(true);

    const observer = new IntersectionObserver(
      ([entry]) => {
        setHeroInView(entry.isIntersecting);
      },
      {
        threshold: 0,
        rootMargin: "-72px 0px 0px 0px",
      },
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, [isHome]);

  return (
    <>
      <header
        className={cn(
          "fixed top-4 left-1/2 z-40 w-[calc(100%-2rem)] max-w-5xl -translate-x-1/2",
          "rounded-full border px-3 py-2 shadow-lg backdrop-blur-xl transition-colors duration-300",
          glass
            ? "border-white/20 bg-white/10 shadow-black/15"
            : "border-corsa-border/70 bg-white/90 shadow-[var(--shadow-elevated)]",
        )}
      >
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <MobileNavTrigger
              onOpen={() => setMobileOpen(true)}
              className={cn(glass && "text-white hover:bg-white/10")}
            />
            <Link href="/" className="inline-flex" aria-label="Corsa — início">
              <CorsaLogo
                variant={glass ? "white" : "primary"}
                height={24}
                priority
                className="sm:h-[26px]"
              />
            </Link>
          </div>

          <div className="flex justify-center">
            <FloatingNavLinks
              links={navLinks}
              pathname={pathname}
              glass={glass}
            />
          </div>

          <div className="flex items-center justify-end gap-1 sm:gap-2">
            {showCart && (
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "relative",
                  glass
                    ? "text-white/80 hover:bg-white/10 hover:text-white"
                    : "text-corsa-ink hover:text-corsa-wine",
                )}
                href="/carrinho"
                aria-label={`Carrinho${cartCount ? `, ${cartCount} itens` : ""}`}
              >
                <ShoppingCart className="size-5" />
                {cartCount > 0 && (
                  <span
                    className={cn(
                      "absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full text-[10px] font-bold text-white",
                      glass ? "bg-white text-corsa-wine" : "bg-corsa-wine",
                    )}
                  >
                    {cartCount}
                  </span>
                )}
              </Button>
            )}

            {user ? (
              <div className="hidden items-center gap-1.5 md:flex">
                {user.role === "buyer" ? (
                  <Button
                    variant={glass ? "outlineLight" : "wineGhost"}
                    size="sm"
                    href="/minha-galeria"
                  >
                    Galeria
                  </Button>
                ) : user.role === "admin" ? (
                  <Button
                    variant={glass ? "outlineLight" : "outline"}
                    size="sm"
                    href="/admin"
                  >
                    Admin
                  </Button>
                ) : (
                  <Button
                    variant={glass ? "outlineLight" : "outline"}
                    size="sm"
                    href="/painel"
                  >
                    Painel
                  </Button>
                )}
                <form action={logoutAction}>
                  <Button
                    variant="ghost"
                    size="sm"
                    type="submit"
                    className={cn(
                      glass &&
                        "text-white/80 hover:bg-white/10 hover:text-white",
                    )}
                  >
                    Sair
                  </Button>
                </form>
              </div>
            ) : (
              <div className="hidden items-center gap-1.5 md:flex">
                <Button
                  variant={glass ? "outlineLight" : "wineGhost"}
                  size="sm"
                  href="/entrar"
                >
                  Entrar
                </Button>
                <Button
                  variant={glass ? "outlineLight" : "primary"}
                  size="sm"
                  href="/criar-conta"
                  className={cn(
                    glass &&
                      "border-white/30 bg-white/15 text-white hover:bg-white/25",
                  )}
                >
                  Criar conta
                </Button>
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "hidden sm:inline-flex md:hidden",
                glass
                  ? "text-white/80 hover:bg-white/10 hover:text-white"
                  : "text-corsa-ink hover:text-corsa-wine",
              )}
              href={
                user?.role === "admin"
                  ? "/admin"
                  : user?.role === "photographer"
                    ? "/painel"
                    : "/minha-conta"
              }
              aria-label="Conta"
            >
              <User className="size-5" />
            </Button>
          </div>
        </div>
      </header>

      {!isHome && <div className="h-[4.5rem]" aria-hidden="true" />}

      <MobileNav
        open={mobileOpen}
        onClose={closeMobileNav}
        navLinks={navLinks}
        user={user}
      />
    </>
  );
}
