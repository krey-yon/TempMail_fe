import type { Metadata, Viewport } from "next";
import { Fragment_Mono, Newsreader, Schibsted_Grotesk } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
import "./globals.css";

const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-newsreader",
});

const schibsted = Schibsted_Grotesk({ subsets: ["latin"], variable: "--font-schibsted" });

const fragment = Fragment_Mono({ subsets: ["latin"], weight: "400", variable: "--font-fragment" });

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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ebe5d8" },
    { media: "(prefers-color-scheme: dark)", color: "#141311" },
  ],
};

const themeBoot = `try{var t=localStorage.getItem("xelio_theme");if(t!=="light"&&t!=="dark")t=matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";document.documentElement.dataset.theme=t;if(localStorage.getItem("xelio_session"))document.documentElement.setAttribute("data-session","")}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${newsreader.variable} ${schibsted.variable} ${fragment.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBoot }} />
      </head>
      <body>
        {children}
        <Analytics />
        <Script
          src="https://analytics.kreyon.in/script.js"
          data-website-id="44045f08-7746-4801-bb4b-a94bd052a28a"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
