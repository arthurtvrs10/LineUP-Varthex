import type { Metadata } from "next";
import { BarberShell } from "@/components/barbeiro/BarberShell";
import { BarberConfiguracoesPage } from "@/components/barbeiro/BarberConfiguracoesPage";

export const metadata: Metadata = {
  title: "Configurações",
};

export default function BarbeiroConfiguracoesRoute() {
  return (
    <BarberShell title="Configurações" breadcrumb="Configurações">
      <BarberConfiguracoesPage />
    </BarberShell>
  );
}
