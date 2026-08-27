"use client";

import { useState } from "react";
import { Plus, Search, AlertTriangle } from "lucide-react";

type Produto = {
  name: string;
  supplier: string;
  category: string;
  stock: number;
  unit: string;
  min: number;
  cost: string;
  price: string;
  margin: string;
  low: boolean;
  swatch: string;
};

const produtos: Produto[] = [
  {
    name: "Pomada modeladora Premium",
    supplier: "Distribuidor Norte",
    category: "Finalização",
    stock: 8,
    unit: "un",
    min: 5,
    cost: "R$ 5,00",
    price: "R$ 35,00",
    margin: "66%",
    low: false,
    swatch: "bg-[#ede9fd]",
  },
  {
    name: "Óleo para barba",
    supplier: "Distribuidor Norte",
    category: "Barba",
    stock: 3,
    unit: "un",
    min: 5,
    cost: "R$ 8,00",
    price: "R$ 28,00",
    margin: "71%",
    low: true,
    swatch: "bg-[#ede9fd]",
  },
  {
    name: "Shampoo anticaspa profissional",
    supplier: "Beleza Shop",
    category: "Cabelo",
    stock: 12,
    unit: "un",
    min: 4,
    cost: "R$ 15,00",
    price: "R$ 45,00",
    margin: "67%",
    low: false,
    swatch: "bg-[#ede9fd]",
  },
  {
    name: "Cera de acabamento mate",
    supplier: "Distribuidor Norte",
    category: "Finalização",
    stock: 2,
    unit: "un",
    min: 5,
    cost: "R$ 10,00",
    price: "R$ 10,00",
    margin: "67%",
    low: true,
    swatch: "bg-[#ede9fd]",
  },
  {
    name: "Loção pós-barba",
    supplier: "Beleza Shop",
    category: "Barba",
    stock: 6,
    unit: "un",
    min: 3,
    cost: "R$ 9,00",
    price: "R$ 25,00",
    margin: "64%",
    low: false,
    swatch: "bg-[#ede9fd]",
  },
];

const metrics = [
  { label: "Total de produtos", value: String(produtos.length) },
  { label: "Estoque baixo", value: String(produtos.filter((p) => p.low).length) },
  { label: "Valor em estoque", value: "R$ 374,00" },
  { label: "Valor de venda", value: "R$ 1.114,00" },
];

export function AdminEstoquePage() {
  const [search, setSearch] = useState("");
  const lowCount = produtos.filter((p) => p.low).length;

  const filtered = produtos.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex w-full flex-col items-start">
      <div className="flex w-full items-center justify-between">
        <div>
          <h1 className="font-['Manrope',sans-serif] text-2xl font-bold tracking-[-0.48px] text-[#0d1831]">
            Estoque
          </h1>
          <p className="pt-0.5 text-sm text-[#686a73]">Controle de produtos e movimentações</p>
        </div>
        <button
          type="button"
          className="flex h-10 items-center justify-center gap-2 rounded-[10px] bg-[#7247f3] px-4 text-sm font-medium text-white transition hover:bg-[#5c2ee0]"
        >
          <Plus size={16} strokeWidth={2} />
          Novo produto
        </button>
      </div>

      {lowCount > 0 && (
        <div className="mt-6 flex w-full items-center gap-3 rounded-[12px] border border-[rgba(210,139,39,0.2)] bg-[#fdf3e3] p-4">
          <AlertTriangle size={18} className="shrink-0 text-[#d28b27]" />
          <p className="text-sm text-[#d28b27]">
            <span className="font-bold">{lowCount} produto(s)</span> com estoque abaixo do mínimo. Verifique e
            reponha.
          </p>
        </div>
      )}

      <div className="grid w-full grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-[12px] border border-[#e6e4df] bg-white p-5">
            <p className="text-sm text-[#686a73]">{metric.label}</p>
            <p className="pt-1 font-['Manrope',sans-serif] text-2xl font-bold text-[#0d1831]">{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="flex h-9 w-full max-w-[384px] items-center gap-2 rounded-[10px] border border-[#e6e4df] bg-white px-3 mt-6">
        <Search size={15} strokeWidth={1.8} className="text-[#b0afa8]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar produto..."
          className="w-full bg-transparent text-sm text-[#0d1831] placeholder:text-[#b0afa8] focus:outline-none"
        />
      </div>

      <div className="w-full pt-4">
        <div className="w-full overflow-x-auto rounded-[12px] border border-[#e6e4df] bg-white">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#e6e4df] bg-[#f7f6f2] text-xs font-medium text-[#686a73]">
                <th className="sticky left-0 z-10 bg-white px-4 py-3 font-medium">Produto</th>
                <th className="px-4 py-3 font-medium">Categoria</th>
                <th className="px-4 py-3 font-medium">Estoque atual</th>
                <th className="px-4 py-3 font-medium">Mínimo</th>
                <th className="px-4 py-3 font-medium">Custo</th>
                <th className="px-4 py-3 font-medium">Preço</th>
                <th className="px-4 py-3 font-medium">Margem</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((produto) => (
                <tr key={produto.name} className="border-b border-[#e6e4df] last:border-b-0">
                  <td className="sticky left-0 z-10 bg-white px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className={`size-8 shrink-0 rounded-[8px] ${produto.swatch}`} />
                      <div>
                        <p className="text-sm font-medium text-[#0d1831]">{produto.name}</p>
                        <p className="text-xs text-[#686a73]">{produto.supplier}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-[#f0efea] px-2 py-0.5 text-xs font-medium text-[#686a73]">
                      {produto.category}
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-sm font-semibold ${produto.low ? "text-[#c84a4a]" : "text-[#0d1831]"}`}>
                    {produto.stock} {produto.unit}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#686a73]">
                    {produto.min} {produto.unit}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#686a73]">{produto.cost}</td>
                  <td className="px-4 py-3 text-sm font-medium text-[#0d1831]">{produto.price}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-[#e8f7f1] px-2 py-0.5 text-xs font-medium text-[#27865b]">
                      {produto.margin}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        produto.low ? "bg-[#fdeaea] text-[#c84a4a]" : "bg-[#e8f7f1] text-[#27865b]"
                      }`}
                    >
                      {produto.low ? "baixo" : "Ok"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      className="rounded-[10px] border border-[#e6e4df] bg-white px-2.5 py-1.5 text-sm font-medium text-[#0d1831] transition hover:bg-[#f7f6f2]"
                    >
                      Movimentar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
