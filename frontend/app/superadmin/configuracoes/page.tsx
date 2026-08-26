import type { Metadata } from "next";
import { SuperAdminShell } from "@/components/superadmin/SuperAdminShell";
import { SuperAdminConfiguracoesPage } from "@/components/superadmin/SuperAdminConfiguracoesPage";

export const metadata: Metadata = {
  title: "Super Admin — Configurações",
};

export default function SuperAdminConfiguracoesRoute() {
  return (
    <SuperAdminShell title="Parâmetros globais e integrações do SaaS Varthex Barber" breadcrumb="Configurações">
      <SuperAdminConfiguracoesPage />
    </SuperAdminShell>
  );
}
