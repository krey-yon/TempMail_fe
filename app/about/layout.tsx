import type { Metadata } from "next";
import AboutPageClient from "./page";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about Xelio - a free temporary email service. Discover how it works, its features, and the open source technology behind it.",
  keywords: [
    "about xelio",
    "temporary email service",
    "disposable email",
    "xelio features",
    "anonymous email",
    "open source email",
    "free tempmail",
    "privacy email service",
    "self-destructing email",
    "ephemeral email",
    "krey-yon",
    "TempMail_fe",
  ],
  authors: [{ name: "krey-yon", url: "https://github.com/krey-yon" }],
  creator: "krey-yon",
  openGraph: {
    title: "About Xelio - Free Temporary Disposable Email Service",
    description: "Learn about Xelio - a free temporary email service. Discover features, open source technology, and how it protects your privacy.",
    url: "https://xelio.me/about",
    siteName: "Xelio",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "About Xelio - Temporary Email Service",
      },
    ],
    locale: "en_US",
    type: "article",
    publishedTime: "2026-04-26T00:00:00Z",
    modifiedTime: "2026-04-26T00:00:00Z",
    authors: ["https://github.com/krey-yon"],
    tags: ["temporary email", "privacy", "open source", "anonymous"],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Xelio - Free Temporary Disposable Email Service",
    description: "Learn about Xelio - a free temporary email service. Discover features and open source technology.",
    site: "@xelio",
    creator: "@krey_yon",
    images: ["/og-image.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/about",
    languages: {
      "en-US": "/about",
    },
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AboutPageClient />;
}