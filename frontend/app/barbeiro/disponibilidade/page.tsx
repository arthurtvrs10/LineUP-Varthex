import type { Metadata } from "next";
import { BarberShell } from "@/components/barbeiro/BarberShell";
import { BarberDisponibilidadePage } from "@/components/barbeiro/BarberDisponibilidadePage";

export const metadata: Metadata = {
  title: "Disponibilidade",
};

export default function BarbeiroDisponibilidadeRoute() {
  return (
    <BarberShell title="Disponibilidade" breadcrumb="Disponibilidade">
      <BarberDisponibilidadePage />
    </BarberShell>
  );
}
