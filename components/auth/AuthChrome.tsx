"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CorsaLogo } from "@/components/brand/CorsaLogo";

export function AuthChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname.startsWith("/entrar");

  return (
    <div className="flex min-h-full flex-1 flex-col bg-[#ebe6df]">
      <header className="border-b border-corsa-border/50 bg-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex" aria-label="Corsa — início">
            <CorsaLogo height={26} />
          </Link>
          {isLogin ? (
            <Link
              href="/criar-conta"
              className="rounded-lg bg-corsa-wine px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-corsa-wine-hover"
            >
              Registrar
            </Link>
          ) : (
            <Link
              href="/entrar"
              className="text-xs font-semibold uppercase tracking-wider text-corsa-muted transition-colors hover:text-corsa-wine"
            >
              Login
            </Link>
          )}
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
        {children}
      </main>

      <footer className="bg-corsa-wine text-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex" aria-label="Corsa — início">
            <CorsaLogo variant="white" height={34} />
          </Link>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/80">
            O principal marketplace para fotografia automotiva profissional e
            mídia exclusiva de eventos.
          </p>
          <p className="mt-6 text-xs text-white/55">
            © 2026 Corsa Automotive. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
