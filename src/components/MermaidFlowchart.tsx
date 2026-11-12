"use client";

import React, { useState } from "react";
import { GitCommit, CheckCircle2, AlertCircle, Code2, Play, RotateCcw, UserCheck, ShieldAlert, FileSignature, Banknote, CalendarCheck } from "lucide-react";

interface MermaidFlowchartProps {
  mermaidCode: string;
}

export default function MermaidFlowchart({ mermaidCode }: MermaidFlowchartProps) {
  const [gestorDecision, setGestorDecision] = useState<"aprova" | "recusa" | "silencio">("aprova");
  const [showRawCode, setShowRawCode] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="bg-[#002D72] text-white px-5 py-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#FFCC00] text-[#002D72]">
            <GitCommit className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base">Fluxograma Oficial de Férias (FL_1111-001 v1.0.0)</h3>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-400/30">
                vinculado_a: PX_1111-001
              </span>
            </div>
            <p className="text-xs text-blue-100">
              Simule a decisão do gestor no nó condicional (7 dias corridos) para visualizar o caminho de aprovação ou escalada
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowRawCode(!showRawCode)}
          className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
        >
          <Code2 className="w-3.5 h-3.5 text-[#FFCC00]" />
          {showRawCode ? "Ocultar Código Mermaid" : "Ver Código Mermaid (JSON)"}
        </button>
      </div>

      {showRawCode && (
        <div className="bg-slate-900 text-amber-200 p-4 text-xs font-mono overflow-x-auto border-b border-slate-800">
          <div className="text-slate-400 mb-1 font-sans text-[11px] uppercase tracking-wider">
            Código oficial extraído de FL_1111-001 (mermaid_code):
          </div>
          <pre className=" leading-relaxed">{mermaidCode}</pre>
        </div>
      )}

      {/* Interactive Branch Selector */}
      <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          <Play className="w-3.5 h-3.5 text-[#002D72]" />
          Simular Decisão no Nó <code className="bg-slate-200 px-1.5 py-0.5 rounded text-[#002D72]">E &#123;Gestor decide em até 7 dias?&#125;</code>:
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setGestorDecision("aprova")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
              gestorDecision === "aprova"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-100"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Aprova (Rito Padrão)
          </button>
          <button
            onClick={() => setGestorDecision("silencio")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
              gestorDecision === "silencio"
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-100"
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            Sem decisão em 7 dias (Escalada Diretor)
          </button>
          <button
            onClick={() => setGestorDecision("recusa")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
              gestorDecision === "recusa"
                ? "bg-rose-600 text-white shadow-sm"
                : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-100"
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Recusa ou Nova Data (Retorna a D)
          </button>
        </div>
      </div>

      {/* Visual Flowchart Canvas */}
      <div className="p-6 bg-gradient-to-b from-white to-slate-50/70">
        {/* Top Row: Planning Phase (A -> B -> C) */}
        <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Fase 1: Programação Anual (Outubro a Dezembro)
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center mb-6">
          <div className="p-3.5 rounded-xl border-2 border-[#002D72]/20 bg-blue-50/50 flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-[#002D72] text-[#FFCC00] font-bold text-xs flex items-center justify-center shrink-0">
              A
            </span>
            <div>
              <div className="text-xs font-bold text-[#002D72]">Empregado registra intenção</div>
              <div className="text-[11px] text-slate-600">De 1º a 31 de outubro no Portal Raiz</div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border-2 border-[#002D72]/20 bg-blue-50/50 flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-[#002D72] text-[#FFCC00] font-bold text-xs flex items-center justify-center shrink-0">
              B
            </span>
            <div>
              <div className="text-xs font-bold text-[#002D72]">Gestor consolida a equipe</div>
              <div className="text-[11px] text-slate-600">Até 30/11 (respeitando limite de 30%)</div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border-2 border-[#002D72]/20 bg-blue-50/50 flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-[#002D72] text-[#FFCC00] font-bold text-xs flex items-center justify-center shrink-0">
              C
            </span>
            <div>
              <div className="text-xs font-bold text-[#002D72]">GGC publica calendário</div>
              <div className="text-[11px] text-slate-600">Calendário anual publicado até 15/12</div>
            </div>
          </div>
        </div>

        {/* Middle Section: Request & Conditional Decision (D -> E -> Branches) */}
        <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Fase 2: Solicitação Formal e Alçada de Decisão (Camadas D-n)
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch mb-6">
          {/* Node D */}
          <div
            className={`lg:col-span-4 p-4 rounded-xl border-2 transition flex flex-col justify-between ${
              gestorDecision === "recusa"
                ? "border-rose-500 bg-rose-50/70 ring-2 ring-rose-500/20"
                : "border-[#002D72] bg-[#002D72]/5"
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="w-7 h-7 rounded-lg bg-[#002D72] text-[#FFCC00] font-bold text-xs flex items-center justify-center shrink-0">
                D
              </span>
              <div>
                <div className="text-sm font-bold text-[#002D72]">
                  Empregado solicita no Portal Raiz até D-45
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Anexa formulário eletrônico <strong>FM_1111-001 v2.0.0</strong> (início em dia útil, fora dos 2 dias antes de feriado/DSR).
                </p>
              </div>
            </div>
            {gestorDecision === "recusa" && (
              <div className="mt-3 p-2 rounded-lg bg-rose-100 border border-rose-300 text-rose-900 text-[11px] font-medium flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                Fluxo retornou ao Nó D: Empregado deve submeter nova data pactuada!
              </div>
            )}
          </div>

          {/* Node E (Diamond Decision) */}
          <div className="lg:col-span-4 p-4 rounded-xl border-2 border-[#FFCC00] bg-amber-50/80 flex flex-col justify-between shadow-sm">
            <div className="flex items-start gap-3">
              <span className="w-7 h-7 rounded-lg bg-[#FFCC00] text-[#002D72] font-extrabold text-xs flex items-center justify-center shrink-0">
                E
              </span>
              <div>
                <div className="text-sm font-bold text-slate-900">
                  &#123;Gestor decide em até 7 dias corridos?&#125;
                </div>
                <p className="text-xs text-slate-700 mt-1">
                  O silêncio do gestor <strong>não aprova</strong> automaticamente o pedido (NG_111 v3.0.0).
                </p>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-amber-200/80 flex items-center justify-between text-[11px]">
              <span className="font-semibold text-slate-600">Caminho ativo:</span>
              {gestorDecision === "aprova" && (
                <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  -- Aprova --&gt; Nó F (GGC)
                </span>
              )}
              {gestorDecision === "silencio" && (
                <span className="font-bold text-amber-900 bg-amber-200 px-2 py-0.5 rounded">
                  -- Sem decisão --&gt; Nó G (Diretor)
                </span>
              )}
              {gestorDecision === "recusa" && (
                <span className="font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                  -- Recusa/Nova data --&gt; Retorna a D
                </span>
              )}
            </div>
          </div>

          {/* Node G (Director Escalation) */}
          <div
            className={`lg:col-span-4 p-4 rounded-xl border-2 transition flex flex-col justify-between ${
              gestorDecision === "silencio"
                ? "border-amber-500 bg-amber-100/80 ring-2 ring-amber-400/40 shadow-sm"
                : "border-slate-200 bg-slate-100/60 opacity-60"
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-extrabold text-xs flex items-center justify-center shrink-0">
                G
              </span>
              <div>
                <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  Diretor decide em até 3 dias úteis
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                </div>
                <p className="text-xs text-slate-700 mt-1">
                  Escalada automática quando o gestor imediato não decide em 7 dias corridos. Após aprovação, segue para o <strong>Nó F</strong>.
                </p>
              </div>
            </div>
            <div className="mt-2 text-[11px] font-semibold text-amber-900">
              {gestorDecision === "silencio"
                ? "⚡ Escalada Ativa: Diretor destrava e envia para GGC (F)"
                : "Inativo no rito padrão (acionado apenas por omissão > 7 dias)"}
            </div>
          </div>
        </div>

        {/* Bottom Row: Execution & Gozo (F -> H -> I -> J -> K) */}
        <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Fase 3: Aviso, Assinatura, Pagamento e Gozo (D-35 a D+1)
        </div>
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 transition ${
            gestorDecision === "recusa" ? "opacity-40 pointer-events-none" : "opacity-100"
          }`}
        >
          <div className="p-3.5 rounded-xl border-2 border-emerald-600/30 bg-emerald-50/50 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1.5">
              <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center">
                F
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Até D-35
              </span>
            </div>
            <div className="text-xs font-bold text-slate-900">GGC emite aviso</div>
            <div className="text-[11px] text-slate-600 mt-0.5">
              Valida faltas na TB_1111-001 e disponibiliza aviso no Portal Raiz.
            </div>
          </div>

          <div className="p-3.5 rounded-xl border-2 border-emerald-600/30 bg-emerald-50/50 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1.5">
              <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center">
                H
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                5d úteis / D-30
              </span>
            </div>
            <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
              Empregado assina
              <FileSignature className="w-3.5 h-3.5 text-emerald-700" />
            </div>
            <div className="text-[11px] text-slate-600 mt-0.5">
              Assinatura eletrônica obrigatória (sem ela, as férias não iniciam).
            </div>
          </div>

          <div className="p-3.5 rounded-xl border-2 border-emerald-600/30 bg-emerald-50/50 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1.5">
              <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center">
                I
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Até D-3
              </span>
            </div>
            <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
              GFI paga até D-3
              <Banknote className="w-3.5 h-3.5 text-emerald-700" />
            </div>
            <div className="text-[11px] text-slate-600 mt-0.5">
              Remuneração + 1/3 + abono pecuniário + adiantamento de 13º.
            </div>
          </div>

          <div className="p-3.5 rounded-xl border-2 border-[#002D72]/30 bg-blue-50/60 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1.5">
              <span className="w-6 h-6 rounded-full bg-[#002D72] text-[#FFCC00] font-bold text-xs flex items-center justify-center">
                J
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-[#002D72]">
                Dia D
              </span>
            </div>
            <div className="text-xs font-bold text-[#002D72] flex items-center gap-1">
              Gozo de Férias
              <CalendarCheck className="w-3.5 h-3.5 text-[#002D72]" />
            </div>
            <div className="text-[11px] text-slate-600 mt-0.5">
              Período de descanso (em até 3 frações: mín. 14d principal e 5d demais).
            </div>
          </div>

          <div className="p-3.5 rounded-xl border-2 border-slate-300 bg-slate-100/80 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1.5">
              <span className="w-6 h-6 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center">
                K
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                D+1 útil
              </span>
            </div>
            <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
              Registro de retorno
              <UserCheck className="w-3.5 h-3.5 text-slate-700" />
            </div>
            <div className="text-[11px] text-slate-600 mt-0.5">
              Gestor imediato registra o retorno no Portal Raiz no 1º dia útil.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
