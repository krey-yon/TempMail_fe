"use client";

import { createContext, use, useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Tone = "info" | "error";
type Toast = { id: number; message: string; tone: Tone };
type Notify = (message: string, tone?: Tone) => void;

const ToastContext = createContext<Notify>(() => {});

export function useToast(): Notify {
  return use(ToastContext);
}

export function Toaster({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const notify = useCallback<Notify>((message, tone = "info") => {
    const id = ++nextId.current;
    setToasts((current) => [...current.slice(-2), { id, message, tone }]);
    setTimeout(() => setToasts((current) => current.filter((t) => t.id !== id)), 3600);
  }, []);

  return (
    <ToastContext value={notify}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 flex flex-col items-center gap-2 px-4"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "animate-toast flex items-center gap-2.5 rounded-full border px-4 py-2 text-sm shadow-lg shadow-black/20",
              t.tone === "error" ? "border-stamp/60 bg-stamp text-stamp-ink" : "border-line bg-raised text-ink",
            )}
          >
            {t.tone === "info" && <span aria-hidden className="size-1.5 rounded-full bg-stamp" />}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext>
  );
}
