"use client";

import { useEffect, useState } from "react";
import { Search, FolderPlus } from "lucide-react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { Toast, useToast } from "@/components/ui/Toast";
import { apiFetch, ApiError } from "@/lib/api";

type TenantStatus = "TRIAL" | "ACTIVE" | "PAST_DUE" | "SUSPENDED" | "CANCELED";

type TenantResponse = {
  id: string;
  tradeName: string;
  document: string | null;
  status: TenantStatus;
  email: string | null;
  createdAt: string;
  version: number;
};

type UserSummaryResponse = {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "BARBER" | "CLIENT";
  status: string;
  tenantId: string | null;
};

const statusLabel: Record<TenantStatus, string> = {
  TRIAL: "Trial",
  ACTIVE: "Ativo",
  PAST_DUE: "Inadimplente",
  SUSPENDED: "Suspenso",
  CANCELED: "Cancelado",
};

const statusStyles: Record<TenantStatus, string> = {
  TRIAL: "bg-[#fdf3e3] text-[#d28b27]",
  ACTIVE: "bg-[#e8f7f1] text-[#27865b]",
  PAST_DUE: "bg-[#fdf3e3] text-[#d28b27]",
  SUSPENDED: "bg-[#fdeaea] text-[#c84a4a]",
  CANCELED: "bg-[#f0efea] text-[#686a73]",
};

function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR");
}

export function SuperAdminBarbeariasPage() {
  const [tenants, setTenants] = useState<TenantResponse[]>([]);
  const [users, setUsers] = useState<UserSummaryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("Todos os status");
  const [confirmando, setConfirmando] = useState<TenantResponse | null>(null);
  const toast = useToast();

  async function carregar() {
    try {
      const [listaTenants, listaUsuarios] = await Promise.all([
        apiFetch<TenantResponse[]>("/tenants"),
        apiFetch<UserSummaryResponse[]>("/users"),
      ]);
      setTenants(listaTenants);
      setUsers(listaUsuarios);
      setError(undefined);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível carregar as barbearias.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  function responsavel(tenantId: string) {
    return users.find((u) => u.tenantId === tenantId && u.role === "ADMIN")?.name ?? "—";
  }

  function contarUsuarios(tenantId: string) {
    return users.filter((u) => u.tenantId === tenantId).length;
  }

  const visiveis = tenants.filter(
    (t) =>
      (filtroStatus === "Todos os status" || statusLabel[t.status] === filtroStatus) &&
      (busca === "" ||
        t.tradeName.toLowerCase().includes(busca.toLowerCase()) ||
        responsavel(t.id).toLowerCase().includes(busca.toLowerCase())),
  );

  async function confirmarMudancaDeStatus() {
    const t = confirmando;
    setConfirmando(null);
    if (!t) return;

    const novoStatus: TenantStatus = t.status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";

    try {
      await apiFetch(`/tenants/${t.id}/status`, {
        method: "PATCH",
        body: { status: novoStatus },
      });
      await carregar();
      toast.mostrar(
        novoStatus === "SUSPENDED"
          ? `${t.tradeName} foi suspensa. Os usuários perdem o acesso.`
          : `${t.tradeName} foi reativada.`,
      );
    } catch (err) {
      toast.mostrar(
        err instanceof ApiError ? err.message : "Não foi possível atualizar o status.",
        "erro",
      );
    }
  }

  return (
    <div className="flex w-full flex-col items-start gap-4">
      <div className="flex w-full flex-wrap items-center gap-3">
        <div className="flex h-10 flex-1 items-center gap-2 rounded-[10px] border border-[#e6e4df] bg-white px-4">
          <Search size={15} strokeWidth={1.8} className="text-[#98a2b3]" />
          <input
            type="text"
            placeholder="Buscar por nome ou responsável..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="h-full flex-1 bg-transparent text-xs text-[#0d1831] placeholder:text-[#98a2b3] focus:outline-none"
          />
        </div>
        <FilterSelect
          label="Filtrar por status"
          options={["Todos os status", ...Object.values(statusLabel)]}
          value={filtroStatus}
          onChange={setFiltroStatus}
        />
        <button
          type="button"
          disabled
          title="Cadastro de barbearia é feito pelo próprio responsável em /cadastro"
          className="flex h-10 items-center gap-2 rounded-[10px] bg-accent px-4 text-xs font-medium text-on-accent opacity-50"
        >
          <FolderPlus size={18} strokeWidth={1.8} />
          Nova barbearia
        </button>
      </div>

      {error && (
        <p className="w-full rounded-[10px] bg-[#fdecee] px-3 py-2 text-sm text-[#e0333f]">
          {error}
        </p>
      )}

      <div className="w-full rounded-[12px] border border-[#e6e4df] bg-white p-6">
        <p className="text-lg font-bold text-[#0d1831]">
          Barbearias{!loading && ` (${tenants.length})`}
        </p>
        <div className="w-full overflow-x-auto">
          <table className="mt-4 w-full min-w-[900px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#e6e4df] text-[10px] font-bold text-[#98a2b3]">
                <th className="pb-2 pr-3 font-bold">BARBEARIA</th>
                <th className="pb-2 pr-3 text-center font-bold">RESPONSÁVEL</th>
                <th className="pb-2 pr-3 text-center font-bold">USUÁRIOS</th>
                <th className="pb-2 pr-3 text-center font-bold">CRIAÇÃO</th>
                <th className="pb-2 pr-3 text-center font-bold">STATUS</th>
                <th className="pb-2 pr-3 text-center font-bold">AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              {visiveis.map((t) => (
                <tr key={t.id} className="border-b border-[#eef0f3] last:border-b-0">
                  <td className="sticky left-0 z-10 bg-white py-3 pr-3">
                    <div className="flex items-center gap-3">
                      <span className="grid size-10 place-items-center rounded-[10px] bg-accent-subtle text-xs font-bold text-accent-strong">
                        {t.tradeName
                          .split(" ")
                          .slice(0, 2)
                          .map((w) => w[0])
                          .join("")}
                      </span>
                      <div>
                        <p className="text-sm font-bold text-[#0d1831]">{t.tradeName}</p>
                        <p className="text-sm text-[#5f6f87]">{t.document ?? "—"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-3 text-center text-sm text-[#5f6f87]">
                    {responsavel(t.id)}
                  </td>
                  <td className="py-3 pr-3 text-center text-sm text-[#5f6f87]">
                    {contarUsuarios(t.id)}
                  </td>
                  <td className="py-3 pr-3 text-center text-sm text-[#5f6f87]">
                    {formatarData(t.createdAt)}
                  </td>
                  <td className="py-3 pr-3 text-center">
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${statusStyles[t.status]}`}>
                      {statusLabel[t.status]}
                    </span>
                  </td>
                  <td className="py-3 pr-3">
                    <div className="flex items-center justify-center gap-3">
                      {t.status === "SUSPENDED" ? (
                        <button
                          type="button"
                          onClick={() => setConfirmando(t)}
                          className="rounded-[8px] border border-[#e6e4df] px-3 py-1 text-sm text-[#0d1831] transition hover:bg-[#f7f6f2]"
                        >
                          Ativar
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmando(t)}
                          className="rounded-[8px] bg-[#c84a4a] px-3 py-1 text-sm font-medium text-white transition hover:bg-[#b13f3f]"
                        >
                          Suspender
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && visiveis.length === 0 && (
            <p className="py-6 text-center text-sm text-[#686a73]">Nenhuma barbearia encontrada.</p>
          )}
        </div>
      </div>

      <ConfirmModal
        open={confirmando !== null}
        onClose={() => setConfirmando(null)}
        onConfirm={confirmarMudancaDeStatus}
        tone={confirmando?.status === "SUSPENDED" ? "accent" : "danger"}
        title={
          confirmando?.status === "SUSPENDED"
            ? `Reativar ${confirmando.tradeName}?`
            : `Suspender ${confirmando?.tradeName}?`
        }
        confirmLabel={confirmando?.status === "SUSPENDED" ? "Reativar barbearia" : "Suspender barbearia"}
        description={
          confirmando?.status === "SUSPENDED"
            ? "Os usuários voltam a ter acesso."
            : "Todos os usuários perdem o acesso imediatamente. Nenhum dado é apagado — a barbearia pode ser reativada depois."
        }
      >
        {confirmando && (
          <p className="mt-3 rounded-[8px] bg-[#f7f6f2] px-3 py-2 text-xs text-[#5f6f87]">
            {contarUsuarios(confirmando.id)} usuário(s) · responsável {responsavel(confirmando.id)}
          </p>
        )}
      </ConfirmModal>

      <Toast mensagem={toast.mensagem} tone={toast.tone} onClose={toast.fechar} />
    </div>
  );
}
