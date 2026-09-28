import { redirect } from "next/navigation";

export default async function Page({ params }: { params: Promise<{ shop: string }> }) {
  const { shop } = await params;
  redirect(`/login?barbearia=${encodeURIComponent(shop)}`);
}
