import type { Metadata } from "next";
import { SuperAdminShell } from "@/components/superadmin/SuperAdminShell";
import { SuperAdminSaudeSistemaPage } from "@/components/superadmin/SuperAdminSaudeSistemaPage";

export const metadata: Metadata = {
  title: "Super Admin — Saúde do sistema",
};

export default function SuperAdminSaudeSistemaRoute() {
  return (
    <SuperAdminShell title="Monitoramento em tempo real de todos os serviços da plataforma" breadcrumb="Saúde do sistema">
      <SuperAdminSaudeSistemaPage />
    </SuperAdminShell>
  );
}
