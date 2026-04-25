import type { Metadata } from "next";
import PrivacyPageClient from "./page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Learn how Xelio protects your privacy. Our privacy policy explains how we handle temporary email addresses, data retention, and your personal information.",
  keywords: ["privacy policy", "data protection", "temporary email privacy", "Xelio privacy", "disposable email privacy"],
  openGraph: {
    title: "Privacy Policy | Xelio",
    description: "Learn how Xelio protects your privacy. Our privacy policy explains how we handle temporary email addresses and data retention.",
    url: "https://xelio.me/privacy",
    type: "article",
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PrivacyPageClient />;
}