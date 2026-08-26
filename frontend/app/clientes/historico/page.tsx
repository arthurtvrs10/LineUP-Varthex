import type { Metadata } from "next";
import { ClientShell } from "@/components/clientes/ClientShell";
import { HistoricoPage } from "@/components/clientes/HistoricoPage";

export const metadata: Metadata = {
  title: "Histórico",
};

export default function ClientesHistoricoPage() {
  return (
    <ClientShell title="Histórico" breadcrumb="Histórico">
      <HistoricoPage />
    </ClientShell>
  );
}
