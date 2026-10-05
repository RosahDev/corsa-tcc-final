export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { getSettings } from "@/lib/queries/site-settings";
import { ContentBlockRenderer } from "@/components/admin/ContentBlockRenderer";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Política de privacidade",
  description:
    "Como o Corsa coleta, usa e protege seus dados pessoais na plataforma.",
  path: "/privacidade",
});

export default async function PrivacidadePage() {
  const settings = await getSettings();

  return (
    <div className="page-container page-section">
      <ContentBlockRenderer blocks={settings.privacy_content} />
    </div>
  );
}
