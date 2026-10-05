import Image from "next/image";
import { CorsaLogo } from "@/components/brand/CorsaLogo";
import { Button } from "@/components/ui/Button";
import { ElectricBorderCard } from "./ElectricBorderCard";
import { ScrollReveal } from "./ScrollReveal";

export function PhotographersSection({
  photographerSharePercent,
}: {
  photographerSharePercent: number;
}) {
  return (
    <section className="bg-[#1c1b1a] py-16 sm:py-20">
      <div className="page-container">
        <ScrollReveal>
          <ElectricBorderCard>
          <div className="relative bg-corsa-wine">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.06),transparent_60%)]" />
            <div className="relative grid items-center gap-8 lg:grid-cols-2 lg:gap-0">
              <div className="relative aspect-[4/5] overflow-hidden lg:aspect-auto lg:min-h-[420px]">
                <Image
                  src="/images/photographer-car.jpg"
                  alt="Carro esportivo em pista ao entardecer"
                  fill
                  className="object-cover grayscale contrast-[1.08] brightness-[0.92]"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                {/* <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/10 to-corsa-wine/50 lg:bg-gradient-to-l lg:from-corsa-wine/70 lg:via-black/20 lg:to-transparent" /> */}
                <div className="absolute bottom-5 left-5">
                  <CorsaLogo
                    variant="white"
                    height={22}
                    className="drop-shadow-md"
                  />
                </div>
              </div>

              <div className="px-8 pb-10 pt-4 text-white lg:px-12 lg:py-14">
                <p className="text-xs font-semibold uppercase tracking-widest text-white/60">
                  Para fotógrafos
                </p>
                <h2 className="mt-3 font-heading text-3xl font-bold leading-tight sm:text-4xl">
                  Você é um artista das pistas?
                </h2>
                <p className="mt-5 max-w-md text-base leading-relaxed text-white/80">
                  Junte-se à nossa rede de fotógrafos e monetize sua paixão.
                  Defina seus próprios preços e fique com {photographerSharePercent}%
                  de cada venda.
                </p>
                <Button
                  variant="secondary"
                  size="lg"
                  href="/criar-conta?tipo=fotografo"
                  className="mt-8"
                >
                  Seja um fotógrafo
                </Button>
              </div>
            </div>
          </div>
        </ElectricBorderCard>
        </ScrollReveal>
      </div>
    </section>
  );
}
