"use client";

import { useEffect } from "react";
import { Landing } from "@/components/landing";
import { Mailbox } from "@/components/mailbox/mailbox";
import { SiteHeader } from "@/components/site-header";
import { Toaster } from "@/components/toaster";
import { useSession } from "@/lib/stores";

export function XelioApp() {
  const session = useSession();

  useEffect(() => {
    document.documentElement.toggleAttribute("data-session", session !== null);
  }, [session]);

  return (
    <Toaster>
      <div className="flex h-dvh flex-col overflow-hidden">
        <SiteHeader />
        {session ? <Mailbox key={session.address} session={session} /> : <Landing />}
      </div>
    </Toaster>
  );
}
