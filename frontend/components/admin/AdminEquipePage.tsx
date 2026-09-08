"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Toast, useToast } from "@/components/ui/Toast";
import { NovoBarbeiroModal, type NovoBarbeiroPayload } from "./modals/CadastroModals";
import { apiFetch, ApiError } from "@/lib/api";

type BarberResponse = {
  id: string;
  userId: string;
  unitId: string;
  displayName: string;
  bio: string | null;
  defaultCommissionPercent: number;
  status: "ACTIVE" | "INACTIVE" | "VACATION" | "BLOCKED";
  createdAt: string;
  updatedAt: string;
};

type UserSummaryResponse = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
};

const statusLabel: Record<BarberResponse["status"], string> = {
  ACTIVE: "Ativo",
  INACTIVE: "Inativo",
  VACATION: "Férias",
  BLOCKED: "Bloqueado",
};

const avatarPalette = [
  { bg: "bg-[#e8f7f1]", text: "text-[#27865b]" },
  { bg: "bg-accent-subtle", text: "text-accent-strong" },
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

export function AdminEquipePage() {
  const [barbers, setBarbers] = useState<BarberResponse[]>([]);
  const [usersById, setUsersById] = useState<Record<string, UserSummaryResponse>>({});
  const [unitId, setUnitId] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [novoAberto, setNovoAberto] = useState(false);
  const toast = useToast();

  async function carregar() {
    try {
      const unidade = await apiFetch<{ id: string }>("/unit");
      setUnitId(unidade.id);

      const [listaBarbeiros, listaUsuarios] = await Promise.all([
        apiFetch<BarberResponse[]>(`/barbers?unitId=${unidade.id}`),
        apiFetch<UserSummaryResponse[]>("/users"),
      ]);

      setBarbers(listaBarbeiros);
      setUsersById(Object.fromEntries(listaUsuarios.map((u) => [u.id, u])));
      setError(undefined);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível carregar a equipe.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function criarBarbeiro(payload: NovoBarbeiroPayload) {
    if (!unitId) {
      throw new ApiError(0, "Unidade ainda não carregou — tente novamente em instantes.");
    }

    const usuario = await apiFetch<{ id: string }>("/users", {
      method: "POST",
      body: {
        name: payload.name,
        email: payload.email,
        password: payload.password,
        role: "BARBER",
      },
    });

    await apiFetch("/barbers", {
      method: "POST",
      body: {
        userId: usuario.id,
        unitId,
        displayName: payload.name,
        bio: "",
        defaultCommissionPercent: Number(payload.commission) || 0,
      },
    });

    await carregar();
  }

  const metrics = [
    { label: "Total de profissionais", value: loading ? "…" : String(barbers.length) },
    // Faturamento/avaliação/atendimentos dependem de Scheduling e
    // Commissions, que ainda não existem — sem dado real pra mostrar.
    { label: "Faturamento médio", value: "—" },
    { label: "Avaliação média", value: "—" },
    { label: "Atendimentos", value: "—" },
  ];

  return (
    <div className="flex w-full flex-col items-start">
      <div className="flex w-full items-center justify-between">
        <div>
          <h1 className="font-['Manrope',sans-serif] text-2xl font-bold tracking-[-0.48px] text-[#0d1831]">
            Equipe
          </h1>
          <p className="pt-0.5 text-sm text-[#686a73]">
            {loading ? "Carregando…" : `${barbers.length} profissionais cadastrados`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setNovoAberto(true)}
          className="flex h-10 items-center justify-center gap-2 rounded-[10px] bg-accent px-4 text-sm font-medium text-on-accent transition hover:bg-accent-hover"
        >
          <Plus size={16} strokeWidth={2} />
          Adicionar barbeiro
        </button>
      </div>

      {error && (
        <p className="mt-4 w-full rounded-[10px] bg-[#fdecee] px-3 py-2 text-sm text-[#e0333f]">
          {error}
        </p>
      )}

      <div className="grid w-full grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-[12px] border border-[#e6e4df] bg-white p-5">
            <p className="text-sm text-[#686a73]">{metric.label}</p>
            <p className="pt-1 font-['Manrope',sans-serif] text-2xl font-bold text-[#0d1831]">{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-6">
        {barbers.map((barbeiro) => {
          const usuario = usersById[barbeiro.userId];
          const avatar = avatarFor(barbeiro.id);
          return (
            <div key={barbeiro.id} className="rounded-[12px] border border-[#e6e4df] bg-white p-5">
              <div className="flex items-start gap-4">
                <span
                  className={`grid size-12 shrink-0 place-items-center rounded-full ${avatar.bg} text-base font-semibold ${avatar.text}`}
                >
                  {initialsFor(barbeiro.displayName)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="truncate text-base font-semibold text-[#0d1831]">
                      {barbeiro.displayName}
                    </p>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                        barbeiro.status === "ACTIVE"
                          ? "bg-[#e8f7f1] text-[#27865b]"
                          : "bg-[#f0efea] text-[#686a73]"
                      }`}
                    >
                      {statusLabel[barbeiro.status]}
                    </span>
                  </div>
                  <p className="truncate pt-1 text-sm text-[#686a73]">{usuario?.email ?? "—"}</p>
                  {/* Avaliação/atendimentos dependem de Scheduling — sem dado ainda */}
                </div>
              </div>

              {/* Especialidades dependem do vínculo barbeiro↔serviço
                  (PUT /barbers/{id}/services), ainda não construído. */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-[#e6e4df] pt-4 mt-4">
                <div>
                  <p className="text-xs text-[#686a73]">Faturamento</p>
                  <p className="font-['Manrope',sans-serif] text-base font-bold text-[#0d1831]">—</p>
                </div>
                <div>
                  <p className="text-xs text-[#686a73]">Comissão</p>
                  <p className="font-['Manrope',sans-serif] text-base font-bold text-[#27865b]">
                    {barbeiro.defaultCommissionPercent}%
                  </p>
                </div>
              </div>

              {/* Jornada semanal (work-schedules) ainda não existe no backend */}
            </div>
          );
        })}
        {!loading && barbers.length === 0 && (
          <p className="col-span-full py-6 text-center text-sm text-[#686a73]">
            Nenhum profissional cadastrado.
          </p>
        )}
      </div>

      <NovoBarbeiroModal
        open={novoAberto}
        onClose={() => setNovoAberto(false)}
        onConcluir={toast.mostrar}
        onCriar={criarBarbeiro}
      />
      <Toast mensagem={toast.mensagem} tone={toast.tone} onClose={toast.fechar} />
    </div>
  );
}
