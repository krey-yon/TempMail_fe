import { XelioApp } from "@/components/xelio-app";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Xelio",
  description: "Free temporary disposable email service. Create instant email addresses to protect your inbox from spam.",
  url: "https://xelio.me",
  applicationCategory: "UtilityApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  creator: { "@type": "Person", name: "krey-yon", url: "https://github.com/krey-yon" },
  featureList: ["Temporary email", "Disposable addresses", "Auto-delete", "No registration", "Free"],
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <XelioApp />
    </>
  );
}
