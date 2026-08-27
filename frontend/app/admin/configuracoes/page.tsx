import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminConfiguracoesPage } from "@/components/admin/AdminConfiguracoesPage";

export const metadata: Metadata = {
  title: "Configurações",
};

export default function AdminConfiguracoesRoute() {
  return (
    <AdminShell title="Configurações" breadcrumb="Configurações">
      <AdminConfiguracoesPage />
    </AdminShell>
  );
}
