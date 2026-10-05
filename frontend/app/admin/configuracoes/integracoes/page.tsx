import Link from "next/link";
import { CalendarDays, MessageCircle } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";

export default function Page() {
  return <AdminShell title="Integrações" breadcrumb="Configurações / Integrações">
    <h1 className="text-2xl font-bold text-ink">Integrações</h1>
    <p className="mt-1 text-sm text-secondary">Conecte as ferramentas da sua barbearia.</p>
    <div className="mt-5 grid max-w-4xl gap-4 md:grid-cols-2">
      <Link href="/admin/configuracoes/integracoes/google-calendar" className="flex items-center gap-4 rounded-[12px] border border-fog bg-white p-5 transition hover:bg-surface-sunken focus-visible:outline-2 focus-visible:outline-accent">
        <CalendarDays className="shrink-0 text-accent-strong" aria-hidden="true" />
        <div><h2 className="font-semibold">Google Calendar</h2><p className="mt-1 text-sm text-secondary">Sincronize agendamentos com um calendário da sua conta Google.</p><p className="mt-3 text-sm font-semibold text-accent-strong">Configurar integração</p></div>
      </Link>
      <Link href="/admin/configuracoes/integracoes/whatsapp" className="flex items-center gap-4 rounded-[12px] border border-fog bg-white p-5 transition hover:bg-surface-sunken focus-visible:outline-2 focus-visible:outline-accent">
        <MessageCircle className="shrink-0 text-accent-strong" aria-hidden="true" />
        <div><h2 className="font-semibold">WhatsApp Business</h2><p className="mt-1 text-sm text-secondary">API oficial da Meta · Conta e número próprios</p><p className="mt-3 text-sm font-semibold text-accent-strong">Configurar integração</p></div>
      </Link>
    </div>
  </AdminShell>;
}
