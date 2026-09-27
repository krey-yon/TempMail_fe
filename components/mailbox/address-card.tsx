"use client";

import { useState } from "react";
import { AlertDialog } from "radix-ui";
import { ArrowClockwise, Check, Copy, Trash } from "@phosphor-icons/react";
import { POLL_MS, type Poll } from "@/hooks/use-mailbox";
import { useNow } from "@/lib/stores";
import { cn } from "@/lib/utils";

type Props = {
  address: string;
  poll: Poll;
  online: boolean;
  onCopy: () => void;
  onRefresh: () => void;
  onDelete: () => void;
};

const iconButton =
  "grid size-9 place-items-center rounded-lg text-ink-2 transition-colors hover:bg-desk hover:text-ink disabled:opacity-40";

export function AddressCard({ address, poll, online, onCopy, onRefresh, onDelete }: Props) {
  const [copied, setCopied] = useState(false);
  const [local, domain] = address.split("@");

  const copy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  return (
    <section aria-label="Your address" className="relative shrink-0 overflow-hidden rounded-2xl border border-line bg-raised">
      <div className="airmail h-1.5" />
      <div className="px-4 pt-3.5 pb-3">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10.5px] tracking-[0.2em] text-ink-3 uppercase">Your address</p>
          <SyncStatus poll={poll} online={online} />
        </div>
        <button
          type="button"
          onClick={copy}
          title="Copy address"
          className="group mt-2 flex w-full items-baseline gap-2 text-left"
        >
          <span className="min-w-0 truncate font-mono text-[clamp(17px,2.2vw,21px)] tracking-tight">
            {local}
            <span className="text-ink-3">@{domain}</span>
          </span>
          <span className="sr-only">Copy address</span>
        </button>
        <div className="mt-3 flex items-center gap-1 border-t border-dashed border-line pt-2.5">
          <button
            type="button"
            onClick={copy}
            className={cn(
              "flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors",
              copied ? "bg-stamp text-stamp-ink" : "bg-ink text-desk hover:opacity-90",
            )}
          >
            {copied ? <Check size={16} weight="bold" /> : <Copy size={16} />}
            {copied ? "Copied" : "Copy"}
          </button>
          <button type="button" onClick={onRefresh} disabled={poll.status === "checking"} aria-label="Check for mail now" title="Check now (R)" className={iconButton}>
            <ArrowClockwise size={17} className={cn(poll.status === "checking" && "animate-spin")} />
          </button>
          <AlertDialog.Root>
            <AlertDialog.Trigger asChild>
              <button type="button" className={cn(iconButton, "ml-auto hover:text-stamp")} aria-label="Delete address" title="Delete address">
                <Trash size={17} />
              </button>
            </AlertDialog.Trigger>
            <AlertDialog.Portal>
              <AlertDialog.Overlay className="fixed inset-0 z-40 bg-black/55 backdrop-blur-[2px]" />
              <AlertDialog.Content className="animate-rise fixed top-1/2 left-1/2 z-50 w-[min(92vw,420px)] -translate-1/2 overflow-hidden rounded-2xl border border-line bg-raised text-ink shadow-2xl">
                <div className="airmail h-1.5" />
                <div className="p-6">
                  <AlertDialog.Title className="font-display text-2xl">Delete this address?</AlertDialog.Title>
                  <AlertDialog.Description className="mt-2 text-sm leading-relaxed text-ink-2">
                    <span className="font-mono text-ink">{address}</span> and every message in it will be gone for good.
                  </AlertDialog.Description>
                  <div className="mt-6 flex justify-end gap-2">
                    <AlertDialog.Cancel className="h-10 rounded-lg px-4 text-sm text-ink-2 hover:bg-desk hover:text-ink">Keep it</AlertDialog.Cancel>
                    <AlertDialog.Action onClick={onDelete} className="h-10 rounded-lg bg-stamp px-4 text-sm font-medium text-stamp-ink hover:brightness-110">
                      Delete address
                    </AlertDialog.Action>
                  </div>
                </div>
              </AlertDialog.Content>
            </AlertDialog.Portal>
          </AlertDialog.Root>
        </div>
      </div>
    </section>
  );
}

function SyncStatus({ poll, online }: { poll: Poll; online: boolean }) {
  const now = useNow();
  const remaining = poll.status === "waiting" && now ? Math.max(0, poll.nextAt - now) : 0;
  const label = !online
    ? "Offline, retrying"
    : poll.status === "checking"
      ? "Checking"
      : poll.status === "paused"
        ? "Paused"
        : `Next check ${Math.ceil(remaining / 1000)}s`;
  const r = 6;
  const circumference = 2 * Math.PI * r;
  const progress = poll.status === "waiting" ? remaining / POLL_MS : poll.status === "checking" ? 0.3 : 0;

  return (
    <p className={cn("flex items-center gap-1.5 font-mono text-[10.5px] tracking-[0.08em] uppercase", online ? "text-ink-3" : "text-stamp")}>
      <svg viewBox="0 0 16 16" className={cn("size-3.5 -rotate-90", poll.status === "checking" && "animate-spin")} aria-hidden>
        <circle cx="8" cy="8" r={r} fill="none" stroke="var(--line)" strokeWidth="2" />
        <circle
          cx="8"
          cy="8"
          r={r}
          fill="none"
          stroke={online ? "var(--stamp)" : "currentColor"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
          className="transition-[stroke-dashoffset] duration-1000 ease-linear"
        />
      </svg>
      <span aria-live="off">{label}</span>
    </p>
  );
}
