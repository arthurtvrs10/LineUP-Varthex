import type { Metadata } from "next";
import { ClientShell } from "@/components/clientes/ClientShell";
import { ClientConfiguracoesPage } from "@/components/clientes/ClientConfiguracoesPage";

export const metadata: Metadata = {
  title: "Configurações",
};

export default function ClientesConfiguracoesRoute() {
  return (
    <ClientShell title="Configurações" breadcrumb="Configurações">
      <ClientConfiguracoesPage />
    </ClientShell>
  );
}
