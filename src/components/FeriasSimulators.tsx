"use client";

import React, { useState } from "react";
import {
  Calculator,
  Users,
  CalendarClock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  ShieldAlert,
  Banknote,
  FileText,
} from "lucide-react";
import MermaidFlowchart from "./MermaidFlowchart";

interface FeriasSimulatorsProps {
  regras: {
    antecedencia_minima_dias_corridos: number;
    dias_vedados_inicio: string;
    fracionamento: {
      max_periodos: number;
      min_dias_periodo_principal: number;
      min_dias_demais_periodos: number;
    };
    abono_pecuniario: string;
    adiantamento_13: string;
    ressarcimento_cancelamento_servico: {
      teto_reais: number;
      prazo_comprovantes_dias_corridos: number;
      quem_autoriza_a_partir_de_D19: string;
    };
    tabela_faltas_injustificadas: {
      faltas_min: number;
      faltas_max: number;
      dias_ferias: number;
      observacao?: string;
    }[];
    marcos_dn: {
      marco: string;
      etapa: string;
      responsavel: string;
    }[];
    limite_ausencia_simultanea_equipe: {
      regra: string;
      faixas_tabela: {
        equipe: string;
        max_ferias: number;
      }[];
    };
  };
  mermaidCode: string;
}

export default function FeriasSimulators({ regras, mermaidCode }: FeriasSimulatorsProps) {
  // 1. State for Faltas Injustificadas Calculator
  const [faltas, setFaltas] = useState<number>(2);
  const [querAbono, setQuerAbono] = useState<boolean>(false);
  const [quer13, setQuer13] = useState<boolean>(false);

  // 2. State for 30% Team Limit Simulator (default 9 for Carlos's team)
  const [tamanhoEquipe, setTamanhoEquipe] = useState<number>(9);
  const [jaAusentes, setJaAusentes] = useState<number>(1);

  // 3. State for D-n Timeline & Date Simulator (default to Ana's demo date 2027-05-05)
  const [dataGozo, setDataGozo] = useState<string>("2027-05-05");
  const [selectedMarcoIdx, setSelectedMarcoIdx] = useState<number>(0);

  // Compute vacation days from faltas
  const faixaFaltas =
    regras.tabela_faltas_injustificadas.find(
      (f) => faltas >= f.faltas_min && faltas <= f.faltas_max
    ) || regras.tabela_faltas_injustificadas[regras.tabela_faltas_injustificadas.length - 1];

  const diasDireito = faixaFaltas.dias_ferias;
  const diasAbonoMax = Math.min(10, Math.floor(diasDireito / 3));
  const diasGozoEfetivo = querAbono && diasDireito > 0 ? diasDireito - diasAbonoMax : diasDireito;

  // Compute 30% team limit
  const maxSimultaneos =
    tamanhoEquipe <= 0
      ? 0
      : tamanhoEquipe <= 3
      ? 1
      : Math.floor(tamanhoEquipe * 0.3);

  const vagasDisponiveis = Math.max(0, maxSimultaneos - jaAusentes);
  const podeAprovarNovo = jaAusentes + 1 <= maxSimultaneos;

  // Helper to compute exact dates from dataGozo for D-n (with NG_111 item 4.5 weekend/holiday anticipation on D-3)
  const calcDataMarco = (offsetDays: number) => {
    if (!dataGozo) return "";
    const d = new Date(dataGozo + "T12:00:00");
    d.setDate(d.getDate() + offsetDays);
    if (offsetDays === -3) {
      // Anticipate if Sunday (0), Saturday (6), or May 1st Holiday
      while (
        d.getDay() === 0 ||
        d.getDay() === 6 ||
        (d.getDate() === 1 && d.getMonth() === 4)
      ) {
        d.setDate(d.getDate() - 1);
      }
    }
    return d.toLocaleDateString("pt-BR");
  };

  return (
    <div className="space-y-6">
      {/* Top 2 Simulators Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SIMULADOR 1: Faltas Injustificadas -> Dias de Férias */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="bg-gradient-to-r from-[#002D72] to-[#003c96] text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-[#FFCC00] text-[#002D72]">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base">
                    1. Calculadora de Faltas Injustificadas → Dias de Férias
                  </h3>
                  <p className="text-[11px] text-blue-100">
                    Base normativa: TB_1111-001 v1.0.0 e NG_111 v3.0.0
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/15 border border-white/20">
                Série 1
              </span>
            </div>

            <div className="p-5 space-y-5">
              {/* Slider & Number Input */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Faltas injustificadas no período aquisitivo:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={60}
                      value={faltas}
                      onChange={(e) => setFaltas(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-18 px-2.5 py-1 text-center font-extrabold text-sm text-[#002D72] bg-blue-50 border border-[#002D72]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002D72]"
                    />
                    <span className="text-xs font-semibold text-slate-500">faltas</span>
                  </div>
                </div>
                <input
                  type="range"
                  min={0}
                  max={40}
                  value={Math.min(40, faltas)}
                  onChange={(e) => setFaltas(parseInt(e.target.value))}
                  className="w-full accent-[#002D72] cursor-pointer h-2 bg-slate-200 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-medium mt-1">
                  <span>0 (Sem faltas)</span>
                  <span>6</span>
                  <span>15</span>
                  <span>24</span>
                  <span>33+ (Perda)</span>
                </div>
              </div>

              {/* Result Highlight Box */}
              <div
                className={`p-4 rounded-xl border-2 transition ${
                  diasDireito === 30
                    ? "bg-emerald-50/70 border-emerald-500/40"
                    : diasDireito > 0
                    ? "bg-amber-50/80 border-amber-500/50"
                    : "bg-rose-50 border-rose-500/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                      Direito Calculado (TB_1111-001)
                    </span>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">
                      {diasDireito} dias corridos
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      Faixa enquadrada:{" "}
                      <strong>
                        {faixaFaltas.faltas_max >= 999
                          ? `Acima de 32 faltas (${faixaFaltas.observacao})`
                          : `De ${faixaFaltas.faltas_min} a ${faixaFaltas.faltas_max} faltas injustificadas`}
                      </strong>
                    </p>
                  </div>
                  <div className="text-right">
                    {diasDireito === 30 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Integral
                      </span>
                    ) : diasDireito > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500 text-slate-950">
                        <AlertTriangle className="w-3.5 h-3.5" /> Reduzido
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-600 text-white">
                        <XCircle className="w-3.5 h-3.5" /> Perda do Direito
                      </span>
                    )}
                  </div>
                </div>

                {/* Optional Abono & 13th simulation */}
                {diasDireito > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <label className="flex items-start gap-2 p-2 rounded-lg bg-white/80 border border-slate-200 cursor-pointer hover:border-[#002D72]/40">
                      <input
                        type="checkbox"
                        checked={querAbono}
                        onChange={(e) => setQuerAbono(e.target.checked)}
                        className="mt-0.5 accent-[#002D72]"
                      />
                      <div className="text-[11px]">
                        <span className="font-bold text-slate-800 block">
                          Abono Pecuniário (vender 1/3)
                        </span>
                        <span className="text-slate-600">
                          Converte <strong>{diasAbonoMax} dias</strong> em dinheiro; gozo de{" "}
                          <strong>{diasGozoEfetivo} dias</strong> (pedir até 15d antes do fim do aquisitivo).
                        </span>
                      </div>
                    </label>
                    <label className="flex items-start gap-2 p-2 rounded-lg bg-white/80 border border-slate-200 cursor-pointer hover:border-[#002D72]/40">
                      <input
                        type="checkbox"
                        checked={quer13}
                        onChange={(e) => setQuer13(e.target.checked)}
                        className="mt-0.5 accent-[#002D72]"
                      />
                      <div className="text-[11px]">
                        <span className="font-bold text-slate-800 block">
                          Adiantamento da 1ª parcela 13º
                        </span>
                        <span className="text-slate-600">
                          {quer13
                            ? "Exige pedido entre 1º e 31/jan para o 1º período do ano (FM_1111-001 v2.0.0)."
                            : "Opcional no 1º período do ano (solicitar em janeiro)."}
                        </span>
                      </div>
                    </label>
                  </div>
                )}
              </div>

              {/* Official Reference Table */}
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Tabela Oficial Completa (TB_1111-001 v1.0.0):
                </div>
                <div className="grid grid-cols-5 gap-1.5 text-center">
                  {regras.tabela_faltas_injustificadas.map((row, idx) => {
                    const active = faltas >= row.faltas_min && faltas <= row.faltas_max;
                    return (
                      <button
                        key={idx}
                        onClick={() => setFaltas(row.faltas_min)}
                        className={`p-2 rounded-lg border text-xs transition cursor-pointer ${
                          active
                            ? "bg-[#002D72] text-white border-[#002D72] font-bold shadow-sm scale-[1.02]"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <div className="text-[10px] opacity-80">
                          {row.faltas_max >= 999 ? "> 32 faltas" : `${row.faltas_min}-${row.faltas_max} faltas`}
                        </div>
                        <div className="text-sm font-extrabold mt-0.5">{row.dias_ferias}d</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
            <span>
              <strong>Fracionamento:</strong> Até {regras.fracionamento.max_periodos} períodos (1º ≥{" "}
              {regras.fracionamento.min_dias_periodo_principal}d, demais ≥{" "}
              {regras.fracionamento.min_dias_demais_periodos}d)
            </span>
            <span className="font-semibold text-[#002D72]">FM_1111-001 v2.0.0</span>
          </div>
        </div>

        {/* SIMULADOR 2: Limite de 30% da Equipe */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="bg-gradient-to-r from-[#002D72] to-[#003c96] text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-[#FFCC00] text-[#002D72]">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base">
                    2. Simulador de Limite de 30% da Equipe
                  </h3>
                  <p className="text-[11px] text-blue-100">
                    Capacidade máxima de ausência simultânea (TB_1111-001 v1.0.0)
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#FFCC00] text-[#002D72]">
                Teto 30%
              </span>
            </div>

            <div className="p-5 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Tamanho Total da Equipe:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={1}
                      max={30}
                      value={tamanhoEquipe}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setTamanhoEquipe(val);
                        if (jaAusentes > val) setJaAusentes(val);
                      }}
                      className="w-full accent-[#002D72] cursor-pointer"
                    />
                    <span className="px-2.5 py-1 rounded-lg bg-[#002D72] text-white font-extrabold text-xs shrink-0">
                      {tamanhoEquipe} emp.
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Já em Férias no Período:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={0}
                      max={Math.min(12, tamanhoEquipe)}
                      value={jaAusentes}
                      onChange={(e) => setJaAusentes(parseInt(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-extrabold text-xs shrink-0">
                      {jaAusentes} ausente(s)
                    </span>
                  </div>
                </div>
              </div>

              {/* Capacity Status Banner */}
              <div
                className={`p-4 rounded-xl border-2 transition ${
                  podeAprovarNovo
                    ? "bg-emerald-50/70 border-emerald-500/40"
                    : "bg-rose-50 border-rose-500/50"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                      Teto simultâneo p/ {tamanhoEquipe} empregado(s)
                    </span>
                    <div className="text-2xl font-black text-slate-900 mt-0.5">
                      Máx. {maxSimultaneos} em férias ao mesmo tempo
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      Cálculo: 30% de {tamanhoEquipe} = {(tamanhoEquipe * 0.3).toFixed(1)} →{" "}
                      <strong>arredondado para baixo = {maxSimultaneos}</strong> (mínimo de 1 para 1 a 3 emp.)
                    </p>
                  </div>

                  <div className="text-right">
                    {podeAprovarNovo ? (
                      <div className="inline-flex flex-col items-end">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Pode Aprovar +1 Pedido
                        </span>
                        <span className="text-[11px] text-emerald-800 font-semibold mt-1">
                          Restam {vagasDisponiveis} vaga(s) no limite de 30%
                        </span>
                      </div>
                    ) : (
                      <div className="inline-flex flex-col items-end">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-600 text-white">
                          <XCircle className="w-3.5 h-3.5" /> Trava de 30% Atingida!
                        </span>
                        <span className="text-[11px] text-rose-800 font-semibold mt-1">
                          Gestor deve propor nova data (PX_1111-001)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Official Faixas from JSON */}
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Faixas de Referência Oficial (TB_1111-001):
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {regras.limite_ausencia_simultanea_equipe.faixas_tabela.map((faixa, i) => (
                    <div
                      key={i}
                      className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-center"
                    >
                      <div className="text-[10px] text-slate-500 font-medium">{faixa.equipe}</div>
                      <div className="text-xs font-extrabold text-[#002D72] mt-0.5">
                        Máx. {faixa.max_ferias}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-amber-50/90 px-5 py-3 border-t border-amber-200 text-[11px] text-amber-950 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Cancelamento a serviço (a partir de D-19):</strong> Exclusivo do{" "}
              <strong>{regras.ressarcimento_cancelamento_servico.quem_autoriza_a_partir_de_D19}</strong>,
              com ressarcimento até{" "}
              <strong>
                R$ {regras.ressarcimento_cancelamento_servico.teto_reais.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </strong>{" "}
              (comprovantes em {regras.ressarcimento_cancelamento_servico.prazo_comprovantes_dias_corridos} dias).
            </span>
          </div>
        </div>
      </div>

      {/* SIMULADOR 3: Linha do Tempo dos Marcos D-n (D-45 a D-3) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-[#002D72] text-white px-5 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#FFCC00] text-[#002D72]">
              <CalendarClock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">
                3. Linha do Tempo Interativa dos Marcos D-n (D-45 a D+1)
              </h3>
              <p className="text-xs text-blue-100">
                Selecione a data pretendida de início de gozo (Dia D) para calcular os prazos-limite de cada responsável
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/20">
            <label className="text-xs font-semibold text-[#FFCC00]">Data de Início (Dia D):</label>
            <input
              type="date"
              value={dataGozo}
              onChange={(e) => setDataGozo(e.target.value)}
              className="bg-white text-[#002D72] font-bold text-xs px-2.5 py-1 rounded-lg focus:outline-none"
            />
          </div>
        </div>

        <div className="p-5">
          {/* Regra de Dias Vedados Alert */}
          <div className="mb-4 p-3 rounded-xl bg-blue-50/80 border border-blue-200 flex items-start gap-2.5 text-xs text-slate-700">
            <Info className="w-4 h-4 text-[#002D72] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#002D72]">Trava de Dias Vedados (NG_111 v3.0.0):</strong>{" "}
              {regras.dias_vedados_inicio}
            </div>
          </div>

          {/* Interactive Timeline Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-9 gap-2.5">
            {regras.marcos_dn.map((m, idx) => {
              const isSelected = selectedMarcoIdx === idx;
              // Map marco string to approximate day offset for live date preview
              let offset: number | null = null;
              if (m.marco.includes("D-45")) offset = -45;
              else if (m.marco.includes("7 dias")) offset = -38;
              else if (m.marco.includes("3 dias")) offset = -35;
              else if (m.marco.includes("D-35")) offset = -35;
              else if (m.marco.includes("D-30")) offset = -30;
              else if (m.marco.includes("D-20")) offset = -20;
              else if (m.marco.includes("D-19")) offset = -19;
              else if (m.marco.includes("D-3")) offset = -3;
              else if (m.marco.includes("D+1")) offset = 1;

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedMarcoIdx(idx)}
                  className={`p-3 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? "bg-[#002D72] text-white border-[#002D72] shadow-md ring-2 ring-[#FFCC00]"
                      : "bg-slate-50 hover:bg-blue-50/50 text-slate-800 border-slate-200"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span
                        className={`text-[11px] font-extrabold px-2 py-0.5 rounded ${
                          isSelected
                            ? "bg-[#FFCC00] text-[#002D72]"
                            : "bg-[#002D72]/10 text-[#002D72]"
                        }`}
                      >
                        {m.marco}
                      </span>
                    </div>
                    {offset !== null && (
                      <div
                        className={`text-[10px] font-mono font-bold mb-1 ${
                          isSelected ? "text-amber-300" : "text-slate-500"
                        }`}
                      >
                        📅 {calcDataMarco(offset)}
                      </div>
                    )}
                    <p
                      className={`text-[11px] font-medium line-clamp-3 leading-snug ${
                        isSelected ? "text-white" : "text-slate-700"
                      }`}
                    >
                      {m.etapa}
                    </p>
                  </div>
                  <div
                    className={`mt-2 pt-1.5 border-t text-[10px] font-bold ${
                      isSelected
                        ? "border-white/20 text-blue-200"
                        : "border-slate-200 text-slate-500"
                    }`}
                  >
                    👤 {m.responsavel}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Marco Detail Spotlight */}
          {regras.marcos_dn[selectedMarcoIdx] && (
            <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-slate-900 to-[#002D72] text-white flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-[#FFCC00] text-[#002D72] font-extrabold text-xs">
                    Marco Selecionado: {regras.marcos_dn[selectedMarcoIdx].marco}
                  </span>
                  <span className="text-xs text-blue-200 font-semibold">
                    Responsável: {regras.marcos_dn[selectedMarcoIdx].responsavel}
                  </span>
                </div>
                <p className="text-sm font-medium mt-1.5 text-white">
                  {regras.marcos_dn[selectedMarcoIdx].etapa}
                </p>
              </div>
              <div className="text-right text-xs text-amber-300 font-semibold">
                Referência: TB_1111-001 v1.0.0 &bull; PX_1111-001 v1.0.0
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SIMULADOR 4: Fluxograma Visual Interativo Mermaid (FL_1111-001) */}
      <MermaidFlowchart mermaidCode={mermaidCode} />
    </div>
  );
}
