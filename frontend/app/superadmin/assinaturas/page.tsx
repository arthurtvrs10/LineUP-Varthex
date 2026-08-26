import type { Metadata } from "next";
import { SuperAdminShell } from "@/components/superadmin/SuperAdminShell";
import { SuperAdminAssinaturasPage } from "@/components/superadmin/SuperAdminAssinaturasPage";

export const metadata: Metadata = {
  title: "Super Admin — Assinaturas",
};

export default function SuperAdminAssinaturasRoute() {
  return (
    <SuperAdminShell title="Gestão de assinaturas e cobranças da plataforma" breadcrumb="Assinaturas">
      <SuperAdminAssinaturasPage />
    </SuperAdminShell>
  );
}
