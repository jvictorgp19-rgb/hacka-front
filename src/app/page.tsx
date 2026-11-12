"use client";

import React, { useState } from "react";
import acervo from "@/data/acervo_estruturado_acme_bbts.json";
import { PERSONAS_NOMINAIS, PersonaNominal } from "@/lib/api";
import DemoPitchBar, { DEMO_STEPS, DemoStepId } from "@/components/DemoPitchBar";
import GovernanceDifferentialsPanel from "@/components/GovernanceDifferentialsPanel";
import FeriasSimulators from "@/components/FeriasSimulators";
import InovacaoSimulators from "@/components/InovacaoSimulators";
import LocacaoSimulators from "@/components/LocacaoSimulators";
import CopilotSidebar from "@/components/CopilotSidebar";
import {
  ShieldCheck,
  AlertTriangle,
  CheckSquare,
  Square,
  UserCheck,
  Layers,
  Link2,
  BookOpen,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Lock,
  ExternalLink,
  Scale,
  RotateCcw,
  Users,
  BellRing,
} from "lucide-react";

type TemaKey = "ferias" | "inovacao" | "locacao";

const TEMAS_CONFIG: {
  id: TemaKey;
  label: string;
  sublabel: string;
  serieTag: string;
  codigosDocs: string[];
}[] = [
  {
    id: "ferias",
    label: "Férias (Série 1)",
    sublabel: "Gente e Cultura • NG_111 v3.0.0",
    serieTag: "1 - Gente e Cultura",
    codigosDocs: ["NG_111", "PX_1111-001", "FM_1111-001", "TB_1111-001", "FL_1111-001"],
  },
  {
    id: "inovacao",
    label: "Inovação - Ideias em Campo (Série 11)",
    sublabel: "Programas Institucionais • NG_1130 & RG_1100 v2.0.0",
    serieTag: "11 - Programas Institucionais",
    codigosDocs: ["NG_1130", "PX_1130-001", "RG_1100", "NT_2026-021"],
  },
  {
    id: "locacao",
    label: "Locação Coworking (Contratos)",
    sublabel: "Compras e Operações • CTR_2026-012 & NT_2026-018",
    serieTag: "Contratos & Instrumentos",
    codigosDocs: ["CTR_2026-012", "NT_2026-018"],
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
  diretoria_gfi_gju: "Diretoria DIRAF / GFI (Finanças) / GJU (Jurídico)",
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
  const [personaAtivaId, setPersonaAtivaId] = useState<string>("ana");
  const [activeDemoStep, setActiveDemoStep] = useState<DemoStepId | null>(1);
  const [temaAtivo, setTemaAtivo] = useState<TemaKey>("ferias");
  const [perfilPorTema, setPerfilPorTema] = useState<Record<TemaKey, string>>({
    ferias: "empregado",
    inovacao: "empregado",
    locacao: "fiscal_tecnico_goc",
  });
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [showSubstituidos, setShowSubstituidos] = useState<boolean>(false);
  const [showTaxonomiaModal, setShowTaxonomiaModal] = useState<boolean>(false);

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

  const handleSelectDemoStep = (stepId: DemoStepId) => {
    setActiveDemoStep(stepId);
    const meta = DEMO_STEPS.find((s) => s.id === stepId);
    if (meta) {
      handleSelectPersona(meta.personaId);
      setTemaAtivo(meta.tema);
      if (stepId === 2) {
        setShowSubstituidos(true);
      }
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

  // Calculate checklist progress for current profile & theme
  const totalCheckItems = dadosPerfil.checklist.length;
  const completedCheckItems = dadosPerfil.checklist.filter(
    (_, idx) => checkedItems[`${temaAtivo}__${perfilSelecionado}__${idx}`]
  ).length;
  const progressPct =
    totalCheckItems > 0 ? Math.round((completedCheckItems / totalCheckItems) * 100) : 0;

  const toggleCheckItem = (idx: number) => {
    const key = `${temaAtivo}__${perfilSelecionado}__${idx}`;
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const markAllChecklist = (value: boolean) => {
    const updates: Record<string, boolean> = {};
    dadosPerfil.checklist.forEach((_, idx) => {
      updates[`${temaAtivo}__${perfilSelecionado}__${idx}`] = value;
    });
    setCheckedItems((prev) => ({ ...prev, ...updates }));
  };

  const flMermaidDoc = acervo.documentos_acervo.find((d) => d.codigo === "FL_1111-001");
  const mermaidCode =
    (flMermaidDoc && "mermaid_code" in flMermaidDoc && flMermaidDoc.mermaid_code) || "";

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-900 flex flex-col pb-12">
      {/* 1. CABEÇALHO EXECUTIVO (IDENTIDADE BBTS / ACME + SELETOR DE 6 PERSONAS NOMINAIS) */}
      <header className="sticky top-0 z-30 bg-[#002D72] text-white shadow-lg border-b-4 border-[#FFCC00]">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3">
          {/* Top Bar: Brand & NG_010 Taxonomy Badge */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-white/15">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFCC00] text-[#002D72] flex flex-col items-center justify-center font-black shadow-md shrink-0">
                <span className="text-xs leading-none">RAIZ</span>
                <span className="text-[9px] font-extrabold tracking-tighter leading-none mt-0.5">
                  IQ 3.0
                </span>
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-sm sm:text-base font-black tracking-tight text-white">
                    Raiz IQ (Zero-Click) — Plataforma de Inteligência Normativa BBTS / ACME
                  </h1>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-[#FFCC00] text-[#002D72]">
                    Ctrl + Alt + Business • Iteração 3
                  </span>
                </div>
                <p className="text-[11px] text-blue-200">
                  {acervo.organizacao} • Governança {acervo.norma_mestra_taxonomia.codigo} (Taxonomia v
                  {acervo.norma_mestra_taxonomia.versao_taxonomia}) • Arquitetura Medalhão & Data Mesh
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowTaxonomiaModal(!showTaxonomiaModal)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-[#FFCC00] border border-white/20 transition cursor-pointer"
              >
                <Scale className="w-3.5 h-3.5" />
                Matriz {acervo.norma_mestra_taxonomia.codigo} & Alçadas NG_012
              </button>

              <button
                onClick={() => setShowSubstituidos(!showSubstituidos)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer border ${
                  showSubstituidos
                    ? "bg-amber-400 text-slate-950 border-amber-300 shadow-sm"
                    : "bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-400/40"
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Trava Histórica ({acervo.documentos_substituidos_bloqueados.length} Revogados)
              </button>
            </div>
          </div>

          {/* SEÇÃO 3 DA PROPOSTA: SELETOR DAS 6 PERSONAS NOMINAIS OFICIAIS (RBAC & ZERO-CLICK) */}
          <div className="py-2.5 border-b border-white/15">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#FFCC00] flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                Seletor de Personas Nominais da Demo (Alterna Papel, Unidade, Jornada e Nível RBAC):
              </span>
              <span className="text-[11px] text-blue-200 hidden md:inline">
                Persona Ativa: <strong className="text-white">{personaAtiva.nome}</strong> ({personaAtiva.papel} •{" "}
                <strong className="text-[#FFCC00]">RBAC: {personaAtiva.rbac}</strong>)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {PERSONAS_NOMINAIS.map((p) => {
                const isSelected = personaAtiva.id === p.id;
                const rbacBadgeColor =
                  p.rbac === "Sigilosa"
                    ? "bg-rose-500 text-white"
                    : p.rbac === "Restrita"
                    ? "bg-amber-400 text-slate-950"
                    : "bg-emerald-400 text-slate-950";

                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPersona(p.id)}
                    className={`p-2 rounded-xl text-left transition cursor-pointer border flex items-center gap-2.5 ${
                      isSelected
                        ? "bg-white text-[#002D72] border-[#FFCC00] ring-2 ring-[#FFCC00] shadow-md"
                        : "bg-blue-950/60 hover:bg-blue-900/70 text-white border-white/15"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg font-black text-xs flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "bg-[#002D72] text-[#FFCC00]"
                          : "bg-white/10 text-[#FFCC00]"
                      }`}
                    >
                      {p.avatarSigla}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-extrabold truncate">{p.nome}</span>
                        <span
                          className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded shrink-0 ${rbacBadgeColor}`}
                        >
                          {p.rbac}
                        </span>
                      </div>
                      <div
                        className={`text-[10px] truncate ${
                          isSelected ? "text-slate-700 font-semibold" : "text-blue-200"
                        }`}
                      >
                        {p.papel}
                      </div>
                      <div
                        className={`text-[9px] truncate ${
                          isSelected ? "text-[#002D72]/80 font-bold" : "text-blue-300/80"
                        }`}
                      >
                        {p.unidade}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Global Selectors Bar: (a) Seletor de Jornada/Tema & (b) Seletor de Perfil */}
          <div className="pt-2.5 grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
            <div className="lg:col-span-7 flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#FFCC00] shrink-0 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" />
                Jornada:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
                {TEMAS_CONFIG.map((t) => {
                  const active = temaAtivo === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTemaAtivo(t.id)}
                      className={`px-3 py-1.5 rounded-xl text-left transition cursor-pointer border flex flex-col justify-between ${
                        active
                          ? "bg-[#FFCC00] text-[#002D72] border-[#FFCC00] shadow-xs font-extrabold"
                          : "bg-white/10 hover:bg-white/15 text-white border-white/15"
                      }`}
                    >
                      <span className="text-xs font-extrabold leading-tight">{t.label}</span>
                      <span
                        className={`text-[10px] truncate ${
                          active ? "text-[#002D72]/80 font-semibold" : "text-blue-200"
                        }`}
                      >
                        {t.sublabel}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#FFCC00] shrink-0 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5" />
                Visão Técnica:
              </span>
              <div className="flex-1 flex flex-wrap gap-1.5">
                {perfisDisponiveis.map((chavePerfil) => {
                  const active = perfilSelecionado === chavePerfil;
                  return (
                    <button
                      key={chavePerfil}
                      onClick={() =>
                        setPerfilPorTema((prev) => ({ ...prev, [temaAtivo]: chavePerfil }))
                      }
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer border ${
                        active
                          ? "bg-white text-[#002D72] border-[#FFCC00] shadow-xs"
                          : "bg-blue-950/60 hover:bg-blue-900/70 text-blue-100 border-white/15"
                      }`}
                    >
                      {PERFIL_LABELS[chavePerfil] || chavePerfil}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Collapsible Taxonomy NG_010 & Alçadas NG_012 Reference Drawer */}
        {showTaxonomiaModal && (
          <div className="bg-slate-900 border-t border-white/15 text-white px-4 sm:px-6 py-4">
            <div className="max-w-[1600px] mx-auto space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-[#FFCC00]">
                    Governança Mestra: {acervo.norma_mestra_taxonomia.codigo} ({acervo.norma_mestra_taxonomia.titulo}) & Alçadas Financeiras NG_012
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {acervo.norma_mestra_taxonomia.regra_desambiguacao}
                  </p>
                </div>
                <button
                  onClick={() => setShowTaxonomiaModal(false)}
                  className="text-xs font-bold text-slate-300 hover:text-white px-2.5 py-1 rounded bg-white/10 cursor-pointer"
                >
                  Fechar ✕
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-8">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-blue-300 mb-2">
                    Séries de Numeração Oficial ({acervo.norma_mestra_taxonomia.codigo}):
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2">
                    {acervo.norma_mestra_taxonomia.series_numeracao.map((s) => (
                      <div
                        key={s.serie}
                        className={`p-2 rounded-lg border text-xs ${
                          s.serie === 1 || s.serie === 11 || s.serie === 4
                            ? "bg-[#002D72]/80 border-[#FFCC00]/60 text-white"
                            : "bg-white/5 border-white/10 text-slate-300"
                        }`}
                      >
                        <div className="font-extrabold text-[#FFCC00]">Série {s.serie}</div>
                        <div className="font-semibold text-[11px] truncate">{s.area}</div>
                        <div className="text-[10px] font-mono opacity-75">{s.faixa}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-4">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-blue-300 mb-2">
                    Tabela de Alçadas Financeiras (NG_012):
                  </div>
                  <div className="space-y-2">
                    {acervo.alcadas_financeiras_ng012.map((alc, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-white/5 border border-white/15 text-xs flex items-center justify-between"
                      >
                        <div>
                          <div className="font-extrabold text-[#FFCC00]">{alc.faixa}</div>
                          <div className="text-[11px] text-slate-300">
                            Geral: <strong>{alc.aprovador_geral}</strong>
                          </div>
                        </div>
                        <div className="text-right text-[11px] bg-blue-950 px-2 py-1 rounded border border-blue-800">
                          <span className="text-blue-300 block text-[10px]">Protótipo Inovação:</span>
                          <strong className="text-white">{alc.aprovador_inovacao_prototipo}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* MAIN WORKSPACE */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-5 space-y-6">
        {/* SEÇÃO 8 DA PROPOSTA: BARRA "ROTEIRO DE DEMO AO VIVO - 8 PASSOS" (ZERO-CLICK PITCH) */}
        <DemoPitchBar
          activeStep={activeDemoStep}
          onSelectStep={handleSelectDemoStep}
          onSwitchPersona={handleSelectPersona}
        />

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* LEFT / CENTER COLUMN (8 cols on XL) */}
          <div className="xl:col-span-8 space-y-6">
            {/* ÁREA DA PERSONA NOMINAL ATIVA + RESUMO UX + CHECKLIST ACIONÁVEL */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-[#002D72] via-[#00388c] to-[#002D72] text-white p-5 border-b border-blue-900 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#FFCC00] text-[#002D72] font-black text-sm flex items-center justify-center">
                      {personaAtiva.avatarSigla}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-base font-black text-white">
                          {personaAtiva.nome} — {personaAtiva.papel}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-[#FFCC00] text-[#002D72] text-[10px] font-black uppercase">
                          RBAC: {personaAtiva.rbac}
                        </span>
                      </div>
                      <div className="text-xs text-blue-200">
                        Unidade: {personaAtiva.unidade} • Visão Normativa:{" "}
                        {PERFIL_LABELS[perfilSelecionado] || perfilSelecionado}
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-white/10 text-[#FFCC00] border border-white/15">
                    ⚡ Zero-Click Feed Ativo
                  </span>
                </div>

                {/* Alertas Proativos Zero-Click da Persona Nominal */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {personaAtiva.alertasProativos.map((alerta, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-amber-400/15 border border-amber-300/40 text-xs text-amber-100 flex items-start gap-2"
                    >
                      <BellRing className="w-4 h-4 text-[#FFCC00] shrink-0 mt-0.5" />
                      <span className="font-medium leading-snug">{alerta}</span>
                    </div>
                  ))}
                </div>

                {/* Destaque do resumo_ux (Linguagem Simples / UX Writing) */}
                <div className="p-3.5 rounded-xl bg-white/10 border border-white/20 backdrop-blur-xs">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#FFCC00] mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Diretriz em Linguagem Simples (Resumo UX Writing do Perfil):
                  </div>
                  <p className="text-sm font-semibold text-white leading-relaxed">
                    “{dadosPerfil.resumo_ux}”
                  </p>
                </div>
              </div>

              {/* Interactive Actionable Checklist with Progress Bar */}
              <div className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div>
                    <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <CheckSquare className="w-4 h-4 text-[#002D72]" />
                      Checklist Acionável do Perfil ({completedCheckItems}/{totalCheckItems} concluídos)
                    </h2>
                    <p className="text-xs text-slate-500">
                      Marque os passos operacionais cumpridos para validar sua conformidade normativa
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => markAllChecklist(true)}
                      className="text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#002D72] transition cursor-pointer"
                    >
                      Marcar todos
                    </button>
                    <button
                      onClick={() => markAllChecklist(false)}
                      className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" /> Limpar
                    </button>
                  </div>
                </div>

                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-4 border border-slate-200">
                  <div
                    className="h-full bg-gradient-to-r from-[#002D72] via-blue-600 to-emerald-500 transition-all duration-300"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {dadosPerfil.checklist.map((item, idx) => {
                    const isChecked = !!checkedItems[`${temaAtivo}__${perfilSelecionado}__${idx}`];
                    return (
                      <button
                        key={idx}
                        onClick={() => toggleCheckItem(idx)}
                        className={`p-3.5 rounded-xl border text-left transition flex items-start gap-3 cursor-pointer ${
                          isChecked
                            ? "bg-emerald-50/70 border-emerald-500/50 text-emerald-950"
                            : "bg-slate-50/70 hover:bg-blue-50/40 border-slate-200 text-slate-800"
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                        <span
                          className={`text-xs font-medium leading-relaxed ${
                            isChecked ? "line-through opacity-80" : ""
                          }`}
                        >
                          {item}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* PAINEL "BATER O OLHO" (GOVERNANÇA E TAXONOMIA NG_010) */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#002D72] text-[#FFCC00]">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-extrabold text-base text-slate-900">
                        Painel “Bater o Olho” — Governança e Taxonomia ({acervo.norma_mestra_taxonomia.codigo})
                      </h2>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {documentosTema.length} Documentos Vigentes no Tema
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Desambiguação hierárquica obrigatória via campo{" "}
                      <code className="px-1 py-0.5 rounded bg-slate-200 text-[#002D72] font-bold">
                        vinculado_a
                      </code>{" "}
                      ({acervo.norma_mestra_taxonomia.regra_aprovacao_geral})
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowSubstituidos(!showSubstituidos)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer border-2 ${
                    showSubstituidos
                      ? "bg-amber-400 text-slate-950 border-amber-600 shadow-sm"
                      : "bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-400"
                  }`}
                >
                  <AlertTriangle className="w-4 h-4 text-amber-700" />
                  Ver Versões Substituídas (Trava Histórica)
                  {showSubstituidos ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>

              <div className="px-5 py-3 bg-blue-50/70 border-b border-blue-200/80 flex items-start gap-2.5 text-xs text-slate-700">
                <Link2 className="w-4 h-4 text-[#002D72] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#002D72]">
                    Regra de Desambiguação ({acervo.norma_mestra_taxonomia.codigo}):
                  </strong>{" "}
                  {acervo.norma_mestra_taxonomia.regra_desambiguacao}
                </div>
              </div>

              {showSubstituidos && (
                <div className="p-5 bg-amber-50/90 border-b-2 border-amber-400 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Lock className="w-5 h-5 text-amber-800" />
                      <h3 className="font-black text-sm sm:text-base text-amber-950 uppercase tracking-tight">
                        Trava Histórica — Documentos Substituídos e Bloqueados na Camada Silver
                      </h3>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-600 text-white">
                      Proibido utilizar como fundamento normativo
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {acervo.documentos_substituidos_bloqueados.map((sub) => (
                      <div
                        key={`${sub.codigo}-${sub.versao}`}
                        className="bg-white rounded-xl border-2 border-amber-400 p-4 shadow-xs flex flex-col justify-between space-y-3"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="px-2.5 py-0.5 rounded bg-slate-900 text-[#FFCC00] font-mono font-extrabold text-xs">
                              {sub.codigo} v{sub.versao}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[11px]">
                              Fase: {sub.fase}
                            </span>
                          </div>
                          <h4 className="font-bold text-sm text-slate-900">{sub.titulo}</h4>
                          <div className="text-[11px] text-slate-600 mt-1 space-y-0.5">
                            {"vigencia_original" in sub && sub.vigencia_original && (
                              <div>
                                <strong>Vigência original impressa:</strong> {sub.vigencia_original}
                              </div>
                            )}
                            {"aprovado_em" in sub && sub.aprovado_em && (
                              <div>
                                <strong>Aprovado em:</strong> {sub.aprovado_em}
                              </div>
                            )}
                            <div className="text-emerald-800 font-semibold">
                              <strong>Substituído por:</strong> {sub.substituido_por}
                            </div>
                          </div>
                        </div>

                        <div className="p-3 rounded-lg bg-[#FFCC00]/35 border-2 border-[#FFCC00] text-slate-950">
                          <div className="text-[10px] font-black uppercase tracking-wider text-amber-950 mb-1 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-800 shrink-0" />
                            Diferença Crítica / Pegadinha:
                          </div>
                          <p className="text-xs font-semibold leading-snug">
                            {sub.diferenca_critica_pegadinha}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Vigentes Cards Grid */}
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                {documentosTema.map((doc) => {
                  const gov = doc.governanca as Record<string, unknown>;
                  const dono =
                    (gov.dono_elaborador as string) ||
                    (gov.dono_gestor_contrato as string) ||
                    "N/A";
                  const aprovador = (gov.aprovador as string) || "N/A";
                  const fiscal =
                    (gov.fiscal_tecnico as string) ||
                    (gov.unidade_demandante as string) ||
                    null;

                  const vigenciaTexto =
                    "vigencia_inicio" in doc && doc.vigencia_inicio
                      ? `${doc.vigencia_inicio} a ${doc.vigencia_fim} (${doc.regra_vigencia})`
                      : "aprovado_em" in doc && doc.aprovado_em
                      ? `Aprovado em ${doc.aprovado_em} (${doc.regra_vigencia})`
                      : doc.regra_vigencia;

                  const resumoTexto =
                    "resumo_legal_design" in doc && doc.resumo_legal_design
                      ? doc.resumo_legal_design.o_que_e
                      : "Fluxograma oficial do processo operacional no Portal Raiz.";

                  const pdfUrl = PDF_LINKS[doc.codigo];

                  return (
                    <div
                      key={doc.codigo}
                      className="rounded-xl border border-slate-200 hover:border-[#002D72]/50 bg-white p-4 shadow-2xs transition flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-lg bg-[#002D72] text-[#FFCC00] font-mono font-extrabold text-xs">
                              {doc.codigo}
                            </span>
                            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                              v{doc.versao}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-600">
                              {doc.categoria}
                            </span>
                          </div>

                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            {doc.fase}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-extrabold text-base text-slate-900">
                            {doc.titulo}
                          </h3>
                          {pdfUrl && (
                            <a
                              href={pdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#002D72] hover:underline shrink-0"
                            >
                              Abrir PDF <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
                          Série: <strong className="text-slate-700">{doc.serie}</strong> • Grupo:{" "}
                          <strong className="text-slate-700">{doc.grupo}</strong>
                        </div>

                        <p className="text-xs text-slate-700 mt-2.5 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                          {resumoTexto}
                        </p>

                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/70">
                            <span className="text-[10px] font-bold uppercase text-slate-400 block">
                              Quem é o Dono (Data Mesh)
                            </span>
                            <span className="font-bold text-slate-800">{dono}</span>
                          </div>

                          <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/70">
                            <span className="text-[10px] font-bold uppercase text-slate-400 block">
                              Quem Aprova (Alçada NG_012)
                            </span>
                            <span className="font-bold text-slate-800">{aprovador}</span>
                          </div>

                          {fiscal && (
                            <div className="p-2 rounded-lg bg-blue-50/60 border border-blue-200/60 sm:col-span-2">
                              <span className="text-[10px] font-bold uppercase text-[#002D72] block">
                                Fiscal Técnico / Unidade Demandante
                              </span>
                              <span className="font-bold text-[#002D72]">{fiscal}</span>
                            </div>
                          )}

                          <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/70 sm:col-span-2">
                            <span className="text-[10px] font-bold uppercase text-slate-400 block">
                              Vigência e Regra ({acervo.norma_mestra_taxonomia.codigo})
                            </span>
                            <span className="font-semibold text-slate-700">{vigenciaTexto}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-500">vinculado_a:</span>
                          {doc.vinculado_a ? (
                            <span className="px-2 py-0.5 rounded bg-blue-100 text-[#002D72] font-mono font-extrabold">
                              {doc.vinculado_a}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold text-[11px]">
                              Norma Raiz da Série (Topo Hierárquico)
                            </span>
                          )}
                        </div>

                        {"substitui" in doc && doc.substitui && (
                          <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                            Substitui: {doc.substitui}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* SIMULADORES INTERATIVOS POR JORNADA (CUSTO R$ 0,00 DETERMINÍSTICO) */}
            <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-black text-[#002D72] tracking-tight flex items-center gap-2">
                    Simuladores Determinísticos (Zero-Click) — {configTema.label}
                  </h2>
                  <p className="text-xs text-slate-600">
                    Cálculos em tempo real alimentados pelo nó{" "}
                    <code className="px-1.5 py-0.5 rounded bg-slate-200 text-[#002D72] font-bold">
                      regras_simuladores
                    </code>{" "}
                    da Camada Gold
                  </p>
                </div>
                <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  ⚡ Custo: R$ 0,00 (Calculadora Determinística / Cache)
                </span>
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
            </section>

            {/* SEÇÕES 1, 4, 5 E 6 DA PROPOSTA: DIFERENCIAIS DE GOVERNANÇA, CUSTO, AUDITOR MEDALHÃO E E-MAIL */}
            <GovernanceDifferentialsPanel />
          </div>

          {/* RIGHT COLUMN: CO-PILOTO EXECUTIVO LATERAL (4 cols on XL) */}
          <div className="xl:col-span-4">
            <CopilotSidebar
              tema={temaAtivo}
              perfilLabel={`${personaAtiva.nome} (${personaAtiva.papel} • RBAC: ${personaAtiva.rbac})`}
              personaId={personaAtiva.id}
            />
          </div>
        </div>
      </main>

      {/* RODAPÉ FIXO DE LEGAL DESIGN EXIGIDO PELA PROPOSTA */}
      <footer className="fixed bottom-0 left-0 right-0 z-30 bg-slate-950/95 backdrop-blur-xs text-slate-200 text-xs py-2.5 px-4 sm:px-6 border-t-2 border-[#FFCC00] shadow-lg">
        <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-[#FFCC00] text-[#002D72] font-black text-[10px]">
              RAIZ IQ • LEGAL DESIGN
            </span>
            <span className="font-extrabold text-amber-300">
              ⚖️ Em caso de divergência, prevalece o documento oficial.
            </span>
          </div>
          <div className="hidden md:flex items-center gap-3 text-[11px] text-slate-400">
            <span>
              Equipe <strong className="text-white">Ctrl + Alt + Business</strong>
            </span>
            <span>•</span>
            <span>
              Cliente FastAPI: <code className="text-[#FFCC00]">src/lib/api.ts</code> (Fallback Local Ativo)
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
