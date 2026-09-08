"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";

type UserSummaryResponse = {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "BARBER" | "CLIENT";
  status: "ACTIVE" | "INACTIVE" | "BLOCKED" | "PENDING";
  tenantId: string | null;
};

type TenantResponse = {
  id: string;
  tradeName: string;
};

const roleLabel: Record<UserSummaryResponse["role"], string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  BARBER: "Barbeiro",
  CLIENT: "Cliente",
};

const roleStyles: Record<UserSummaryResponse["role"], string> = {
  SUPER_ADMIN: "bg-accent-subtle text-accent-strong",
  ADMIN: "bg-accent-subtle text-accent-strong",
  BARBER: "bg-[#f0efea] text-[#686a73]",
  CLIENT: "bg-[#f0efea] text-[#686a73]",
};

const statusLabel: Record<UserSummaryResponse["status"], string> = {
  ACTIVE: "Ativo",
  INACTIVE: "Inativo",
  BLOCKED: "Bloqueado",
  PENDING: "Pendente",
};

const statusStyles: Record<UserSummaryResponse["status"], string> = {
  ACTIVE: "bg-[#e8f7f1] text-[#27865b]",
  INACTIVE: "bg-[#f0efea] text-[#686a73]",
  BLOCKED: "bg-[#fdeaea] text-[#c84a4a]",
  PENDING: "bg-[#fdf3e3] text-[#d28b27]",
};

export function SuperAdminUsuariosPage() {
  const [users, setUsers] = useState<UserSummaryResponse[]>([]);
  const [tenantsById, setTenantsById] = useState<Record<string, string>>({});
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  async function carregar() {
    try {
      const [listaUsuarios, listaTenants] = await Promise.all([
        apiFetch<UserSummaryResponse[]>("/users"),
        apiFetch<TenantResponse[]>("/tenants"),
      ]);
      setUsers(listaUsuarios);
      setTenantsById(Object.fromEntries(listaTenants.map((t) => [t.id, t.tradeName])));
      setError(undefined);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível carregar os usuários.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  const visiveis = users.filter(
    (u) =>
      busca === "" ||
      u.name.toLowerCase().includes(busca.toLowerCase()) ||
      u.email.toLowerCase().includes(busca.toLowerCase()),
  );

  return (
    <div className="flex w-full flex-col items-start gap-4">
      <div className="flex h-10 w-full max-w-[352px] items-center gap-2 rounded-[10px] border border-[#e6e4df] bg-white px-4">
        <Search size={15} strokeWidth={1.8} className="text-[#98a2b3]" />
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar usuário..."
          className="h-full flex-1 bg-transparent text-xs text-[#0d1831] placeholder:text-[#98a2b3] focus:outline-none"
        />
      </div>

      {error && (
        <p className="w-full rounded-[10px] bg-[#fdecee] px-3 py-2 text-sm text-[#e0333f]">
          {error}
        </p>
      )}

      <div className="w-full rounded-[12px] border border-[#e6e4df] bg-white p-6">
        <p className="text-lg font-bold text-[#0d1831]">
          Usuários globais{!loading && ` (${users.length})`}
        </p>
        <div className="w-full overflow-x-auto">
          <table className="mt-4 w-full min-w-[800px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#e6e4df] text-[10px] font-bold text-[#98a2b3]">
                <th className="sticky left-0 z-10 bg-white pb-2 pr-3 font-bold">USUÁRIO</th>
                <th className="pb-2 pr-3 text-center font-bold">ROLE</th>
                <th className="pb-2 pr-3 text-center font-bold">BARBEARIA</th>
                <th className="pb-2 pr-3 text-center font-bold">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {visiveis.map((u) => (
                <tr key={u.id} className="border-b border-[#eef0f3] last:border-b-0">
                  <td className="sticky left-0 z-10 bg-white py-3 pr-3">
                    <div className="flex items-center gap-3">
                      <span className="grid size-10 place-items-center rounded-[10px] bg-accent-subtle text-xs font-bold text-accent-strong">
                        {u.name
                          .split(" ")
                          .slice(0, 2)
                          .map((w) => w[0])
                          .join("")}
                      </span>
                      <div>
                        <p className="text-sm font-bold text-[#0d1831]">{u.name}</p>
                        <p className="text-sm text-[#5f6f87]">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-3 text-center">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${roleStyles[u.role]}`}>
                      {roleLabel[u.role]}
                    </span>
                  </td>
                  <td className="py-3 pr-3 text-center text-sm text-[#5f6f87]">
                    {u.tenantId ? (tenantsById[u.tenantId] ?? "—") : "—"}
                  </td>
                  <td className="py-3 pr-3 text-center">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${statusStyles[u.status]}`}
                    >
                      {statusLabel[u.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && visiveis.length === 0 && (
            <p className="py-6 text-center text-sm text-[#686a73]">Nenhum usuário encontrado.</p>
          )}
        </div>
      </div>
    </div>
  );
}
