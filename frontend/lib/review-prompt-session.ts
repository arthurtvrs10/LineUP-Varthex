export function reviewPromptSession(storage: Pick<Storage, "getItem" | "setItem">) {
  const shown = new Set<string>();
  return {
    has(key: string) {
      if (shown.has(key)) return true;
      try { return storage.getItem(key) === "shown"; } catch { return false; }
    },
    mark(key: string) {
      shown.add(key);
      try { storage.setItem(key, "shown"); } catch { /* Keep the in-memory marker when storage is unavailable. */ }
    },
  };
}
