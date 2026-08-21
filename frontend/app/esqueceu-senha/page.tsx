import type { Metadata } from "next";
import { ForgotPasswordPage } from "@/components/auth/ForgotPasswordPage";

export const metadata: Metadata = {
  title: "Encontre sua conta",
};

export default function EsqueceuSenhaPage() {
  return <ForgotPasswordPage />;
}
