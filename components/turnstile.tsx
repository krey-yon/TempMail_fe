"use client";

import { useEffect, useImperativeHandle, useRef, useState, type Ref } from "react";

/** Public widget key. `NEXT_PUBLIC_TURNSTILE_SITE_KEY` overrides it for local UI work. */
export const TURNSTILE_SITE_KEY =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || "0x4AAAAAAFpK7cF3T0CInpf3";

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js";
const SCRIPT_MARK = "script[data-turnstile]";
const LOAD_WAIT_MS = 10_000;

export type TurnstileHandle = {
  reload: () => void;
};

type RenderOptions = {
  sitekey: string;
  action: string;
  theme: "dark";
  language: "auto";
  size: "flexible";
};

type TurnstileApi = {
  render: (container: HTMLElement, options: RenderOptions) => string;
  reset: (widgetId?: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

function alreadyRendered(el: HTMLElement) {
  return !!el.querySelector("iframe, input[name='cf-turnstile-response']");
}

function paint(el: HTMLElement) {
  const api = window.turnstile;
  if (!api || alreadyRendered(el)) return;
  api.render(el, {
    sitekey: el.dataset.sitekey || TURNSTILE_SITE_KEY,
    action: "create",
    theme: "dark",
    language: "auto",
    size: "flexible",
  });
}

export function Turnstile({
  ref,
  onToken,
  onWidgetMissing,
}: {
  ref?: Ref<TurnstileHandle>;
  onToken: (token: string) => void;
  onWidgetMissing: (missing: boolean) => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const onTokenRef = useRef(onToken);
  const onWidgetMissingRef = useRef(onWidgetMissing);
  const [attempt, setAttempt] = useState(0);
  const [token, setToken] = useState("");

  useEffect(() => {
    onTokenRef.current = onToken;
    onWidgetMissingRef.current = onWidgetMissing;
  }, [onToken, onWidgetMissing]);

  useImperativeHandle(ref, () => ({
    reload() {
      document.querySelector(SCRIPT_MARK)?.remove();
      host.current?.replaceChildren();
      delete window.turnstile;
      onWidgetMissingRef.current(false);
      setToken("");
      onTokenRef.current("");
      setAttempt((n) => n + 1);
    },
  }), []);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let cancelled = false;
    const show = () => {
      if (!cancelled) paint(el);
    };

    if (window.turnstile) {
      show();
      return () => {
        cancelled = true;
      };
    }

    let script = document.querySelector<HTMLScriptElement>(SCRIPT_MARK);
    if (!script) {
      script = document.createElement("script");
      script.src = SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.dataset.turnstile = "true";
      document.head.appendChild(script);
    }
    const fail = () => {
      if (!cancelled) onWidgetMissingRef.current(true);
    };
    script.addEventListener("error", fail);
    return () => {
      cancelled = true;
      script?.removeEventListener("error", fail);
    };
  }, [attempt]);

  useEffect(() => {
    const seen = { value: "" };
    const read = () => {
      const value = host.current?.querySelector<HTMLInputElement>('[name="cf-turnstile-response"]')?.value.trim() ?? "";
      if (value === seen.value) return;
      seen.value = value;
      setToken(value);
      onTokenRef.current(value);
      if (value) onWidgetMissingRef.current(false);
    };
    read();
    const timer = window.setInterval(read, 300);
    return () => window.clearInterval(timer);
  }, [attempt]);

  useEffect(() => {
    if (token) return;
    const timer = window.setTimeout(() => {
      if (!host.current?.querySelector("iframe")) onWidgetMissingRef.current(true);
    }, LOAD_WAIT_MS);
    return () => window.clearTimeout(timer);
  }, [token, attempt]);

  return (
    <div className="w-full max-w-full overflow-x-auto">
      <div
        ref={host}
        className="cf-turnstile min-h-[65px]"
        data-sitekey={TURNSTILE_SITE_KEY}
        data-action="create"
        data-theme="dark"
        data-language="auto"
        data-size="flexible"
      />
    </div>
  );
}
