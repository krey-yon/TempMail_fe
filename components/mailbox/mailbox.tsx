"use client";

import { useEffect, useEffectEvent, useMemo, useState } from "react";
import { AddressCard } from "@/components/mailbox/address-card";
import { InboxList, mailDomId } from "@/components/mailbox/inbox-list";
import { Reader } from "@/components/mailbox/reader";
import { useToast } from "@/components/toaster";
import { useMailbox } from "@/hooks/use-mailbox";
import { deleteEmailAddress, type Session } from "@/lib/api";
import { playChime } from "@/lib/chime";
import { senderLabel, type Mail } from "@/lib/mail";
import { addressPairs, letterPairs, morph } from "@/lib/morph";
import { readStore, sessionStore, useReadIds } from "@/lib/stores";

function signOut(address: string) {
  morph(
    () => {
      readStore(address).set(null);
      sessionStore.set(null);
    },
    { from: addressPairs("mailbox"), to: () => addressPairs("landing") },
  );
}

const row = (id: string | null) => (id ? document.getElementById(mailDomId(id)) : null);
const readerHeader = () => document.querySelector("[data-reader-header]");

export function Mailbox({ session }: { session: Session }) {
  const { address, token } = session;
  const notify = useToast();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [arrivals, setArrivals] = useState(0);
  const readIds = useReadIds(address);

  const { mails, poll, online, refresh, remove } = useMailbox(session, {
    onExpired: () => {
      signOut(address);
      notify("That address has expired", "error");
    },
    onArrived: (arrived: Mail[]) => {
      playChime();
      setArrivals((n) => n + 1);
      notify(arrived.length === 1 ? `New mail from ${senderLabel(arrived[0].from)}` : `${arrived.length} new messages`);
    },
  });

  const unread = useMemo(() => {
    const read = new Set(readIds);
    return new Set((mails ?? []).filter((m) => !read.has(m.id)).map((m) => m.id));
  }, [mails, readIds]);

  const selected = mails?.find((m) => m.id === selectedId) ?? null;

  const select = (id: string) => {
    setSelectedId(id);
    if (!unread.has(id)) return;
    const present = new Set(mails?.map((m) => m.id));
    readStore(address).set([...readIds.filter((r) => present.has(r)), id]);
  };

  const open = (id: string) => {
    if (id === selectedId) return;
    morph(() => select(id), { from: letterPairs(row(id)), to: () => letterPairs(readerHeader()), direction: "forward" });
  };

  const close = () => {
    const id = selectedId;
    morph(() => setSelectedId(null), { from: letterPairs(readerHeader()), to: () => letterPairs(row(id)), direction: "back" });
  };

  const copy = (announce = true) => {
    navigator.clipboard.writeText(address).then(
      () => announce && notify("Address copied"),
      () => notify("Couldn't reach the clipboard", "error"),
    );
  };

  const deleteMail = (id: string) => {
    if (id === selectedId && mails) {
      const i = mails.findIndex((m) => m.id === id);
      setSelectedId((mails[i + 1] ?? mails[i - 1])?.id ?? null);
    }
    remove(id).catch(() => notify("Couldn't delete that message", "error"));
  };

  const deleteAddress = async () => {
    try {
      await deleteEmailAddress(address, token);
      signOut(address);
      notify("Address deleted");
    } catch {
      notify("Couldn't delete the address. Try again.", "error");
    }
  };

  const onKey = useEffectEvent((e: KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey || e.altKey || e.defaultPrevented) return;
    if ((e.target as HTMLElement).closest("input, textarea, select, [contenteditable], [role=alertdialog]")) return;
    const list = mails ?? [];
    const index = list.findIndex((m) => m.id === selectedId);
    const move = (to: number) => {
      const target = list[Math.min(list.length - 1, Math.max(0, to))];
      if (!target) return;
      e.preventDefault();
      select(target.id);
      document.getElementById(mailDomId(target.id))?.focus();
    };
    switch (e.key) {
      case "j":
      case "ArrowDown":
        return move(index + 1);
      case "k":
      case "ArrowUp":
        return move(index === -1 ? 0 : index - 1);
      case "Escape":
        return setSelectedId(null);
      case "r":
        return refresh();
      case "c":
        return copy();
      case "Delete":
      case "Backspace":
      case "#":
        if (selected) {
          e.preventDefault();
          deleteMail(selected.id);
        }
    }
  });

  useEffect(() => {
    const listener = (e: KeyboardEvent) => onKey(e);
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);

  useEffect(() => {
    const previous = document.title;
    document.title = unread.size > 0 ? `(${unread.size}) Inbox · Xelio` : "Inbox · Xelio";
    return () => {
      document.title = previous;
    };
  }, [unread.size]);

  return (
    <main
      data-view={selected ? "reader" : "list"}
      className="group/mailbox grid min-h-0 flex-1 grid-cols-1 gap-3 px-3 pb-3 sm:px-4 sm:pb-4 md:grid-cols-[minmax(300px,380px)_minmax(0,1fr)] lg:gap-4"
    >
      <div className="flex min-h-0 flex-col gap-3 max-md:group-data-[view=reader]/mailbox:hidden lg:gap-4">
        <AddressCard address={address} poll={poll} online={online} onCopy={() => copy(false)} onRefresh={refresh} onDelete={deleteAddress} />
        <InboxList mails={mails} unread={unread} arrivals={arrivals} selectedId={selectedId} onSelect={open} onDelete={deleteMail} />
      </div>
      <div className="min-h-0 max-md:group-data-[view=list]/mailbox:hidden">
        <Reader
          mail={selected}
          address={address}
          hasMail={(mails?.length ?? 0) > 0}
          onBack={close}
          onDelete={deleteMail}
          onCopy={() => copy()}
        />
      </div>
    </main>
  );
}
