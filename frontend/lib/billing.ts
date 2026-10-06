export type BillingPlan = { id: string; name: string; monthlyPrice: number; barberLimit: number; description?: string | null; features?: string | null };
export type BillingAddon = { id: string; planId: string; name: string; code: string; monthlyPrice: number; maxQuantity: number };
export type BillingCatalog = { available: boolean; graceDays: number; plans: BillingPlan[]; environment?: string; addons?: BillingAddon[] };
export type BillingAccount = { id: string; tenantId: string; planId: string; monthlyPrice: number; method: string; state: string; cancelRequested: boolean; checkoutUrl: string | null; issue: string | null; syncedAt: string | null; providerSubscriptionId: string | null; environment?: string; basePrice?: number; addonName?: string; addonUnitPrice?: number; addonQuantity?: number; contractedBarberLimit?: number };
export type BillingCharge = { id: string; accountId: string; providerId: string; status: string; dueDate: string; paymentDate: string | null; availableOn: string | null; gross: number; net: number | null; refunded: number; invoiceUrl: string | null; refundState: string | null; failureCode: string | null };
export type BillingSummary = { available: boolean; graceDays: number; environment?: string; sandboxActionsEnabled?: boolean; account: BillingAccount | null; charges: BillingCharge[]; subscription: { planId: string | null; status: string; startsOn: string; endsOn: string } | null };

export const billingMoney = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
export const billingDate = (value: string | null | undefined) => value ? new Intl.DateTimeFormat("pt-BR").format(new Date(`${value.slice(0, 10)}T12:00:00`)) : "—";
export function billingStatus(value: string | null | undefined) {
  const labels: Record<string, string> = { STARTING: "Preparando contratação", UNCERTAIN: "Aguardando conciliação", ACTIVE: "Ativa", PENDING: "Aguardando pagamento", OVERDUE: "Vencida", PAST_DUE: "Em atraso", SUSPENDED: "Sem acesso ativo", CANCELED: "Renovação cancelada", CONFIRMED: "Pagamento confirmado", RECEIVED: "Recebido", REFUNDED: "Reembolsado", REFUND_REQUESTED: "Reembolso solicitado", REFUND_IN_PROGRESS: "Reembolso em processamento", DONE: "Reembolso concluído", DELETED: "Excluída", DUNNING_REQUESTED: "Em cobrança", CHARGEBACK_REQUESTED: "Pagamento contestado", CHARGEBACK_DISPUTE: "Contestação em análise", AWAITING_CHARGEBACK_REVERSAL: "Aguardando decisão da contestação" };
  if (value === "EXPIRED") return "Contratação expirada";
  if (value === "FAILED") return "Operação recusada";
  return value ? labels[value] ?? "Em análise" : "Sem assinatura integrada";
}
export function safeAsaasUrl(value: string | null | undefined) {
  if (!value) return undefined;
  try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password && ["asaas.com", "www.asaas.com", "sandbox.asaas.com"].includes(url.hostname) ? value : undefined; }
  catch { return undefined; }
}

// Shared by the public offer and authenticated checkout; prices always come from the API.
export function planFeatures(plan: BillingPlan): string[] {
  return plan.features?.split("\n").map(value => value.trim()).filter(Boolean) ?? [];
}
export function selectCatalogPlan(plans: BillingPlan[], requested: string | null): string {
  return plans.find(plan => plan.id === requested)?.id ?? "";
}
export function orderedPlans(plans: BillingPlan[]): BillingPlan[] {
  return [...plans].sort((a, b) => a.monthlyPrice - b.monthlyPrice || a.name.localeCompare(b.name));
}
export function monthlyTotal(base: number, addonPrice = 0, quantity = 0): number {
  return (Math.round(base * 100) + Math.round(addonPrice * 100) * quantity) / 100;
}
