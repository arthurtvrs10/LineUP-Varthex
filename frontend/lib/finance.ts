export type Movement = { id: string; createdAt: string; kind: string; amount: number | string; method: string; reason: string; registerId: string; appointmentId?: string | null; reversalOf?: string | null };
export const monthKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
export function monthRange(month: string) {
  const [year, m] = month.split("-").map(Number);
  return { from: `${month}-01`, to: `${month}-${new Date(year, m, 0).getDate()}` };
}
export function financeSummary(all: Movement[], month: string) {
  const rows = all.filter(p => p.createdAt.slice(0, 7) === month);
  const sum = (items: Movement[]) => items.reduce((s, p) => s + Math.round(Number(p.amount) * 100), 0) / 100;
  const incoming = sum(rows.filter(p => Number(p.amount) > 0));
  const outgoing = Math.abs(sum(rows.filter(p => Number(p.amount) < 0)));
  const services = rows.filter(p => p.kind === "PAYMENT" && p.appointmentId);
  const count = new Set(services.map(p => p.appointmentId)).size;
  return { rows, incoming, outgoing, balance: Math.round((incoming - outgoing) * 100) / 100,
    receipts: sum(rows.filter(p => p.kind === "PAYMENT" || p.kind === "PRODUCT_SALE")), ticket: count ? sum(services) / count : 0 };
}
export function sixMonths(month: string) {
  const [year, m] = month.split("-").map(Number);
  return Array.from({ length: 6 }, (_, i) => monthKey(new Date(year, m - 6 + i, 1)));
}
