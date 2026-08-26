import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminServicosPage } from "@/components/admin/AdminServicosPage";

export const metadata: Metadata = {
  title: "Serviços",
};

export default function AdminServicosRoute() {
  return (
    <AdminShell title="Serviços" breadcrumb="Serviços">
      <AdminServicosPage />
    </AdminShell>
  );
}
