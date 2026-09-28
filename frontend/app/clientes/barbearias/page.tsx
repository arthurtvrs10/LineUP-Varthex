import { Suspense } from "react";
import { ClientShell } from "@/components/clientes/ClientShell";
import { BarbershopPicker } from "@/components/clientes/BarbershopPicker";

export default function Page() {
  return <ClientShell title="Escolher barbearia" breadcrumb="Barbearias">
    <Suspense fallback={<p>Carregando barbearias…</p>}><BarbershopPicker /></Suspense>
  </ClientShell>;
}
