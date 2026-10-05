import { Quote, Star } from "lucide-react";
import { ScrollReveal } from "./ScrollReveal";

type SocialProofSectionProps = {
  orders: number;
  cities: number;
  photographerSharePercent: number;
};

export function SocialProofSection({
  orders,
  cities,
  photographerSharePercent,
}: SocialProofSectionProps) {
  return (
    <section className="border-y border-corsa-border bg-corsa-rose/30 py-16 sm:py-20">
      <div className="page-container">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <ScrollReveal>
            <div className="grid grid-cols-2 gap-6">
              <div className="rounded-2xl border border-corsa-border bg-white p-6 text-center shadow-[var(--shadow-card)]">
                <p className="font-heading text-4xl font-bold text-corsa-wine">
                  {orders}+
                </p>
                <p className="mt-2 text-sm text-corsa-muted">Pedidos entregues</p>
              </div>
              <div className="rounded-2xl border border-corsa-border bg-white p-6 text-center shadow-[var(--shadow-card)]">
                <p className="font-heading text-4xl font-bold text-corsa-wine">
                  {cities}
                </p>
                <p className="mt-2 text-sm text-corsa-muted">Cidades cobertas</p>
              </div>
              <div className="col-span-2 rounded-2xl border border-corsa-border bg-white p-6 text-center shadow-[var(--shadow-card)]">
                <p className="font-heading text-4xl font-bold text-corsa-wine">
                  {photographerSharePercent}%
                </p>
                <p className="mt-2 text-sm text-corsa-muted">
                  Repasse para fotógrafos em cada venda
                </p>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={120}>
            <div className="relative rounded-2xl border border-corsa-border bg-white p-8 shadow-[var(--shadow-card)]">
              <Quote
                className="absolute right-6 top-6 size-10 text-corsa-rose"
                strokeWidth={1.5}
              />
              <div className="mb-4 flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="size-4 fill-corsa-wine text-corsa-wine"
                  />
                ))}
              </div>
              <blockquote className="text-lg leading-relaxed text-corsa-ink">
                &ldquo;Encontrei minhas fotos do track day em menos de dois
                minutos. Qualidade absurda e download na hora.&rdquo;
              </blockquote>
              <footer className="mt-6 flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-corsa-wine font-heading text-sm font-bold text-white">
                  RM
                </div>
                <div>
                  <p className="text-sm font-semibold text-corsa-ink">
                    Rafael M.
                  </p>
                  <p className="text-xs text-corsa-muted">
                    Piloto amador, Interlagos
                  </p>
                </div>
              </footer>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
