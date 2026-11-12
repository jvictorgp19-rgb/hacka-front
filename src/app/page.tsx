"use client";

import React, { useState } from "react";
import acervo from "@/data/acervo_estruturado_acme_bbts.json";
import { PERSONAS_NOMINAIS, PersonaNominal, apiChat } from "@/lib/api";
import DemoPitchBar, { DEMO_STEPS, DemoStepId } from "@/components/DemoPitchBar";
import GovernanceDifferentialsPanel, {
  GovernanceSubTab,
} from "@/components/GovernanceDifferentialsPanel";
import FeriasSimulators from "@/components/FeriasSimulators";
import InovacaoSimulators from "@/components/InovacaoSimulators";
import LocacaoSimulators from "@/components/LocacaoSimulators";
import CopilotSidebar, { ChatMessage } from "@/components/CopilotSidebar";
import {
  Search,
  ShieldCheck,
  CheckSquare,
  Square,
  ExternalLink,
  X,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  SunMedium,
  Sparkles,
  FileCheck2,
  AlertTriangle,
  HelpCircle,
  Lock,
  CalendarClock,
  Compass,
  BookmarkCheck,
} from "lucide-react";

type TemaKey = "ferias" | "inovacao" | "locacao";
type MainTabKey = "inicio" | "normas" | "simuladores" | "governanca";

const TEMAS_CONFIG: {
  id: TemaKey;
  label: string;
  sublabel: string;
  serieTag: string;
  codigosDocs: string[];
  destaqueResumo: string;
  prazoSemana: string;
}[] = [
  {
    id: "ferias",
    label: "Férias (Série 1)",
    sublabel: "Gente e Cultura • NG_111 v3.0.0",
    serieTag: "1 - Gente e Cultura",
    codigosDocs: ["NG_111", "PX_1111-001", "FM_1111-001", "TB_1111-001", "FL_1111-001"],
    destaqueResumo:
      "Antecedência obrigatória de 45 dias corridos (D-45) e limite máximo de 30% da equipe em gozo simultâneo.",
    prazoSemana:
      "Solicitação até D-45 (21/03 para gozo em 05/05) e pagamento em D-3 antecipado em feriados/domingos.",
  },
  {
    id: "inovacao",
    label: "Inovação - Ideias em Campo (Série 11)",
    sublabel: "Programas Institucionais • NG_1130 & RG_1100 v2.0.0",
    serieTag: "11 - Programas Institucionais",
    codigosDocs: ["NG_1130", "PX_1130-001", "RG_1100", "NT_2026-021"],
    destaqueResumo:
      "Edição 2027 com orçamento de R$ 96 mil, gamificação até 800 pts, 6 meses de casa e até 2 ideias por pessoa.",
    prazoSemana:
      "Trava crítica de documentação para incentivo fiscal em 31 de março (PX_1130-001) e inscrições até 28/02.",
  },
  {
    id: "locacao",
    label: "Locação Coworking (Contratos)",
    sublabel: "Compras e Operações • CTR_2026-012 & NT_2026-018",
    serieTag: "Contratos & Instrumentos",
    codigosDocs: ["CTR_2026-012", "NT_2026-018"],
    destaqueResumo:
      "Espaço em Vale Azul (R$ 3.650/mês) com desconto de R$ 121,67/dia por queda de internet > 4h e isenção de multa no 91º dia.",
    prazoSemana:
      "Pedido de prorrogação até 30/03/2027; NF até dia 25, atesto técnico GOC em 5 dias úteis e pagamento até dia 8.",
  },
];

const PERFIL_LABELS: Record<string, string> = {
  empregado: "Empregado / Proponente",
  gestor: "Gestor Imediato",
  diretoria: "Diretoria da Área",
  ggc_gfi: "GGC (Gente e Cultura) / GFI (Finanças)",
  nin_cin_diretoria: "NIN / CIN / Diretoria (DIRTEC & DIRAF)",
  gestor_contrato_gco: "Gestor de Contrato GCO (Compras e Contratos)",
  fiscal_tecnico_goc: "Fiscal Técnico GOC (Operações de Campo)",
  diretoria_gfi_gju: "Diretoria DIRAF / GFI / GJU",
};

const PDF_LINKS: Record<string, string> = {
  NG_111: "/docs_acervo/vigentes/NG_111__FERIAS__v3.0.0.pdf",
  "PX_1111-001": "/docs_acervo/vigentes/PX_1111-001__PROCEDIMENTO_DE_FERIAS__v1.0.0.pdf",
  "FM_1111-001": "/docs_acervo/vigentes/FM_1111-001__SOLICITACAO_DE_FERIAS__v2.0.0.pdf",
  "TB_1111-001": "/docs_acervo/vigentes/TB_1111-001__TABELAS_DE_FERIAS__v1.0.0.pdf",
  "FL_1111-001": "/docs_acervo/vigentes/FL_1111-001__FLUXOGRAMA_DE_FERIAS__v1.0.0.pdf",
  NG_1130: "/docs_acervo/vigentes/NG_1130__GESTAO_DA_INOVACAO__v1.0.0.pdf",
  "PX_1130-001": "/docs_acervo/vigentes/PX_1130-001__FUNIL_DE_INOVACAO__v1.0.0.pdf",
  RG_1100: "/docs_acervo/vigentes/RG_1100__PROGRAMA_IDEIAS_EM_CAMPO__v2.0.0.pdf",
  "NT_2026-021":
    "/docs_acervo/vigentes/NT_2026-021__ORCAMENTO_E_COMPETENCIAS_IDEIAS_EM_CAMPO__v1.0.0.pdf",
  "CTR_2026-012":
    "/docs_acervo/vigentes/CTR_2026-012__LOCACAO_DE_ESPACO_DE_COWORKING__v1.0.0.pdf",
  "NT_2026-018": "/docs_acervo/vigentes/NT_2026-018__CONTRATACAO_DE_COWORKING__v1.0.0.pdf",
};

export default function HomePage() {
  // Navigation & Core State
  const [activeTab, setActiveTab] = useState<MainTabKey>("inicio");
  const [governanceSubTab, setGovernanceSubTab] = useState<GovernanceSubTab>("radar");
  const [personaAtivaId, setPersonaAtivaId] = useState<string>("ana");
  const [temaAtivo, setTemaAtivo] = useState<TemaKey>("ferias");
  const [perfilPorTema, setPerfilPorTema] = useState<Record<TemaKey, string>>({
    ferias: "empregado",
    inovacao: "empregado",
    locacao: "fiscal_tecnico_goc",
  });

  // Accessibility Controls (A+, A-, Alto Contraste)
  const [fontScale, setFontScale] = useState<"normal" | "lg" | "sm">("normal");
  const [highContrast, setHighContrast] = useState<boolean>(false);

  // Drawers & Modals State
  const [isPitchDrawerOpen, setIsPitchDrawerOpen] = useState<boolean>(false);
  const [activeDemoStep, setActiveDemoStep] = useState<DemoStepId | null>(null);
  const [isCopilotDrawerOpen, setIsCopilotDrawerOpen] = useState<boolean>(false);
  const [selectedDocModalCode, setSelectedDocModalCode] = useState<string | null>(null);
  const [showVersionDiffModal, setShowVersionDiffModal] = useState<boolean>(false);

  // Hero Search / Inline Co-Piloto State (Tab 1)
  const [heroQuestion, setHeroQuestion] = useState<string>("");
  const [heroLoading, setHeroLoading] = useState<boolean>(false);
  const [heroResponse, setHeroResponse] = useState<ChatMessage | null>(null);
  const [heroFoundationExpanded, setHeroFoundationExpanded] = useState<boolean>(false);

  // Checklist state (Tab 2)
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const personaAtiva: PersonaNominal =
    PERSONAS_NOMINAIS.find((p) => p.id === personaAtivaId) || PERSONAS_NOMINAIS[0];

  const handleSelectPersona = (personaId: string) => {
    const found = PERSONAS_NOMINAIS.find((p) => p.id === personaId);
    if (!found) return;
    setPersonaAtivaId(found.id);
    setTemaAtivo(found.temaPadrao);
    setPerfilPorTema((prev) => ({
      ...prev,
      [found.temaPadrao]: found.perfilChave,
    }));
  };

  // Automatic routing when a Demo Step (1..8) is clicked from the retractable drawer
  const handleSelectDemoStep = (stepId: DemoStepId) => {
    setActiveDemoStep(stepId);
    const meta = DEMO_STEPS.find((s) => s.id === stepId);
    if (meta) {
      handleSelectPersona(meta.personaId);
      setTemaAtivo(meta.tema);
    }

    if (stepId === 1 || stepId === 3 || stepId === 4) {
      setActiveTab("simuladores");
    } else if (stepId === 2) {
      setActiveTab("normas");
      setShowVersionDiffModal(true);
    } else if (stepId === 5) {
      setActiveTab("governanca");
      setGovernanceSubTab("radar");
    } else if (stepId === 6) {
      setActiveTab("inicio");
      executeHeroSearch("Como o prêmio é dividido em equipe no Ideias em Campo e se alguém for afastado?");
    } else if (stepId === 7) {
      setActiveTab("governanca");
      setGovernanceSubTab("acesso");
    } else if (stepId === 8) {
      setActiveTab("governanca");
      setGovernanceSubTab("finops_ppt");
    }
  };

  const jornadaAtual = acervo.jornadas_por_tema[temaAtivo];
  const perfisDisponiveis = Object.keys(jornadaAtual.visoes_por_perfil);
  const perfilSelecionado = perfisDisponiveis.includes(perfilPorTema[temaAtivo])
    ? perfilPorTema[temaAtivo]
    : perfisDisponiveis[0];

  const dadosPerfil = (
    jornadaAtual.visoes_por_perfil as Record<
      string,
      { resumo_ux: string; checklist: string[] }
    >
  )[perfilSelecionado];

  const configTema = TEMAS_CONFIG.find((t) => t.id === temaAtivo)!;
  const documentosTema = acervo.documentos_acervo.filter((d) =>
    configTema.codigosDocs.includes(d.codigo)
  );

  const selectedDocForModal = selectedDocModalCode
    ? acervo.documentos_acervo.find((d) => d.codigo === selectedDocModalCode)
    : null;

  const executeHeroSearch = async (queryText: string) => {
    const q = queryText.trim();
    if (!q || heroLoading) return;
    setHeroLoading(true);
    setHeroFoundationExpanded(false);
    try {
      const { data } = await apiChat({
        message: q,
        tema: temaAtivo,
        perfil: `${personaAtiva.nome} (${personaAtiva.papel})`,
        personaId: personaAtiva.id,
      });
      setHeroResponse({
        id: Date.now().toString(),
        role: "assistant",
        text: data.answer,
        bullets: data.bullets || [],
        citations: data.citations || [],
        costBadge: data.costBadge,
        revokedAlert: data.revokedAlert,
        honestAbstention: data.honestAbstention,
        rbacBlock: data.rbacBlock,
      });
    } catch {
      setHeroResponse({
        id: Date.now().toString(),
        role: "assistant",
        text: "Não foi possível consultar o acervo neste momento.",
      });
    } finally {
      setHeroLoading(false);
    }
  };

  const toggleCheckItem = (idx: number) => {
    const key = `${temaAtivo}__${perfilSelecionado}__${idx}`;
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const totalCheckItems = dadosPerfil.checklist.length;
  const completedCheckItems = dadosPerfil.checklist.filter(
    (_, idx) => checkedItems[`${temaAtivo}__${perfilSelecionado}__${idx}`]
  ).length;
  const progressPct =
    totalCheckItems > 0 ? Math.round((completedCheckItems / totalCheckItems) * 100) : 0;

  const flMermaidDoc = acervo.documentos_acervo.find((d) => d.codigo === "FL_1111-001");
  const mermaidCode =
    (flMermaidDoc && "mermaid_code" in flMermaidDoc && flMermaidDoc.mermaid_code) || "";

  const fontSizeClass =
    fontScale === "lg" ? "text-[17px]" : fontScale === "sm" ? "text-[14px]" : "text-base";

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors ${fontSizeClass} ${
        highContrast ? "bg-slate-950 text-white" : "bg-[#F8FAFC] text-slate-800"
      }`}
    >
      {/* 1. BARRA DE TOPO INSTITUCIONAL FINA (ESTILO BBTS.COM.BR) */}
      <div className="bg-[#002D72] text-white border-b border-white/10 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-10 flex items-center justify-between gap-4">
          {/* Left: BBTS — Tecnologia e Serviços */}
          <div className="flex items-center gap-2 font-medium tracking-wide">
            <span className="w-2 h-2 rounded-full bg-[#F8D117]" />
            <span className="font-semibold text-white">BBTS — Tecnologia e Serviços</span>
            <span className="hidden md:inline text-blue-200 font-normal">
              | Inteligência Empresarial & Legal Design
            </span>
          </div>

          {/* Center: Discreet Accessibility Controls (A+, A-, Alto Contraste) */}
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-blue-100">
            <span className="text-blue-300 mr-1">Acessibilidade:</span>
            <button
              onClick={() => setFontScale("sm")}
              className={`px-1.5 py-0.5 rounded hover:bg-white/10 cursor-pointer ${
                fontScale === "sm" ? "bg-white/20 text-[#F8D117] font-bold" : ""
              }`}
              title="Diminuir fonte"
            >
              A-
            </button>
            <button
              onClick={() => setFontScale("normal")}
              className={`px-1.5 py-0.5 rounded hover:bg-white/10 cursor-pointer ${
                fontScale === "normal" ? "bg-white/20 text-[#F8D117] font-bold" : ""
              }`}
              title="Fonte padrão"
            >
              A
            </button>
            <button
              onClick={() => setFontScale("lg")}
              className={`px-1.5 py-0.5 rounded hover:bg-white/10 cursor-pointer ${
                fontScale === "lg" ? "bg-white/20 text-[#F8D117] font-bold" : ""
              }`}
              title="Aumentar fonte"
            >
              A+
            </button>
            <span className="mx-1 text-white/20">|</span>
            <button
              onClick={() => setHighContrast(!highContrast)}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded hover:bg-white/10 cursor-pointer ${
                highContrast ? "bg-[#F8D117] text-[#002D72] font-bold" : ""
              }`}
            >
              <SunMedium className="w-3 h-3" />
              Alto Contraste
            </button>
          </div>

          {/* Right: Compact Active Persona Selector */}
          <div className="flex items-center gap-2">
            <label htmlFor="persona-select" className="text-[11px] text-blue-200 hidden sm:inline">
              Persona:
            </label>
            <select
              id="persona-select"
              value={personaAtiva.id}
              onChange={(e) => handleSelectPersona(e.target.value)}
              className="bg-[#0038A8] text-white text-xs font-medium px-2.5 py-1 rounded border border-white/20 focus:outline-none focus:border-[#F8D117] cursor-pointer"
            >
              {PERSONAS_NOMINAIS.map((p) => (
                <option key={p.id} value={p.id} className="bg-white text-slate-900">
                  {p.nome} — {p.papel} ({p.rbac})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. CABEÇALHO PRINCIPAL & NAVEGAÇÃO EM 4 ABAS LIMPAS */}
      <header className="sticky top-0 z-30 bg-white border-b border-[#E2E8F0] shadow-2xs">
        <div className="h-1 bg-[#F8D117] w-full" />
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <button
            onClick={() => setActiveTab("inicio")}
            className="flex items-center gap-3 text-left cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-[#0038A8] text-[#F8D117] font-black text-sm flex items-center justify-center tracking-tight">
              BBTS
            </div>
            <div>
              <span className="font-bold text-base text-[#002D72] block leading-none">
                Portal Raiz IQ
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                ACME Tecnologia e Serviços
              </span>
            </div>
          </button>

          {/* 4 Clean Main Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto">
            {[
              { id: "inicio", label: "Início & Co-Piloto" },
              { id: "normas", label: "Normas & Jornada" },
              { id: "simuladores", label: "Simuladores" },
              { id: "governanca", label: "Governança & Radar" },
            ].map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as MainTabKey)}
                  className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition cursor-pointer whitespace-nowrap relative ${
                    isSelected
                      ? "text-[#002D72] bg-blue-50/70"
                      : "text-slate-600 hover:text-[#0038A8] hover:bg-slate-50"
                  }`}
                >
                  {tab.label}
                  {isSelected && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#F8D117] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Discreet Action Buttons: Roteiro Demo (8 Passos) & Co-Piloto */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsPitchDrawerOpen(true)}
              className="px-3.5 py-2 rounded-lg bg-[#F8D117] hover:bg-[#FFCC00] text-[#002D72] font-bold text-xs transition cursor-pointer shadow-2xs"
            >
              🎯 Roteiro Demo (8 Passos)
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT CONTAINER (Renders ONLY ONE active view at a time) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8">
        {/* Retractable Pitch Drawer + Contextual Demo Proof Card if a step was triggered */}
        <DemoPitchBar
          activeStep={activeDemoStep}
          onSelectStep={handleSelectDemoStep}
          onSwitchPersona={handleSelectPersona}
          isDrawerOpen={isPitchDrawerOpen}
          onCloseDrawer={() => setIsPitchDrawerOpen(false)}
          onDismissBanner={() => setActiveDemoStep(null)}
        />

        {/* =====================================================================
            ABA 1: INÍCIO & CO-PILOTO (Hero Clean BBTS + 3 Cards Resumidos)
           ===================================================================== */}
        {activeTab === "inicio" && (
          <div className="space-y-10">
            {/* Hero Portal BBTS */}
            <section className="bg-gradient-to-r from-[#002D72] to-[#0038A8] rounded-2xl p-8 sm:p-12 text-white shadow-sm relative overflow-hidden">
              <div className="max-w-3xl space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs text-blue-100 border border-white/15">
                  <span className="w-2 h-2 rounded-full bg-[#F8D117]" />
                  Olá, <strong>{personaAtiva.nome}</strong> ({personaAtiva.papel} • Acesso{" "}
                  {personaAtiva.rbac})
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-snug">
                  O que você precisa resolver hoje na BBTS?
                </h1>
                <p className="text-sm text-blue-100 leading-relaxed">
                  Consulte normas vigentes em linguagem simples, simule prazos e alçadas com custo zero ou tire dúvidas no Co-Piloto auditado pela taxonomia{" "}
                  <span className="font-semibold text-white">NG_010</span>.
                </p>

                {/* Central Search Input */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    executeHeroSearch(heroQuestion);
                  }}
                  className="flex flex-col sm:flex-row gap-2.5 pt-2"
                >
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={heroQuestion}
                      onChange={(e) => setHeroQuestion(e.target.value)}
                      placeholder="Ex: Quero sair de férias em 05/05/2027, qual o prazo limite? Ou: Posso enviar 3 ideias?"
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F8D117]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={heroLoading}
                    className="px-6 py-3.5 rounded-xl bg-[#F8D117] hover:bg-[#FFCC00] text-[#002D72] font-bold text-sm transition cursor-pointer shrink-0"
                  >
                    {heroLoading ? "Consultando..." : "Consultar Norma"}
                  </button>
                </form>

                {/* Quick Pill Triggers */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-xs text-blue-200">Consultas rápidas:</span>
                  {[
                    "Férias em 05/05/2027 (Cronograma D-n)",
                    "Antecedência 30 vs 45 dias",
                    "Alçada R$ 18.000,01",
                    "Rescisão Coworking em março tem multa?",
                  ].map((qText, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setHeroQuestion(qText);
                        executeHeroSearch(qText);
                      }}
                      className="text-xs px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/15 transition cursor-pointer"
                    >
                      {qText}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Clean Inline Response Card (Maximum 3 lines initially + Expand button) */}
            {heroResponse && (
              <section className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-2xs space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 max-w-4xl">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                        Resposta Fundamentada
                      </span>
                      {heroResponse.revokedAlert && (
                        <span className="px-2.5 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 text-xs font-semibold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          Alerta de versão revogada ({heroResponse.revokedAlert.codigo})
                        </span>
                      )}
                    </div>

                    <p className="text-sm font-semibold text-[#002D72] line-clamp-2">
                      {heroResponse.text.replace(/\*\*/g, "")}
                    </p>

                    {heroResponse.bullets && heroResponse.bullets[0] && (
                      <p
                        className={`text-sm text-slate-600 leading-relaxed ${
                          !heroFoundationExpanded ? "line-clamp-2" : ""
                        }`}
                      >
                        {heroResponse.bullets[0].replace(/\*\*/g, "").replace(/`/g, "")}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => setHeroResponse(null)}
                    className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {/* Expandable Technical Details, Full Bullets, Citations & Cost Router */}
                {heroFoundationExpanded && (
                  <div className="pt-4 border-t border-[#E2E8F0] space-y-4">
                    {heroResponse.bullets && heroResponse.bullets.length > 1 && (
                      <ul className="space-y-2 text-xs text-slate-700 list-disc pl-5">
                        {heroResponse.bullets.slice(1).map((b, i) => (
                          <li key={i}>{b.replace(/\*\*/g, "").replace(/`/g, "")}</li>
                        ))}
                      </ul>
                    )}

                    {heroResponse.revokedAlert && (
                      <div className="p-3.5 rounded-lg bg-amber-50/70 border border-amber-200 text-xs text-amber-950">
                        <strong>Trava Histórica ({heroResponse.revokedAlert.codigo}):</strong>{" "}
                        {heroResponse.revokedAlert.pegadinha}
                      </div>
                    )}

                    {heroResponse.honestAbstention && (
                      <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-slate-700 flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <strong className="text-[#002D72]">
                            Abstenção Honesta ({heroResponse.honestAbstention.donoDominio}):
                          </strong>{" "}
                          {heroResponse.honestAbstention.lacuna}
                        </div>
                        <button
                          onClick={() => setIsCopilotDrawerOpen(true)}
                          className="px-3 py-1.5 rounded bg-[#0038A8] text-white font-semibold cursor-pointer"
                        >
                          {heroResponse.honestAbstention.botaoAcao}
                        </button>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs text-slate-500">Fontes vigentes:</span>
                        {heroResponse.citations?.map((cit) => (
                          <span
                            key={cit.codigo}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-medium text-[#002D72]"
                          >
                            <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                            {cit.codigo} ({cit.versao})
                          </span>
                        ))}
                      </div>

                      {heroResponse.costBadge && (
                        <span className="text-xs text-slate-500 bg-[#F8FAFC] px-3 py-1 rounded border border-[#E2E8F0]">
                          {heroResponse.costBadge.label} • Sigilo: {heroResponse.costBadge.sigiloNivel}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setHeroFoundationExpanded(!heroFoundationExpanded)}
                    className="text-xs font-semibold text-[#0038A8] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {heroFoundationExpanded ? (
                      <>
                        Ocultar fundamentação e fonte <ChevronUp className="w-3.5 h-3.5" />
                      </>
                    ) : (
                      <>
                        Ver fundamentação e fonte <ChevronDown className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setIsCopilotDrawerOpen(true)}
                    className="text-xs text-slate-500 hover:text-[#0038A8] cursor-pointer"
                  >
                    Abrir histórico completo no Co-Piloto →
                  </button>
                </div>
              </section>
            )}

            {/* 3 Clean Summary Cards ("Prazos da Semana", "Minha Jornada", "Destaques do Tema") */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Prazos da Semana */}
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-2xs flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#0038A8] flex items-center justify-center">
                    <CalendarClock className="w-5 h-5" />
                  </div>
                  <h2 className="text-base font-bold text-[#002D72]">Prazos da Semana</h2>
                  <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                    { personaAtiva.alertasProativos[0] || configTema.prazoSemana }
                  </p>
                </div>
                <button
                  onClick={() => {
                    setActiveTab("governanca");
                    setGovernanceSubTab("radar");
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0038A8] hover:text-[#002D72] cursor-pointer"
                >
                  Saiba mais <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Card 2: Minha Jornada */}
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-2xs flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#0038A8] flex items-center justify-center">
                    <Compass className="w-5 h-5" />
                  </div>
                  <h2 className="text-base font-bold text-[#002D72]">Minha Jornada</h2>
                  <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                    {dadosPerfil.resumo_ux}
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("normas")}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0038A8] hover:text-[#002D72] cursor-pointer"
                >
                  Saiba mais <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Card 3: Destaques do Tema */}
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-2xs flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#0038A8] flex items-center justify-center">
                    <BookmarkCheck className="w-5 h-5" />
                  </div>
                  <h2 className="text-base font-bold text-[#002D72]">
                    Destaques — {configTema.label}
                  </h2>
                  <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                    {configTema.destaqueResumo}
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("simuladores")}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0038A8] hover:text-[#002D72] cursor-pointer"
                >
                  Saiba mais <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </section>
          </div>
        )}

        {/* =====================================================================
            ABA 2: NORMAS & JORNADA (Seletor Limpo + UX Writing + Cards 3 Dados + Modal)
           ===================================================================== */}
        {activeTab === "normas" && (
          <div className="space-y-8">
            {/* Clean Theme & Profile Selector Bar */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-2xs flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {TEMAS_CONFIG.map((t) => {
                  const active = temaAtivo === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTemaAtivo(t.id)}
                      className={`px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition cursor-pointer border ${
                        active
                          ? "bg-[#0038A8] text-white border-[#002D72]"
                          : "bg-[#F8FAFC] hover:bg-slate-100 text-slate-700 border-[#E2E8F0]"
                      }`}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Perfil na jornada:</span>
                <select
                  value={perfilSelecionado}
                  onChange={(e) =>
                    setPerfilPorTema((prev) => ({ ...prev, [temaAtivo]: e.target.value }))
                  }
                  className="text-xs font-semibold text-[#002D72] bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2 focus:outline-none focus:border-[#0038A8]"
                >
                  {perfisDisponiveis.map((k) => (
                    <option key={k} value={k}>
                      {PERFIL_LABELS[k] || k}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* UX Writing Summary & Enxuto Checklist */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 sm:p-8 shadow-2xs space-y-6">
              <div className="border-l-4 border-[#0038A8] pl-4 space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#0038A8]">
                  Diretriz em Linguagem Simples • {PERFIL_LABELS[perfilSelecionado]}
                </span>
                <p className="text-base sm:text-lg font-semibold text-[#002D72] leading-relaxed">
                  “{dadosPerfil.resumo_ux}”
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">
                    Checklist da Jornada ({completedCheckItems}/{totalCheckItems})
                  </span>
                  <span>{progressPct}% concluído</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#0038A8] transition-all duration-300"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-2">
                  {dadosPerfil.checklist.map((item, idx) => {
                    const isChecked = !!checkedItems[`${temaAtivo}__${perfilSelecionado}__${idx}`];
                    return (
                      <button
                        key={idx}
                        onClick={() => toggleCheckItem(idx)}
                        className={`p-3.5 rounded-lg border text-left transition flex items-start gap-3 cursor-pointer ${
                          isChecked
                            ? "bg-emerald-50/40 border-emerald-200 text-slate-500 line-through"
                            : "bg-[#F8FAFC] hover:bg-white border-[#E2E8F0] text-slate-700"
                        }`}
                      >
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        )}
                        <span className="text-xs leading-relaxed">{item}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Minimalist Document Cards (ONLY 3 visible data points: Código, Título, Selo Vigente/Dono) */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-[#002D72]">
                    Acervo Normativo Vigente — {configTema.label}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Clique em qualquer documento para abrir os metadados completos da NG_010 ou comparar versões substituídas
                  </p>
                </div>

                <button
                  onClick={() => setShowVersionDiffModal(true)}
                  className="px-4 py-2 rounded-lg bg-white hover:bg-slate-50 text-[#002D72] border border-[#E2E8F0] text-xs font-semibold transition cursor-pointer flex items-center gap-2 shadow-2xs"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  Comparar Versões Substituídas (Trava Histórica)
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {documentosTema.map((doc) => {
                  const gov = doc.governanca as Record<string, unknown>;
                  const donoSigla = (
                    (gov.dono_elaborador as string) ||
                    (gov.dono_gestor_contrato as string) ||
                    ""
                  ).split(" ")[0];

                  return (
                    <div
                      key={doc.codigo}
                      className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-2xs hover:border-[#0038A8]/50 transition flex flex-col justify-between space-y-5"
                    >
                      <div className="space-y-3">
                        {/* Data 1 & Data 3: Código + Selo Vigente/Dono */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2.5 py-1 rounded bg-[#002D72] text-white font-mono font-bold text-xs">
                            {doc.codigo}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            Vigente • {donoSigla}
                          </span>
                        </div>

                        {/* Data 2: Título */}
                        <h3 className="text-base font-bold text-slate-900 leading-snug">
                          {doc.titulo}
                        </h3>
                      </div>

                      <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between">
                        <button
                          onClick={() => setSelectedDocModalCode(doc.codigo)}
                          className="text-xs font-semibold text-[#0038A8] hover:text-[#002D72] cursor-pointer flex items-center gap-1"
                        >
                          Ver detalhes / Comparar versões <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            ABA 3: SIMULADORES (Apenas Calculadoras Interativas em Layout Amplo)
           ===================================================================== */}
        {activeTab === "simuladores" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-2xs flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#0038A8]">
                  Calculadoras Determinísticas • Custo R$ 0,00
                </span>
                <h2 className="text-xl font-bold text-[#002D72] mt-0.5">
                  Simuladores de Regras e Tomada de Decisão
                </h2>
              </div>

              <div className="flex flex-wrap gap-2">
                {TEMAS_CONFIG.map((t) => {
                  const active = temaAtivo === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTemaAtivo(t.id)}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                        active
                          ? "bg-[#0038A8] text-white border-[#002D72]"
                          : "bg-[#F8FAFC] hover:bg-slate-100 text-slate-700 border-[#E2E8F0]"
                      }`}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {temaAtivo === "ferias" && (
              <FeriasSimulators
                regras={acervo.jornadas_por_tema.ferias.regras_simuladores}
                mermaidCode={mermaidCode}
              />
            )}

            {temaAtivo === "inovacao" && (
              <InovacaoSimulators
                regras={acervo.jornadas_por_tema.inovacao.regras_simuladores}
                alcadasNg012={acervo.alcadas_financeiras_ng012}
              />
            )}

            {temaAtivo === "locacao" && (
              <LocacaoSimulators
                regras={acervo.jornadas_por_tema.locacao.regras_simuladores}
              />
            )}
          </div>
        )}

        {/* =====================================================================
            ABA 4: GOVERNANÇA & RADAR (Com Sub-abas Limpas a, b, c, d)
           ===================================================================== */}
        {activeTab === "governanca" && (
          <GovernanceDifferentialsPanel
            initialSubTab={governanceSubTab}
            onSwitchPersona={handleSelectPersona}
          />
        )}
      </main>

      {/* =====================================================================
          MODAL LIMPO: DETALHES DO DOCUMENTO & COMPARAÇÃO DE VERSÕES
         ===================================================================== */}
      {selectedDocForModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xl max-w-2xl w-full overflow-hidden">
            <div className="bg-[#002D72] text-white px-6 py-4 flex items-center justify-between border-b-2 border-[#F8D117]">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded bg-[#F8D117] text-[#002D72] font-mono font-bold text-xs">
                  {selectedDocForModal.codigo} (v{selectedDocForModal.versao})
                </span>
                <h3 className="font-bold text-base">{selectedDocForModal.titulo}</h3>
              </div>
              <button
                onClick={() => setSelectedDocModalCode(null)}
                className="p-1 rounded-lg text-blue-100 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs text-slate-700 max-h-[80vh] overflow-y-auto">
              {"resumo_legal_design" in selectedDocForModal &&
                selectedDocForModal.resumo_legal_design && (
                  <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5">
                    <div className="font-bold text-[#002D72]">Resumo em Linguagem Simples</div>
                    <p className="leading-relaxed">
                      {selectedDocForModal.resumo_legal_design.o_que_e}
                    </p>
                  </div>
                )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                  <span className="text-slate-400 block text-[11px]">Categoria e Série</span>
                  <strong className="text-slate-900">
                    {selectedDocForModal.categoria} • {selectedDocForModal.serie}
                  </strong>
                </div>
                <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                  <span className="text-slate-400 block text-[11px]">
                    Desambiguação NG_010 (vinculado_a)
                  </span>
                  <strong className="text-[#0038A8]">
                    {selectedDocForModal.vinculado_a || "Norma Raiz da Série (Topo Hierárquico)"}
                  </strong>
                </div>
                <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                  <span className="text-slate-400 block text-[11px]">Dono / Gestor</span>
                  <strong className="text-slate-900">
                    {((selectedDocForModal.governanca as Record<string, unknown>)
                      .dono_elaborador as string) ||
                      ((selectedDocForModal.governanca as Record<string, unknown>)
                        .dono_gestor_contrato as string)}
                  </strong>
                </div>
                <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                  <span className="text-slate-400 block text-[11px]">Aprovador (NG_012)</span>
                  <strong className="text-slate-900">
                    {
                      (selectedDocForModal.governanca as Record<string, unknown>)
                        .aprovador as string
                    }
                  </strong>
                </div>
              </div>

              {/* Show Historical Replacement Diff if this doc replaced an older version */}
              {acervo.documentos_substituidos_bloqueados
                .filter((sub) => sub.codigo === selectedDocForModal.codigo)
                .map((sub) => (
                  <div
                    key={sub.versao}
                    className="p-4 rounded-xl bg-amber-50/70 border border-amber-300 space-y-1.5"
                  >
                    <div className="font-bold text-amber-950 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-700" />
                      Comparativo com Versão Substituída ({sub.codigo} v{sub.versao})
                    </div>
                    <p className="text-amber-900 leading-relaxed">
                      {sub.diferenca_critica_pegadinha}
                    </p>
                  </div>
                ))}

              <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between">
                {PDF_LINKS[selectedDocForModal.codigo] ? (
                  <a
                    href={PDF_LINKS[selectedDocForModal.codigo]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0038A8] text-white font-semibold hover:bg-[#002D72] transition"
                  >
                    Abrir PDF Oficial <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <span />
                )}
                <button
                  onClick={() => setSelectedDocModalCode(null)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL LIMPO: VERSÕES SUBSTITUÍDAS (TRAVA HISTÓRICA DIFF v2 vs v3)
         ===================================================================== */}
      {showVersionDiffModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xl max-w-3xl w-full overflow-hidden">
            <div className="bg-[#002D72] text-white px-6 py-4 flex items-center justify-between border-b-2 border-[#F8D117]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#F8D117]">
                  Quarentena da Camada Silver
                </span>
                <h3 className="font-bold text-base">
                  Versões Substituídas e Bloqueadas (Comparativo de Mudanças)
                </h3>
              </div>
              <button
                onClick={() => setShowVersionDiffModal(false)}
                className="p-1 rounded-lg text-blue-100 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {acervo.documentos_substituidos_bloqueados.map((sub) => (
                <div
                  key={`${sub.codigo}-${sub.versao}`}
                  className="p-5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded bg-slate-800 text-[#F8D117] font-mono font-bold text-xs">
                      {sub.codigo} v{sub.versao} — {sub.titulo}
                    </span>
                    <span className="text-xs font-semibold text-emerald-700">
                      Substituído por: {sub.substituido_por}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed bg-amber-50/70 p-3 rounded-lg border border-amber-200">
                    <strong className="text-amber-950">Mudança crítica: </strong>
                    {sub.diferenca_critica_pegadinha}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* RETRACTABLE CO-PILOTO LATERAL DRAWER */}
      <CopilotSidebar
        tema={temaAtivo}
        perfilLabel={`${personaAtiva.nome} (${personaAtiva.papel} • RBAC: ${personaAtiva.rbac})`}
        personaId={personaAtiva.id}
        isOpenDrawer={isCopilotDrawerOpen}
        onToggleDrawer={() => setIsCopilotDrawerOpen(!isCopilotDrawerOpen)}
      />

      {/* 4. RODAPÉ INSTITUCIONAL BBTS (INSPIRADO NO BBTS.COM.BR) */}
      <footer className="bg-[#002D72] text-white border-t-4 border-[#F8D117] mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded bg-[#F8D117] text-[#002D72] font-black text-xs">
              BBTS
            </span>
            <span className="text-blue-100">
              BB Tecnologia e Serviços • Desafio 2 (Equipe Ctrl + Alt + Business)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-blue-200">
            <button
              onClick={() => {
                setActiveTab("governanca");
                setGovernanceSubTab("medalhao");
              }}
              className="hover:text-white cursor-pointer"
            >
              Transparência
            </button>
            <button
              onClick={() => {
                setActiveTab("governanca");
                setGovernanceSubTab("acesso");
              }}
              className="hover:text-white cursor-pointer"
            >
              Privacidade / LGPD
            </button>
            <button
              onClick={() => setIsCopilotDrawerOpen(true)}
              className="hover:text-white cursor-pointer"
            >
              Ouvidoria & Canais
            </button>
          </div>

          <div className="text-amber-300 font-semibold">
            Em caso de divergência, prevalece o documento oficial.
          </div>
        </div>
      </footer>
    </div>
  );
}
