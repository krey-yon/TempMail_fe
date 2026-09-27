"use client";

import { useEffect, useMemo, useRef } from "react";
import { ArrowLeft, Copy, Trash } from "@phosphor-icons/react";
import { Postmark } from "@/components/postmark";
import { SenderStamp } from "@/components/mailbox/sender-stamp";
import { Ago } from "@/components/mailbox/inbox-list";
import { buildEmailDocument, linkify } from "@/lib/email-document";
import { fullDate } from "@/lib/format";
import { senderLabel, type Mail, type MailBody } from "@/lib/mail";

type Props = {
  mail: Mail | null;
  address: string;
  hasMail: boolean;
  onBack: () => void;
  onDelete: (id: string) => void;
  onCopy: () => void;
};

export function Reader({ mail, address, hasMail, onBack, onDelete, onCopy }: Props) {
  if (!mail) return <EmptyReader address={address} hasMail={hasMail} onCopy={onCopy} />;

  return (
    <article aria-label="Message" className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-line bg-raised">
      <header className="shrink-0 border-b border-line px-4 pt-3 pb-4 sm:px-6 sm:pt-4">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onBack} aria-label="Back to inbox" className="-ml-1.5 grid size-9 place-items-center rounded-lg text-ink-2 hover:bg-desk hover:text-ink md:hidden">
            <ArrowLeft size={18} />
          </button>
          <SenderStamp sender={mail.from} className="size-10 text-lg" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-semibold">{senderLabel(mail.from)}</p>
            <p className="truncate font-mono text-[11.5px] text-ink-3">{mail.from.address}</p>
          </div>
          <div className="hidden text-right sm:block">
            <Ago time={mail.receivedAt} className="block font-mono text-[11px] text-ink-2" />
            <p className="font-mono text-[10.5px] text-ink-3" suppressHydrationWarning>
              {fullDate(mail.receivedAt)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onDelete(mail.id)}
            aria-label="Delete message"
            title="Delete (⌫)"
            className="grid size-9 place-items-center rounded-lg text-ink-2 hover:bg-desk hover:text-stamp"
          >
            <Trash size={17} />
          </button>
        </div>
        <h2 className="mt-3 line-clamp-2 font-display text-[clamp(1.35rem,2.4vw,1.9rem)] leading-[1.15] tracking-[-0.01em]">
          {mail.subject ?? <em className="text-ink-3">No subject</em>}
        </h2>
      </header>
      <div className="min-h-0 flex-1 p-2 sm:p-3">
        <Body key={mail.id} body={mail.body} title={mail.subject ?? "Message"} />
      </div>
    </article>
  );
}

function Body({ body, title }: { body: MailBody; title: string }) {
  return body.kind === "html" ? <HtmlBody html={body.html} title={title} /> : <TextBody text={body.text} />;
}

/** Fixed-width email layouts (usually 600–700px) shrink to fit. Anything wider is real data and scrolls sideways. */
const MAX_FIT_WIDTH = 820;

function fitToWidth(frame: HTMLIFrameElement) {
  const root = frame.contentDocument?.documentElement;
  if (!root) return;
  root.style.zoom = "";
  const { clientWidth, scrollWidth } = root;
  if (scrollWidth > clientWidth && scrollWidth <= MAX_FIT_WIDTH) {
    root.style.zoom = String(Math.floor((clientWidth / scrollWidth) * 1000) / 1000);
  }
}

function HtmlBody({ html, title }: { html: string; title: string }) {
  const doc = useMemo(() => buildEmailDocument(html), [html]);
  const frame = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const observer = new ResizeObserver(() => fitToWidth(el));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex size-full flex-col overflow-hidden rounded-xl bg-white shadow-[0_1px_0_rgb(0_0_0/0.04),0_12px_30px_-18px_rgb(0_0_0/0.5)] dark:brightness-[0.94]">
      <div aria-hidden className="airmail h-1 shrink-0 opacity-90" />
      {/* Scripts stay blocked (no allow-scripts, plus a CSP in the document). allow-same-origin only lets us measure for fit-to-width. */}
      <iframe
        ref={frame}
        title={title}
        srcDoc={doc}
        onLoad={(e) => fitToWidth(e.currentTarget)}
        sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        referrerPolicy="no-referrer"
        className="min-h-0 w-full flex-1 bg-white"
      />
    </div>
  );
}

function TextBody({ text }: { text: string }) {
  const segments = useMemo(() => linkify(text), [text]);
  return (
    <div className="scroll-quiet size-full overflow-auto rounded-xl border border-line bg-sheet px-5 py-5 sm:px-7">
      <pre className="font-mono text-[13.5px] leading-[1.7] break-words whitespace-pre-wrap text-ink">
        {text.length === 0 ? (
          <em className="text-ink-3">This message has no body.</em>
        ) : (
          segments.map((s, i) =>
            s.kind === "link" ? (
              <a key={i} href={s.href} target="_blank" rel="noopener noreferrer" className="break-all text-air underline decoration-air/40 underline-offset-2 hover:decoration-air">
                {s.value}
              </a>
            ) : (
              s.value
            ),
          )
        )}
      </pre>
    </div>
  );
}

const KEYS: [string, string][] = [
  ["J K", "browse"],
  ["R", "check now"],
  ["C", "copy address"],
  ["⌫", "delete"],
  ["Esc", "close"],
];

function EmptyReader({ address, hasMail, onCopy }: { address: string; hasMail: boolean; onCopy: () => void }) {
  return (
    <div className="relative flex h-full min-h-0 flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-line p-8 text-center">
      <Postmark className="animate-stamp mb-6 w-52 text-ink-3 opacity-60 [--tilt:-8deg] short:mb-3 short:w-40" />
      {hasMail ? (
        <>
          <h2 className="font-display text-3xl">Pick a letter.</h2>
          <p className="mt-2 text-sm text-ink-2">Choose a message on the left to read it here.</p>
        </>
      ) : (
        <>
          <h2 className="font-display text-3xl">Your address is live.</h2>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-2">
            Anything sent to <span className="font-mono text-ink">{address}</span> lands here. We check every ten seconds.
          </p>
          <button type="button" onClick={onCopy} className="mt-5 flex h-10 items-center gap-2 rounded-lg bg-ink px-4 text-sm font-medium text-desk hover:opacity-90">
            <Copy size={16} /> Copy address
          </button>
        </>
      )}
      <dl className="absolute inset-x-0 bottom-5 hidden flex-wrap justify-center gap-x-5 gap-y-2 px-6 text-[11px] text-ink-3 lg:flex short:hidden">
        {KEYS.map(([key, action]) => (
          <div key={key} className="flex items-center gap-1.5">
            <dt>
              <kbd className="rounded border border-line bg-raised px-1.5 py-0.5 font-mono text-[10.5px] text-ink-2">{key}</kbd>
            </dt>
            <dd>{action}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
