import { Postmark } from "@/components/postmark";
import { DOMAIN } from "@/lib/username";
import { cn } from "@/lib/utils";

export function Envelope({ username, className }: { username: string; className?: string }) {
  return (
    <div className={cn("relative mx-auto aspect-[1.6] w-full @container", className)}>
      <div className="absolute inset-0 translate-x-[3%] translate-y-[-5%] rotate-[4deg] rounded-md border border-line bg-raised" />
      <div data-morph-src="addr-card" className="absolute inset-0 -rotate-2 overflow-hidden rounded-md bg-paper text-paper-ink shadow-[0_30px_60px_-20px_rgb(0_0_0/0.45),0_2px_0_rgb(0_0_0/0.04)]">
        <div className="airmail absolute inset-x-0 top-0 h-[2.2cqw]" />
        <div className="airmail absolute inset-x-0 bottom-0 h-[2.2cqw]" />

        <div className="absolute top-[11%] left-[6%] rounded-[0.5cqw] border-[0.3cqw] border-air px-[1.4cqw] py-[0.8cqw] font-mono text-[1.75cqw] leading-tight tracking-[0.14em] text-air uppercase">
          Par avion
          <br />
          By air mail
        </div>

        <div className="perforated absolute top-[10%] right-[6%] w-[17%] bg-paper">
          <div className="flex aspect-[0.82] flex-col justify-between bg-stamp p-[9%] text-stamp-ink">
            <span className="font-mono text-[1.5cqw] tracking-widest">XELIO</span>
            <span className="text-center font-display text-[8.5cqw] leading-none italic">X</span>
            <span className="text-right font-mono text-[1.5cqw]">0¢</span>
          </div>
        </div>
        <Postmark className="animate-stamp absolute top-[6%] right-[14%] w-[44%] text-stamp opacity-80 mix-blend-multiply [--tilt:-12deg] [animation-delay:450ms]" />

        <div className="absolute right-[8%] bottom-[15%] left-[10%]">
          <p className="mb-[1.2cqw] font-mono text-[1.7cqw] tracking-[0.2em] text-paper-ink/50 uppercase">Deliver to</p>
          <p data-morph-src="addr-text" className="truncate border-b border-paper-ink/15 pb-[1.2cqw] font-mono text-[4.6cqw] leading-tight tracking-tight">
            <span>{username || "you"}</span>
            <span aria-hidden className="animate-caret mx-[0.2cqw] inline-block h-[0.95em] w-[0.5cqw] translate-y-[0.12em] bg-stamp" />
            <span className="text-paper-ink/45">@{DOMAIN}</span>
          </p>
          <p className="mt-[1.8cqw] border-b border-paper-ink/15 pb-[1.2cqw] font-display text-[2.9cqw] text-paper-ink/70 italic">
            Poste restante, held for collection
          </p>
        </div>
      </div>
    </div>
  );
}
