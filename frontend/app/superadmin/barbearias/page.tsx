import type { Metadata } from "next";
import { SuperAdminShell } from "@/components/superadmin/SuperAdminShell";
import { SuperAdminBarbeariasPage } from "@/components/superadmin/SuperAdminBarbeariasPage";

export const metadata: Metadata = {
  title: "Super Admin — Barbearias",
};

export default function SuperAdminBarbeariasRoute() {
  return (
    <SuperAdminShell title="Barbearias" breadcrumb="Barbearias">
      <SuperAdminBarbeariasPage />
    </SuperAdminShell>
  );
}
