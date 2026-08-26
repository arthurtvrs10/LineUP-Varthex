import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminDashboardPage } from "@/components/admin/AdminDashboardPage";

export const metadata: Metadata = {
  title: "Visão Geral",
};

export default function AdminDashboardRoute() {
  return (
    <AdminShell title="Visão Geral" breadcrumb="Visão Geral">
      <AdminDashboardPage />
    </AdminShell>
  );
}
