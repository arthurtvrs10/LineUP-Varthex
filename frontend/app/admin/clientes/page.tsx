import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminClientesPage } from "@/components/admin/AdminClientesPage";

export const metadata: Metadata = {
  title: "Clientes",
};

export default function AdminClientesRoute() {
  return (
    <AdminShell title="Clientes" breadcrumb="Clientes">
      <AdminClientesPage />
    </AdminShell>
  );
}
