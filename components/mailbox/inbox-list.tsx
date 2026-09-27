"use client";

import { Trash } from "@phosphor-icons/react";
import { useState } from "react";
import { SenderStamp } from "@/components/mailbox/sender-stamp";
import { relativeTime } from "@/lib/format";
import { senderLabel, type Mail } from "@/lib/mail";
import { useNow } from "@/lib/stores";
import { cn } from "@/lib/utils";

type Props = {
  mails: Mail[] | null;
  unread: ReadonlySet<string>;
  arrivals: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
};

export const mailDomId = (id: string) => `mail-${id}`;

export function InboxList({ mails, unread, arrivals, selectedId, onSelect, onDelete }: Props) {
  return (
    <section aria-label="Inbox" className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-line bg-raised">
      <header className="flex h-11 shrink-0 items-center justify-between border-b border-line px-4 font-mono text-[10.5px] tracking-[0.2em] uppercase">
        <h2 className="text-ink-2">
          Inbox <span className="text-ink-3">· {mails?.length ?? 0}</span>
        </h2>
        {unread.size > 0 && (
          <span className="relative">
            {arrivals > 0 && <ArrivalDrip key={arrivals} />}
            <span
              key={arrivals}
              className={cn(
                "relative block rounded-full bg-stamp px-2 py-0.5 text-stamp-ink",
                arrivals > 0 && "animate-[badge-squash_720ms_ease-out] motion-reduce:animate-none",
              )}
            >
              {unread.size} new
            </span>
          </span>
        )}
      </header>

      {mails === null ? (
        <ul aria-busy className="flex-1 overflow-hidden">
          {[0, 1, 2, 3].map((i) => (
            <li key={i} className="flex gap-3 border-b border-line/60 px-4 py-3.5" style={{ opacity: 1 - i * 0.22 }}>
              <span className="size-9 animate-pulse rounded bg-line" />
              <span className="flex-1 space-y-2 pt-1">
                <span className="block h-2.5 w-1/3 animate-pulse rounded bg-line" />
                <span className="block h-2.5 w-3/4 animate-pulse rounded bg-line" />
              </span>
            </li>
          ))}
        </ul>
      ) : mails.length === 0 ? (
        <div className="grid flex-1 place-items-center p-6 text-center">
          <div>
            <p className="font-display text-xl text-ink-2 italic">Nothing yet.</p>
            <p className="mt-1 text-sm text-ink-3">New mail shows up here on its own.</p>
          </div>
        </div>
      ) : (
        <ul className="scroll-quiet min-h-0 flex-1 overflow-y-auto">
          {mails.map((mail) => {
            const isUnread = unread.has(mail.id);
            const selected = mail.id === selectedId;
            return (
              <li key={mail.id} className="group relative animate-rise [animation-duration:.35s]">
                <button
                  id={mailDomId(mail.id)}
                  type="button"
                  onClick={() => onSelect(mail.id)}
                  aria-current={selected || undefined}
                  className={cn(
                    "flex w-full gap-3 border-b border-line/60 py-3 pr-4 pl-4 text-left transition-colors outline-offset-[-2px]",
                    selected ? "bg-desk" : "hover:bg-desk/50",
                  )}
                >
                  {selected && <span aria-hidden className="absolute inset-y-0 left-0 w-[3px] bg-stamp" />}
                  <SenderStamp sender={mail.from} className="mt-0.5 size-9 text-base" />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline gap-2">
                      {isUnread && <span className="sr-only">Unread.</span>}
                      <span className={cn("truncate text-[14px]", isUnread ? "font-semibold text-ink" : "text-ink-2")}>
                        {senderLabel(mail.from)}
                      </span>
                      <Ago time={mail.receivedAt} className="ml-auto shrink-0 font-mono text-[10.5px] text-ink-3 transition-opacity group-hover:opacity-0 group-focus-within:opacity-0" />
                    </span>
                    <span className={cn("mt-0.5 flex items-center gap-1.5 text-[13.5px]", isUnread ? "text-ink" : "text-ink-2")}>
                      {isUnread && <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-stamp" />}
                      <span data-morph="subject" className="truncate">
                        {mail.subject ?? <em className="text-ink-3">No subject</em>}
                      </span>
                    </span>
                    <span className="mt-0.5 block truncate text-[12.5px] text-ink-3">{mail.preview || "\u00a0"}</span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(mail.id)}
                  aria-label={`Delete message from ${senderLabel(mail.from)}`}
                  title="Delete (⌫)"
                  className="absolute top-2 right-2 grid size-7 place-items-center rounded-md text-ink-3 opacity-0 transition hover:bg-raised hover:text-stamp focus-visible:opacity-100 group-hover:opacity-100 group-focus-within:opacity-100"
                >
                  <Trash size={15} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function ArrivalDrip() {
  const [done, setDone] = useState(false);
  if (done) return null;
  return (
    <>
      <svg aria-hidden className="absolute size-0">
        <filter id="goo" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" />
          <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8" />
        </filter>
      </svg>
      <span
        aria-hidden
        data-goo
        onAnimationEnd={(e) => e.target === e.currentTarget && setDone(true)}
        className="pointer-events-none absolute -inset-x-2 -top-3 -bottom-2 animate-[goo-life_720ms_linear] [filter:url(#goo)] motion-reduce:hidden"
      >
        <span className="absolute inset-x-2 top-3 bottom-2 animate-[goo-swell_720ms_ease-out] rounded-full bg-stamp" />
        <span className="absolute top-0 left-1/2 -ml-1 size-2 animate-[goo-drop_720ms_cubic-bezier(0.5,0,0.8,0.6)_both] rounded-full bg-stamp" />
      </span>
    </>
  );
}

export function Ago({ time, className }: { time: number; className?: string }) {
  const now = useNow();
  return (
    <time dateTime={new Date(time).toISOString()} className={className} suppressHydrationWarning>
      {now ? relativeTime(time, now) : ""}
    </time>
  );
}
