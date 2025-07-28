export function getParsedLocalStorage<T>(key: string): T | null {
  if (typeof window === "undefined") return null; // SSR guard
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) as T : null;
  } catch (e) {
    console.error("Error reading from localStorage:", e);
    return null;
  }
}
