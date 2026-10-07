"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, UserRound, Store, Settings2, CalendarDays, MessageCircle, Layers, Users, CreditCard, Receipt, RefreshCw } from "lucide-react";
import { AdminConfiguracoesPage } from "./AdminConfiguracoesPage";
import { BusinessSettingsPanel } from "@/components/commercial/Settings";
import { GoogleCalendarConnection } from "@/components/integrations/GoogleCalendarConnection";
import { WhatsAppSettings } from "./whatsapp/WhatsAppSettings";
import { SubscriptionPage } from "@/components/billing/SubscriptionPage";

const items = [
  { id: "conta", label: "Minha conta", group: "Estabelecimento", icon: UserRound },
  { id: "barbearia", label: "Dados da barbearia", group: "Estabelecimento", icon: Store },
  { id: "regras", label: "Agendamento e notificações", group: "Estabelecimento", icon: Settings2 },
  { id: "assinatura", label: "Meu plano", group: "Assinatura", icon: Layers, billing: "plan" },
  { id: "adicionais", label: "Profissionais e adicionais", group: "Assinatura", icon: Users, billing: "extras" },
  { id: "pagamento", label: "Forma de pagamento", group: "Assinatura", icon: CreditCard, billing: "payment" },
  { id: "faturas", label: "Faturas", group: "Assinatura", icon: Receipt, billing: "history" },
  { id: "renovacao", label: "Renovação", group: "Assinatura", icon: RefreshCw, billing: "renewal" },
  { id: "google", label: "Google Calendar", group: "Integrações", icon: CalendarDays },
  { id: "whatsapp", label: "WhatsApp Business", group: "Integrações", icon: MessageCircle },
] as const;
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export function SettingsDashboard({ initialSection = "conta" }: { initialSection?: string }) {
  const [search, setSearch] = useState("");
  const current = items.find(item => item.id === initialSection) ?? items[0];
  const visible = items.filter(item => normalize(`${item.label} ${item.group}`).includes(normalize(search)));
  return <div className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-2xl border border-fog bg-surface md:flex-row">
    <aside className="flex shrink-0 flex-col border-b border-fog bg-surface-sunken md:w-64 md:border-r md:border-b-0">
      <div className="shrink-0 p-4"><h1 className="mb-4 text-lg font-semibold text-ink">Configurações</h1><label className="flex items-center gap-2 rounded-lg border border-fog bg-surface px-3 py-2"><Search size={16} className="shrink-0 text-secondary"/><input aria-label="Pesquisar configurações" placeholder="Pesquisar" value={search} onChange={e => setSearch(e.target.value)} className="min-w-0 w-full bg-transparent text-sm outline-none"/></label></div>
      <nav aria-label="Configurações" className="flex gap-2 overflow-x-auto px-3 pb-3 md:min-h-0 md:flex-1 md:flex-col md:overflow-y-auto">
        {["Estabelecimento", "Assinatura", "Integrações"].map(group => { const links = visible.filter(item => item.group === group); return links.length > 0 && <div key={group} className="flex shrink-0 gap-1 md:block"><p className="hidden px-3 pt-3 pb-2 text-xs font-semibold text-secondary md:block">{group}</p>{links.map(item => <Link key={item.id} href={`/admin/configuracoes?secao=${item.id}`} scroll={false} aria-current={current.id === item.id ? "page" : undefined} className={"flex min-h-10 shrink-0 items-center gap-3 rounded-lg px-3 py-2 text-sm md:mb-1 " + (current.id === item.id ? "bg-accent-subtle font-semibold text-accent-strong" : "text-secondary hover:bg-surface")}><item.icon size={16} className="shrink-0"/><span>{item.label}</span></Link>)}</div>; })}
        {!visible.length && <p role="status" className="px-3 text-sm text-secondary">Nenhuma configuração encontrada.</p>}
      </nav>
    </aside>
    <section key={current.id} aria-label={current.label} className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 lg:p-8">
      {"billing" in current ? <SubscriptionPage section={current.billing} embedded/> : <div className="w-full space-y-6"><div><p className="text-xs text-secondary">{current.group}</p><h2 className="mt-1 text-xl font-semibold text-ink">{current.label}</h2></div>
        {(current.id === "conta" || current.id === "barbearia") && <AdminConfiguracoesPage section={current.id}/>}
        {current.id === "regras" && <BusinessSettingsPanel/>}
        {current.id === "google" && <GoogleCalendarConnection scope="TENANT" returnTo="/admin/configuracoes/integracoes/google-calendar"/>}
        {current.id === "whatsapp" && <WhatsAppSettings embedded/>}
      </div>}
    </section>
  </div>;
}
