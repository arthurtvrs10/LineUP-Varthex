import type { ReactNode } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopbar } from "./AdminTopbar";

type AdminShellProps = {
  title: string;
  breadcrumb: string;
  children: ReactNode;
};

export function AdminShell({ title, breadcrumb, children }: AdminShellProps) {
  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <AdminSidebar />
      <div className="lg:pl-60">
        <AdminTopbar title={title} breadcrumb={breadcrumb} />
        <main className="max-w-[1144px] px-7 py-8">{children}</main>
      </div>
    </div>
  );
}
