import type { Metadata } from "next";
import { SuperAdminShell } from "@/components/superadmin/SuperAdminShell";
import { SuperAdminUsuariosPage } from "@/components/superadmin/SuperAdminUsuariosPage";

export const metadata: Metadata = {
  title: "Super Admin — Usuários",
};

export default function SuperAdminUsuariosRoute() {
  return (
    <SuperAdminShell title="Usuários" breadcrumb="Usuários">
      <SuperAdminUsuariosPage />
    </SuperAdminShell>
  );
}
