export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { getSettings } from "@/lib/queries/site-settings";
import { ContentBlockRenderer } from "@/components/admin/ContentBlockRenderer";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Termos de uso",
  description:
    "Termos de uso da plataforma Corsa para compradores, fotógrafos e visitantes.",
  path: "/termos",
});

export default async function TermosPage() {
  const settings = await getSettings();

  return (
    <div className="page-container page-section">
      <ContentBlockRenderer blocks={settings.terms_content} />
    </div>
  );
}
