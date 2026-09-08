"use client";

import { useEffect, useState } from "react";
import { Toast, useToast } from "@/components/ui/Toast";
import { NovoServicoModal, type NovoServicoPayload } from "./modals/CadastroModals";
import { Plus, Clock } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";

type ServiceCategoryResponse = {
  id: string;
  name: string;
  sortOrder: number;
  active: boolean;
  version: number;
};

type ServiceResponse = {
  id: string;
  unitId: string | null;
  categoryId: string | null;
  serviceType: "SERVICE" | "COMBO" | "ADDON";
  name: string;
  description: string | null;
  durationMinutes: number;
  bufferBeforeMinutes: number;
  bufferAfterMinutes: number;
  price: string;
  sortOrder: number;
  active: boolean;
  version: number;
};

const SEM_CATEGORIA = "Sem categoria";

function formatarPreco(price: string) {
  return `R$ ${price.replace(".", ",")}`;
}

export function AdminServicosPage() {
  const [services, setServices] = useState<ServiceResponse[]>([]);
  const [categorias, setCategorias] = useState<ServiceCategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [filter, setFilter] = useState<string>("Todos");
  const [novoAberto, setNovoAberto] = useState(false);
  const toast = useToast();

  async function carregar() {
    try {
      const [listaServicos, listaCategorias] = await Promise.all([
        apiFetch<ServiceResponse[]>("/services"),
        apiFetch<ServiceCategoryResponse[]>("/service-categories"),
      ]);
      setServices(listaServicos);
      setCategorias(listaCategorias);
      setError(undefined);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível carregar os serviços.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function criarServico(payload: NovoServicoPayload) {
    const preco = Number(payload.price);
    await apiFetch("/services", {
      method: "POST",
      body: {
        categoryId: payload.categoryId || null,
        serviceType: payload.serviceType,
        name: payload.name,
        description: payload.description || null,
        durationMinutes: Number(payload.durationMinutes),
        bufferBeforeMinutes: 0,
        bufferAfterMinutes: 0,
        price: Number.isFinite(preco) ? preco.toFixed(2) : "0.00",
        sortOrder: 0,
        active: true,
        version: 0,
      },
    });
    await carregar();
  }

  function categoryName(categoryId: string | null) {
    if (!categoryId) return SEM_CATEGORIA;
    return categorias.find((c) => c.id === categoryId)?.name ?? SEM_CATEGORIA;
  }

  const categoryOptions = [
    "Todos",
    ...Array.from(new Set(categorias.map((c) => c.name))),
    SEM_CATEGORIA,
  ];

  const filtered =
    filter === "Todos" ? services : services.filter((s) => categoryName(s.categoryId) === filter);

  const grouped = filtered.reduce<Record<string, ServiceResponse[]>>((acc, servico) => {
    const nome = categoryName(servico.categoryId);
    (acc[nome] ??= []).push(servico);
    return acc;
  }, {});

  return (
    <div className="flex w-full flex-col items-start">
      <div>
        <h1 className="font-['Manrope',sans-serif] text-2xl font-bold tracking-[-0.48px] text-[#0d1831]">
          Serviços
        </h1>
        <p className="pt-0.5 text-sm text-[#686a73]">
          {loading ? "Carregando…" : `${services.length} serviços cadastrados`}
        </p>
      </div>

      <div className="flex w-full flex-col gap-3 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full items-center gap-3 overflow-x-auto pb-1 sm:w-auto sm:overflow-visible sm:pb-0">
          {categoryOptions.map((category) => {
            const count =
              category === "Todos"
                ? services.length
                : services.filter((s) => categoryName(s.categoryId) === category).length;
            if (category !== "Todos" && count === 0) return null;
            const isActive = filter === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setFilter(category)}
                className={`flex h-[34px] shrink-0 items-center justify-center rounded-full px-3 py-1.5 text-sm font-medium transition ${
                  isActive
                    ? "border border-accent bg-accent text-on-accent"
                    : "border border-[#e6e4df] bg-white text-[#686a73] hover:bg-[#f7f6f2]"
                }`}
              >
                {category} ({count})
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => setNovoAberto(true)}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-[10px] bg-accent px-4 text-sm font-medium text-on-accent transition hover:bg-accent-hover sm:w-auto"
        >
          <Plus size={16} strokeWidth={2} />
          Novo serviço
        </button>
      </div>

      {error && (
        <p className="mt-4 w-full rounded-[10px] bg-[#fdecee] px-3 py-2 text-sm text-[#e0333f]">
          {error}
        </p>
      )}

      <div className="flex w-full flex-col gap-6 pt-5">
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category} className="w-full">
            <h3 className="font-['Manrope',sans-serif] text-sm font-bold uppercase tracking-[-0.28px] text-[#686a73]">
              {category}
            </h3>
            <div className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-3">
              {items.map((servico) => (
                <div key={servico.id} className="rounded-[12px] border border-[#e6e4df] bg-white p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-[#0d1831]">{servico.name}</p>
                      {servico.description && (
                        <p className="pt-1 text-xs text-[#686a73]">{servico.description}</p>
                      )}
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                        servico.active
                          ? "bg-[#e8f7f1] text-[#27865b]"
                          : "bg-[#f0efea] text-[#686a73]"
                      }`}
                    >
                      {servico.active ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                  {/* Comissão e "destaque" não têm fonte de dado no backend
                      ainda (Commissions não existe; não há campo highlight
                      em ServiceOffering) — mostrando só o que é real. */}
                  <div className="flex items-center justify-between pt-3">
                    <div className="flex items-center gap-1">
                      <Clock size={12} className="text-[#686a73]" />
                      <p className="text-xs text-[#686a73]">{servico.durationMinutes}min</p>
                    </div>
                    <p className="text-base font-bold text-[#0d1831]">
                      {formatarPreco(servico.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {!loading && filtered.length === 0 && (
          <p className="w-full py-6 text-center text-sm text-[#686a73]">
            Nenhum serviço cadastrado.
          </p>
        )}
      </div>

      <NovoServicoModal
        open={novoAberto}
        onClose={() => setNovoAberto(false)}
        onConcluir={toast.mostrar}
        categorias={categorias}
        onCriar={criarServico}
      />
      <Toast mensagem={toast.mensagem} tone={toast.tone} onClose={toast.fechar} />
    </div>
  );
}
