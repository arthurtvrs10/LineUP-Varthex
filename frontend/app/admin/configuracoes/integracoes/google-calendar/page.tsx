import { AdminShell } from "@/components/admin/AdminShell";
import { SettingsDashboard } from "@/components/admin/SettingsDashboard";
export default function Page() { return <AdminShell title="Configurações" breadcrumb="Configurações / Integrações" settings><SettingsDashboard initialSection="google"/></AdminShell>; }
