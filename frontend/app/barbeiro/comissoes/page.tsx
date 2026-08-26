import type { Metadata } from "next";
import { BarberShell } from "@/components/barbeiro/BarberShell";
import { BarberComissoesPage } from "@/components/barbeiro/BarberComissoesPage";

export const metadata: Metadata = {
  title: "Comissões",
};

export default function BarbeiroComissoesRoute() {
  return (
    <BarberShell title="Comissões" breadcrumb="Comissões">
      <BarberComissoesPage />
    </BarberShell>
  );
}
