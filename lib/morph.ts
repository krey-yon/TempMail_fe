import { flushSync } from "react-dom";

type Named = [Element | null | undefined, string];

function tag(pairs: Named[], on: boolean) {
  for (const [el, name] of pairs) {
    if (el instanceof HTMLElement || el instanceof SVGElement) el.style.viewTransitionName = on ? name : "";
  }
}

export function visible(selector: string): Element | null {
  return [...document.querySelectorAll(selector)].find((el) => el.checkVisibility()) ?? null;
}

/** The addressed envelope on the landing becomes the address card in the mailbox, and back. */
export function addressPairs(side: "landing" | "mailbox"): Named[] {
  if (side === "mailbox") {
    return [
      [document.querySelector('[data-morph-dst="addr-card"]'), "addr-card"],
      [document.querySelector('[data-morph-dst="addr-text"]'), "addr-text"],
    ];
  }
  return [
    [visible('[data-morph-src="addr-card"]') ?? visible('[data-morph-fallback="addr-card"]'), "addr-card"],
    [visible('[data-morph-src="addr-text"]') ?? visible('[data-morph-fallback="addr-text"]'), "addr-text"],
  ];
}

/** A letter's stamp and subject, inside an inbox row or the reader header. */
export function letterPairs(container: Element | null): Named[] {
  return [
    [container?.querySelector('[data-morph="stamp"]'), "letter-stamp"],
    [container?.querySelector('[data-morph="subject"]'), "letter-subject"],
  ];
}

type Options = {
  /** Elements that carry a shared name in the old state. */
  from?: Named[];
  /** Elements that carry the same names in the new state, looked up after the update renders. */
  to?: () => Named[];
  /** Slides the page on phones, where the list and the reader swap places. */
  direction?: "forward" | "back";
};

/**
 * Names are assigned per state rather than rendered statically, because a source row often stays
 * mounted next to its destination and a view-transition-name must be unique at capture time.
 */
export function morph(update: () => void, { from = [], to = () => [], direction }: Options = {}) {
  if (!document.startViewTransition || matchMedia("(prefers-reduced-motion: reduce)").matches) {
    update();
    return;
  }
  const root = document.documentElement;
  let target: Named[] = [];
  tag(from, true);
  if (direction) root.dataset.morph = direction;
  const transition = document.startViewTransition(() => {
    flushSync(update);
    tag(from, false);
    target = to();
    tag(target, true);
  });
  transition.ready.catch(() => {});
  transition.finished
    .catch(() => {})
    .finally(() => {
      tag(target, false);
      delete root.dataset.morph;
    });
}
