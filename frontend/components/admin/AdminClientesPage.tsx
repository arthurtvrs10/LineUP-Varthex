"use client";

import { useEffectEvent, useEffect, useState } from "react";
import { Toast, useToast } from "@/components/ui/Toast";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { NovoClienteModal, type NovoClientePayload } from "./modals/CadastroModals";
import { Plus, Search, Pencil } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { fetchAllPages } from "@/lib/paginated";
import { Modal } from "@/components/ui/Modal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useResource, brl, date } from "@/components/commercial/Primitives";

type CustomerResponse = {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  birthDate: string | null;
  notes: string | null;
  version: number;
  status: "ACTIVE" | "ARCHIVED";
  createdAt: string;
  photoData: string | null;
};


const avatarPalette = [
  { bg: "bg-[#fbf4e8]", text: "text-[#c8a86b]" },
  { bg: "bg-[#fdf3e3]", text: "text-[#d28b27]" },
  { bg: "bg-[#e8f7f1]", text: "text-[#27865b]" },
  { bg: "bg-[#eaf2fb]", text: "text-[#3478c9]" },
];

function avatarFor(id: string) {
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) % avatarPalette.length;
  return avatarPalette[hash];
}

function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

export function AdminClientesPage() {
  const [customers, setCustomers] = useState<CustomerResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [search, setSearch] = useState("");
  const [novoAberto, setNovoAberto] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState("Todos os status");
  const toast = useToast();
  const [editing, setEditing] = useState<CustomerResponse>();
  const [archiving, setArchiving] = useState<CustomerResponse>();
  const [archiveBusy, setArchiveBusy] = useState(false);
  const summary = useResource<Record<string,{visits:number;lastVisit:string|null;nextAppointment:string|null;paidAmount:number}>>("/commercial/customers/summary");
  async function archive() {
    if (!archiving || archiveBusy) return;
    setArchiveBusy(true);
    try { await apiFetch(`/customers/${archiving.id}`, {method:"DELETE"}); setArchiving(undefined); setEditing(undefined); await carregar(); }
    catch (e) { toast.mostrar(e instanceof Error ? e.message : "Não foi possível arquivar.", "erro"); }
    finally { setArchiveBusy(false); }
  }

  async function carregar() {
    try {
      setCustomers(await fetchAllPages<CustomerResponse>("/customers"));
      setError(undefined);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível carregar os clientes.");
    } finally {
      setLoading(false);
    }
  }

  const loadOnEffect = useEffectEvent(carregar);
  useEffect(() => {
    let active = true;
    // Start asynchronously; Strict Mode cleanup cancels an obsolete initial load.
    Promise.resolve().then(() => { if (active) { loadOnEffect(); } });
    return () => { active = false; };
  }, []);

  async function criarCliente(payload: NovoClientePayload) {
    await apiFetch("/customers", {
      method: "POST",
      body: {
        fullName: payload.fullName,
        email: payload.email || null,
        phone: payload.phone || null,
        birthDate: payload.birthDate || null,
        notes: payload.notes || null,
        version: 0,
      },
    });
    await carregar();
  }

  const filtered = customers.filter((c) => {
    const statusLabel = c.status === "ACTIVE" ? "Ativo" : "Inativo";
    return (
      (filtroStatus === "Todos os status" || statusLabel === filtroStatus) &&
      [c.fullName, c.phone ?? "", c.email ?? ""].some((field) =>
        field.toLowerCase().includes(search.toLowerCase()),
      )
    );
  });

  return (
    <div className="flex w-full flex-col items-start">
      <div className="flex w-full items-center justify-between">
        <div>
          <h1 className="font-['Manrope',sans-serif] text-2xl font-bold tracking-[-0.48px] text-[#0d1831]">
            Clientes
          </h1>
          <p className="pt-0.5 text-sm text-[#686a73]">
            {loading ? "Carregando…" : `${customers.length} clientes cadastrados`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setNovoAberto(true)}
          className="flex h-10 items-center justify-center gap-2 rounded-[10px] bg-accent px-4 text-sm font-medium text-on-accent transition hover:bg-accent-hover"
        >
          <Plus size={16} strokeWidth={2} />
          Novo cliente
        </button>
      </div>

      <div className="flex w-full flex-wrap items-center gap-3 pt-6">
        <div className="flex h-9 flex-1 items-center gap-2 rounded-[10px] border border-[#e6e4df] bg-white px-3">
          <Search size={15} strokeWidth={1.8} className="text-[#b0afa8]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, telefone ou e-mail..."
            className="w-full bg-transparent text-sm text-[#0d1831] placeholder:text-[#b0afa8] focus:outline-none"
          />
        </div>
        <FilterSelect
          label="Filtrar por status"
          className="w-[155px]"
          options={["Todos os status", "Ativo", "Inativo"]}
          value={filtroStatus}
          onChange={setFiltroStatus}
        />
      </div>

      {error && (
        <p className="mt-4 w-full rounded-[10px] bg-[#fdecee] px-3 py-2 text-sm text-[#e0333f]">
          {error}
        </p>
      )}

      <div className="w-full pt-6">
        <div className="w-full overflow-x-auto rounded-[12px] border border-[#e6e4df] bg-white">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#e6e4df] bg-[#f7f6f2] text-xs font-medium text-[#686a73]">
                <th className="sticky left-0 z-10 bg-white px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Telefone</th>
                <th className="px-4 py-3 font-medium">Última visita</th>
                <th className="px-4 py-3 font-medium">Próx. agendamento</th>
                <th className="px-4 py-3 font-medium">Pagamentos registrados</th>
                <th className="px-4 py-3 font-medium">Visitas</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((cliente) => {
                const avatar = avatarFor(cliente.id);
                return (
                  <tr key={cliente.id} className="border-b border-[#e6e4df] last:border-b-0">
                    <td className="sticky left-0 z-10 bg-white px-4 py-3">
                      <div className="flex items-center gap-3">
                        {cliente.photoData ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={cliente.photoData}
                            alt=""
                            className="size-8 shrink-0 rounded-full object-cover"
                          />
                        ) : (
                          <span
                            className={`grid size-8 shrink-0 place-items-center rounded-full ${avatar.bg} text-xs font-semibold ${avatar.text}`}
                          >
                            {initialsFor(cliente.fullName)}
                          </span>
                        )}
                        <div>
                          <p className="text-sm font-medium text-[#0d1831]">{cliente.fullName}</p>
                          <p className="text-xs text-[#686a73]">{cliente.email ?? "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#686a73]">{cliente.phone ?? "—"}</td>
                    <td className="px-4 py-3 text-sm">{date(summary.data?.[cliente.id]?.lastVisit)}</td>
                    <td className="px-4 py-3 text-sm">{date(summary.data?.[cliente.id]?.nextAppointment)}</td>
                    <td className="px-4 py-3 text-sm">{summary.data ? brl(summary.data[cliente.id]?.paidAmount) : "…"}</td>
                    <td className="px-4 py-3 text-sm">{summary.data?.[cliente.id]?.visits ?? "…"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          cliente.status === "ACTIVE"
                            ? "bg-[#e8f7f1] text-[#27865b]"
                            : "bg-[#f0efea] text-[#686a73]"
                        }`}
                      >
                        {cliente.status === "ACTIVE" ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        aria-label={`Editar ${cliente.fullName}`}
                        onClick={() => setEditing(cliente)}
                        className="text-[#b0afa8] transition hover:text-[#686a73]"
                      >
                        <Pencil size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!loading && filtered.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-[#686a73]">
              Nenhum cliente encontrado.
            </p>
          )}
        </div>
      </div>

      {summary.error && <p role="alert" className="mt-4 text-danger">{summary.error}</p>}
      {editing && <Modal open title="Editar cliente" onClose={() => setEditing(undefined)}>
        <CustomerEditor customer={editing} onSave={async body => { await apiFetch(`/customers/${editing.id}`, {method:"PATCH",body}); setEditing(undefined); await carregar(); }} />
        {editing.status === "ACTIVE" && <button className="mt-4 text-danger" onClick={() => setArchiving(editing)}>Arquivar cliente</button>}
      </Modal>}
      <ConfirmModal open={!!archiving} title="Arquivar cliente" description={`Arquivar ${archiving?.fullName ?? ""}? O histórico será preservado.`} confirmLabel={archiveBusy ? "Arquivando…" : "Confirmar arquivamento"} onClose={() => { if (!archiveBusy) setArchiving(undefined); }} onConfirm={archive} />
      <NovoClienteModal
        open={novoAberto}
        onClose={() => setNovoAberto(false)}
        onConcluir={toast.mostrar}
        onCriar={criarCliente}
      />
      <Toast mensagem={toast.mensagem} tone={toast.tone} onClose={toast.fechar} />
    </div>
  );
}

function CustomerEditor({customer,onSave}:{customer:CustomerResponse;onSave:(body:unknown)=>Promise<void>}) {
 const [form,setForm]=useState({fullName:customer.fullName,email:customer.email??"",phone:customer.phone??"",birthDate:customer.birthDate??"",notes:customer.notes??""});
 const [busy,setBusy]=useState(false);const [error,setError]=useState<string>();
 return <form className="space-y-3" onSubmit={async e=>{e.preventDefault();if(busy)return;setBusy(true);setError(undefined);try{await onSave({...form,email:form.email||null,phone:form.phone||null,birthDate:form.birthDate||null,version:customer.version});}catch(e){setError(e instanceof Error?e.message:"Falha ao salvar.");}finally{setBusy(false);}}}>
 {([['fullName','Nome'],['email','E-mail'],['phone','Telefone'],['birthDate','Nascimento'],['notes','Observações']] as const).map(([key,label])=><label key={key} className="flex flex-col gap-1 text-sm">{label}<input className="h-11 border border-fog px-3" required={key==='fullName'} type={key==='email'?'email':key==='birthDate'?'date':'text'} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}/></label>)}
 {error&&<p role="alert" className="text-danger">{error}</p>}<button disabled={busy} className="h-11 bg-accent px-5 text-on-accent">{busy?'Salvando…':'Salvar alterações'}</button></form>;
}
