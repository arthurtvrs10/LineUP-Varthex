"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Search, Store, ArrowRight } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { selectShop, type BookingShop } from "@/lib/client-barbershop";

export function BarbershopPicker() {
  const { data: session } = useSession();
  const linkedShop = useSearchParams().get("barbearia");
  const [shops, setShops] = useState<BookingShop[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (!session?.user?.email) return;
    let active = true;
    apiFetch<BookingShop[]>("/me/barbershops").then(data => {
      if (!active) return;
      setShops(data);
      const linked = linkedShop && data.find(s => s.id === linkedShop || s.slug === linkedShop);
      if (linked) {
        selectShop(session.user.email!, linked);
        window.location.replace("/clientes/agendamento");
      }
    }).catch(() => { if (active) setError("Não foi possível carregar as barbearias. Tente novamente."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [session?.user?.email, linkedShop, retry]);

  function choose(shop: BookingShop) {
    try {
      selectShop(session!.user.email!, shop);
      // A new document discards all cached customer/catalog/booking state from the previous shop.
      window.location.assign("/clientes/agendamento");
    } catch { setError("Permita o armazenamento desta sessão no navegador para escolher uma barbearia."); }
  }

  const visible = shops.filter(s => s.name.toLocaleLowerCase("pt-BR").includes(query.trim().toLocaleLowerCase("pt-BR")));
  return <section className="mx-auto max-w-3xl">
    <h1 className="text-2xl font-bold text-[#0d1831]">Encontre sua barbearia</h1>
    <p className="mt-2 text-sm text-[#5f6f87]">Escolha onde quer agendar. Seu cadastro na barbearia será criado automaticamente ao confirmar o primeiro agendamento.</p>
    <label className="mt-6 flex items-center gap-3 rounded-[10px] border border-[#e6e4df] bg-white px-4 py-3">
      <Search size={18} className="text-[#5f6f87]" />
      <input aria-label="Buscar barbearia pelo nome" placeholder="Buscar pelo nome da barbearia" value={query} onChange={e => setQuery(e.target.value)} className="w-full bg-transparent text-sm text-[#0d1831] outline-none" />
    </label>
    {loading ? <p className="py-12 text-center text-sm text-[#5f6f87]" role="status">Carregando barbearias…</p>
      : error ? <div role="alert" className="mt-6 rounded-[12px] border border-[#e6e4df] bg-white p-6"><p>{error}</p><button className="mt-3 font-semibold text-accent-strong" onClick={() => { setError(undefined); setLoading(true); setRetry(n => n + 1); }}>Tentar novamente</button></div>
      : <>
        {linkedShop && !shops.some(s => s.id === linkedShop || s.slug === linkedShop) && <p role="status" className="mt-4 rounded-[10px] bg-[#fdf3e3] p-4 text-sm text-[#5f6f87]">A barbearia deste link não está disponível. Você pode escolher outra abaixo.</p>}
        {visible.length ? <ul className="mt-6 grid gap-3 sm:grid-cols-2">{visible.map(shop => <li key={shop.id}>
          <button onClick={() => choose(shop)} className="flex h-full w-full items-center gap-4 rounded-[12px] border border-[#e6e4df] bg-white p-5 text-left transition hover:border-accent focus-visible:outline-accent">
            <span className="rounded-[10px] bg-[#fdf3e3] p-3 text-accent-strong"><Store size={22} /></span>
            <span className="min-w-0 flex-1"><span className="block font-semibold text-[#0d1831]">{shop.name}</span><span className="mt-1 block text-xs text-[#5f6f87]">Escolher e agendar</span></span><ArrowRight size={18} />
          </button>
        </li>)}</ul> : <div className="mt-6 rounded-[12px] border border-dashed border-[#e6e4df] bg-white p-10 text-center">
          <h2 className="font-semibold text-[#0d1831]">{shops.length ? "Nenhuma barbearia encontrada" : "Nenhuma barbearia disponível no momento"}</h2>
          <p className="mt-2 text-sm text-[#5f6f87]">{shops.length ? "Tente outro nome ou limpe a busca." : "Tente novamente mais tarde ou peça à sua barbearia o link de agendamento do LineUp. Sua conta já está pronta para usar."}</p>
          {shops.length > 0 && <button onClick={() => setQuery("")} className="mt-4 text-sm font-semibold text-accent-strong">Limpar busca</button>}
        </div>}
      </>}
  </section>;
}
