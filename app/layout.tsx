import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "XELIO",
  description: "Temporary email service",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="h-full">{children}</body>
    </html>
  );
}
