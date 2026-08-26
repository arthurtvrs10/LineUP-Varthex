import type { ReactNode } from "react";
import { SuperAdminSidebar } from "./SuperAdminSidebar";
import { SuperAdminTopbar } from "./SuperAdminTopbar";

type SuperAdminShellProps = {
  title: string;
  breadcrumb: string;
  children: ReactNode;
};

export function SuperAdminShell({ title, breadcrumb, children }: SuperAdminShellProps) {
  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <SuperAdminSidebar />
      <div className="lg:pl-60">
        <SuperAdminTopbar title={title} breadcrumb={breadcrumb} />
        <main className="max-w-[1144px] px-7 py-8">{children}</main>
      </div>
    </div>
  );
}
