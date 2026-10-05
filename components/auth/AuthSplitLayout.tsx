import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { CorsaLogo } from "@/components/brand/CorsaLogo";
import { cn } from "@/lib/utils";

function AuthImagePanel({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative min-h-[220px] overflow-hidden sm:min-h-[280px] lg:min-h-[620px]",
        className,
      )}
    >
      <Image
        src="/images/auth-car.webp"
        alt="Carro de drift em ação na pista"
        fill
        priority
        className="object-cover object-center grayscale"
        sizes="(max-width: 1024px) 100vw, 50vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/5" />
      <div className="absolute inset-x-0 bottom-0 px-6 py-8 text-center text-white sm:px-8 sm:py-10">
        <div className="flex justify-center">
          <CorsaLogo variant="white" height={40} className="drop-shadow-md" />
        </div>
        <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-white/85">
          Feito por amantes de carros, para amantes de carros
        </p>
      </div>
    </div>
  );
}

export function AuthSplitLayout({
  title,
  subtitleLink,
  imagePosition = "right",
  children,
}: {
  title: string;
  subtitleLink: ReactNode;
  imagePosition?: "left" | "right";
  children: ReactNode;
}) {
  const imageFirst = imagePosition === "left";

  return (
    <div className="animate-fade-up w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-elevated)]">
      <div className="grid lg:grid-cols-2">
        <div
          className={cn(
            "order-2 flex flex-col justify-center px-6 py-8 sm:px-10 sm:py-10 lg:order-none lg:px-12 lg:py-12",
            imageFirst ? "lg:order-2" : "lg:order-1",
          )}
        >
          <Link href="/" className="mb-8 inline-flex" aria-label="Corsa — início">
            <CorsaLogo height={26} />
          </Link>
          <div>
            <h1 className="font-heading text-3xl font-bold tracking-tight text-corsa-ink sm:text-4xl">
              {title}
            </h1>
            <div className="mt-2 text-sm text-corsa-muted">{subtitleLink}</div>
          </div>
          <div className="mt-6">{children}</div>
        </div>

        <AuthImagePanel
          className={cn(
            "order-1 lg:order-none",
            imageFirst ? "lg:order-1" : "lg:order-2",
          )}
        />
      </div>
    </div>
  );
}
