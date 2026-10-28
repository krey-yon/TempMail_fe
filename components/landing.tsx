"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { ArrowRight, DiceFive, SpinnerGap } from "@phosphor-icons/react";
import { Envelope } from "@/components/envelope";
import { Turnstile, type TurnstileHandle } from "@/components/turnstile";
import { UsageBadge } from "@/components/usage-badge";
import { ApiError, createEmailAddress } from "@/lib/api";
import { addressPairs, morph } from "@/lib/morph";
import { sessionStore } from "@/lib/stores";
import { DOMAIN, randomUsername, usernameProblem } from "@/lib/username";
import { cn } from "@/lib/utils";

type Failure = { username: string; message: string } | null;

const CHECK_AGAIN = "Complete the verification check, then try again.";
const CHECK_FAILED = "Verification failed. Complete the check and try again.";
const CHECK_DOWN = "Verification is temporarily unavailable, try again in a moment.";
const WIDGET_MISSING = "Could not load the verification widget.";
const TOKEN_WAIT_MS = 10_000;

function turnstileToken(form: HTMLFormElement | null): string {
  return form?.querySelector<HTMLInputElement>('[name="cf-turnstile-response"]')?.value.trim() ?? "";
}

function resetTurnstile() {
  window.turnstile?.reset();
}

function waitForFreshToken(form: HTMLFormElement, spent: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const timer = window.setInterval(() => {
      const token = turnstileToken(form);
      if (token && token !== spent) {
        window.clearInterval(timer);
        resolve(token);
        return;
      }
      if (Date.now() - started >= TOKEN_WAIT_MS) {
        window.clearInterval(timer);
        reject(new Error("turnstile-timeout"));
      }
    }, 200);
  });
}

function inlineError(error: unknown): string {
  if (!(error instanceof ApiError)) return "Could not create that address.";
  if (error.code === "turnstile_missing") return CHECK_AGAIN;
  if (error.code === "turnstile_failed") return CHECK_FAILED;
  if (error.code === "turnstile_unavailable") return CHECK_DOWN;
  if (error.status === 409) return "That username is already taken.";
  if (error.status === 400) return "That username cannot be used.";
  return "Could not create that address.";
}

async function create(formData: FormData, form: HTMLFormElement | null): Promise<Failure> {
  const username = String(formData.get("username") ?? "");
  const problem = username ? usernameProblem(username) : "Pick a username first";
  if (problem) return { username, message: problem };

  const token = turnstileToken(form);
  if (!token) return { username, message: CHECK_AGAIN };

  const open = (nextToken: string) => createEmailAddress(username, nextToken);

  try {
    const session = await open(token);
    morph(() => sessionStore.set(session), { from: addressPairs("landing"), to: () => addressPairs("mailbox") });
    return null;
  } catch (error) {
    resetTurnstile();
    if (error instanceof ApiError && error.code === "turnstile_failed" && form) {
      try {
        const nextToken = await waitForFreshToken(form, token);
        const session = await open(nextToken);
        morph(() => sessionStore.set(session), { from: addressPairs("landing"), to: () => addressPairs("mailbox") });
        return null;
      } catch (retryError) {
        resetTurnstile();
        return { username, message: inlineError(retryError) };
      }
    }
    return { username, message: inlineError(error) };
  }
}

const FEATURES = ["No sign-up", "24-hour inbox", "Delete any time"];

export function Landing() {
  const [username, setUsername] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [widgetMissing, setWidgetMissing] = useState(false);
  const turnstile = useRef<TurnstileHandle>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [failure, submit, pending] = useActionState(
    (_prev: Failure, formData: FormData) => create(formData, formRef.current),
    null,
  );
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (matchMedia("(pointer: fine)").matches) input.current?.focus();
  }, []);

  const message =
    usernameProblem(username) ??
    (widgetMissing ? WIDGET_MISSING : null) ??
    (failure?.username === username ? failure.message : null);

  return (
    <main data-landing className="grid min-h-0 flex-1 grid-cols-1 items-center gap-8 overflow-hidden px-5 pb-6 sm:px-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-16 lg:px-16 lg:pb-10">
      <section className="mx-auto w-full max-w-xl lg:mx-0">
        <Envelope
          username={username}
          className="mb-7 max-w-[300px] rotate-1 short:hidden lg:hidden"
        />
        <p className="mb-4 font-mono text-[11px] tracking-[0.2em] text-ink-2 uppercase tiny:mb-2">
          <span className="text-stamp">Xelio</span> · Temporary email
        </p>
        <h1 className="font-display text-[clamp(2.5rem,6.4vw,5.75rem)] leading-[0.92] font-normal tracking-[-0.025em] tiny:text-[2.35rem]">
          Mail that <em className="text-stamp">forgets</em> you were here.
        </h1>
        <p className="mt-5 max-w-md text-[15px] leading-relaxed text-ink-2 sm:text-base tiny:mt-3 tiny:text-sm">
          Catch the code. Skip the spam. Gone in 24 hours.
        </p>

        <form ref={formRef} action={submit} noValidate className="mt-8 tiny:mt-5" aria-label="Create an address">
          <div className="flex flex-col gap-2.5">
            <div
              data-morph-fallback="addr-card"
              className={cn(
                "flex h-13 min-w-0 items-center rounded-xl border bg-raised pr-1.5 pl-4 transition-[border-color,box-shadow] focus-within:border-ink-2 focus-within:shadow-[0_0_0_4px_var(--glow)]",
                message ? "border-stamp" : "border-line",
              )}
            >
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <input
                ref={input}
                data-morph-fallback="addr-text"
                id="username"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ""))}
                placeholder="yourname"
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                maxLength={40}
                disabled={pending}
                aria-invalid={message ? true : undefined}
                aria-describedby="username-note"
                className="min-w-0 flex-1 bg-transparent font-mono text-[15px] text-ink outline-none placeholder:text-ink-3 focus-visible:outline-none"
              />
              <span className="shrink-0 font-mono text-[15px] text-ink-3">@{DOMAIN}</span>
              <button
                type="button"
                onClick={() => setUsername(randomUsername())}
                disabled={pending}
                aria-label="Suggest a random username"
                title="Suggest a random username"
                className="ml-2 grid size-10 shrink-0 place-items-center rounded-lg text-ink-2 transition hover:bg-desk hover:text-ink active:rotate-45"
              >
                <DiceFive size={20} />
              </button>
            </div>
            <Turnstile ref={turnstile} onToken={setTurnstileToken} onWidgetMissing={setWidgetMissing} />
            <button
              type="submit"
              disabled={pending || !turnstileToken}
              title={turnstileToken ? undefined : "Complete the verification check first"}
              className="group flex h-13 w-full items-center justify-center gap-2 self-start rounded-xl bg-stamp px-6 font-medium text-stamp-ink transition hover:brightness-110 active:translate-y-px disabled:opacity-70 sm:w-auto"
            >
              {pending ? <SpinnerGap size={18} className="animate-spin" /> : null}
              {pending ? "Opening" : "Open inbox"}
              {!pending && <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />}
            </button>
          </div>
          <p id="username-note" role={message ? "alert" : undefined} className={cn("mt-2.5 min-h-5 text-sm", message ? "text-stamp" : "text-ink-3")}>
            {message ?? "3–32 characters: a–z, 0–9, hyphen, underscore"}
          </p>
          {widgetMissing ? (
            <button type="button" onClick={() => turnstile.current?.reload()} className="mt-1 text-sm font-medium text-stamp">
              Retry
            </button>
          ) : null}
        </form>

        <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[11px] tracking-[0.12em] text-ink-2 uppercase tiny:hidden">
          {FEATURES.map((f) => (
            <li key={f} className="flex items-center gap-2">
              <span aria-hidden className="size-1 rotate-45 bg-stamp" />
              {f}
            </li>
          ))}
        </ul>
        <UsageBadge />
      </section>

      <aside aria-hidden className="hidden lg:block">
        <Envelope username={username} className="max-w-[620px]" />
      </aside>
    </main>
  );
}
