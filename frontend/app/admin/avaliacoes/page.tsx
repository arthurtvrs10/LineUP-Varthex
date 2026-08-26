import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminAvaliacoesPage } from "@/components/admin/AdminAvaliacoesPage";

export const metadata: Metadata = {
  title: "Avaliações",
};

export default function AdminAvaliacoesRoute() {
  return (
    <AdminShell title="Avaliações" breadcrumb="Avaliações">
      <AdminAvaliacoesPage />
    </AdminShell>
  );
}
