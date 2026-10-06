import { AdminShell } from "@/components/admin/AdminShell";
import { SubscriptionPage } from "@/components/billing/SubscriptionPage";
export default function Page() {
  return <AdminShell title="Minha assinatura" breadcrumb="Assinatura"><SubscriptionPage /></AdminShell>;
}
