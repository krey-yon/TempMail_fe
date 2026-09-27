import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { SiteHeader } from "@/components/site-header";

type Props = { eyebrow: string; title: string; updated: string; children: React.ReactNode };

export function DocumentPage({ eyebrow, title, updated, children }: Props) {
  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <SiteHeader />
      <main className="min-h-0 flex-1 px-3 pb-3 sm:px-4 sm:pb-4">
        <div className="scroll-quiet mx-auto h-full max-w-3xl overflow-y-auto rounded-2xl border border-line bg-raised">
          <div aria-hidden className="airmail sticky top-0 h-1.5" />
          <article className="animate-rise px-6 pt-8 pb-14 sm:px-12 sm:pt-12">
            <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-ink-3 transition-colors hover:text-ink">
              <ArrowLeft size={14} /> Back to your inbox
            </Link>
            <p className="mt-8 font-mono text-[11px] tracking-[0.2em] text-stamp uppercase">{eyebrow}</p>
            <h1 className="mt-2 font-display text-[clamp(2.4rem,6vw,3.75rem)] leading-none tracking-[-0.02em]">{title}</h1>
            <p className="mt-3 font-mono text-xs text-ink-3">{updated}</p>
            <div className="mt-4 border-t border-dashed border-line" />
            {children}
          </article>
        </div>
      </main>
    </div>
  );
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-9">
      <h2 className="font-display text-[1.6rem] leading-tight">{title}</h2>
      <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-ink-2 [&_a]:text-ink [&_a]:underline [&_a]:decoration-stamp/60 [&_a]:underline-offset-2 [&_strong]:font-semibold [&_strong]:text-ink">
        {children}
      </div>
    </section>
  );
}
