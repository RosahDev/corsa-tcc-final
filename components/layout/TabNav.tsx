"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type TabNavItem = {
  href: string;
  label: string;
  shortLabel?: string;
  isActive?: (pathname: string) => boolean;
};

type TabNavProps = {
  items: TabNavItem[];
  ariaLabel: string;
  className?: string;
  /** Rota raiz que só deve ativar com match exato (ex: /painel) */
  exactRoot?: string;
};

function resolveIsActive(
  pathname: string,
  item: TabNavItem,
  exactRoot?: string,
) {
  if (item.isActive) return item.isActive(pathname);
  if (exactRoot && item.href === exactRoot) {
    return pathname === exactRoot;
  }
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function MobileTabBar({
  items,
  ariaLabel,
  exactRoot,
}: {
  items: TabNavItem[];
  ariaLabel: string;
  exactRoot?: string;
}) {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const linkRefs = useRef(new Map<string, HTMLAnchorElement>());
  const [pill, setPill] = useState({ width: 0, x: 0, visible: false });

  const activeHref = items.find((item) =>
    resolveIsActive(pathname, item, exactRoot),
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
      x: linkRect.left - containerRect.left + container.scrollLeft,
      visible: true,
    });

    activeLink.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [activeHref]);

  useLayoutEffect(() => {
    updatePill();
  }, [updatePill, pathname]);

  useLayoutEffect(() => {
    const container = navRef.current;
    if (!container) return;

    const observer = new ResizeObserver(updatePill);
    observer.observe(container);
    container.addEventListener("scroll", updatePill, { passive: true });
    window.addEventListener("resize", updatePill);

    return () => {
      observer.disconnect();
      container.removeEventListener("scroll", updatePill);
      window.removeEventListener("resize", updatePill);
    };
  }, [updatePill]);

  return (
    <nav
      ref={navRef}
      aria-label={ariaLabel}
      className={cn(
        "relative flex gap-1 overflow-x-auto rounded-2xl border border-corsa-border bg-white p-1 shadow-sm",
        "scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        "lg:hidden",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "auth-role-pill pointer-events-none absolute top-1 bottom-1 left-0 rounded-xl bg-corsa-rose",
          pill.visible ? "opacity-100" : "opacity-0",
        )}
        style={{
          width: pill.width,
          transform: `translateX(${pill.x}px)`,
        }}
      />
      {items.map((item) => {
        const isActive = resolveIsActive(pathname, item, exactRoot);

        return (
          <Link
            key={item.href}
            ref={(node) => {
              if (node) linkRefs.current.set(item.href, node);
              else linkRefs.current.delete(item.href);
            }}
            href={item.href}
            className={cn(
              "relative z-10 shrink-0 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors duration-300",
              isActive
                ? "text-corsa-wine"
                : "text-corsa-muted hover:text-corsa-ink",
            )}
            aria-current={isActive ? "page" : undefined}
          >
            {item.shortLabel ?? item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function DesktopTabNav({
  items,
  ariaLabel,
  exactRoot,
}: {
  items: TabNavItem[];
  ariaLabel: string;
  exactRoot?: string;
}) {
  const pathname = usePathname();

  return (
    <nav
      className="hidden flex-col gap-1 lg:flex"
      aria-label={ariaLabel}
    >
      {items.map((item) => {
        const isActive = resolveIsActive(pathname, item, exactRoot);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-corsa-rose text-corsa-wine"
                : "text-corsa-muted hover:bg-corsa-cream hover:text-corsa-ink",
            )}
            aria-current={isActive ? "page" : undefined}
          >
            {item.label}
            {isActive && (
              <span
                className="absolute bottom-1 left-3 right-3 h-0.5 rounded-full bg-corsa-wine"
                aria-hidden="true"
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function TabNav({
  items,
  ariaLabel,
  className,
  exactRoot,
}: TabNavProps) {
  return (
    <div className={cn("w-full", className)}>
      <MobileTabBar
        items={items}
        ariaLabel={ariaLabel}
        exactRoot={exactRoot}
      />
      <DesktopTabNav
        items={items}
        ariaLabel={ariaLabel}
        exactRoot={exactRoot}
      />
    </div>
  );
}
