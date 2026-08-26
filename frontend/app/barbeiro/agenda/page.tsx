import type { Metadata } from "next";
import { BarberShell } from "@/components/barbeiro/BarberShell";
import { BarberAgendaPage } from "@/components/barbeiro/BarberAgendaPage";

export const metadata: Metadata = {
  title: "Agenda",
};

export default function BarbeiroAgendaRoute() {
  return (
    <BarberShell title="Agendamentos" breadcrumb="Agenda">
      <BarberAgendaPage />
    </BarberShell>
  );
}
