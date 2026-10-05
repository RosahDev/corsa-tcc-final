import type { Metadata } from "next";

export const SITE_NAME = "Corsa";

export const DEFAULT_TITLE =
  "Corsa — Marketplace de fotografia automotiva";

export const DEFAULT_DESCRIPTION =
  "O principal marketplace para fotografia automotiva profissional e mídia exclusiva de eventos, drift, track days e encontros.";

export const SITE_KEYWORDS = [
  "fotografia automotiva",
  "marketplace de fotos",
  "fotos de carros",
  "eventos automotivos",
  "drift",
  "track day",
  "autódromo",
  "fotógrafos automotivos",
  "comprar fotos de carro",
  "Corsa",
] as const;

export const DEFAULT_OG_IMAGE = "/images/hero-car.jpg";

export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }
  return "http://localhost:3000";
}

export function getMetadataBase(): URL {
  return new URL(`${getSiteUrl()}/`);
}

type PageMetadataInput = {
  title: string;
  description?: string;
  path: string;
  image?: string;
  noIndex?: boolean;
  absoluteTitle?: boolean;
};

export function createPageMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path,
  image = DEFAULT_OG_IMAGE,
  noIndex = false,
  absoluteTitle = false,
}: PageMetadataInput): Metadata {
  const openGraphTitle = absoluteTitle ? title : `${title} | ${SITE_NAME}`;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    ...(noIndex
      ? { robots: { index: false, follow: false } }
      : { robots: { index: true, follow: true } }),
    alternates: {
      canonical: path,
    },
    openGraph: {
      type: "website",
      locale: "pt_BR",
      url: path,
      siteName: SITE_NAME,
      title: openGraphTitle,
      description,
      images: [
        {
          url: image,
          alt: openGraphTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: openGraphTitle,
      description,
      images: [image],
    },
  };
}

export const NO_INDEX_METADATA: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export function createRootMetadata(): Metadata {
  return {
    metadataBase: getMetadataBase(),
    title: {
      default: DEFAULT_TITLE,
      template: `%s | ${SITE_NAME}`,
    },
    description: DEFAULT_DESCRIPTION,
    applicationName: SITE_NAME,
    keywords: [...SITE_KEYWORDS],
    authors: [{ name: SITE_NAME }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
    openGraph: {
      type: "website",
      locale: "pt_BR",
      url: "/",
      siteName: SITE_NAME,
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
      images: [
        {
          url: DEFAULT_OG_IMAGE,
          alt: DEFAULT_TITLE,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
      images: [DEFAULT_OG_IMAGE],
    },
  };
}
