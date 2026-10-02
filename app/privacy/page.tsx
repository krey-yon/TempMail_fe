import type { Metadata } from "next";
import { DocumentPage, Section } from "@/components/document-page";

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

export default function PrivacyPage() {
  return (
    <DocumentPage eyebrow="Policy" title="Privacy Policy" updated="Last updated April 2026">
      <Section title="Data collection">
        <p>
          Xelio is designed with privacy as its core principle. We collect minimal information necessary to provide the temporary email service.
        </p>
      </Section>
      <Section title="Temporary email addresses">
        <p>
          When you create a temporary email address, we store only the address itself. Email content is held temporarily on our servers and is automatically deleted when your session ends or after a set period of inactivity.
        </p>
      </Section>
      <Section title="Cookies & local storage">
        <p>
          We use local storage to remember your theme preference, maintain your active session, and remember which messages you have already read. No tracking cookies or third-party analytics are used.
        </p>
      </Section>
      <Section title="Data retention">
        <p>
          Inboxes expire 24 hours after creation. Their stored messages are purged after expiry or manual deletion, and their usernames become available for reuse. Future mail to a reused address can reach its new owner. We retain an aggregate count of successfully created inboxes, including reused addresses; this does not count unique people.
        </p>
      </Section>
      <Section title="Third-party services">
        <p>We do not share any data with third parties. All email processing occurs entirely within our own infrastructure.</p>
      </Section>
      <Section title="Security">
        <p>
          While no service can guarantee 100% security, we employ standard measures to protect our infrastructure. However, since emails are intentionally temporary and public, we recommend not using Xelio for sensitive communications.
        </p>
      </Section>
      <Section title="Children’s privacy">
        <p>Our service is not intended for children under 13. We do not knowingly collect information from minors.</p>
      </Section>
      <Section title="Changes to this policy">
        <p>We may update this privacy policy periodically. Any changes will be posted on this page with an updated revision date.</p>
      </Section>
      <Section title="Contact">
        <p>
          For questions regarding this privacy policy, please contact us through our{" "}
          <a href="https://github.com/krey-yon/TempMail_fe" target="_blank" rel="noopener noreferrer">
            GitHub repository
          </a>
          .
        </p>
      </Section>
    </DocumentPage>
  );
}
