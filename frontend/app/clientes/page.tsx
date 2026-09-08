import { redirect } from "next/navigation";

export default function ClientesIndexPage() {
  redirect("/clientes/dashboard");
}
