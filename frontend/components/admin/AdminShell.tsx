import type { ReactNode } from "react";
import { PortalSwitcher } from "@/components/dev/PortalSwitcher";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopbar } from "./AdminTopbar";

type AdminShellProps = {
  title: string;
  breadcrumb: string;
  children: ReactNode;
};

export function AdminShell({ title, breadcrumb, children }: AdminShellProps) {
  return (
    <div className="min-h-screen bg-[#f7f6f2]">
      <AdminSidebar />
      <div className="lg:pl-60">
        <AdminTopbar title={title} breadcrumb={breadcrumb} />
        <main className="max-w-full px-4 py-8 lg:pl-7 lg:pr-7">{children}</main>
      </div>
      <PortalSwitcher />
    </div>
  );
}
