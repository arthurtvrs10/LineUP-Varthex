import type { Metadata } from "next";
import { SuperAdminShell } from "@/components/superadmin/SuperAdminShell";
import { SuperAdminMetricasPage } from "@/components/superadmin/SuperAdminMetricasPage";

export const metadata: Metadata = {
  title: "Super Admin — Métricas",
};

export default function SuperAdminMetricasRoute() {
  return (
    <SuperAdminShell title="Indicadores de crescimento e saúde do SaaS" breadcrumb="Métricas">
      <SuperAdminMetricasPage />
    </SuperAdminShell>
  );
}
