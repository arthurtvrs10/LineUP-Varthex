import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { SettingsDashboard } from "@/components/admin/SettingsDashboard";
export const metadata: Metadata = { title: "Configurações" };
export default async function Page({ searchParams }: { searchParams: Promise<{ secao?: string }> }) {
  const { secao } = await searchParams;
  return <AdminShell title="Configurações" breadcrumb="Configurações" settings><SettingsDashboard initialSection={secao}/></AdminShell>;
}
