import type { Metadata } from "next";
import { DocumentPage, Section } from "@/components/document-page";

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

export default function AboutPage() {
  return (
    <DocumentPage eyebrow="About" title="About Xelio" updated="Version 1.0, April 2026">
      <Section title="What is Xelio?">
        <p>
          Xelio is a free temporary email service that lets you create instant, disposable email addresses. Protect your real inbox from spam, trackers, and unwanted sign-ups without revealing your identity.
        </p>
      </Section>
      <Section title="Key features">
        <p>
          <strong>Instant addresses.</strong> Generate a working email in seconds. No registration or personal information required.
        </p>
        <p>
          <strong>Automatic deletion.</strong> All emails and addresses are automatically purged after your session ends.
        </p>
        <p>
          <strong>Real-time inbox.</strong> Messages appear on their own with live polling. No manual refresh needed.
        </p>
        <p>
          <strong>Privacy first.</strong> Your temporary communications stay temporary.
        </p>
      </Section>
      <Section title="How it works">
        <p>
          Choose any username you like, and Xelio creates a unique email address at xelio.me. Any emails sent to that address appear in your inbox. When you are done, delete the address and all its messages are permanently removed.
        </p>
      </Section>
      <Section title="Use cases">
        <p>
          <strong>Sign up for services.</strong> Avoid spam in your real inbox when testing new platforms.
        </p>
        <p>
          <strong>Protect your identity.</strong> Communicate without revealing your personal email.
        </p>
        <p>
          <strong>Quick verifications.</strong> Receive confirmation codes without long-term commitment.
        </p>
        <p>
          <strong>One-time communications.</strong> Perfect for temporary correspondence.
        </p>
      </Section>
      <Section title="Open source">
        <p>
          Xelio is built and maintained by{" "}
          <a href="https://github.com/krey-yon" target="_blank" rel="noopener noreferrer">
            krey-yon
          </a>
          . The frontend code is publicly available on GitHub.
        </p>
      </Section>
      <Section title="Technology">
        <p>
          Built with Next.js 16, React 19, and Tailwind CSS. HTML mail renders in a sandboxed frame with scripts blocked, and new mail arrives through live polling with a small audio chime.
        </p>
      </Section>
      <Section title="Contact">
        <p>
          For questions, feedback, or contributions, visit the{" "}
          <a href="https://github.com/krey-yon/TempMail_fe" target="_blank" rel="noopener noreferrer">
            GitHub repository
          </a>
          .
        </p>
      </Section>
    </DocumentPage>
  );
}
