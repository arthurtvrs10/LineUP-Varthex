import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { GoogleCalendarConnection } from "@/components/integrations/GoogleCalendarConnection";

export const metadata: Metadata = { title: "Google Calendar" };

export default function GoogleCalendarPage() {
  return <AdminShell title="Google Calendar" breadcrumb="Configurações / Integrações / Google Calendar">
    <div className="max-w-4xl"><GoogleCalendarConnection scope="TENANT" returnTo="/admin/configuracoes/integracoes/google-calendar" /></div>
  </AdminShell>;
}
