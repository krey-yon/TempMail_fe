import type { Metadata } from "next";
import AboutPageClient from "./page";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about Xelio - a free temporary email service. Discover how it works, its features, and the technology behind it.",
  keywords: ["about xelio", "temporary email service", "disposable email", "xelio features"],
  openGraph: {
    title: "About | Xelio",
    description: "Learn about Xelio - a free temporary email service.",
    url: "https://xelio.me/about",
    type: "article",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AboutPageClient />;
}