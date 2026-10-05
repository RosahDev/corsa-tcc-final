import { Download, Search, ShoppingBag } from "lucide-react";
import { ScrollReveal } from "./ScrollReveal";

const steps = [
  {
    icon: Search,
    title: "Explore o marketplace",
    description:
      "Filtre por cidade, modalidade, marca ou categoria. Navegue pelos álbuns publicados pelos fotógrafos.",
  },
  {
    icon: ShoppingBag,
    title: "Selecione suas fotos",
    description:
      "Compre fotos avulsas ou leve o pacote completo com desconto. Adicione ao carrinho em poucos cliques.",
  },
  {
    icon: Download,
    title: "Baixe na hora",
    description:
      "Pagamento confirmado, download liberado imediatamente na sua galeria pessoal em alta resolução.",
  },
] as const;

export function HowItWorksSection() {
  return (
    <section className="bg-corsa-cream py-16 sm:py-20">
      <div className="page-container">
        <ScrollReveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-corsa-wine">
              Simples e rápido
            </p>
            <h2 className="mt-2 font-heading text-3xl font-bold text-corsa-ink">
              Como funciona
            </h2>
            <p className="mt-3 text-corsa-muted">
              Do grid de largada ao download em três passos.
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <ScrollReveal key={step.title} delay={index * 100}>
              <div className="group relative rounded-2xl border border-corsa-border bg-white p-8 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-elevated)]">
                <div className="mb-5 flex size-12 items-center justify-center rounded-xl bg-corsa-rose text-corsa-wine transition-colors group-hover:bg-corsa-wine group-hover:text-white">
                  <step.icon className="size-6" strokeWidth={1.75} />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-corsa-wine-muted">
                  Passo {index + 1}
                </span>
                <h3 className="mt-2 font-heading text-xl font-bold text-corsa-ink">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-corsa-muted">
                  {step.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
