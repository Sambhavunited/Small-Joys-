"use client";

import { useSyncExternalStore } from "react";

export type Toast = { id: number; text: string; action?: "box" | "chat" };

type UIState = {
  drawerOpen: boolean;
  chatOpen: boolean;
  toast: Toast | null;
};

let state: UIState = { drawerOpen: false, chatOpen: false, toast: null };
const SERVER: UIState = state;
const listeners = new Set<() => void>();
let toastTimer: ReturnType<typeof setTimeout> | undefined;

function set(patch: Partial<UIState>) {
  state = { ...state, ...patch };
  for (const l of listeners) l();
}

export const uiStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot: () => state,
  getServerSnapshot: () => SERVER,
  openDrawer: () => set({ drawerOpen: true, chatOpen: false }),
  closeDrawer: () => set({ drawerOpen: false }),
  setChatOpen: (open: boolean) => set({ chatOpen: open, ...(open ? { drawerOpen: false } : {}) }),
  notify(text: string, action?: Toast["action"]) {
    clearTimeout(toastTimer);
    set({ toast: { id: Date.now(), text, action } });
    toastTimer = setTimeout(() => set({ toast: null }), 3200);
  },
  dismissToast() {
    clearTimeout(toastTimer);
    set({ toast: null });
  },
};

export function useUI() {
  return useSyncExternalStore(uiStore.subscribe, uiStore.getSnapshot, uiStore.getServerSnapshot);
}
