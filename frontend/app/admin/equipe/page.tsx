import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminEquipePage } from "@/components/admin/AdminEquipePage";

export const metadata: Metadata = {
  title: "Equipe",
};

export default function AdminEquipeRoute() {
  return (
    <AdminShell title="Equipe" breadcrumb="Equipe">
      <AdminEquipePage />
    </AdminShell>
  );
}
