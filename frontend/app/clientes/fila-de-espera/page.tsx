import type { Metadata } from "next";
import { ClientShell } from "@/components/clientes/ClientShell";
import { FilaDeEsperaPage } from "@/components/clientes/FilaDeEsperaPage";

export const metadata: Metadata = {
  title: "Fila de espera",
};

export default function ClientesFilaDeEsperaPage() {
  return (
    <ClientShell title="Fila de espera" breadcrumb="Fila de espera">
      <FilaDeEsperaPage />
    </ClientShell>
  );
}
