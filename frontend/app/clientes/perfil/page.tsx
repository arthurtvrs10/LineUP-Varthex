import type { Metadata } from "next";
import { ClientShell } from "@/components/clientes/ClientShell";
import { PerfilPage } from "@/components/clientes/PerfilPage";

export const metadata: Metadata = {
  title: "Meu perfil",
};

export default function ClientesPerfilPage() {
  return (
    <ClientShell title="Perfil" breadcrumb="Perfil">
      <PerfilPage />
    </ClientShell>
  );
}
