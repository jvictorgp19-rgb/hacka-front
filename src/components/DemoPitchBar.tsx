"use client";

import React, { useState } from "react";
import {
  Play,
  GitCompare,
  Clock,
  Radar,
  CheckCircle2,
  HelpCircle,
  Send,
  Lock,
  UserCheck,
  ShieldCheck,
  Presentation,
  X,
} from "lucide-react";

export type DemoStepId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

interface DemoPitchBarProps {
  activeStep: DemoStepId | null;
  onSelectStep: (step: DemoStepId) => void;
  onSwitchPersona?: (personaId: string) => void;
  isDrawerOpen?: boolean;
  onCloseDrawer?: () => void;
  onDismissBanner?: () => void;
}

export const DEMO_STEPS: {
  id: DemoStepId;
  shortLabel: string;
  targetTabLabel: string;
  personaId: string;
  tema: "ferias" | "inovacao" | "locacao";
  costType: "deterministic" | "rag_llm";
  costLabel: string;
}[] = [
  {
    id: 1,
    shortLabel: "1. Ana: Férias 05/05/2027",
    targetTabLabel: "Abre Aba Simuladores (Férias D-n)",
    personaId: "ana",
    tema: "ferias",
    costType: "deterministic",
    costLabel: "⚡ Custo: R$ 0,00 (Calculadora Determinística)",
  },
  {
    id: 2,
    shortLabel: "2. Ana: Mudança 30 vs 45 dias",
    targetTabLabel: "Abre Aba Normas & Modal Diff v2 vs v3",
    personaId: "ana",
    tema: "ferias",
    costType: "deterministic",
    costLabel: "⚡ Custo: R$ 0,00 (Diff Estruturado / Cache)",
  },
  {
    id: 3,
    shortLabel: "3. Carlos: Equipe de 9 + Pendências",
    targetTabLabel: "Abre Aba Simuladores (Limite 30% + Fila)",
    personaId: "carlos",
    tema: "ferias",
    costType: "deterministic",
    costLabel: "⚡ Custo: R$ 0,00 (Calculadora Determinística)",
  },
  {
    id: 4,
    shortLabel: "4. Diretora: Alçada R$ 18.000,01",
    targetTabLabel: "Abre Aba Simuladores (Inovação Alçadas)",
    personaId: "diretora_diraf",
    tema: "inovacao",
    costType: "deterministic",
    costLabel: "⚡ Custo: R$ 0,00 (Motor de Alçada NG_012)",
  },
  {
    id: 5,
    shortLabel: "5. Rafael: Radar Contrato CTR_2026-012",
    targetTabLabel: "Abre Aba Governança & Radar (Sub-aba Radar)",
    personaId: "rafael",
    tema: "locacao",
    costType: "deterministic",
    costLabel: "⚡ Custo: R$ 0,00 (Radar Contratual D-n)",
  },
  {
    id: 6,
    shortLabel: "6. Abstenção Honesta: Prêmio Equipe & NG_012",
    targetTabLabel: "Abre Aba Início & Co-Piloto (Guardrail NIN)",
    personaId: "marina",
    tema: "inovacao",
    costType: "rag_llm",
    costLabel: "🧠 Custo: ~R$ 0,004 (RAG + Guardrail Abstenção)",
  },
  {
    id: 7,
    shortLabel: "7. Governança: Pedido de Acesso & Resposta Curada",
    targetTabLabel: "Abre Aba Governança (Sub-aba Acesso & Data Mesh)",
    personaId: "curadora_ggc",
    tema: "ferias",
    costType: "rag_llm",
    costLabel: "🧠 Custo: ~R$ 0,004 (RBAC + Fluxo Data Mesh)",
  },
  {
    id: 8,
    shortLabel: "8. Executivo: Gerar PPT Ideias em Campo 2027",
    targetTabLabel: "Abre Aba Governança (Sub-aba FinOps & PPT)",
    personaId: "diretora_diraf",
    tema: "inovacao",
    costType: "rag_llm",
    costLabel: "🧠 Custo: ~R$ 0,004 (Síntese Executiva Auditada)",
  },
];

export default function DemoPitchBar({
  activeStep,
  onSelectStep,
  onSwitchPersona,
  isDrawerOpen = false,
  onCloseDrawer,
  onDismissBanner,
}: DemoPitchBarProps) {
  const [ninQuestionSent, setNinQuestionSent] = useState(false);
  const [rbacStage, setRbacStage] = useState<"blocked" | "requested" | "curated_approved">(
    "blocked"
  );
  const [curatedText, setCuratedText] = useState(
    "Orientação Oficial Curada GGC #2026-89: Para cancelamento de férias a serviço a partir de D-19 (autorizado pelo Diretor), o ressarcimento cobre despesas não reembolsáveis comprovadas em até 15 dias corridos, até R$ 2.500,00 (NG_111 v3.0.0 item 4.9), sem expor dados salariais de terceiros."
  );
  const [activeSlide, setActiveSlide] = useState<number>(1);
  const [showCostFoundation, setShowCostFoundation] = useState<boolean>(false);

  const currentStepMeta = DEMO_STEPS.find((s) => s.id === activeStep);

  return (
    <>
      {/* RETRACTABLE PITCH DRAWER */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-[2px] flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl border-l border-[#E2E8F0] flex flex-col">
            <div className="bg-[#002D72] text-white px-6 py-4 flex items-center justify-between border-b-2 border-[#F8D117]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#F8D117]">
                  Apresentação Guiada • 3 Minutos
                </span>
                <h2 className="font-bold text-base">Roteiro de Demo ao Vivo (8 Passos)</h2>
              </div>
              <button
                onClick={onCloseDrawer}
                className="p-1.5 rounded-lg text-blue-100 hover:text-white hover:bg-white/10 transition cursor-pointer"
                aria-label="Fechar Roteiro Demo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-2.5 bg-[#F8FAFC]">
              <p className="text-xs text-slate-600 mb-3">
                Selecione um passo para alternar automaticamente a Persona, abrir a aba/modal correspondente e exibir a comprovação normativa:
              </p>

              {DEMO_STEPS.map((step) => {
                const isSelected = activeStep === step.id;
                return (
                  <button
                    key={step.id}
                    onClick={() => {
                      onSelectStep(step.id);
                      onCloseDrawer?.();
                    }}
                    className={`w-full p-3.5 rounded-xl text-left transition cursor-pointer border flex items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-[#0038A8] text-white border-[#002D72] shadow-xs"
                        : "bg-white hover:bg-blue-50/40 text-slate-800 border-[#E2E8F0]"
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">{step.shortLabel}</div>
                      <div
                        className={`text-[11px] mt-0.5 ${
                          isSelected ? "text-blue-100" : "text-slate-500"
                        }`}
                      >
                        {step.targetTabLabel}
                      </div>
                    </div>
                    <Play
                      className={`w-4 h-4 shrink-0 ${
                        isSelected ? "text-[#F8D117] fill-current" : "text-[#0038A8]"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* CLEAN CONTEXTUAL RESULT CARD WHEN A DEMO STEP IS ACTIVE */}
      {activeStep && currentStepMeta && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-2xs overflow-hidden mb-6">
          <div className="bg-[#F8FAFC] px-6 py-3 border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded bg-[#F8D117] text-[#002D72] font-bold text-[11px]">
                Demo Passo {activeStep}/8
              </span>
              <h3 className="font-bold text-sm text-[#002D72]">{currentStepMeta.shortLabel}</h3>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowCostFoundation(!showCostFoundation)}
                className="text-xs font-medium text-[#0038A8] hover:underline cursor-pointer"
              >
                {showCostFoundation
                  ? "Ocultar fundamentação e custo"
                  : "Ver fundamentação e fonte"}
              </button>
              {onDismissBanner && (
                <button
                  onClick={onDismissBanner}
                  className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                  aria-label="Fechar destaque da demo"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {showCostFoundation && (
            <div className="px-6 py-2.5 bg-blue-50/50 border-b border-[#E2E8F0] flex flex-wrap items-center justify-between text-xs text-slate-600">
              <span>Roteador de Custo: <strong>{currentStepMeta.costLabel}</strong></span>
              <span>Conformidade: <strong>NG_010 / NG_012 Auditado</strong></span>
            </div>
          )}

          <div className="p-6">
            {/* PASSO 1: Ana: Férias 05/05/2027 */}
            {activeStep === 1 && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-xs text-slate-500">
                      Persona: <strong>Ana (Analista)</strong> • Início pretendido: <strong>05/05/2027 (Quarta-feira)</strong>
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                      Cronograma Oficial D-n (NG_111 item 4.5 & PX_1111-001 Anexo D)
                    </h4>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {[
                    { marco: "D-45", data: "21/03/2027", titulo: "Solicitar (Portal Raiz)", destaque: false },
                    { marco: "D-35", data: "31/03/2027", titulo: "Emissão Aviso (GGC)", destaque: false },
                    { marco: "D-30", data: "05/04/2027", titulo: "Assinar Aviso", destaque: false },
                    { marco: "D-20", data: "15/04/2027", titulo: "Limite Alteração", destaque: false },
                    {
                      marco: "D-3 (Antecipado)",
                      data: "30/04/2027 (Sex)",
                      titulo: "Pagamento (02/05 é dom)",
                      destaque: true,
                    },
                    { marco: "Dia D", data: "05/05/2027", titulo: "Início do Gozo", destaque: false },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className={`p-3.5 rounded-lg border ${
                        item.destaque
                          ? "bg-amber-50/60 border-[#F8D117] ring-1 ring-[#F8D117]"
                          : "bg-[#F8FAFC] border-[#E2E8F0]"
                      }`}
                    >
                      <span className="text-[11px] font-bold text-[#0038A8]">{item.marco}</span>
                      <div className="text-sm font-bold text-slate-900 mt-1">{item.data}</div>
                      <div className="text-[11px] text-slate-600 mt-0.5">{item.titulo}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PASSO 2: Ana: Mudança 30 vs 45 dias */}
            {activeStep === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border border-rose-200 bg-rose-50/30 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-800">NG_111 v2.0.0 (Versão Anterior)</span>
                    <span className="text-[11px] text-rose-600 font-medium">Revogada em 03/08/2026</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Apesar de trazer data impressa até 10/06/2027, seu status é <strong>Versão anterior</strong>. Exigia apenas <strong>30 dias</strong> de antecedência.
                  </p>
                </div>

                <div className="p-4 rounded-lg border border-emerald-200 bg-emerald-50/30 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-900">NG_111 v3.0.0 (Vigente)</span>
                    <span className="text-[11px] text-emerald-700 font-medium">Vigente desde 03/08/2026</span>
                  </div>
                  <p className="text-xs text-slate-700">
                    Exige <strong>45 dias corridos (D-45)</strong>, limite de <strong>30% da equipe</strong>, escalada ao Diretor em 7 dias corridos e ressarcimento até R$ 2.500,00.
                  </p>
                </div>
              </div>
            )}

            {/* PASSO 3: Carlos: Equipe de 9 + Pendências */}
            {activeStep === 3 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                  <span className="text-xs text-slate-500">Limite Simultâneo (NG_111 4.6.3 / TB_1111-001 Tabela 4)</span>
                  <div className="text-xl font-bold text-[#002D72] mt-1">
                    Equipe de 9 = Máximo de 2 Pessoas
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    30% de 9 = 2,7 → arredondado para baixo = 2 ausentes simultâneos.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#0038A8]" />
                    Fila de Pendências (Prazo de 7 dias corridos antes de escalar ao Diretor)
                  </div>
                  <div className="text-xs text-slate-600 flex justify-between py-1 border-b border-slate-200/70">
                    <span>1. Ana (05/05 a 19/05/2027)</span>
                    <span className="font-semibold text-[#0038A8]">Restam 2 dias corridos</span>
                  </div>
                  <div className="text-xs text-slate-600 flex justify-between py-1">
                    <span>2. Lucas (10/05 a 24/05/2027)</span>
                    <span className="font-semibold text-amber-700">Restam 14h (Escalada D+7)</span>
                  </div>
                </div>
              </div>
            )}

            {/* PASSO 4: Diretora: Alçada R$ 18.000,01 */}
            {activeStep === 4 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                  <div className="text-xs text-slate-500">Até R$ 18.000,00</div>
                  <div className="text-lg font-bold text-slate-900 mt-0.5">Gerente do NIN</div>
                </div>
                <div className="p-4 rounded-lg bg-blue-50/50 border-2 border-[#0038A8]">
                  <div className="text-xs font-semibold text-[#0038A8]">
                    R$ 18.000,01 a R$ 120.000,00 (NT_2026-021 4.3)
                  </div>
                  <div className="text-lg font-bold text-[#002D72] mt-0.5">Diretor da DIRTEC</div>
                </div>
                <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                  <div className="text-xs text-slate-500">Acima de R$ 120.000,00</div>
                  <div className="text-lg font-bold text-slate-900 mt-0.5">Comitê de Alçadas</div>
                </div>
              </div>
            )}

            {/* PASSO 5: Rafael: Radar Contrato CTR_2026-012 */}
            {activeStep === 5 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                  <div className="text-xs font-bold text-[#002D72]">
                    Prorrogação Contratual: até 30/03/2027
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Pedido formal deve ser feito 30 dias antes do término (29/04/2027), limitado ao aditivo de 20% (R$ 3.650,00).
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-emerald-50/40 border border-emerald-200">
                  <div className="text-xs font-bold text-emerald-900">
                    Rescisão em Março/2027: Multa R$ 0,00 (Isento)
                  </div>
                  <p className="text-xs text-slate-700 mt-1">
                    O 90º dia encerra em <strong>27/02/2027</strong>. A partir do 91º dia em <strong>28/02/2027</strong>, a rescisão é isenta de multa (aviso prévio de 30 dias).
                  </p>
                </div>
              </div>
            )}

            {/* PASSO 6: Abstenção Honesta */}
            {activeStep === 6 && (
              <div className="flex flex-wrap items-center justify-between gap-4 bg-[#F8FAFC] p-4 rounded-lg border border-[#E2E8F0]">
                <div className="space-y-1 max-w-3xl">
                  <div className="text-xs font-bold text-[#002D72] flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-[#0038A8]" />
                    Não consta no RG_1100. Dono: NIN (Núcleo de Inovação)
                  </div>
                  <p className="text-xs text-slate-600">
                    O regulamento não define a fórmula de rateio do prêmio entre equipes de até 4 pessoas, a NT_2026-021 (item 5.4) remete casos de empregado afastado ao NIN/CIN, e os PDFs físicos da NG_010/NG_012 não integram o pacote bruto.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setNinQuestionSent(true)}
                    className="px-4 py-2 rounded-lg bg-[#F8D117] hover:bg-[#FFCC00] text-[#002D72] font-bold text-xs transition cursor-pointer"
                  >
                    [Perguntar ao NIN]
                  </button>
                  {ninQuestionSent && (
                    <span className="text-xs font-medium text-emerald-700">✓ Enviado ao NIN</span>
                  )}
                </div>
              </div>
            )}

            {/* PASSO 7: Governança: Pedido de Acesso & Resposta Curada */}
            {activeStep === 7 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
                  <div className="text-xs font-bold text-slate-800">1. Bloqueio RBAC</div>
                  <p className="text-xs text-slate-600">
                    &quot;Parte da resposta requer autorização da <strong>[GGC]</strong>.&quot;
                  </p>
                  <button
                    onClick={() => {
                      setRbacStage("requested");
                      onSwitchPersona?.("curadora_ggc");
                    }}
                    className="px-3 py-1.5 rounded bg-[#0038A8] text-white text-xs font-medium cursor-pointer"
                  >
                    Solicitar à GGC
                  </button>
                </div>

                <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
                  <div className="text-xs font-bold text-slate-800">
                    2. Curadora GGC (Resposta Curada)
                  </div>
                  <input
                    type="text"
                    value={curatedText}
                    onChange={(e) => setCuratedText(e.target.value)}
                    className="w-full text-xs p-2 rounded border border-[#E2E8F0] bg-white"
                  />
                  <button
                    onClick={() => setRbacStage("curated_approved")}
                    className="px-3 py-1.5 rounded bg-[#F8D117] text-[#002D72] text-xs font-bold cursor-pointer"
                  >
                    Aprovar via RESPOSTA CURADA
                  </button>
                </div>

                <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
                  <div className="text-xs font-bold text-slate-800">3. Trilha de Auditoria</div>
                  {rbacStage === "curated_approved" ? (
                    <p className="text-xs text-emerald-700 font-medium">
                      ✓ Registrado: Resposta Curada enviada para Ana sem abrir o documento restrito.
                    </p>
                  ) : (
                    <p className="text-xs text-slate-500">Aguardando aprovação da Curadora GGC.</p>
                  )}
                </div>
              </div>
            )}

            {/* PASSO 8: Executivo: Gerar PPT Ideias em Campo 2027 */}
            {activeStep === 8 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#002D72]">
                    Preview Executivo PPT — Programa Ideias em Campo 2027 (R$ 96.000,00)
                  </span>
                  <div className="flex gap-1.5">
                    {[1, 2, 3].map((n) => (
                      <button
                        key={n}
                        onClick={() => setActiveSlide(n)}
                        className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
                          activeSlide === n
                            ? "bg-[#0038A8] text-white"
                            : "bg-[#F8FAFC] text-slate-600 border border-[#E2E8F0]"
                        }`}
                      >
                        Slide {n}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-slate-700">
                  {activeSlide === 1 && (
                    <div>
                      <strong>Slide 1 — Orçamento R$ 96.000,00:</strong> Kits Prototipagem R$ 36k (37,5%), Imersão R$ 30k (31,3%), Premiação Colocação R$ 16k (16,7%), Arenas R$ 8k (8,3%), Comunicação R$ 6k (6,3%). <em>Fonte: NT_2026-021 v1.0.0.</em>
                    </div>
                  )}
                  {activeSlide === 2 && (
                    <div>
                      <strong>Slide 2 — 7 Fases (01/02 a 30/06/2027):</strong> Inscrição (fev), Triagem (12/03), Votação Top 20 (15 a 26/03), Imersão (05 a 09/04), Protótipo TRL 4 (até 31/05), Banca (15/06) e Prêmio em Folha (30/06). <em>Fonte: RG_1100 v2.0.0.</em>
                    </div>
                  )}
                  {activeSlide === 3 && (
                    <div>
                      <strong>Slide 3 — Alçadas & Trava Fiscal (31/03):</strong> Até R$ 18k (Gerente NIN), R$ 18.000,01 a R$ 120k (Diretor DIRTEC), &gt; R$ 120k (Comitê). Trava de documentação fiscal em 31/03. <em>Fonte: NT_2026-021 e PX_1130-001.</em>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
