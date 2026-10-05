export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { getPhotographerSharePercent } from "@/lib/constants";
import {
  countCitiesCovered,
  countDailyUploads,
  countPaidOrders,
  countPublishedAlbums,
} from "@/lib/queries/orders";
import { listPublishedAlbums } from "@/lib/queries/albums";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturedAlbumsSection } from "@/components/landing/FeaturedAlbumsSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { PhotographersSection } from "@/components/landing/PhotographersSection";
import { RecentAlbumsSection } from "@/components/landing/RecentAlbumsSection";
import { SocialProofSection } from "@/components/landing/SocialProofSection";
import { createPageMetadata, DEFAULT_TITLE } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: DEFAULT_TITLE,
  description:
    "Encontre e compre fotos profissionais de eventos automotivos, drift, track days e encontros. Fotógrafos publicam álbuns; você escolhe e baixa em alta qualidade.",
  path: "/",
  absoluteTitle: true,
});

export default async function HomePage() {
  const emptyAlbums = { albums: [], total: 0, page: 1, totalPages: 1 };
  const [uploads, albums, cities, orders, featured, recentAlbums, sharePercent] =
    await Promise.all([
      countDailyUploads().catch(() => 128),
      countPublishedAlbums().catch(() => 0),
      countCitiesCovered().catch(() => 0),
      countPaidOrders().catch(() => 0),
      listPublishedAlbums({ page: 1, sort: "recent" }).catch(() => emptyAlbums),
      listPublishedAlbums({ page: 1, sort: "date_desc" }).catch(
        () => emptyAlbums,
      ),
      getPhotographerSharePercent().catch(() => 85),
    ]);

  return (
    <>
      <HeroSection uploads={uploads} albums={albums} orders={orders} />
      <FeaturedAlbumsSection albums={featured.albums} />
      <HowItWorksSection />
      <PhotographersSection photographerSharePercent={sharePercent} />
      <RecentAlbumsSection albums={recentAlbums.albums} />
      <SocialProofSection
        orders={orders}
        cities={cities}
        photographerSharePercent={sharePercent}
      />
    </>
  );
}
