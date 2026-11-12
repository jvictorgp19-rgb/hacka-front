"use client";

import React, { useState } from "react";
import {
  Play,
  CalendarCheck2,
  GitCompare,
  Users,
  Scale,
  Radar,
  HelpCircle,
  Lock,
  Presentation,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
  ShieldCheck,
  FileCheck2,
  Sparkles,
  ArrowRight,
  UserCheck,
  FileSpreadsheet,
} from "lucide-react";

export type DemoStepId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

interface DemoPitchBarProps {
  activeStep: DemoStepId | null;
  onSelectStep: (step: DemoStepId) => void;
  onTriggerChatPrompt?: (prompt: string) => void;
  onSwitchPersona?: (personaId: string) => void;
}

export const DEMO_STEPS: {
  id: DemoStepId;
  shortLabel: string;
  personaId: string;
  tema: "ferias" | "inovacao" | "locacao";
  costType: "deterministic" | "rag_llm";
  costLabel: string;
}[] = [
  {
    id: 1,
    shortLabel: "1. Ana: Férias 05/05/2027",
    personaId: "ana",
    tema: "ferias",
    costType: "deterministic",
    costLabel: "⚡ Custo: R$ 0,00 (Calculadora Determinística)",
  },
  {
    id: 2,
    shortLabel: "2. Ana: Mudança 30 vs 45 dias",
    personaId: "ana",
    tema: "ferias",
    costType: "deterministic",
    costLabel: "⚡ Custo: R$ 0,00 (Diff Estruturado / Cache)",
  },
  {
    id: 3,
    shortLabel: "3. Carlos: Equipe de 9 + Pendências",
    personaId: "carlos",
    tema: "ferias",
    costType: "deterministic",
    costLabel: "⚡ Custo: R$ 0,00 (Calculadora Determinística)",
  },
  {
    id: 4,
    shortLabel: "4. Diretora: Alçada R$ 18.000,01",
    personaId: "diretora_diraf",
    tema: "inovacao",
    costType: "deterministic",
    costLabel: "⚡ Custo: R$ 0,00 (Motor de Alçada NG_012)",
  },
  {
    id: 5,
    shortLabel: "5. Rafael: Radar Contrato CTR_2026-012",
    personaId: "rafael",
    tema: "locacao",
    costType: "deterministic",
    costLabel: "⚡ Custo: R$ 0,00 (Radar Contratual D-n)",
  },
  {
    id: 6,
    shortLabel: "6. Abstenção Honesta: Prêmio Equipe & NG_012",
    personaId: "marina",
    tema: "inovacao",
    costType: "rag_llm",
    costLabel: "🧠 Custo: ~R$ 0,004 (RAG + Guardrail Abstenção)",
  },
  {
    id: 7,
    shortLabel: "7. Governança: Pedido de Acesso & Resposta Curada",
    personaId: "curadora_ggc",
    tema: "ferias",
    costType: "rag_llm",
    costLabel: "🧠 Custo: ~R$ 0,004 (RBAC + Fluxo Data Mesh)",
  },
  {
    id: 8,
    shortLabel: "8. Executivo: Gerar PPT Ideias em Campo 2027",
    personaId: "diretora_diraf",
    tema: "inovacao",
    costType: "rag_llm",
    costLabel: "🧠 Custo: ~R$ 0,004 (Síntese Executiva Auditada)",
  },
];

export default function DemoPitchBar({
  activeStep,
  onSelectStep,
  onTriggerChatPrompt,
  onSwitchPersona,
}: DemoPitchBarProps) {
  // Interactive states for Step 6 (Ask NIN) & Step 7 (RBAC Request -> Curated Response -> Audit Log) & Step 8 (Slide Tab)
  const [ninQuestionSent, setNinQuestionSent] = useState(false);
  const [rbacStage, setRbacStage] = useState<"blocked" | "requested" | "curated_approved">(
    "blocked"
  );
  const [curatedText, setCuratedText] = useState(
    "Orientação Oficial Curada GGC #2026-89: Para cancelamento de férias por necessidade de serviço a partir de D-19 (autorizado pelo Diretor da área), o ressarcimento cobre passagens e hospedagens não reembolsáveis comprovadas em até 15 dias corridos, limitado ao teto de R$ 2.500,00 (NG_111 v3.0.0 item 4.9), pago na folha seguinte pela GFI sem expor dados salariais de terceiros."
  );
  const [activeSlide, setActiveSlide] = useState<number>(1);

  const currentStepMeta = DEMO_STEPS.find((s) => s.id === activeStep);

  return (
    <div className="space-y-4">
      {/* BARRA ROTEIRO DE DEMO AO VIVO - 8 PASSOS */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 border-2 border-[#FFCC00] shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FFCC00] text-[#002D72] text-xs font-black uppercase tracking-wider">
              <Play className="w-3.5 h-3.5 fill-current" />
              Roteiro de Demo ao Vivo — 8 Passos (Zero-Click Pitch)
            </span>
            <span className="text-xs text-slate-300 hidden sm:inline">
              Clique em qualquer passo para demonstrar em 3 minutos sem digitar (muda Persona, Tema e executa a prova ao vivo)
            </span>
          </div>

          {activeStep && (
            <button
              onClick={() => onSelectStep(activeStep)}
              className="text-[11px] font-bold text-[#FFCC00] hover:underline cursor-pointer"
            >
              Passo {activeStep}/8 Ativo
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {DEMO_STEPS.map((step) => {
            const isSelected = activeStep === step.id;
            return (
              <button
                key={step.id}
                onClick={() => onSelectStep(step.id)}
                className={`p-2.5 rounded-xl text-left transition cursor-pointer border flex flex-col justify-between ${
                  isSelected
                    ? "bg-[#FFCC00] text-[#002D72] border-white font-black shadow-md scale-[1.01]"
                    : "bg-slate-800/90 hover:bg-slate-800 text-slate-100 border-slate-700"
                }`}
              >
                <div className="text-xs font-extrabold leading-snug">{step.shortLabel}</div>
                <div
                  className={`text-[10px] mt-1 font-semibold truncate ${
                    isSelected ? "text-[#002D72]/90" : "text-amber-300/90"
                  }`}
                >
                  {step.costLabel}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* SPOTLIGHT EXECUTIVO DO PASSO SELECIONADO */}
      {activeStep && currentStepMeta && (
        <div className="bg-white rounded-2xl border-2 border-[#002D72] shadow-md overflow-hidden">
          {/* Header with Live Cost Router Badge */}
          <div className="bg-gradient-to-r from-[#002D72] via-[#00388c] to-slate-900 text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-1 rounded-lg bg-[#FFCC00] text-[#002D72] font-black text-xs">
                PASSO {activeStep} DE 8
              </span>
              <h3 className="font-extrabold text-sm sm:text-base">{currentStepMeta.shortLabel}</h3>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
                  currentStepMeta.costType === "deterministic"
                    ? "bg-emerald-400/20 text-emerald-200 border-emerald-400/40"
                    : "bg-amber-400/20 text-amber-200 border-amber-400/40"
                }`}
              >
                {currentStepMeta.costLabel}
              </span>
            </div>
          </div>

          <div className="p-5">
            {/* PASSO 1: Ana: Férias 05/05/2027 */}
            {activeStep === 1 && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 bg-blue-50 p-3.5 rounded-xl border border-blue-200">
                  <div>
                    <div className="text-xs font-bold uppercase text-[#002D72]">
                      Simulação Zero-Click — Persona: Ana (Analista / Empregada • RBAC: Interna)
                    </div>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">
                      Início de Gozo Pretendido: <span className="text-[#002D72]">05/05/2027 (Quarta-feira, Dia Útil)</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 text-xs font-extrabold">
                      ✓ NG_111 item 4.5
                    </span>
                    <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 text-xs font-extrabold">
                      ✓ PX_1111-001 Anexo D
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                  {[
                    {
                      marco: "D-45",
                      data: "21/03/2027",
                      titulo: "Solicitar no Portal Raiz",
                      detalhe: "Submeter FM_1111-001 v2.0.0 formalmente",
                      destaque: false,
                    },
                    {
                      marco: "D-35",
                      data: "31/03/2027",
                      titulo: "Aviso de Férias (GGC)",
                      detalhe: "GGC valida faltas na TB_1111-001 e emite aviso",
                      destaque: false,
                    },
                    {
                      marco: "D-30",
                      data: "05/04/2027",
                      titulo: "Assinar Eletronicamente",
                      detalhe: "Até 5 dias úteis e nunca após D-30 (trava de gozo)",
                      destaque: false,
                    },
                    {
                      marco: "D-20",
                      data: "15/04/2027",
                      titulo: "Limite para Alterar",
                      detalhe: "Último dia p/ empregada alterar c/ anuência do gestor",
                      destaque: false,
                    },
                    {
                      marco: "D-3 (Antecipado!)",
                      data: "30/04/2027 (Sexta)",
                      titulo: "Pagamento GFI Antecipado",
                      detalhe:
                        "02/05/2027 é domingo (e 01/05 feriado) -> Antecipa p/ sexta 30/04 (NG_111 4.5)",
                      destaque: true,
                    },
                    {
                      marco: "Dia D",
                      data: "05/05/2027",
                      titulo: "Início do Gozo",
                      detalhe: "Retorno registrado pelo gestor em D+1 útil",
                      destaque: false,
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className={`p-3.5 rounded-xl border-2 flex flex-col justify-between ${
                        item.destaque
                          ? "bg-amber-50 border-amber-500 shadow-sm ring-2 ring-amber-400/30"
                          : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className={`text-[11px] font-black px-2 py-0.5 rounded ${
                              item.destaque
                                ? "bg-amber-500 text-slate-950"
                                : "bg-[#002D72] text-[#FFCC00]"
                            }`}
                          >
                            {item.marco}
                          </span>
                        </div>
                        <div className="text-sm font-black text-slate-900 mt-1.5">{item.data}</div>
                        <div className="text-xs font-bold text-[#002D72] mt-0.5">{item.titulo}</div>
                        <p className="text-[11px] text-slate-600 mt-1 leading-snug">{item.detalhe}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PASSO 2: Ana: Mudança 30 vs 45 dias (Diff NG_111 v2.0.0 vs v3.0.0) */}
            {activeStep === 2 && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-amber-50 border-2 border-amber-400 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <GitCompare className="w-5 h-5 text-amber-800" />
                    <span className="text-xs sm:text-sm font-black text-amber-950">
                      Diff Normativo Anti-Pegadinha: Por que um RAG comum erraria a vigência da NG_111 v2.0.0?
                    </span>
                  </div>
                  <span className="text-xs font-extrabold px-2.5 py-1 rounded bg-rose-600 text-white">
                    Pegadinha de Vigência Bloqueada
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Versão Revogada v2.0.0 */}
                  <div className="p-4 rounded-xl border-2 border-rose-400 bg-rose-50/60 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded bg-rose-700 text-white font-mono font-extrabold text-xs">
                        NG_111 v2.0.0 (REVOGADA)
                      </span>
                      <span className="text-xs font-bold text-rose-800 bg-rose-200 px-2 py-0.5 rounded">
                        Fase: Versão anterior
                      </span>
                    </div>
                    <div className="text-xs text-slate-700 space-y-1.5">
                      <p>
                        <strong>Armadilha no cabeçalho do PDF:</strong> Exibe vigência impressa de{" "}
                        <code className="bg-rose-200 px-1 rounded font-bold text-rose-950">
                          10/12/2025 a 10/06/2027
                        </code>
                        , parecendo estar vigente hoje!
                      </p>
                      <p>
                        <strong>Como o Raiz IQ bloqueia:</strong> Verifica o metadado{" "}
                        <code className="bg-slate-200 px-1 rounded font-bold">fase: &quot;Versão anterior&quot;</code>{" "}
                        e o campo <code className="bg-slate-200 px-1 rounded font-bold">substitui</code> da v3.0.0.
                      </p>
                      <ul className="list-disc pl-4 space-y-1 text-rose-900 font-medium pt-1">
                        <li>Exigia antecedência mínima de apenas <strong>30 dias</strong> (item 2.3).</li>
                        <li>Aprovação simples do gerente (sem escalada em 7 dias corridos).</li>
                        <li>Sem regras de limite de 30% da equipe, abono, 13º ou ressarcimento de R$ 2.500,00.</li>
                      </ul>
                    </div>
                  </div>

                  {/* Versão Vigente v3.0.0 */}
                  <div className="p-4 rounded-xl border-2 border-emerald-500 bg-emerald-50/60 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded bg-emerald-700 text-white font-mono font-extrabold text-xs">
                        NG_111 v3.0.0 (VIGENTE)
                      </span>
                      <span className="text-xs font-bold text-emerald-900 bg-emerald-200 px-2 py-0.5 rounded">
                        Vigente desde 03/08/2026 (até 03/02/2028)
                      </span>
                    </div>
                    <div className="text-xs text-slate-700 space-y-1.5">
                      <p>
                        <strong>Fonte de verdade única:</strong> Substituiu oficialmente a v2.0.0 em{" "}
                        <strong>03/08/2026</strong> (junto com o novo <code className="font-bold">FM_1111-001 v2.0.0</code>).
                      </p>
                      <ul className="list-disc pl-4 space-y-1 text-emerald-950 font-semibold pt-1">
                        <li>Antecedência mínima subiu para <strong>45 dias corridos (D-45)</strong>.</li>
                        <li>Prazos em camadas D-n (D-45, 7d gestor, 3d úteis diretor, D-35, D-30, D-20, D-3).</li>
                        <li>Teto de <strong>30% da equipe</strong> ausente simultaneamente (TB_1111-001).</li>
                        <li>Ressarcimento de até <strong>R$ 2.500,00</strong> por cancelamento a serviço a partir de D-19.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PASSO 3: Carlos: Equipe de 9 + Pendências */}
            {activeStep === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  <div className="lg:col-span-5 p-4 rounded-xl bg-blue-50 border-2 border-[#002D72]/30 flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-black uppercase text-[#002D72]">
                        Cálculo Oficial — Equipe de Carlos (9 Empregados)
                      </span>
                      <div className="text-2xl font-black text-slate-900 mt-1">
                        Máximo de 2 em Férias Simultâneas
                      </div>
                      <p className="text-xs text-slate-700 mt-1.5 leading-relaxed">
                        <strong>Fórmula Normativa (NG_111 item 4.6.3 / TB_1111-001 Tabela 4):</strong>{" "}
                        30% de 9 empregados = <strong>2,7</strong> → arredondado para baixo ={" "}
                        <strong className="text-[#002D72]">2 pessoas</strong>.
                      </p>
                    </div>
                    <div className="mt-3 p-2.5 rounded-lg bg-white border border-blue-200 text-xs flex items-center justify-between">
                      <span className="font-semibold text-slate-700">Faixa na Tabela 4 (TB_1111-001):</span>
                      <span className="font-extrabold text-[#002D72]">7 a 9 empregados = Máx. 2</span>
                    </div>
                  </div>

                  <div className="lg:col-span-7 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-900 uppercase flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-amber-600" />
                        Fila de Pendências do Gestor Carlos (Relógio Regressivo de 7 Dias Corridos)
                      </span>
                      <span className="text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                        Silêncio não aprova!
                      </span>
                    </div>

                    <div className="space-y-2">
                      {[
                        {
                          emp: "Ana (Analista)",
                          periodo: "05/05/2027 a 19/05/2027 (15d)",
                          vagasOcupadas: "1/2 no período",
                          relogio: "Faltam 2 dias corridos (5º dia do pedido)",
                          status: "Apto para aprovar (dentro dos 30%)",
                          cor: "amber",
                        },
                        {
                          emp: "Lucas (Técnico)",
                          periodo: "10/05/2027 a 24/05/2027 (15d)",
                          vagasOcupadas: "2/2 no período",
                          relogio: "Faltam 14 horas (7º dia corrido!)",
                          status: "Escalada iminente ao Diretor (decisão em 3d úteis)",
                          cor: "rose",
                        },
                      ].map((p, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-lg bg-white border border-slate-200 flex flex-wrap items-center justify-between gap-2"
                        >
                          <div>
                            <div className="text-xs font-bold text-slate-900">
                              {p.emp} — <span className="text-[#002D72]">{p.periodo}</span>
                            </div>
                            <div className="text-[11px] text-slate-600">
                              Impacto na lotação: <strong>{p.vagasOcupadas}</strong> • {p.status}
                            </div>
                          </div>
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
                              p.cor === "rose"
                                ? "bg-rose-600 text-white"
                                : "bg-amber-400 text-slate-950"
                            }`}
                          >
                            ⏱️ {p.relogio}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PASSO 4: Diretora: Alçada R$ 18.000,01 */}
            {activeStep === 4 && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs sm:text-sm font-bold text-[#002D72]">
                    Simulação de Fronteira de Alçada (NT_2026-021 item 4.3 e NG_012): Diferença de R$ 0,01 muda a autoridade aprovadora!
                  </div>
                  <span className="px-2.5 py-1 rounded bg-[#002D72] text-[#FFCC00] text-xs font-extrabold">
                    NT_2026-021 item 4.3
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl border-2 border-emerald-500 bg-emerald-50/60">
                    <div className="text-[11px] font-bold uppercase text-emerald-800">
                      Faixa 1 — Até R$ 18.000,00
                    </div>
                    <div className="text-2xl font-black text-slate-900 mt-1">R$ 18.000,00</div>
                    <div className="mt-2 text-xs font-bold text-emerald-900 bg-emerald-200/80 px-2.5 py-1 rounded inline-block">
                      Aprovador: Gerente do NIN
                    </div>
                    <p className="text-[11px] text-slate-600 mt-2">
                      Custo de prototipagem dentro da alçada gerencial do Núcleo de Inovação.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border-2 border-amber-500 bg-amber-50 shadow-sm ring-2 ring-[#FFCC00]">
                    <div className="text-[11px] font-black uppercase text-amber-900">
                      Faixa 2 — De R$ 18.000,01 a R$ 120.000,00
                    </div>
                    <div className="text-2xl font-black text-[#002D72] mt-1">R$ 18.000,01</div>
                    <div className="mt-2 text-xs font-black text-[#002D72] bg-[#FFCC00] px-2.5 py-1 rounded inline-block">
                      Aprovador: Diretor da DIRTEC (ou DIRAF no geral)
                    </div>
                    <p className="text-[11px] text-slate-700 mt-2 font-medium">
                      Apenas +1 centavo desloca a competência para a Diretoria (mesma regra aplicada ao contrato de coworking CTR_2026-012 de R$ 18.250,00).
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border-2 border-slate-300 bg-slate-50">
                    <div className="text-[11px] font-bold uppercase text-slate-500">
                      Faixa 3 — Acima de R$ 120.000,00
                    </div>
                    <div className="text-2xl font-black text-slate-900 mt-1">&gt; R$ 120.000,00</div>
                    <div className="mt-2 text-xs font-bold text-slate-800 bg-slate-200 px-2.5 py-1 rounded inline-block">
                      Aprovador: Comitê de Alçadas
                    </div>
                    <p className="text-[11px] text-slate-600 mt-2">
                      Deliberação colegiada exigida pela NG_012 para projetos de grande porte.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* PASSO 5: Rafael: Radar Contrato CTR_2026-012 */}
            {activeStep === 5 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border-2 border-amber-500 bg-amber-50/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-amber-900 flex items-center gap-1.5">
                        <Radar className="w-4 h-4" />
                        Alerta Proativo de Prorrogação (CTR_2026-012)
                      </span>
                      <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-extrabold text-xs">
                        Prazo: 30/03/2027
                      </span>
                    </div>
                    <p className="text-xs text-slate-800 leading-relaxed">
                      O contrato vigora por <strong>150 dias corridos (30/11/2026 a 29/04/2027)</strong>. Caso a GOC precise manter o espaço em Vale Azul, o pedido formal de prorrogação deve ser enviado à GCO até{" "}
                      <strong>30/03/2027</strong> (30 dias antes do término), respeitando o limite de 24 meses e aditivo máximo de 20% (R$ 3.650,00).
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border-2 border-emerald-500 bg-emerald-50/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-emerald-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        Rescisão em Março/2027 = Multa Zero (R$ 0,00)
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-extrabold text-xs">
                        91º dia = 28/02/2027
                      </span>
                    </div>
                    <p className="text-xs text-slate-800 leading-relaxed">
                      <strong>Prova Matemática das Datas:</strong> Contando 90 dias corridos a partir de{" "}
                      <code className="font-bold">30/11/2026</code> (Nov: 1d + Dez: 31d + Jan: 31d + Fev: 27d), o{" "}
                      <strong>90º dia encerra-se em 27/02/2027</strong> (multa de R$ 3.650,00). A partir do{" "}
                      <strong>91º dia em 28/02/2027</strong> — portanto durante <strong>todo o mês de março de 2027</strong> — a rescisão antecipada tem <strong>multa de R$ 0,00</strong> (basta aviso escrito de 30 dias)!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* PASSO 6: Abstenção Honesta: Prêmio Equipe & NG_012 */}
            {activeStep === 6 && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-amber-50 border-2 border-amber-500 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-amber-800" />
                      <h4 className="font-black text-sm text-amber-950">
                        Guardrail de Abstenção Honesta: O sistema recusa-se a inventar o que não consta no acervo!
                      </h4>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-slate-900 text-[#FFCC00] text-xs font-extrabold">
                      Zero Alucinação • Encaminhamento ao Dono (Data Mesh)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-white border border-amber-300 space-y-1.5">
                      <div className="font-extrabold text-slate-900">
                        1. Como o prêmio em dinheiro é dividido em equipe (até 4 pessoas)?
                      </div>
                      <p className="text-slate-700">
                        <strong className="text-rose-700">Não consta no RG_1100 v2.0.0.</strong> O regulamento fixa os prêmios (R$ 8k/5k/3k + R$ 2k arena) pagos em folha, mas não especifica se o valor é dividido igualmente ou se é por equipe/indivíduo.
                      </p>
                      <div className="text-[11px] font-bold text-[#002D72]">Dono: NIN (Núcleo de Inovação)</div>
                    </div>

                    <div className="p-3 rounded-lg bg-white border border-amber-300 space-y-1.5">
                      <div className="font-extrabold text-slate-900">
                        2. E se um membro da equipe entrar em afastamento (NT_2026-021 item 5.4)?
                      </div>
                      <p className="text-slate-700">
                        A <strong>NT_2026-021 (item 5.4)</strong> aponta explicitamente essa lacuna operacional sobre empregado afastado durante a imersão/banca, exigindo deliberação do <strong>NIN / CIN</strong>.
                      </p>
                      <div className="text-[11px] font-bold text-[#002D72]">Dono: NIN / Comitê CIN</div>
                    </div>

                    <div className="p-3 rounded-lg bg-white border border-amber-300 space-y-1.5">
                      <div className="font-extrabold text-slate-900">
                        3. Onde estão os PDFs integrais da NG_010 e da NG_012?
                      </div>
                      <p className="text-slate-700">
                        Os PDFs físicos da <code className="font-bold">NG_010</code> e <code className="font-bold">NG_012</code> não estão presentes na pasta bruta; o sistema responde apenas com as regras de taxonomia e faixas de alçada consolidadas no catálogo oficial.
                      </p>
                      <div className="text-[11px] font-bold text-[#002D72]">Dono: Governança Corporativa</div>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                    <button
                      onClick={() => setNinQuestionSent(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#002D72] hover:bg-[#003c96] text-[#FFCC00] font-extrabold text-xs transition cursor-pointer shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      [Perguntar ao NIN] — Escalar Lacuna Normativa ao Dono
                    </button>

                    {ninQuestionSent && (
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-300">
                        ✅ Protocolo #NIN-2026-044 aberto! O Núcleo de Inovação receberá a solicitação para emitir Resposta Curada.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* PASSO 7: Governança: Pedido de Acesso & Resposta Curada */}
            {activeStep === 7 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Stage 1: Bloqueio RBAC */}
                  <div
                    className={`p-4 rounded-xl border-2 space-y-2.5 ${
                      rbacStage === "blocked"
                        ? "border-rose-500 bg-rose-50/70"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-rose-800 flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5" /> 1. Bloqueio RBAC (Visão Ana)
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-200 text-rose-900">
                        Nível: Restrita
                      </span>
                    </div>
                    <p className="text-xs text-slate-700">
                      Ana consulta parâmetros internos de auditoria de folha e exceções de ressarcimento D-19.
                    </p>
                    <div className="p-2.5 rounded-lg bg-white border border-rose-200 text-xs font-semibold text-rose-900">
                      🔒 &quot;Parte da resposta requer autorização da <strong>[GGC]</strong>.&quot;
                    </div>
                    <button
                      onClick={() => {
                        setRbacStage("requested");
                        onSwitchPersona?.("curadora_ggc");
                      }}
                      className="w-full py-2 rounded-lg bg-[#002D72] hover:bg-[#003c96] text-[#FFCC00] font-extrabold text-xs transition cursor-pointer"
                    >
                      Solicitar Autorização à [GGC] →
                    </button>
                  </div>

                  {/* Stage 2: Visão Curadora GGC aprovando via Resposta Curada */}
                  <div
                    className={`p-4 rounded-xl border-2 space-y-2.5 ${
                      rbacStage === "requested"
                        ? "border-amber-500 bg-amber-50/80 ring-2 ring-[#FFCC00]"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-[#002D72] flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5" /> 2. Curadora da GGC (Data Mesh)
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-950">
                        Sem abrir o PDF!
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      A Curadora aprova enviando uma <strong>RESPOSTA CURADA</strong> sem expor o documento sigiloso/restrito bruto:
                    </p>
                    <textarea
                      rows={3}
                      value={curatedText}
                      onChange={(e) => setCuratedText(e.target.value)}
                      className="w-full text-[11px] p-2 rounded border border-slate-300 bg-white text-slate-800"
                    />
                    <button
                      onClick={() => setRbacStage("curated_approved")}
                      className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition cursor-pointer"
                    >
                      ✓ Aprovar via RESPOSTA CURADA
                    </button>
                  </div>

                  {/* Stage 3: Trilha de Auditoria */}
                  <div
                    className={`p-4 rounded-xl border-2 space-y-2.5 ${
                      rbacStage === "curated_approved"
                        ? "border-emerald-500 bg-emerald-50/80 shadow-sm"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-emerald-900 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> 3. Trilha de Auditoria Imutável
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">
                        LGPD & RBAC OK
                      </span>
                    </div>
                    {rbacStage === "curated_approved" ? (
                      <div className="space-y-2 text-[11px]">
                        <div className="p-2.5 rounded bg-white border border-emerald-300 text-slate-800">
                          <div className="font-bold text-emerald-800">
                            [LOG #AUD-2026-991] • {new Date().toLocaleTimeString("pt-BR")}
                          </div>
                          <div>
                            <strong>Solicitante:</strong> Ana (RBAC: Interna)
                          </div>
                          <div>
                            <strong>Aprovadora:</strong> Curadora da GGC (Domínio Série 1)
                          </div>
                          <div>
                            <strong>Modalidade:</strong> RESPOSTA CURADA (Documento original mantido fechado)
                          </div>
                        </div>
                        <div className="p-2 rounded bg-emerald-100 text-emerald-950 font-medium">
                          {curatedText}
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500 py-6 text-center">
                        Clique nos passos 1 e 2 ao lado para registrar o evento na Trilha de Auditoria.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* PASSO 8: Executivo: Gerar PPT Ideias em Campo 2027 */}
            {activeStep === 8 && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900 text-white p-3.5 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Presentation className="w-5 h-5 text-[#FFCC00]" />
                    <div>
                      <div className="text-xs font-black text-[#FFCC00] uppercase">
                        Gerador de Apresentação Executiva (PPTX Preview) — Diretora da DIRAF
                      </div>
                      <div className="text-xs text-slate-300">
                        Programa Ideias em Campo 2027 • 100% fundamentado na NT_2026-021 v1.0.0 e RG_1100 v2.0.0
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    {[1, 2, 3].map((num) => (
                      <button
                        key={num}
                        onClick={() => setActiveSlide(num)}
                        className={`px-3 py-1 rounded-lg text-xs font-extrabold cursor-pointer transition ${
                          activeSlide === num
                            ? "bg-[#FFCC00] text-[#002D72]"
                            : "bg-white/10 text-white hover:bg-white/20"
                        }`}
                      >
                        Slide {num}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Slide Canvas */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-[#002D72] via-[#002255] to-slate-950 text-white border-4 border-[#FFCC00] shadow-lg min-h-[240px] flex flex-col justify-between">
                  {activeSlide === 1 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-white/15 pb-3">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-[#FFCC00]">
                            SLIDE 01 / 03 • ORÇAMENTO E CONVERSÃO HISTÓRICA
                          </span>
                          <h4 className="text-lg font-black mt-0.5">
                            Orçamento Oficial 2027: R$ 96.000,00 (4 Arenas Estratégicas)
                          </h4>
                        </div>
                        <span className="px-3 py-1 rounded bg-white/10 text-xs font-bold text-[#FFCC00]">
                          BBTS / ACME
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                        {[
                          { label: "Kits Prototipagem", val: "R$ 36.000", pct: "37,5%" },
                          { label: "Semana Imersão", val: "R$ 30.000", pct: "31,3%" },
                          { label: "Prêmios Colocação", val: "R$ 16.000", pct: "16,7%" },
                          { label: "Prêmios Arenas (4x2k)", val: "R$ 8.000", pct: "8,3%" },
                          { label: "Comunicação", val: "R$ 6.000", pct: "6,3%" },
                        ].map((b, i) => (
                          <div key={i} className="p-3 rounded-xl bg-white/10 border border-white/15">
                            <div className="text-[11px] text-blue-200">{b.label}</div>
                            <div className="text-base font-black text-[#FFCC00] mt-1">{b.val}</div>
                            <div className="text-xs font-bold text-white mt-0.5">{b.pct} do total</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeSlide === 2 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-white/15 pb-3">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-[#FFCC00]">
                            SLIDE 02 / 03 • CRONOGRAMA OFICIAL (7 FASES) & ELEGIBILIDADE
                          </span>
                          <h4 className="text-lg font-black mt-0.5">
                            Jornada 01/02/2027 a 30/06/2027 • Teto de 2 Ideias/Pessoa e 6 Meses de Casa
                          </h4>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-xs">
                        {[
                          { f: "1. Inscrição", d: "01 a 28/02/27" },
                          { f: "2. Triagem NIN", d: "Até 12/03/27" },
                          { f: "3. Votação (Top 20)", d: "15 a 26/03/27" },
                          { f: "4. Imersão", d: "05 a 09/04/27" },
                          { f: "5. Protótipo TRL 4", d: "12/04 a 31/05" },
                          { f: "6. Banca (5 membros)", d: "15/06/2027" },
                          { f: "7. Prêmio em Folha", d: "30/06/2027" },
                        ].map((x, idx) => (
                          <div key={idx} className="p-2.5 rounded-xl bg-white/10 border border-white/15">
                            <div className="font-extrabold text-[#FFCC00]">{x.f}</div>
                            <div className="text-[11px] text-blue-100 mt-1">{x.d}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeSlide === 3 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-white/15 pb-3">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-[#FFCC00]">
                            SLIDE 03 / 03 • ALÇADAS DE PROTOTIPAGEM E TRAVA FISCAL (31/03)
                          </span>
                          <h4 className="text-lg font-black mt-0.5">
                            Governança Financeira (NG_012) e Calendário de Incentivo Fiscal
                          </h4>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-white/10 border border-white/15">
                          <div className="text-[#FFCC00] font-bold">Até R$ 18.000,00</div>
                          <div className="text-sm font-black mt-0.5">Gerente do NIN</div>
                        </div>
                        <div className="p-3 rounded-xl bg-white/15 border-2 border-[#FFCC00]">
                          <div className="text-[#FFCC00] font-bold">R$ 18.000,01 a R$ 120.000,00</div>
                          <div className="text-sm font-black mt-0.5">Diretor da DIRTEC</div>
                        </div>
                        <div className="p-3 rounded-xl bg-white/10 border border-white/15">
                          <div className="text-[#FFCC00] font-bold">Acima de R$ 120.000,00</div>
                          <div className="text-sm font-black mt-0.5">Comitê de Alçadas</div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-3 mt-4 border-t border-white/15 flex flex-wrap items-center justify-between text-[11px] text-blue-200">
                    <span>
                      📌 <strong>Nota de Rodapé Auditada:</strong> Dados extraídos de{" "}
                      <code className="text-[#FFCC00] font-bold">NT_2026-021 v1.0.0</code> (aprovada pela DIRAF em 16/10/2026) e{" "}
                      <code className="text-[#FFCC00] font-bold">RG_1100 v2.0.0</code> (aprovado pela DIRTEC em 20/10/2026).
                    </span>
                    <span className="font-bold text-emerald-300">Zero Alucinação Verificada</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
