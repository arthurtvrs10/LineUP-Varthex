export type BookingShop = { id: string; name: string; slug: string | null };

// Per-account, per-tab context: switching in one tab cannot retarget a booking in another.
const key = (email: string) => `lineup:barbershop:${email.toLowerCase()}`;
export function selectedShop(email?: string | null): BookingShop | undefined {
  if (!email || typeof window === "undefined") return;
  try {
    const value = JSON.parse(sessionStorage.getItem(key(email)) ?? "null");
    if (value && typeof value.id === "string" && typeof value.name === "string") return value;
  } catch { /* An unavailable/invalid selection leads to the picker. */ }
}
export function selectShop(email: string, shop: BookingShop) {
  sessionStorage.setItem(key(email), JSON.stringify(shop));
}
export function clientDestination(email?: string | null, linkedShop?: string | null) {
  if (linkedShop) return `/clientes/barbearias?barbearia=${encodeURIComponent(linkedShop)}`;
  return selectedShop(email) ? "/clientes/agendamento" : "/clientes/barbearias";
}
