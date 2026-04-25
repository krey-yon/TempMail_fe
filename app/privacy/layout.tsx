import type { Metadata } from "next";
import PrivacyPageClient from "./page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Learn how Xelio protects your privacy. Our privacy policy explains how we handle temporary email addresses, zero data retention, and your personal information.",
  keywords: [
    "privacy policy",
    "data protection",
    "temporary email privacy",
    "Xelio privacy",
    "disposable email privacy",
    "data retention",
    "GDPR",
    "CCPA",
    "privacy first email",
    "no logs email",
    "anonymous email service",
    "privacy compliance",
    "user data",
    "cookie policy",
    "third party sharing",
  ],
  authors: [{ name: "krey-yon", url: "https://github.com/krey-yon" }],
  creator: "krey-yon",
  openGraph: {
    title: "Privacy Policy - Xelio Temporary Email Service",
    description: "Learn how Xelio protects your privacy. Zero logs, no data retention, and anonymous temporary email service.",
    url: "https://xelio.me/privacy",
    siteName: "Xelio",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Xelio Privacy Policy",
      },
    ],
    locale: "en_US",
    type: "article",
    publishedTime: "2026-04-26T00:00:00Z",
    modifiedTime: "2026-04-26T00:00:00Z",
    authors: ["https://github.com/krey-yon"],
    tags: ["privacy", "data protection", "temporary email", "security"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy - Xelio Temporary Email Service",
    description: "Learn how Xelio protects your privacy with zero data retention and anonymous service.",
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
    canonical: "/privacy",
    languages: {
      "en-US": "/privacy",
    },
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PrivacyPageClient />;
}