import type { Metadata } from "next";
import { CheckoutPage } from "@/components/billing/CheckoutPage";

export const metadata: Metadata = { title: "Escolha seu plano" };

export default function Page() {
  return <CheckoutPage />;
}
