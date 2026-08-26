import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminFidelidadePage } from "@/components/admin/AdminFidelidadePage";

export const metadata: Metadata = {
  title: "Fidelidade e planos",
};

export default function AdminFidelidadeRoute() {
  return (
    <AdminShell title="Fidelidade" breadcrumb="Fidelidade">
      <AdminFidelidadePage />
    </AdminShell>
  );
}
