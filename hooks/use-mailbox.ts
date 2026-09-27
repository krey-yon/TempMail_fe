import { useCallback, useEffect, useEffectEvent, useReducer, useRef } from "react";
import { ApiError, deleteEmail, fetchEmails, type Session } from "@/lib/api";
import type { Mail } from "@/lib/mail";

export const POLL_MS = 10_000;

export type Poll = { status: "checking" } | { status: "waiting"; nextAt: number } | { status: "paused" };

type State = {
  /** `null` until the first fetch settles. */
  mails: Mail[] | null;
  poll: Poll;
  online: boolean;
  /** Ids deleted locally, filtered from in-flight poll results so they never flicker back. */
  deleted: ReadonlySet<string>;
};

type Action =
  | { type: "check" }
  | { type: "received"; mails: Mail[]; next: Poll }
  | { type: "failed"; next: Poll }
  | { type: "paused" }
  | { type: "removed"; id: string }
  | { type: "restored"; id: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "check":
      return { ...state, poll: { status: "checking" } };
    case "received":
      return { ...state, online: true, poll: action.next, mails: action.mails.filter((m) => !state.deleted.has(m.id)) };
    case "failed":
      return { ...state, online: false, poll: action.next };
    case "paused":
      return state.poll.status === "checking" ? state : { ...state, poll: { status: "paused" } };
    case "removed":
      return {
        ...state,
        deleted: new Set(state.deleted).add(action.id),
        mails: state.mails?.filter((m) => m.id !== action.id) ?? null,
      };
    case "restored": {
      const deleted = new Set(state.deleted);
      deleted.delete(action.id);
      return { ...state, deleted };
    }
  }
}

const initial: State = { mails: null, poll: { status: "checking" }, online: true, deleted: new Set() };

type Handlers = {
  onExpired: () => void;
  onArrived: (mails: Mail[]) => void;
};

export function useMailbox(session: Session, handlers: Handlers) {
  const [state, dispatch] = useReducer(reducer, initial);
  const checkNow = useRef<() => void>(() => {});
  const onExpired = useEffectEvent(handlers.onExpired);
  const onArrived = useEffectEvent(handlers.onArrived);
  const { address, token } = session;

  useEffect(() => {
    let alive = true;
    let inFlight = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let known: Set<string> | null = null;

    const next = (): Poll => {
      if (document.hidden) return { status: "paused" };
      timer = setTimeout(check, POLL_MS);
      return { status: "waiting", nextAt: Date.now() + POLL_MS };
    };

    async function check() {
      if (inFlight) return;
      inFlight = true;
      clearTimeout(timer);
      dispatch({ type: "check" });
      try {
        const mails = await fetchEmails(address, token);
        if (!alive) return;
        const arrived = known ? mails.filter((m) => !known!.has(m.id)) : [];
        known = new Set(mails.map((m) => m.id));
        if (arrived.length > 0) onArrived(arrived);
        dispatch({ type: "received", mails, next: next() });
      } catch (error) {
        if (!alive) return;
        if (error instanceof ApiError && (error.status === 401 || error.status === 404)) onExpired();
        else dispatch({ type: "failed", next: next() });
      } finally {
        inFlight = false;
      }
    }

    const onVisibility = () => {
      if (!document.hidden) return void check();
      clearTimeout(timer);
      dispatch({ type: "paused" });
    };

    checkNow.current = check;
    document.addEventListener("visibilitychange", onVisibility);
    check();
    return () => {
      alive = false;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [address, token]);

  const refresh = useCallback(() => checkNow.current(), []);

  const remove = useCallback(
    async (id: string) => {
      dispatch({ type: "removed", id });
      try {
        await deleteEmail(address, token, id);
      } catch (error) {
        dispatch({ type: "restored", id });
        checkNow.current();
        throw error;
      }
    },
    [address, token],
  );

  return { mails: state.mails, poll: state.poll, online: state.online, refresh, remove };
}
