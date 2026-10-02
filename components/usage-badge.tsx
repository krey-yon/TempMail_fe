"use client";

import { useEffect, useState } from "react";
import { fetchStats } from "@/lib/api";

const countFormat = new Intl.NumberFormat("en-US");

export function UsageBadge() {
  const [usage, setUsage] = useState<number | "loading" | "error">("loading");

  useEffect(() => {
    let alive = true;
    let inFlight = false;
    let controller: AbortController | undefined;

    async function refresh() {
      if (inFlight || document.hidden) return;
      inFlight = true;
      controller = new AbortController();
      const timeout = setTimeout(() => controller?.abort(), 10_000);
      try {
        const stats = await fetchStats(controller.signal);
        if (alive) setUsage(stats.total_addresses_created);
      } catch {
        if (alive) setUsage("error");
      } finally {
        clearTimeout(timeout);
        inFlight = false;
      }
    }

    // Landing remounts after deletion/expiry: refetch the lifetime count,
    // including successful creations made during the previous mailbox session.
    void refresh();
    const timer = setInterval(refresh, 60_000);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      alive = false;
      controller?.abort();
      clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  return (
    <p role="status" aria-atomic="true" className="mt-5 flex w-fit items-center gap-2 rounded-full border border-line bg-raised px-3 py-1.5 font-mono text-[11px] text-ink-2 tiny:mt-2">
      <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-stamp" />
      {typeof usage === "number" ? (
        <span><span className="tabular-nums">{countFormat.format(usage)}</span> temporary {usage === 1 ? "inbox" : "inboxes"} created</span>
      ) : (
        <span>{usage === "loading" ? "Loading inbox count…" : "Inbox count unavailable"}</span>
      )}
    </p>
  );
}
