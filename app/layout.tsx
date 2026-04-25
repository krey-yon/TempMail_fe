import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://xelio.me"),
  title: {
    default: "Xelio - Free Temporary Disposable Email",
    template: "%s | Xelio",
  },
  description: "Create instant temporary email addresses in seconds. Free, private, and disposable. Protect your real inbox from spam and tracking with Xelio.",
  keywords: ["temporary email", "disposable email", "fake email generator", "spam protection", "privacy email service", "anonymous email", "throwaway email", "mailinator alternative"],
  authors: [{ name: "krey-yon", url: "https://github.com/krey-yon" }],
  creator: "krey-yon",
  openGraph: {
    title: "Xelio - Free Temporary Disposable Email",
    description: "Create instant temporary email addresses in seconds. Free, private, and disposable.",
    url: "https://xelio.me",
    siteName: "Xelio",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "Xelio - Free Temporary Disposable Email",
    description: "Create instant temporary email addresses in seconds. Free, private, and disposable.",
    site: "@xelio",
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
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
  verification: {
    google: "google-site-verification-code",
  },
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
      <body className="h-full">{children}</body>
    </html>
  );
}
