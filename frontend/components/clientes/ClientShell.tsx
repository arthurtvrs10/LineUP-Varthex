import type { ReactNode } from "react";
import { PortalSwitcher } from "@/components/dev/PortalSwitcher";
import { ClientSidebar } from "./ClientSidebar";
import { ClientTopbar } from "./ClientTopbar";
import { ClientPortalGate } from "./ClientPortalGate";
import { MyCustomerProvider } from "./MyCustomerContext";

type ClientShellProps = {
  title: string;
  breadcrumb: string;
  children: ReactNode;
};

export function ClientShell({ title, breadcrumb, children }: ClientShellProps) {
  return (
    <MyCustomerProvider>
      <div className="min-h-screen bg-[#f7f6f2]">
        <ClientSidebar />
        <div className="lg:pl-60">
          <ClientTopbar title={title} breadcrumb={breadcrumb} />
          <main className="max-w-full px-4 py-8 lg:pl-7 lg:pr-7">
            <ClientPortalGate>{children}</ClientPortalGate>
          </main>
        </div>
        <PortalSwitcher />
      </div>
    </MyCustomerProvider>
  );
}
