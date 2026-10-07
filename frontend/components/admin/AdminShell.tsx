import type { ReactNode } from "react";
import { PortalSwitcher } from "@/components/dev/PortalSwitcher";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopbar } from "./AdminTopbar";

type AdminShellProps = {
  title: string;
  breadcrumb: string;
  children: ReactNode;
  settings?: boolean;
};

export function AdminShell({ title, breadcrumb, children, settings = false }: AdminShellProps) {
  return (
    <div className={settings ? "h-dvh overflow-hidden bg-[#f7f6f2]" : "min-h-screen bg-[#f7f6f2]"}>
      <AdminSidebar />
      <div className={settings ? "flex h-full min-h-0 flex-col lg:pl-60" : "lg:pl-60"}>
        <AdminTopbar title={title} breadcrumb={breadcrumb} />
        <main className={settings ? "min-h-0 w-full flex-1 overflow-hidden p-3 lg:p-5" : "max-w-full px-4 py-8 lg:pl-7 lg:pr-7"}>{children}</main>
      </div>
      <PortalSwitcher />
    </div>
  );
}
