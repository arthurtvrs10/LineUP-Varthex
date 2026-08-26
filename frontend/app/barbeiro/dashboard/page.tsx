import type { Metadata } from "next";
import { BarberShell } from "@/components/barbeiro/BarberShell";
import { BarberDashboardPage } from "@/components/barbeiro/BarberDashboardPage";

export const metadata: Metadata = {
  title: "Painel do barbeiro",
};

export default function BarbeiroDashboardPage() {
  return (
    <BarberShell title="Dashboard" breadcrumb="Dashboard">
      <BarberDashboardPage />
    </BarberShell>
  );
}
