import type { Metadata } from "next";
import { BarberShell } from "@/components/barbeiro/BarberShell";
import { BarberNotificacoesPage } from "@/components/barbeiro/BarberNotificacoesPage";

export const metadata: Metadata = {
  title: "Notificações",
};

export default function BarbeiroNotificacoesRoute() {
  return (
    <BarberShell title="Notificações" breadcrumb="Notificações">
      <BarberNotificacoesPage />
    </BarberShell>
  );
}
