export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { AdminNav } from "@/components/layout/AdminNav";
import { NO_INDEX_METADATA } from "@/lib/seo";

export const metadata: Metadata = NO_INDEX_METADATA;

export default function AdminLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:px-8">
        <aside className="shrink-0 lg:w-56">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-corsa-muted">
            Admin
          </p>
          <AdminNav />
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </>
  );
}
