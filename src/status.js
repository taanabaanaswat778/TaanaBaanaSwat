import { useSyncExternalStore } from "react";

// A message shown at the top of the store when something needs attention
let cur = { kind: "", text: "" };
const subs = new Set();

export function reportStatus(kind, text) {
  if (cur.kind === kind && cur.text === text) return;
  cur = { kind, text };
  subs.forEach((f) => f());
}

export const useStatus = () =>
  useSyncExternalStore(
    (cb) => { subs.add(cb); return () => subs.delete(cb); },
    () => cur
  );