import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminFinanceiroPage } from "@/components/admin/AdminFinanceiroPage";

export const metadata: Metadata = {
  title: "Financeiro",
};

export default function AdminFinanceiroRoute() {
  return (
    <AdminShell title="Financeiro" breadcrumb="Financeiro">
      <AdminFinanceiroPage />
    </AdminShell>
  );
}
