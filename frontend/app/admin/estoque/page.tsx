import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminEstoquePage } from "@/components/admin/AdminEstoquePage";

export const metadata: Metadata = {
  title: "Estoque",
};

export default function AdminEstoqueRoute() {
  return (
    <AdminShell title="Estoque" breadcrumb="Estoque">
      <AdminEstoquePage />
    </AdminShell>
  );
}
