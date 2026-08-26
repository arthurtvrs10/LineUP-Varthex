import type { ReactNode } from "react";
import { ClientSidebar } from "./ClientSidebar";
import { ClientTopbar } from "./ClientTopbar";

type ClientShellProps = {
  title: string;
  breadcrumb: string;
  children: ReactNode;
};

export function ClientShell({ title, breadcrumb, children }: ClientShellProps) {
  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <ClientSidebar />
      <div className="pl-[298px]">
        <ClientTopbar title={title} breadcrumb={breadcrumb} />
        <main className="mx-auto max-w-[1142px] px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
