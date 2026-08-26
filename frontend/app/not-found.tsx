"use client";

import Link from "next/link";
import { ArrowRight, ArrowLeft, LayoutDashboard, Calendar, Users2, Zap } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col bg-white text-[#0d1831]">
      <SiteHeader />

      <div className="mx-auto flex w-full max-w-[1216px] flex-1 flex-col items-center gap-14 px-5 py-16 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:py-24">
        <div className="flex max-w-[440px] flex-col items-start gap-5 text-center lg:text-left">
          <p className="text-lg font-semibold text-[#2259e2]">Erro 404</p>
          <h1 className="text-[44px] font-bold leading-[1.05] text-[#0f172a] sm:text-[56px]">
            Essa página saiu da <span className="text-[#3448c5]">agenda.</span>
          </h1>
          <p className="text-lg text-[#526176]">
            O endereço que você tentou acessar não existe, foi movido ou está temporariamente indisponível.
          </p>
          <div className="flex w-full flex-col items-center gap-3 pt-2 sm:flex-row sm:justify-center lg:justify-start">
            <Link
              href="/"
              className="group inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#3448c5] px-6 text-[15px] font-bold text-white transition hover:bg-[#2c3ba8] sm:w-auto"
            >
              <ArrowRight className="transition-transform duration-150 group-hover:translate-x-0.5" size={16} />
              Voltar ao painel
            </Link>
            <button
              type="button"
              onClick={() => window.history.back()}
              className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl border border-[#d0d5dd] bg-white px-6 text-[15px] font-bold text-[#334155] transition hover:border-[#3448c5] hover:text-[#3448c5] sm:w-auto"
            >
              <ArrowLeft size={16} />
              Página anterior
            </button>
          </div>
        </div>

        <div className="relative w-full max-w-[440px] shrink-0">
          <div className="overflow-hidden rounded-[20px] border border-[#e2e7f0] bg-[#101116] shadow-[0_24px_60px_rgba(15,23,42,0.15)]">
            <div className="flex items-center gap-2 border-b border-white/10 px-5 py-4">
              <LayoutDashboard size={16} className="text-white/70" />
              <span className="text-sm font-semibold text-white/90">Dashboard</span>
            </div>
            <div className="flex flex-col gap-3 p-5">
              <div className="flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2.5">
                <Calendar size={14} className="text-white/40" />
                <div className="h-2 w-24 rounded-full bg-white/15" />
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2.5">
                <Users2 size={14} className="text-white/40" />
                <div className="h-2 w-32 rounded-full bg-white/15" />
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2.5">
                <Zap size={14} className="text-white/40" />
                <div className="h-2 w-20 rounded-full bg-white/15" />
              </div>
            </div>
          </div>

          <div className="absolute -bottom-8 -left-8 flex items-center gap-4 rounded-[16px] border border-[#e2e7f0] bg-white px-6 py-5 shadow-[0_16px_40px_rgba(15,23,42,0.12)]">
            <p className="text-[40px] font-bold leading-none text-[#0f172a]">
              4<span className="text-[#3448c5]">0</span>4
            </p>
            <div className="flex flex-col gap-1.5">
              <div className="h-2 w-16 rounded-full bg-[#e2e7f0]" />
              <div className="h-2 w-10 rounded-full bg-[#e2e7f0]" />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1216px] px-5 sm:px-6">
        <SiteFooter simple />
      </div>
    </main>
  );
}
