'use client';

import { approvalIndex, gamification } from '@/features/simulators/calculations';
import React, { useState } from 'react';
import { Trophy, PieChart, ShieldAlert, CheckCircle2, Award, Coins, Lock } from 'lucide-react';

interface InovacaoSimulatorsProps {
  regras: {
    orcamento_total_2027: number;
    composicao_orcamento_2027: {
      item: string;
      valor: number;
      participacao_pct: number;
    }[];
    arenas: string[];
    elegibilidade_2027: {
      tempo_minimo_casa_meses: number;
      data_referencia_tempo_casa: string;
      limite_ideias_por_pessoa: number;
      tamanho_max_equipe: number;
      regra_contagem_equipe: string;
      impedidos: string;
    };
    gamificacao_pontos: {
      evento: string;
      pontos: number;
    }[];
    calendario_fases_2027: {
      fase: number;
      nome: string;
      periodo: string;
      responsavel: string;
    }[];
    etapas_funil_px1130: {
      etapa: string;
      prazo: string;
    }[];
    ciclo_incentivo_fiscal: {
      data_fixa: string;
      acao: string;
    }[];
  };
  alcadasNg012: {
    faixa: string;
    aprovador_geral: string;
    aprovador_inovacao_prototipo: string;
  }[];
}

export default function InovacaoSimulators({ regras, alcadasNg012 }: InovacaoSimulatorsProps) {
  // 1. Simulador de Alçada de Prototipagem
  const [custoPrototipo, setCustoPrototipo] = useState<number>(15000);
  const [mesesCasa, setMesesCasa] = useState<number>(8);
  const [qtdIdeiasInscritas, setQtdIdeiasInscritas] = useState<number>(2);

  // 2. Simulador de Pontos de Gamificação (até 800 pts) e Prêmios Cumulativos
  const [ideiaElegivel, setIdeiaElegivel] = useState<boolean>(true);
  const [votosEmitidos, setVotosEmitidos] = useState<number>(5); // 10 pts each, max 50
  const [imersaoCompleta, setImersaoCompleta] = useState<boolean>(true);
  const [prototipoNoPrazo, setPrototipoNoPrazo] = useState<boolean>(true);
  const [bancaFinal, setBancaFinal] = useState<boolean>(true);

  const [colocacaoGeral, setColocacaoGeral] = useState<'nenhum' | '1' | '2' | '3'>('1');
  const [destaqueArena, setDestaqueArena] = useState<boolean>(true);
  const [arenaSelecionada, setArenaSelecionada] = useState<string>(regras.arenas[0]);

  // Compute Alçada
  const faixaIndex = approvalIndex(Math.round(custoPrototipo * 100));
  const faixaAlcada = alcadasNg012[faixaIndex];
  const corAlcada = ['emerald', 'amber', 'rose'][faixaIndex];

  // Compute Gamificação Points
  const ptsVotos = Math.min(5, Math.max(0, votosEmitidos)) * 10;
  const totalPontos = gamification(
    ideiaElegivel,
    votosEmitidos,
    imersaoCompleta,
    prototipoNoPrazo,
    bancaFinal,
  );

  // Compute Premiação Cumulativa
  const valorColocacao =
    colocacaoGeral === '1'
      ? 8000
      : colocacaoGeral === '2'
        ? 5000
        : colocacaoGeral === '3'
          ? 3000
          : 0;
  const valorArena = destaqueArena ? 2000 : 0;
  const premioTotal = valorColocacao + valorArena;

  // Elegibilidade check
  const elegivelCasa = mesesCasa >= regras.elegibilidade_2027.tempo_minimo_casa_meses;
  const elegivelLimiteIdeias =
    qtdIdeiasInscritas <= regras.elegibilidade_2027.limite_ideias_por_pessoa;

  return (
    <div className="space-y-6">
      {/* Top 2 Simulators Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SIMULADOR 1: Alçada de Prototipagem & Validador de Elegibilidade 2027 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="bg-gradient-to-r from-[#002D72] to-[#003c96] text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-[#FFCC00] text-[#002D72]">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base">
                    1. Simulador de Alçada de Prototipagem & Elegibilidade
                  </h3>
                  <p className="text-[11px] text-blue-100">
                    Base normativa: NT_2026-021 v1.0.0, NG_012 e RG_1100 v2.0.0
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/15 border border-white/20">
                Série 11
              </span>
            </div>

            <div className="p-5 space-y-5">
              {/* Cost Input & Slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Custo Estimado do Protótipo por Ideia (R$):
                  </label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-500">R$</span>
                    <input
                      type="number"
                      step={1000}
                      min={0}
                      max={250000}
                      value={custoPrototipo}
                      onChange={(e) =>
                        setCustoPrototipo(Math.max(0, parseFloat(e.target.value) || 0))
                      }
                      className="w-28 px-2.5 py-1 text-right font-extrabold text-sm text-[#002D72] bg-blue-50 border border-[#002D72]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002D72]"
                    />
                  </div>
                </div>

                <input
                  type="range"
                  min={1000}
                  max={160000}
                  step={1000}
                  value={Math.min(160000, custoPrototipo)}
                  onChange={(e) => setCustoPrototipo(parseFloat(e.target.value))}
                  className="w-full accent-[#002D72] cursor-pointer h-2 bg-slate-200 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-medium mt-1">
                  <span>R$ 1.000</span>
                  <span>R$ 18.000 (Teto NIN)</span>
                  <span>R$ 120.000 (Teto DIRTEC)</span>
                  <span>R$ 160k+</span>
                </div>

                {/* Quick Preset Buttons */}
                <div className="flex flex-wrap gap-2 mt-3">
                  <button
                    onClick={() => setCustoPrototipo(12000)}
                    className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                  >
                    Simular R$ 12.000 (Gerente NIN)
                  </button>
                  <button
                    onClick={() => setCustoPrototipo(18000.01)}
                    className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                  >
                    Simular R$ 18.000,01 (DIRTEC)
                  </button>
                  <button
                    onClick={() => setCustoPrototipo(135000)}
                    className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                  >
                    Simular R$ 135.000 (Comitê)
                  </button>
                </div>
              </div>

              {/* Dynamic Alçada Result Card */}
              <div
                className={`p-4 rounded-xl border-2 transition ${
                  corAlcada === 'emerald'
                    ? 'bg-emerald-50/70 border-emerald-500/40'
                    : corAlcada === 'amber'
                      ? 'bg-amber-50/80 border-amber-500/50'
                      : 'bg-rose-50 border-rose-500/50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                      Autoridade Aprovadora Exigida (NT_2026-021 / NG_012)
                    </span>
                    <div className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                      {faixaAlcada.aprovador_inovacao_prototipo}
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      Faixa enquadrada: <strong>{faixaAlcada.faixa}</strong> (Alçada geral
                      equivalente: {faixaAlcada.aprovador_geral})
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#002D72] text-[#FFCC00] shrink-0">
                    R$ {custoPrototipo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Mini-Validator of Eligibility 2027 (Pegadinha v1.0.0 vs v2.0.0) */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#002D72] uppercase tracking-wider">
                    Teste Rápido de Elegibilidade (RG_1100 v2.0.0):
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                    Trava contra v1.0.0 revogada
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Tempo de casa em 01/02/2027: <strong>{mesesCasa} meses</strong>
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={24}
                      value={mesesCasa}
                      onChange={(e) => setMesesCasa(parseInt(e.target.value))}
                      className="w-full accent-[#002D72] cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Ideias inscritas (indiv. + equipe):{' '}
                      <strong>{qtdIdeiasInscritas} ideia(s)</strong>
                    </label>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4].map((n) => (
                        <button
                          key={n}
                          onClick={() => setQtdIdeiasInscritas(n)}
                          className={`flex-1 py-1 rounded text-xs font-bold border transition cursor-pointer ${
                            qtdIdeiasInscritas === n
                              ? n <= 2
                                ? 'bg-[#002D72] text-white border-[#002D72]'
                                : 'bg-rose-600 text-white border-rose-600'
                              : 'bg-white text-slate-700 border-slate-200'
                          }`}
                        >
                          {n} {n === 3 ? '(v1.0!)' : ''}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div
                  className={`p-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                    elegivelCasa && elegivelLimiteIdeias
                      ? 'bg-emerald-100 text-emerald-900'
                      : 'bg-rose-100 text-rose-900'
                  }`}
                >
                  {elegivelCasa && elegivelLimiteIdeias ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span>
                        Inscrição Válida! Cumpre ≥ 6 meses de casa e limite de até 2 ideias por
                        pessoa.
                      </span>
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-4 h-4 text-rose-700 shrink-0" />
                      <span>
                        {!elegivelCasa &&
                          'Bloqueado: RG_1100 v2.0.0 exige mínimo de 6 meses de casa em 01/02/2027. '}
                        {!elegivelLimiteIdeias &&
                          'Bloqueado: O limite caiu de 3 (v1.0.0 revogada) para no máximo 2 ideias por pessoa na v2.0.0!'}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
            <span>
              <strong>Impedidos:</strong> {regras.elegibilidade_2027.impedidos}
            </span>
            <span className="font-semibold text-[#002D72]">RG_1100 v2.0.0</span>
          </div>
        </div>

        {/* SIMULADOR 2: Gamificação (até 800 pts) & Prêmios Cumulativos */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="bg-gradient-to-r from-[#002D72] to-[#003c96] text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-[#FFCC00] text-[#002D72]">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base">
                    2. Simulador de Gamificação (800 pts) & Prêmios Cumulativos
                  </h3>
                  <p className="text-[11px] text-blue-100">
                    Pontuação por jornada e premiação cumulativa em folha (RG_1100 v2.0.0)
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#FFCC00] text-[#002D72]">
                {totalPontos} / 800 pts
              </span>
            </div>

            <div className="p-5 space-y-4">
              {/* Gamification Checkboxes */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Etapas Conquistadas na Jornada:</span>
                  <span className="text-[#002D72]">
                    {Math.round((totalPontos / 800) * 100)}% da pontuação máxima
                  </span>
                </div>

                <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-gradient-to-r from-[#002D72] to-[#FFCC00] transition-all duration-300"
                    style={{ width: `${(totalPontos / 800) * 100}%` }}
                  />
                </div>

                <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-blue-50/40 cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={ideiaElegivel}
                      onChange={(e) => setIdeiaElegivel(e.target.checked)}
                      className="accent-[#002D72] w-4 h-4"
                    />
                    <span className="text-xs font-semibold text-slate-800">
                      Ideia elegível inscrita (01/02 a 28/02/2027)
                    </span>
                  </div>
                  <span className="text-xs font-extrabold text-[#002D72] bg-blue-100 px-2 py-0.5 rounded">
                    +100 pts
                  </span>
                </label>

                <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50/70">
                  <div className="text-xs font-semibold text-slate-800">
                    Votos na votação interna (10 pts/voto, máx 5, proibido votar na própria):
                  </div>
                  <div className="flex items-center gap-1.5">
                    {[0, 1, 2, 3, 4, 5].map((v) => (
                      <button
                        key={v}
                        onClick={() => setVotosEmitidos(v)}
                        className={`w-6 h-6 rounded text-xs font-bold cursor-pointer transition ${
                          votosEmitidos === v
                            ? 'bg-[#002D72] text-[#FFCC00]'
                            : 'bg-white border border-slate-300 text-slate-700'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                    <span className="text-xs font-extrabold text-[#002D72] bg-blue-100 px-2 py-0.5 rounded ml-1">
                      +{ptsVotos} pts
                    </span>
                  </div>
                </div>

                <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-blue-50/40 cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={imersaoCompleta}
                      onChange={(e) => setImersaoCompleta(e.target.checked)}
                      className="accent-[#002D72] w-4 h-4"
                    />
                    <span className="text-xs font-semibold text-slate-800">
                      Participação completa na Imersão (05/04 a 09/04/2027)
                    </span>
                  </div>
                  <span className="text-xs font-extrabold text-[#002D72] bg-blue-100 px-2 py-0.5 rounded">
                    +150 pts
                  </span>
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-blue-50/40 cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={prototipoNoPrazo}
                      onChange={(e) => setPrototipoNoPrazo(e.target.checked)}
                      className="accent-[#002D72] w-4 h-4"
                    />
                    <span className="text-xs font-semibold text-slate-800">
                      Protótipo entregue no prazo (até 31/05/2027, TRL mín. 4)
                    </span>
                  </div>
                  <span className="text-xs font-extrabold text-[#002D72] bg-blue-100 px-2 py-0.5 rounded">
                    +300 pts
                  </span>
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-blue-50/40 cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={bancaFinal}
                      onChange={(e) => setBancaFinal(e.target.checked)}
                      className="accent-[#002D72] w-4 h-4"
                    />
                    <span className="text-xs font-semibold text-slate-800">
                      Chegada à Banca Final (15/06/2027 - 5 membros, 1 DIRAF)
                    </span>
                  </div>
                  <span className="text-xs font-extrabold text-[#002D72] bg-blue-100 px-2 py-0.5 rounded">
                    +200 pts
                  </span>
                </label>
              </div>

              {/* Cumulative Cash Prize Simulator */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-[#002D72] to-slate-900 text-white space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#FFCC00] uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-4 h-4" />
                    Simulador de Premiação Cumulativa em Folha
                  </span>
                  <span className="text-[11px] text-blue-200">Pago em até 30 dias (DIRAF)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-blue-200 block mb-1">
                      Colocação Geral (Banca Final):
                    </label>
                    <div className="grid grid-cols-4 gap-1">
                      {[
                        { id: '1', label: '1º (R$ 8k)' },
                        { id: '2', label: '2º (R$ 5k)' },
                        { id: '3', label: '3º (R$ 3k)' },
                        { id: 'nenhum', label: 'Sem pódio' },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => setColocacaoGeral(opt.id as '1' | '2' | '3' | 'nenhum')}
                          className={`py-1.5 px-1 rounded text-[11px] font-bold transition cursor-pointer ${
                            colocacaoGeral === opt.id
                              ? 'bg-[#FFCC00] text-[#002D72]'
                              : 'bg-white/10 text-white hover:bg-white/20'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-blue-200 block mb-1">
                      Destaque da Arena (+R$ 2.000 cumulativo):
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setDestaqueArena(!destaqueArena)}
                        className={`px-3 py-1.5 rounded text-xs font-bold transition cursor-pointer shrink-0 ${
                          destaqueArena ? 'bg-emerald-500 text-slate-950' : 'bg-white/10 text-white'
                        }`}
                      >
                        {destaqueArena ? '✓ Venceu Arena (+R$ 2k)' : 'Não venceu Arena'}
                      </button>
                      <select
                        value={arenaSelecionada}
                        onChange={(e) => setArenaSelecionada(e.target.value)}
                        className="w-full bg-white/15 text-white text-xs rounded px-2 py-1.5 border border-white/20 focus:outline-none"
                      >
                        {regras.arenas.map((ar) => (
                          <option key={ar} value={ar} className="text-slate-900">
                            {ar}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/15 flex items-center justify-between">
                  <div className="text-xs text-blue-100">
                    Prêmio Total Simulado ({arenaSelecionada}):
                  </div>
                  <div className="text-2xl font-black text-[#FFCC00]">
                    R$ {premioTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-amber-50/90 px-5 py-3 border-t border-amber-200 text-[11px] text-amber-950 flex items-center justify-between">
            <span>
              <strong>Pegadinha histórica:</strong> Na v1.0.0 revogada o teto era R$ 5.000 sem
              arenas; na v2.0.0 chega a <strong>R$ 10.000,00</strong>!
            </span>
          </div>
        </div>
      </div>

      {/* DASHBOARD DO ORÇAMENTO DE R$ 96.000,00 E TRAVA DE INCENTIVO FISCAL (31/03) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Orçamento R$ 96.000,00 (NT_2026-021) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-[#002D72] text-white px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-[#FFCC00] text-[#002D72]">
                <PieChart className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base">
                  Dashboard do Orçamento 2027 — R${' '}
                  {regras.orcamento_total_2027.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                  })}
                </h3>
                <p className="text-xs text-blue-100">
                  Composição oficial aprovada pela DIRAF na Nota Técnica NT_2026-021 v1.0.0
                </p>
              </div>
            </div>
            <span className="text-xs font-extrabold px-2.5 py-1 rounded bg-[#FFCC00] text-[#002D72]">
              NT_2026-021
            </span>
          </div>

          <div className="p-5 space-y-4">
            {regras.composicao_orcamento_2027.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">{item.item}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-[#002D72]">
                      R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 w-14 text-right">
                      {item.participacao_pct}%
                    </span>
                  </div>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#002D72] to-blue-500"
                    style={{ width: `${item.participacao_pct}%` }}
                  />
                </div>
              </div>
            ))}

            <div className="pt-3 border-t border-slate-200 grid grid-cols-3 gap-3 text-center">
              <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200/60">
                <div className="text-[10px] font-bold uppercase text-slate-500">Histórico 2026</div>
                <div className="text-sm font-black text-[#002D72]">118 ideias</div>
                <div className="text-[10px] text-slate-600">21 protótipos (17,8%)</div>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200/60">
                <div className="text-[10px] font-bold uppercase text-slate-500">Votação 2027</div>
                <div className="text-sm font-black text-[#002D72]">Top 20 ideias</div>
                <div className="text-[10px] text-slate-600">Máx. 6 por Arena</div>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200/60">
                <div className="text-[10px] font-bold uppercase text-slate-500">
                  Liberação Horas
                </div>
                <div className="text-sm font-black text-[#002D72]">Até 4h / sem</div>
                <div className="text-[10px] text-slate-600">Protótipo (TRL 4) e MVP</div>
              </div>
            </div>
          </div>
        </div>

        {/* Trava de Incentivo Fiscal (31/03) & Calendário Fixo (PX_1130-001) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="bg-gradient-to-r from-amber-500 to-[#FFCC00] text-slate-950 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-[#002D72] text-[#FFCC00]">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">
                    Trava Crítica de Incentivo Fiscal (31/03)
                  </h3>
                  <p className="text-xs text-slate-800 font-medium">
                    Calendário anual obrigatório do PX_1130-001 v1.0.0
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-3">
              {regras.ciclo_incentivo_fiscal.map((marco, i) => {
                const isCritico = marco.data_fixa.includes('31 de março');
                return (
                  <div
                    key={i}
                    className={`p-3.5 rounded-xl border-2 transition ${
                      isCritico
                        ? 'bg-amber-50 border-amber-500 shadow-sm'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-xs font-extrabold px-2 py-0.5 rounded ${
                          isCritico ? 'bg-amber-500 text-slate-950' : 'bg-[#002D72] text-white'
                        }`}
                      >
                        {marco.data_fixa}
                      </span>
                      {isCritico && (
                        <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                          Bloqueio Anual
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-800 font-medium leading-relaxed mt-1">
                      {marco.acao}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-4 bg-slate-900 text-white text-xs">
            <div className="font-bold text-[#FFCC00] mb-1">
              Funil Permanente de 5 Etapas (PX_1130-001 / NG_1130):
            </div>
            <div className="grid grid-cols-5 gap-1.5 text-[10px] text-slate-300">
              {regras.etapas_funil_px1130.map((et, idx) => (
                <div key={idx} className="p-1.5 rounded bg-white/5 border border-white/10">
                  <div className="font-bold text-white truncate">{et.etapa}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
