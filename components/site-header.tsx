import Link from "next/link";
import { GithubLogo } from "@phosphor-icons/react/dist/ssr";
import { ThemeToggle } from "@/components/theme-toggle";

const navLink = "rounded-full px-3 py-1.5 text-sm text-ink-2 transition-colors hover:bg-raised hover:text-ink";

export function SiteHeader() {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 px-4 sm:px-6 [view-transition-name:site-header]">
      <Link href="/" className="group flex items-baseline gap-2" aria-label="Xelio home">
        <span className="font-display text-[26px] leading-none font-medium tracking-tight italic">Xelio</span>
        <span className="hidden font-mono text-[10px] tracking-[0.18em] text-ink-3 uppercase sm:inline">poste restante</span>
      </Link>
      <nav className="flex items-center gap-0.5" aria-label="Site">
        <Link href="/about" className={navLink}>
          About
        </Link>
        <Link href="/privacy" className={navLink}>
          Privacy
        </Link>
        <a
          href="https://github.com/krey-yon/TempMail_fe"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Source on GitHub"
          title="Source on GitHub"
          className="grid size-9 place-items-center rounded-full text-ink-2 transition-colors hover:bg-raised hover:text-ink"
        >
          <GithubLogo size={18} />
        </a>
        <ThemeToggle />
      </nav>
    </header>
  );
}
