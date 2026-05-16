/**
 * state/notificationStore.ts
 *
 * Simple in-memory state for viewed/unviewed notifications.
 * Persisted to localStorage so it survives page refreshes.
 */

const STORAGE_KEY = "viewed_notification_ids";

function getViewedIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set<string>(JSON.parse(raw)) : new Set<string>();
  } catch {
    return new Set();
  }
}

function saveViewedIds(ids: Set<string>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ids)));
}

export function markAsViewed(id: string): void {
  const ids = getViewedIds();
  ids.add(id);
  saveViewedIds(ids);
}

export function markAllAsViewed(ids: string[]): void {
  const viewed = getViewedIds();
  ids.forEach((id) => viewed.add(id));
  saveViewedIds(viewed);
}

export function isViewed(id: string): boolean {
  return getViewedIds().has(id);
}

export function clearViewed(): void {
  if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEY);
}
