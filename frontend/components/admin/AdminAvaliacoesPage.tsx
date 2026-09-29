"use client";

import { useState } from "react";
import { Star, MessageSquare, Search } from "lucide-react";
import { useResource, Status } from "@/components/commercial/Primitives";
import { Modal, ModalCancelButton, ModalSubmitButton } from "@/components/ui/Modal";
import { Toast, useToast } from "@/components/ui/Toast";
import { apiFetch } from "@/lib/api";

type Review = { id: string; appointmentId: string; customerName: string; barberName: string; rating: number; comment: string; reply: string | null; createdAt: string };

export function AdminAvaliacoesPage() {
  const resource = useResource<Review[]>("/commercial/reviews");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<Review>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const toast = useToast();
  const reviews = resource.data ?? [];
  const average = reviews.length ? (reviews.reduce((sum,r) => sum+r.rating,0)/reviews.length).toFixed(1).replace(".",",") : "—";
  const visible = reviews.filter(r => (filter === "all" || (filter === "unanswered" ? !r.reply : r.rating === Number(filter))) && `${r.customerName} ${r.barberName} ${r.comment}`.toLocaleLowerCase("pt-BR").includes(query.toLocaleLowerCase("pt-BR")));
  return <div className="space-y-5">
    <div><h1 className="text-2xl font-bold tracking-tight text-ink">Avaliações</h1><p className="mt-1 text-sm text-secondary">Acompanhe a experiência dos clientes e responda às avaliações dos atendimentos.</p></div>
    <Status ready={!!resource.data} error={resource.error} />
    {resource.error && <button onClick={resource.reload} className="text-sm font-semibold text-accent-strong">Tentar novamente</button>}
    <div className="grid gap-3 sm:grid-cols-3">{[["Nota média",average],["Avaliações recebidas",reviews.length],["Sem resposta",reviews.filter(r=>!r.reply).length]].map(([label,value]) => <section key={label} className="rounded-[12px] border border-fog bg-white p-5"><p className="text-sm text-secondary">{label}</p><p className="mt-2 text-2xl font-bold text-ink">{value}</p></section>)}</div>
    <div className="flex flex-col gap-3 sm:flex-row"><label className="flex flex-1 items-center gap-2 rounded-[10px] border border-fog bg-white px-3"><Search size={18} className="text-secondary" /><input aria-label="Buscar avaliações" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar cliente, profissional ou comentário" className="h-11 w-full bg-transparent text-sm outline-none" /></label><select aria-label="Filtrar avaliações" value={filter} onChange={e=>setFilter(e.target.value)} className="h-11 rounded-[10px] border border-fog bg-white px-3 text-sm"><option value="all">Todas as avaliações</option><option value="unanswered">Sem resposta</option>{[5,4,3,2,1].map(n=><option key={n} value={n}>{n} estrelas</option>)}</select></div>
    <div className="space-y-3">{visible.map(r=><article key={r.id} className="rounded-[12px] border border-fog bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-semibold text-ink">{r.customerName}</h2><p className="mt-1 text-xs text-secondary">{r.barberName} · {new Date(r.createdAt).toLocaleDateString("pt-BR")}</p></div><div className="flex gap-1 text-accent-strong" aria-label={`${r.rating} de 5 estrelas`}>{[1,2,3,4,5].map(n=><Star key={n} size={17} fill={n<=r.rating?"currentColor":"none"} />)}</div></div>
      <p className="mt-4 whitespace-pre-wrap break-words text-sm text-ink">{r.comment || "Avaliação sem comentário."}</p>
      {r.reply && <div className="mt-4 rounded-[10px] bg-surface-sunken p-3"><p className="text-xs font-semibold text-secondary">Resposta da barbearia</p><p className="mt-1 whitespace-pre-wrap break-words text-sm text-ink">{r.reply}</p></div>}
      <button onClick={()=>{setSelected(r);setError(undefined);}} className="mt-4 flex items-center gap-2 text-sm font-semibold text-accent-strong"><MessageSquare size={16} />{r.reply?"Editar resposta":"Responder"}</button>
    </article>)}</div>
    {resource.data && !visible.length && <p className="rounded-[12px] border border-dashed border-fog p-10 text-center text-sm text-secondary">{reviews.length ? "Nenhuma avaliação corresponde à busca." : "As avaliações aparecerão aqui após os clientes avaliarem seus atendimentos concluídos."}</p>}
    {selected && <Modal open title={`Responder a ${selected.customerName}`} onClose={()=>{if(!busy)setSelected(undefined);}} footer={<><ModalCancelButton onClick={()=>{if(!busy)setSelected(undefined);}} /><ModalSubmitButton form="reply-review" disabled={busy}>{busy?"Salvando…":"Salvar resposta"}</ModalSubmitButton></>}>
      <form id="reply-review" className="space-y-3" onSubmit={async e=>{e.preventDefault();if(busy)return;const reason=String(new FormData(e.currentTarget).get("reason")??"").trim();if(!reason){setError("Informe sua resposta.");return;}setBusy(true);setError(undefined);try{await apiFetch(`/commercial/reviews/${selected.id}/reply`,{method:"POST",body:{reason}});setSelected(undefined);resource.reload();toast.mostrar("Resposta salva.");}catch(err){setError(err instanceof Error?err.message:"Não foi possível salvar.");}finally{setBusy(false);}}}>
        <label className="flex flex-col gap-2 text-sm text-ink">Sua resposta<textarea name="reason" required maxLength={1000} defaultValue={selected.reply??""} rows={4} className="rounded-[10px] border border-fog p-3 outline-none focus:border-accent" /></label>{error&&<p role="alert" className="text-sm text-danger">{error}</p>}
      </form>
    </Modal>}
    <Toast mensagem={toast.mensagem} tone={toast.tone} onClose={toast.fechar} />
  </div>;
}
