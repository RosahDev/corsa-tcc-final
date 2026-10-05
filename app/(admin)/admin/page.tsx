export const dynamic = "force-dynamic";

import { requireAdmin } from "@/lib/auth/current-user";
import { getSettings } from "@/lib/queries/site-settings";
import { AdminSettingsClient } from "@/components/admin/AdminSettingsClient";

export default async function AdminPage() {
  await requireAdmin();
  const settings = await getSettings();

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-corsa-wine">
        Configurações do site
      </h1>
      <p className="mt-1 text-sm text-corsa-muted">
        Taxa da plataforma, redes sociais e páginas legais.
      </p>
      <div className="mt-8">
        <AdminSettingsClient settings={settings} />
      </div>
    </div>
  );
}
