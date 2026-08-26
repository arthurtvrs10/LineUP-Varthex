import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminCrmPage } from "@/components/admin/AdminCrmPage";

export const metadata: Metadata = {
  title: "CRM & WhatsApp",
};

export default function AdminCrmRoute() {
  return (
    <AdminShell title="CRM & WhatsApp" breadcrumb="CRM & WhatsApp">
      <AdminCrmPage />
    </AdminShell>
  );
}
