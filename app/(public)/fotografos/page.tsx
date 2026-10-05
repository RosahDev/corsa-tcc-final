export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { listPhotographers } from "@/lib/queries/photographers";
import { PhotographersList } from "@/components/photographer/PhotographersList";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Fotógrafos",
  description:
    "Conheça os fotógrafos automotivos que publicam álbuns e vendem fotos profissionais no Corsa.",
  path: "/fotografos",
});

export default async function FotografosPage() {
  const photographers = await listPhotographers();

  return (
    <div className="page-container page-section">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-corsa-wine sm:text-4xl">
          Fotógrafos
        </h1>
        <p className="mt-2 text-corsa-muted">
          Profissionais que publicam no Corsa
        </p>
      </div>

      <PhotographersList photographers={photographers} />
    </div>
  );
}
