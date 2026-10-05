"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const adminLinks = [
  { href: "/admin", label: "Configurações" },
] as const;

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1" aria-label="Administração">
      {adminLinks.map((link) => {
        const isActive = pathname === link.href;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "relative rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-corsa-rose text-corsa-wine"
                : "text-corsa-muted hover:bg-corsa-cream hover:text-corsa-ink",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
