import type { Metadata } from "next";
import { ClientShell } from "@/components/clientes/ClientShell";
import { AgendamentoPage } from "@/components/clientes/AgendamentoPage";

export const metadata: Metadata = {
  title: "Agendar",
};

export default function ClientesAgendamentoPage() {
  return (
    <ClientShell title="Agendamento" breadcrumb="Agendar">
      <AgendamentoPage />
    </ClientShell>
  );
}
