import type { ReactNode } from "react";
import { PortalSwitcher } from "@/components/dev/PortalSwitcher";
import { SuperAdminSidebar } from "./SuperAdminSidebar";
import { SuperAdminTopbar } from "./SuperAdminTopbar";

type SuperAdminShellProps = {
  title: string;
  breadcrumb: string;
  children: ReactNode;
};

export function SuperAdminShell({ title, breadcrumb, children }: SuperAdminShellProps) {
  return (
    <div className="min-h-screen bg-[#f7f6f2]">
      <SuperAdminSidebar />
      <div className="lg:pl-60">
        <SuperAdminTopbar title={title} breadcrumb={breadcrumb} />
        <main className="max-w-full px-4 py-8 lg:pl-7 lg:pr-7">{children}</main>
      </div>
      <PortalSwitcher />
    </div>
  );
}
