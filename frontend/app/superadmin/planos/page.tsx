import type { Metadata } from "next";
import { SuperAdminShell } from "@/components/superadmin/SuperAdminShell";
import { SuperAdminPlanosPage } from "@/components/superadmin/SuperAdminPlanosPage";

export const metadata: Metadata = {
  title: "Super Admin — Planos",
};

export default function SuperAdminPlanosRoute() {
  return (
    <SuperAdminShell title="Configuração e gestão dos planos da plataforma" breadcrumb="Planos">
      <SuperAdminPlanosPage />
    </SuperAdminShell>
  );
}
