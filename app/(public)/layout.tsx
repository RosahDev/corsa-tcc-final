export const dynamic = "force-dynamic";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { getSettings } from "@/lib/queries/site-settings";

export default async function PublicLayout({ children }: LayoutProps<"/">) {
  const settings = await getSettings();

  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter socialLinks={settings.social_links} />
    </>
  );
}
