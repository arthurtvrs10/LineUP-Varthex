import type { Metadata } from "next";
import { ClientShell } from "@/components/clientes/ClientShell";
import { DashboardPage } from "@/components/clientes/DashboardPage";

export const metadata: Metadata = {
  title: "Minha área",
};

export default function ClientesDashboardPage() {
  return (
    <ClientShell title="Dashboard" breadcrumb="Dashboard">
      <DashboardPage />
    </ClientShell>
  );
}
