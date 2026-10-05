import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { CorsaLogo } from "@/components/brand/CorsaLogo";
import { Button } from "@/components/ui/Button";
import { AnimatedNumber } from "./AnimatedNumber";
import { AnimatedLines } from "./AnimatedLines";

type HeroSectionProps = {
  uploads: number;
  albums: number;
  orders: number;
};

export function HeroSection({ uploads, albums, orders }: HeroSectionProps) {
  return (
    <section
      data-site-hero
      className="relative min-h-[min(92vh,920px)] overflow-hidden"
    >
      <Image
        src="/images/image-background.webp"
        alt="Lamborghini em pista capturada em alta velocidade"
        fill
        priority
        className="object-cover object-[center_42%]"
        sizes="100vw"
      />

      <div className="absolute inset-0 bg-black/30" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_0%_0%,rgba(93,25,35,0.48),transparent_58%)]" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-black/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/15" />

      <AnimatedLines className="pointer-events-none absolute -right-24 top-1/2 hidden w-[min(56vw,700px)] -translate-y-1/2 lg:block" />

      <div className="page-container relative flex min-h-[min(92vh,920px)] flex-col justify-between pb-14 pt-28 sm:pb-16 sm:pt-32 lg:pb-20 lg:pt-36">
        <div className="animate-fade-up max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/65">
            Fotografia automotiva
          </p>

          <h1 className="mt-4 font-heading text-[clamp(3.5rem,12vw,7.5rem)] font-bold leading-[0.92] tracking-tight text-white">
            CORSA
          </h1>

          <p className="mt-4 max-w-xl text-xl font-medium leading-snug text-white/90 sm:text-2xl">
            Capture a adrenalina da pista.
          </p>

          <p className="mt-4 max-w-lg text-base leading-relaxed text-white/70 sm:text-lg">
            Fotografia profissional automotiva. Encontre seu veículo por
            cidade, modalidade ou marca em segundos.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button size="lg" href="/marketplace" className="w-full sm:w-auto">
              Explorar marketplace
              <ArrowRight className="size-4" />
            </Button>
            <Button
              variant="outlineLight"
              size="lg"
              href="/criar-conta?tipo=fotografo"
              className="w-full sm:w-auto"
            >
              Sou fotógrafo
            </Button>
          </div>
        </div>

        <div className="animate-fade-up mt-12 grid grid-cols-3 gap-6 border-t border-white/15 pt-8 sm:max-w-2xl">
          <div>
            <p className="font-heading text-2xl font-bold text-white sm:text-3xl">
              <AnimatedNumber value={uploads} suffix="+" />
            </p>
            <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-white/55">
              Uploads diários
            </p>
          </div>
          <div>
            <p className="font-heading text-2xl font-bold text-white sm:text-3xl">
              <AnimatedNumber value={albums} />
            </p>
            <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-white/55">
              Álbuns publicados
            </p>
          </div>
          <div>
            <p className="font-heading text-2xl font-bold text-white sm:text-3xl">
              <AnimatedNumber value={orders} suffix="+" />
            </p>
            <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-white/55">
              Pedidos concluídos
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
