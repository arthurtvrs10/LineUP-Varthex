import type { Metadata } from "next";
import { SuperAdminShell } from "@/components/superadmin/SuperAdminShell";
import { SuperAdminDashboardPage } from "@/components/superadmin/SuperAdminDashboardPage";

export const metadata: Metadata = {
  title: "Super Admin — Dashboard",
};

export default function SuperAdminDashboardRoute() {
  return (
    <SuperAdminShell title="Dashboard" breadcrumb="Dashboard">
      <SuperAdminDashboardPage />
    </SuperAdminShell>
  );
}
