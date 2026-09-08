"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";
import { Toast, useToast } from "@/components/ui/Toast";
import { NovoClienteModal, type NovoClientePayload } from "@/components/admin/modals/CadastroModals";
import { apiFetch, ApiError } from "@/lib/api";

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
};

type CustomerPageResponse = {
  items: CustomerResponse[];
  page: { number: number; size: number; totalElements: number; totalPages: number };
};

function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

function formatarData(iso: string | null) {
  if (!iso) return "Não informado";
  return new Date(iso).toLocaleDateString("pt-BR");
}

export function BarberClientesPage() {
  const [customers, setCustomers] = useState<CustomerResponse[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [novoAberto, setNovoAberto] = useState(false);
  const toast = useToast();

  async function carregar() {
    try {
      const params = new URLSearchParams({
        page: String(page),
        size: String(pageSize),
      });
      if (query.trim()) params.set("query", query.trim());

      const pagina = await apiFetch<CustomerPageResponse>(`/customers?${params.toString()}`);
      setCustomers(pagina.items);
      setTotalElements(pagina.page.totalElements);
      setTotalPages(pagina.page.totalPages);
      setError(undefined);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível carregar os clientes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, query]);

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
    setPage(0);
    await carregar();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[30px] font-bold text-[#0d1831]">Clientes</h1>
          <p className="mt-1 text-sm text-[#5f6f87]">Consulte dados permitidos e o histórico de atendimentos.</p>
        </div>
        <button
          type="button"
          onClick={() => setNovoAberto(true)}
          className="flex items-center gap-2 rounded-[10px] bg-accent px-5 py-3 text-sm font-bold text-on-accent transition hover:bg-accent-hover"
        >
          <Plus size={16} strokeWidth={2.5} />
          Cadastrar cliente
        </button>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4 rounded-[12px] border border-[#e6e4df] bg-white p-5">
        <div className="min-w-[260px] flex-1">
          <label className="text-sm text-[#0d1831]" htmlFor="buscar-clientes">
            Buscar
          </label>
          <div className="relative mt-2">
            <Search size={16} strokeWidth={2} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#98a2b3]" />
            <input
              id="buscar-clientes"
              value={query}
              onChange={(event) => {
                setPage(0);
                setQuery(event.target.value);
              }}
              placeholder="Buscar clientes"
              className="h-11 w-full rounded-[10px] border border-[#e6e4df] pl-10 pr-3.5 text-sm text-[#0d1831] outline-none focus:border-accent focus:ring-3 focus:ring-accent/10"
            />
          </div>
        </div>

        <div>
          <p className="text-xs text-[#5f6f87]">RESULTADOS POR PÁGINA</p>
          <select
            value={pageSize}
            onChange={(event) => {
              setPage(0);
              setPageSize(Number(event.target.value));
            }}
            className="mt-1.5 h-10 rounded-[10px] border border-[#e6e4df] px-3 text-sm font-bold text-[#0d1831] outline-none"
          >
            <option value="4">4</option>
            <option value="10">10</option>
            <option value="25">25</option>
          </select>
        </div>

        <p className="text-sm text-[#5f6f87]">
          {loading ? "Carregando…" : `${totalElements} clientes`}
        </p>
      </div>

      {error && (
        <p className="rounded-[10px] bg-[#fdecee] px-3 py-2 text-sm text-[#e0333f]">{error}</p>
      )}

      <div className="rounded-[12px] border border-[#e6e4df] bg-white">
        <div className="px-6 pt-5">
          <p className="text-xl font-bold text-[#0d1831]">Lista de clientes</p>
          <p className="mt-1 text-sm text-[#5f6f87]">Cadastros disponíveis no seu escopo.</p>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-left">
            <thead>
              <tr className="border-y border-[#e6e4df] bg-[#f7f6f2] text-[12px] font-bold text-[#98a2b3]">
                <th className="sticky left-0 z-10 bg-white px-6 py-3 font-bold">CLIENTE</th>
                <th className="px-6 py-3 font-bold">CONTATO</th>
                <th className="px-6 py-3 font-bold">NASCIMENTO</th>
                <th className="px-6 py-3 font-bold">CADASTRO</th>
                <th className="px-6 py-3 font-bold">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((client) => (
                <tr key={client.id} className="border-b border-[#eef0f3] last:border-none">
                  <td className="sticky left-0 z-10 bg-white px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent-subtle text-xs font-bold text-accent-strong">
                        {initialsFor(client.fullName)}
                      </span>
                      <div>
                        <p className="text-sm font-bold text-[#0d1831]">{client.fullName}</p>
                        <p className="text-xs text-[#5f6f87]">Cliente</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[13px] text-[#5f6f87]">{client.phone ?? "Não informado"}</p>
                    <p className="mt-0.5 text-xs text-[#5f6f87]">{client.email ?? "Não informado"}</p>
                  </td>
                  <td className="px-6 py-4 text-[13px] text-[#5f6f87]">
                    {formatarData(client.birthDate)}
                  </td>
                  <td className="px-6 py-4 text-[13px] text-[#5f6f87]">
                    {formatarData(client.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
                        client.status === "ACTIVE"
                          ? "bg-[#e8f7f1] text-[#27865b]"
                          : "bg-[#f0efea] text-[#686a73]"
                      }`}
                    >
                      <span className="size-1.5 rounded-full bg-current" />
                      {client.status === "ACTIVE" ? "Ativo" : "Arquivado"}
                    </span>
                  </td>
                </tr>
              ))}
              {!loading && customers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-[#98a2b3]">
                    Nenhum cliente encontrado para essa busca.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e6e4df] px-6 py-4 text-sm">
          <p className="text-[#5f6f87]">
            Página {totalPages === 0 ? 0 : page + 1} de {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="flex items-center gap-1 rounded-[10px] border border-[#e6e4df] px-3.5 py-2 text-[#0d1831] transition hover:bg-[#f7f6f2] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={14} strokeWidth={2} />
              Anterior
            </button>
            <span className="grid size-10 place-items-center rounded-[10px] border border-accent text-sm font-bold text-accent-strong">
              {page + 1}
            </span>
            <button
              type="button"
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="flex items-center gap-1 rounded-[10px] border border-[#e6e4df] px-3.5 py-2 text-[#0d1831] transition hover:bg-[#f7f6f2] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Próxima
              <ChevronRight size={14} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>

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
