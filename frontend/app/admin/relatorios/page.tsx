import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminRelatoriosPage } from "@/components/admin/AdminRelatoriosPage";

export const metadata: Metadata = {
  title: "Relatórios",
};

export default function AdminRelatoriosRoute() {
  return (
    <AdminShell title="Relatórios" breadcrumb="Relatórios">
      <AdminRelatoriosPage />
    </AdminShell>
  );
}
