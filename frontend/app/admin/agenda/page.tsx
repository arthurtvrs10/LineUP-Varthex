import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminAgendaPage } from "@/components/admin/AdminAgendaPage";

export const metadata: Metadata = {
  title: "Agenda",
};

export default function AdminAgendaRoute() {
  return (
    <AdminShell title="Agenda" breadcrumb="Agenda">
      <AdminAgendaPage />
    </AdminShell>
  );
}
