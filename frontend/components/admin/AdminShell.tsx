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
      <div className="pl-[298px]">
        <AdminTopbar title={title} breadcrumb={breadcrumb} />
        <main className="mx-auto max-w-[1144px] px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
