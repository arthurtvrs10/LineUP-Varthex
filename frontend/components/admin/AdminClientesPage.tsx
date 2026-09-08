"use client";

import { useEffect, useState } from "react";
import { Toast, useToast } from "@/components/ui/Toast";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { NovoClienteModal, type NovoClientePayload } from "./modals/CadastroModals";
import { Plus, Search, MoreVertical } from "lucide-react";
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

  async function carregar() {
    try {
      const pagina = await apiFetch<CustomerPageResponse>("/customers?page=0&size=100");
      setCustomers(pagina.items);
      setError(undefined);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível carregar os clientes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
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
                <th className="px-4 py-3 font-medium">Total gasto</th>
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
                        <span
                          className={`grid size-8 shrink-0 place-items-center rounded-full ${avatar.bg} text-xs font-semibold ${avatar.text}`}
                        >
                          {initialsFor(cliente.fullName)}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-[#0d1831]">{cliente.fullName}</p>
                          <p className="text-xs text-[#686a73]">{cliente.email ?? "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#686a73]">{cliente.phone ?? "—"}</td>
                    {/* Sem dado de agendamento/pagamento ainda (Scheduling não existe) */}
                    <td className="px-4 py-3 text-sm text-[#686a73]">—</td>
                    <td className="px-4 py-3 text-sm text-[#686a73]">—</td>
                    <td className="px-4 py-3 text-sm font-medium text-[#0d1831]">—</td>
                    <td className="px-4 py-3 text-sm text-[#686a73]">—</td>
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
                        aria-label="Mais opções"
                        className="text-[#b0afa8] transition hover:text-[#686a73]"
                      >
                        <MoreVertical size={16} />
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
