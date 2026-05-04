import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://xelio.me"),
  title: {
    default: "Xelio - Free Temporary Disposable Email",
    template: "%s | Xelio",
  },
  description: "Create instant temporary email addresses in seconds. Free, private, and disposable. Protect your real inbox from spam and tracking with Xelio.",
  keywords: [
    "temporary email",
    "disposable email",
    "fake email generator",
    "spam protection",
    "privacy email service",
    "anonymous email",
    "throwaway email",
    "mailinator alternative",
    "tempmail",
    "fake email",
    "anonymous inbox",
    "temporary mailbox",
    "disposable email address",
    "free email",
    "no registration email",
    "self-destructing email",
  ],
  authors: [{ name: "krey-yon", url: "https://github.com/krey-yon" }],
  creator: "krey-yon",
  publisher: "krey-yon",
  alternates: {
    canonical: "/",
    languages: {
      "en-US": "/",
    },
  },
  openGraph: {
    title: "Xelio - Free Temporary Disposable Email",
    description: "Create instant temporary email addresses in seconds. Free, private, and disposable.",
    url: "https://xelio.me",
    siteName: "Xelio",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Xelio - Temporary Email Service",
        type: "image/svg+xml",
      },
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Xelio - Temporary Email Service",
      },
    ],
    locale: "en_US",
    type: "website",
    emails: "contact@xelio.me",
  },
  twitter: {
    card: "summary_large_image",
    title: "Xelio - Free Temporary Disposable Email",
    description: "Create instant temporary email addresses in seconds. Free, private, and disposable.",
    site: "@xelio",
    creator: "@krey_yon",
    images: [
      {
        url: "/og-image.svg",
        alt: "Xelio - Temporary Email Service",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    indexifembedded: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  verification: {
    google: "google-site-verification-code",
  },
  category: "Utility",
  classification: "Email Service",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400&family=IM+Fell+English+SC&display=swap"
          as="style"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400&family=IM+Fell+English+SC&display=swap"
          media="print"
          onLoad={undefined}
          onLoadCapture={undefined}
        />
        <noscript>
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400&family=IM+Fell+English+SC&display=swap"
          />
        </noscript>
      </head>
      <body className="h-full">
        {children}
        <Analytics />
        <Script
          src="https://analytics.kreyon.in/script.js"
          data-website-id="0e8b242c-5e36-449a-bc9e-9ab7d4c88308"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
