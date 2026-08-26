import type { Metadata } from "next";
import { SuperAdminShell } from "@/components/superadmin/SuperAdminShell";
import { SuperAdminAuditoriasPage } from "@/components/superadmin/SuperAdminAuditoriasPage";

export const metadata: Metadata = {
  title: "Super Admin — Auditoria",
};

export default function SuperAdminAuditoriasRoute() {
  return (
    <SuperAdminShell title="Registro completo de ações realizadas na plataforma" breadcrumb="Auditoria">
      <SuperAdminAuditoriasPage />
    </SuperAdminShell>
  );
}
