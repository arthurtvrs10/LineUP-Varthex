import type { ReactNode } from "react";
import { BarberSidebar } from "./BarberSidebar";
import { BarberTopbar } from "./BarberTopbar";

type BarberShellProps = {
  title: string;
  breadcrumb: string;
  children: ReactNode;
};

export function BarberShell({ title, breadcrumb, children }: BarberShellProps) {
  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <BarberSidebar />
      <div className="pl-[298px]">
        <BarberTopbar title={title} breadcrumb={breadcrumb} />
        <main className="mx-auto max-w-[1144px] px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
