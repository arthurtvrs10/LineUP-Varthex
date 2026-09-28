import { Suspense } from "react";
import { ClientShell } from "@/components/clientes/ClientShell";
import { BarbershopPicker } from "@/components/clientes/BarbershopPicker";

export default function Page() {
  return <ClientShell title="Minha barbearia" breadcrumb="Configurações / Barbearia">
    <Suspense fallback={<p>Carregando…</p>}><BarbershopPicker allowChange /></Suspense>
  </ClientShell>;
}
