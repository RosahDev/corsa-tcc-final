export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { BuyerNav } from "@/components/layout/BuyerNav";
import { NO_INDEX_METADATA } from "@/lib/seo";

export const metadata: Metadata = NO_INDEX_METADATA;

export default function BuyerLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 px-4 py-6 sm:px-6 lg:flex-row lg:gap-6 lg:px-8 lg:py-8">
        <aside className="sticky top-[4.5rem] z-30 -mx-4 shrink-0 bg-corsa-cream/95 px-4 py-2 backdrop-blur-sm sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:w-52 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
          <BuyerNav />
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
      <SiteFooter />
    </>
  );
}
