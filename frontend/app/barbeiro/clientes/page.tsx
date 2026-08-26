import type { Metadata } from "next";
import { BarberShell } from "@/components/barbeiro/BarberShell";
import { BarberClientesPage } from "@/components/barbeiro/BarberClientesPage";

export const metadata: Metadata = {
  title: "Clientes",
};

export default function BarbeiroClientesRoute() {
  return (
    <BarberShell title="Clientes" breadcrumb="Clientes">
      <BarberClientesPage />
    </BarberShell>
  );
}
