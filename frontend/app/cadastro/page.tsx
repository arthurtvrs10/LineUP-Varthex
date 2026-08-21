import type { Metadata } from "next";
import { AuthPage } from "@/components/auth/AuthPage";

export const metadata: Metadata = {
  title: "Criar conta",
};

export default function CadastroPage() {
  return <AuthPage mode="register" />;
}
