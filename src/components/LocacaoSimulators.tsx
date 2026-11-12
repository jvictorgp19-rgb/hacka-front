"use client";

import { rentalFine } from "@/features/simulators/calculations";
import React, { useState } from "react";
import { WifiOff, FileWarning, Scale, Building2, Receipt } from "lucide-react";

interface LocacaoSimulatorsProps {
  regras: {
    contrato_codigo: string;
    nota_tecnica_codigo: string;
    locadora: string;
    local: string;
    objeto: string;
    vigencia_dias: number;
    data_inicio: string;
    data_fim: string;
    data_limite_vistoria: string;
    data_limite_pedido_prorrogacao: string;
    prazo_maximo_total_meses: number;
    valores: {
      aluguel_mensal: number;
      valor_global_5_meses: number;
      limite_aditivo_20_pct: number;
      multa_inexecucao_5_pct_global: number;
      multa_rescisao_ate_90_dias: number;
      multa_rescisao_a_partir_91_dia: number;
      desconto_diario_internet_fora_4h: number;
      multa_atraso_pagamento_pct: number;
      juros_atraso_pagamento_mensal_pct: number;
    };
    cotacoes_mercado_nt2026_018: {
      fornecedor: string;
      mensal: number;
      total_5_meses: number;
      diferenca_menor: number;
    }[];
    rotina_mensal: {
      passo: number;
      prazo: string;
      acao: string;
    }[];
  };
}

export default function LocacaoSimulators({ regras }: LocacaoSimulatorsProps) {
  // 1. Calculadora do Fiscal GOC (Quedas de internet > 4h)
  const [diasSemInternet, setDiasSemInternet] = useState<number>(2);
  const [atrasoPagamentoCulpa, setAtrasoPagamentoCulpa] = useState<
    "em_dia" | "sem_atesto_locadora" | "culpa_acme"
  >("em_dia");

  // 2. Simulador de Multa de Rescisão (até 90º dia vs >= 91º dia) & Aditivo 20%
  const [diaRescisao, setDiaRescisao] = useState<number>(95);
  const [valorAditivoPretendido, setValorAditivoPretendido] = useState<number>(3650);

  // Calculations for Simulator 1
  const descontoUnitario = regras.valores.desconto_diario_internet_fora_4h; // 121.67
  const descontoTotalInternet = Number((diasSemInternet * descontoUnitario).toFixed(2));
  const aluguelLiquidoAtestado = Math.max(
    0,
    Number((regras.valores.aluguel_mensal - descontoTotalInternet).toFixed(2))
  );

  const multaAtrasoAcme =
    atrasoPagamentoCulpa === "culpa_acme"
      ? Number((aluguelLiquidoAtestado * 0.01).toFixed(2))
      : 0;

  // Calculations for Simulator 2
  const isentoMultaRescisao = diaRescisao >= 91;
  const multaRescisaoAplicavel = rentalFine(diaRescisao, Math.round(regras.valores.multa_rescisao_ate_90_dias * 100)) / 100;

  const pctAditivo = Number(
    ((valorAditivoPretendido / regras.valores.valor_global_5_meses) * 100).toFixed(1)
  );
  const aditivoDentroLimite = valorAditivoPretendido <= regras.valores.limite_aditivo_20_pct;

  return (
    <div className="space-y-6">
      {/* Contract Executive Summary Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-[#002D72] to-[#003c96] text-white rounded-2xl p-5 shadow-sm border border-[#002D72]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-[#FFCC00] text-[#002D72] shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-[#FFCC00] text-[#002D72]">
                  {regras.contrato_codigo}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white/15 text-blue-100">
                  Vinculado a: {regras.nota_tecnica_codigo}
                </span>
                <span className="text-xs text-emerald-300 font-semibold">
                  ● Vigência: 30/11/2026 a 29/04/2027 ({regras.vigencia_dias} dias corridos)
                </span>
              </div>
              <h3 className="font-bold text-base sm:text-lg mt-1">
                {regras.locadora} — {regras.local}
              </h3>
              <p className="text-xs text-blue-100 mt-0.5">{regras.objeto}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white/10 px-4 py-2.5 rounded-xl border border-white/15">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-blue-200 font-bold">
                Mensalidade
              </div>
              <div className="text-lg font-black text-[#FFCC00]">
                R$ {regras.valores.aluguel_mensal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div>
              <div className="text-[10px] uppercase tracking-wider text-blue-200 font-bold">
                Global (5 meses)
              </div>
              <div className="text-lg font-black text-white">
                R$ {regras.valores.valor_global_5_meses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top 2 Simulators Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SIMULADOR 1: Calculadora do Fiscal GOC (Desconto Internet > 4h) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="bg-gradient-to-r from-[#002D72] to-[#003c96] text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-[#FFCC00] text-[#002D72]">
                  <WifiOff className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base">
                    1. Calculadora do Fiscal GOC (Glosa de Internet &gt; 4h)
                  </h3>
                  <p className="text-[11px] text-blue-100">
                    Desconto de 1/30 avos (R$ 121,67/dia) no Atesto Técnico (CTR_2026-012)
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#FFCC00] text-[#002D72]">
                GOC Fiscal
              </span>
            </div>

            <div className="p-5 space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Dias no mês com queda de internet &gt; 4 horas:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={30}
                      value={diasSemInternet}
                      onChange={(e) =>
                        setDiasSemInternet(Math.min(30, Math.max(0, parseInt(e.target.value) || 0)))
                      }
                      className="w-16 px-2.5 py-1 text-center font-extrabold text-sm text-[#002D72] bg-blue-50 border border-[#002D72]/30 rounded-lg focus:outline-none"
                    />
                    <span className="text-xs font-semibold text-slate-500">dia(s)</span>
                  </div>
                </div>

                <input
                  type="range"
                  min={0}
                  max={15}
                  value={Math.min(15, diasSemInternet)}
                  onChange={(e) => setDiasSemInternet(parseInt(e.target.value))}
                  className="w-full accent-[#002D72] cursor-pointer h-2 bg-slate-200 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-medium mt-1">
                  <span>0 dias (100% SLA)</span>
                  <span>1 dia (-R$ 121,67)</span>
                  <span>5 dias (-R$ 608,35)</span>
                  <span>10 dias (-R$ 1.216,70)</span>
                  <span>15 dias</span>
                </div>
              </div>

              {/* Financial Breakdown Box */}
              <div className="p-4 rounded-xl bg-slate-50 border-2 border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Valor Mensal Contratado (CTR_2026-012):</span>
                  <span className="font-bold text-slate-900">
                    R$ {regras.valores.aluguel_mensal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-rose-700 font-semibold">
                  <span>
                    (-) Glosa de SLA ({diasSemInternet} dia(s) × R${" "}
                    {descontoUnitario.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}):
                  </span>
                  <span className="font-extrabold">
                    - R$ {descontoTotalInternet.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="pt-2.5 border-t border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#002D72] block">
                      Valor Líquido para Atesto da GOC e Pagamento GFI
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Link exigido: 500 Mbps • Atesto em até 5 dias úteis da NF
                    </span>
                  </div>
                  <div className="text-2xl font-black text-[#002D72]">
                    R$ {aluguelLiquidoAtestado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              {/* Simulador de Atraso de Pagamento (Culpa Locadora vs Culpa ACME) */}
              <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/80 space-y-2">
                <div className="text-xs font-bold text-[#002D72]">
                  Simular Cenário de Pagamento (Dia 8 do mês de uso):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                  <button
                    onClick={() => setAtrasoPagamentoCulpa("em_dia")}
                    className={`p-2 rounded-lg text-[11px] font-bold border transition cursor-pointer ${
                      atrasoPagamentoCulpa === "em_dia"
                        ? "bg-[#002D72] text-white border-[#002D72]"
                        : "bg-white text-slate-700 border-slate-200"
                    }`}
                  >
                    Pago até Dia 8 (Regular)
                  </button>
                  <button
                    onClick={() => setAtrasoPagamentoCulpa("sem_atesto_locadora")}
                    className={`p-2 rounded-lg text-[11px] font-bold border transition cursor-pointer ${
                      atrasoPagamentoCulpa === "sem_atesto_locadora"
                        ? "bg-emerald-700 text-white border-emerald-700"
                        : "bg-white text-slate-700 border-slate-200"
                    }`}
                  >
                    Retido por Falta de Atesto
                  </button>
                  <button
                    onClick={() => setAtrasoPagamentoCulpa("culpa_acme")}
                    className={`p-2 rounded-lg text-[11px] font-bold border transition cursor-pointer ${
                      atrasoPagamentoCulpa === "culpa_acme"
                        ? "bg-rose-600 text-white border-rose-600"
                        : "bg-white text-slate-700 border-slate-200"
                    }`}
                  >
                    Atraso por Culpa ACME
                  </button>
                </div>
                <div className="text-[11px] text-slate-700 pt-1">
                  {atrasoPagamentoCulpa === "em_dia" && (
                    <span>
                      ✅ <strong>Fluxo regular:</strong> Sem encargos. GFI transfere R${" "}
                      {aluguelLiquidoAtestado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} até o dia 8.
                    </span>
                  )}
                  {atrasoPagamentoCulpa === "sem_atesto_locadora" && (
                    <span className="text-emerald-900 font-semibold">
                      🛡️ <strong>Proteção Contratual (CTR_2026-012):</strong> Sem atesto não há pagamento e{" "}
                      <strong>NÃO incide multa nem juros</strong> contra a ACME quando a pendência é da Locadora!
                    </span>
                  )}
                  {atrasoPagamentoCulpa === "culpa_acme" && (
                    <span className="text-rose-800 font-semibold">
                      ⚠️ <strong>Encargos por culpa exclusiva da ACME:</strong> Multa de{" "}
                      {regras.valores.multa_atraso_pagamento_pct}% (R${" "}
                      {multaAtrasoAcme.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}) + juros de{" "}
                      {regras.valores.juros_atraso_pagamento_mensal_pct}% a.m. pro rata.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
            <span>
              <strong>Vistoria Obrigatória GOC:</strong> Até 25/11/2026 (5 dias antes do início)
            </span>
            <span className="font-semibold text-[#002D72]">CTR_2026-012 v1.0.0</span>
          </div>
        </div>

        {/* SIMULADOR 2: Multa de Rescisão (90º vs 91º dia) & Aditivo de 20% */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="bg-gradient-to-r from-[#002D72] to-[#003c96] text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-[#FFCC00] text-[#002D72]">
                  <FileWarning className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base">
                    2. Simulador de Rescisão (90º vs 91º dia) & Aditivo 20%
                  </h3>
                  <p className="text-[11px] text-blue-100">
                    Gestão contratual GCO e análise jurídica GJU (CTR_2026-012)
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/15 border border-white/20">
                GCO / GJU
              </span>
            </div>

            <div className="p-5 space-y-5">
              {/* Rescisão Simulator */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Dia de Vigência da Rescisão Antecipada (1 a 150 dias):
                  </label>
                  <span className="px-2.5 py-1 rounded-lg bg-[#002D72] text-[#FFCC00] font-extrabold text-xs">
                    {diaRescisao}º dia
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={150}
                  value={diaRescisao}
                  onChange={(e) => setDiaRescisao(parseInt(e.target.value))}
                  className="w-full accent-[#002D72] cursor-pointer h-2 bg-slate-200 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-medium mt-1">
                  <span>1º dia (30/11/26)</span>
                  <span>90º dia (Com multa)</span>
                  <span>91º dia (Isento!)</span>
                  <span>150º dia (29/04/27)</span>
                </div>

                <div className="flex gap-2 mt-2.5">
                  <button
                    onClick={() => setDiaRescisao(60)}
                    className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                  >
                    Testar 60º dia (Até 90º dia)
                  </button>
                  <button
                    onClick={() => setDiaRescisao(90)}
                    className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                  >
                    Testar 90º dia (Limite multa)
                  </button>
                  <button
                    onClick={() => setDiaRescisao(91)}
                    className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 cursor-pointer"
                  >
                    Testar 91º dia (Isenção R$ 0,00)
                  </button>
                </div>

                <div
                  className={`mt-3 p-3.5 rounded-xl border-2 transition flex items-center justify-between ${
                    isentoMultaRescisao
                      ? "bg-emerald-50/80 border-emerald-500/40"
                      : "bg-amber-50 border-amber-500/50"
                  }`}
                >
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                      Multa de Rescisão no {diaRescisao}º dia (Exige aviso prévio de 30 dias)
                    </span>
                    <div className="text-xl font-black text-slate-900 mt-0.5">
                      R$ {multaRescisaoAplicavel.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      {isentoMultaRescisao
                        ? "Isento de multa! A partir do 91º dia de vigência não há penalidade rescisória."
                        : "Até o 90º dia incide multa fixa de 1 mensalidade (R$ 3.650,00)."}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold shrink-0 ${
                      isentoMultaRescisao
                        ? "bg-emerald-600 text-white"
                        : "bg-amber-500 text-slate-950"
                    }`}
                  >
                    {isentoMultaRescisao ? "Isento (≥ 91º dia)" : "1 Aluguel (≤ 90º dia)"}
                  </span>
                </div>
              </div>

              {/* Aditivo de 20% & Prorrogação 30/03/2027 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#002D72] uppercase tracking-wider">
                    Simulador de Termo Aditivo (Teto Legal de 20%):
                  </span>
                  <span className="text-[11px] font-bold text-slate-600">
                    Teto: R$ {regras.valores.limite_aditivo_20_pct.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={500}
                    max={6000}
                    step={250}
                    value={valorAditivoPretendido}
                    onChange={(e) => setValorAditivoPretendido(parseFloat(e.target.value))}
                    className="w-full accent-[#002D72] cursor-pointer"
                  />
                  <span className="text-xs font-extrabold px-2.5 py-1 rounded bg-white border border-slate-300 text-slate-800 shrink-0">
                    R$ {valorAditivoPretendido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} ({pctAditivo}%)
                  </span>
                </div>

                <div
                  className={`p-2.5 rounded-lg text-xs font-semibold flex items-center justify-between ${
                    aditivoDentroLimite
                      ? "bg-emerald-100 text-emerald-900"
                      : "bg-rose-100 text-rose-900"
                  }`}
                >
                  <span>
                    {aditivoDentroLimite
                      ? `✅ Aditivo de ${pctAditivo}% permitido (respeita o limite de 20% = R$ 3.650,00 com parecer da GJU).`
                      : `🚫 Bloqueado! ${pctAditivo}% ultrapassa o limite de 20% (R$ 3.650,00) do valor global.`}
                  </span>
                </div>

                <div className="text-[11px] text-slate-600 flex items-center justify-between pt-1 border-t border-slate-200">
                  <span>
                    📅 <strong>Prazo limite para pedir prorrogação:</strong> até{" "}
                    <strong className="text-[#002D72]">30/03/2027</strong> (30d antes do fim)
                  </span>
                  <span>Máx. {regras.prazo_maximo_total_meses} meses</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-amber-50/90 px-5 py-3 border-t border-amber-200 text-[11px] text-amber-950 flex items-center justify-between">
            <span>
              <strong>Multa por inexecução total:</strong> 5% do valor global ={" "}
              <strong>R$ {regras.valores.multa_inexecucao_5_pct_global.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
            </span>
            <span>LGPD: incidente em 48h / exclusão em 90d</span>
          </div>
        </div>
      </div>

      {/* SIMULADOR 3: Comparativo das 3 Cotações (NT_2026-018) e Rotina Mensal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Comparativo das 3 Cotações da NT_2026-018 */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-[#002D72] text-white px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-[#FFCC00] text-[#002D72]">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base">
                  3. Comparativo Oficial das 3 Cotações de Mercado (NT_2026-018)
                </h3>
                <p className="text-xs text-blue-100">
                  Justificativa de preço, economia obtida e enquadramento na alçada da DIRAF (&gt; R$ 18k)
                </p>
              </div>
            </div>
            <span className="text-xs font-extrabold px-2.5 py-1 rounded bg-[#FFCC00] text-[#002D72]">
              NT_2026-018
            </span>
          </div>

          <div className="p-5 space-y-3">
            {regras.cotacoes_mercado_nt2026_018.map((cot, idx) => {
              const isVencedor = idx === 0;
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border-2 transition flex flex-wrap items-center justify-between gap-3 ${
                    isVencedor
                      ? "bg-emerald-50/70 border-emerald-500 shadow-sm"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg font-extrabold text-sm flex items-center justify-center ${
                        isVencedor
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {idx + 1}º
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        {cot.fornecedor}
                        {isVencedor && (
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                            Menor Preço • Contratado
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5">
                        Mensal:{" "}
                        <strong>
                          R$ {cot.mensal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </strong>{" "}
                        • Global 5 meses:{" "}
                        <strong>
                          R$ {cot.total_5_meses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    {isVencedor ? (
                      <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg">
                        Economia de até R$ 2.750,00
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg">
                        + R$ {cot.diferenca_menor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} vs vencedor
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rotina Mensal (Dia 25 NF -> 5 dias úteis Atesto GOC -> Dia 8 Pagamento GFI) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="bg-gradient-to-r from-[#002D72] to-slate-900 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-[#FFCC00] text-[#002D72]">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">
                    Rito Mensal de Faturamento e Atesto
                  </h3>
                  <p className="text-xs text-blue-100">
                    Governança entre Locadora, GCO, GOC e GFI
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-3">
              {regras.rotina_mensal.map((item) => (
                <div
                  key={item.passo}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3"
                >
                  <span className="w-6 h-6 rounded-full bg-[#002D72] text-[#FFCC00] font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {item.passo}
                  </span>
                  <div>
                    <span className="text-xs font-extrabold text-[#002D72] bg-blue-100/80 px-2 py-0.5 rounded">
                      {item.prazo}
                    </span>
                    <p className="text-xs text-slate-700 font-medium mt-1 leading-relaxed">
                      {item.acao}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
            <span>
              <strong>Manutenções pela Locadora:</strong> Aviso prévio mínimo de 10 dias
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
