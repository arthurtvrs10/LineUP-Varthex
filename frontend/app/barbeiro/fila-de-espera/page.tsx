import type { Metadata } from "next";
import { BarberShell } from "@/components/barbeiro/BarberShell";
import { BarberFilaDeEsperaPage } from "@/components/barbeiro/BarberFilaDeEsperaPage";

export const metadata: Metadata = {
  title: "Fila de espera",
};

export default function BarbeiroFilaDeEsperaRoute() {
  return (
    <BarberShell title="Fila de espera" breadcrumb="Fila de espera">
      <BarberFilaDeEsperaPage />
    </BarberShell>
  );
}
