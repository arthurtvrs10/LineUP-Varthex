import type { ReactNode } from "react";
import { PortalSwitcher } from "@/components/dev/PortalSwitcher";
import { BarberSidebar } from "./BarberSidebar";
import { BarberTopbar } from "./BarberTopbar";

type BarberShellProps = {
  title: string;
  breadcrumb: string;
  children: ReactNode;
};

export function BarberShell({ title, breadcrumb, children }: BarberShellProps) {
  return (
    <div className="min-h-screen bg-[#f7f6f2]">
      <BarberSidebar />
      <div className="lg:pl-60">
        <BarberTopbar title={title} breadcrumb={breadcrumb} />
        <main className="max-w-full px-4 py-8 lg:pl-7 lg:pr-7">{children}</main>
      </div>
      <PortalSwitcher />
    </div>
  );
}
