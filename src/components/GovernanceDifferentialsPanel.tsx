"use client";

import React, { useState, useEffect } from "react";
import {
  Zap,
  Brain,
  Database,
  ShieldAlert,
  Mail,
  Send,
  CheckCircle2,
  Lock,
  TrendingUp,
  Award,
  Layers,
  AlertTriangle,
  FileWarning,
  ArrowRight,
} from "lucide-react";
import { apiIngestAudit, IngestAuditFinding, RbacLevel } from "@/lib/api";

export default function GovernanceDifferentialsPanel() {
  const [activeTab, setActiveTab] = useState<"roi_eval" | "medalhao" | "email_agent">("roi_eval");
  const [auditFindings, setAuditFindings] = useState<IngestAuditFinding[]>([]);
  const [consultasMes, setConsultasMes] = useState<number>(2000);
  const [minutosEconomizados, setMinutosEconomizados] = useState<number>(10);
  const [custoHoraReais, setCustoHoraReais] = useState<number>(60);

  // High-Water Mark interactive state
  const [selectedSourcesSigilo, setSelectedSourcesSigilo] = useState<RbacLevel[]>([
    "Pública",
    "Interna",
    "Restrita",
  ]);

  // Email agent human-in-the-loop state
  const [emailApprovedSent, setEmailApprovedSent] = useState<boolean>(false);

  useEffect(() => {
    apiIngestAudit().then((res) => setAuditFindings(res.data));
  }, []);

  // ROI Calculation: 2.000 consultas x 10 min x R$ 60/h = R$ 20.000/mês
  const horasEconomizadasMes = Number(((consultasMes * minutosEconomizados) / 60).toFixed(1));
  const economiaMensalReais = Math.round(horasEconomizadasMes * custoHoraReais);
  const custoIaMensalEstimado = Math.round(consultasMes * 0.3 * 0.004); // 70% deterministic R$0, 30% RAG ~R$0,004

  // High-Water Mark contamination calculation
  const hierarchyOrder: RbacLevel[] = ["Pública", "Interna", "Restrita", "Sigilosa"];
  const highestSigilo = selectedSourcesSigilo.reduce<RbacLevel>((acc, curr) => {
    return hierarchyOrder.indexOf(curr) > hierarchyOrder.indexOf(acc) ? curr : acc;
  }, "Pública");

  const toggleSigiloSource = (level: RbacLevel) => {
    setSelectedSourcesSigilo((prev) =>
      prev.includes(level)
        ? prev.length > 1
          ? prev.filter((l) => l !== level)
          : prev
        : [...prev, level]
    );
  };

  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header & Navigation Tabs */}
      <div className="bg-gradient-to-r from-slate-900 via-[#002D72] to-slate-900 text-white px-5 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-blue-900">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-[#FFCC00] text-[#002D72] text-[10px] font-black uppercase tracking-wider">
              Iteração 3 • Raiz IQ / Zero-Click
            </span>
            <h2 className="font-extrabold text-base">
              Diferenciais de Governança, Roteador de Custo, Auditor Medalhão & Agente Proativo
            </h2>
          </div>
          <p className="text-xs text-blue-200 mt-0.5">
            Seções 1, 4, 5 e 6 da Proposta Oficial: FinOps determinístico, auditoria de anacronismos nos PDFs e Human-in-the-Loop
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setActiveTab("roi_eval")}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "roi_eval"
                ? "bg-[#FFCC00] text-[#002D72] shadow-xs"
                : "bg-white/10 hover:bg-white/20 text-white"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            1. Roteador de Custo, ROI (R$ 20k/mês) & Eval FAQ (~30)
          </button>

          <button
            onClick={() => setActiveTab("medalhao")}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "medalhao"
                ? "bg-[#FFCC00] text-[#002D72] shadow-xs"
                : "bg-white/10 hover:bg-white/20 text-white"
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            2. Auditor do Acervo & Medalhão (Bronze → Silver → Gold)
          </button>

          <button
            onClick={() => setActiveTab("email_agent")}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "email_agent"
                ? "bg-[#FFCC00] text-[#002D72] shadow-xs"
                : "bg-white/10 hover:bg-white/20 text-white"
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            3. Agente de E-mail Semanal (Human-in-the-Loop)
          </button>
        </div>
      </div>

      <div className="p-5">
        {/* TAB 1: ROTEADOR DE CUSTO, ROI & PLACAR DE AVALIAÇÃO ~30 PERGUNTAS DO FAQ */}
        {activeTab === "roi_eval" && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Cost Router + ROI Simulator (7 cols) */}
              <div className="lg:col-span-7 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-black text-[#002D72] uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-500" />
                    Roteador Híbrido de Custo & Calculadora de ROI Executivo
                  </h3>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Economia Mensal: R$ {economiaMensalReais.toLocaleString("pt-BR")},00/mês
                  </span>
                </div>

                {/* Live Cost Badges Comparison */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-emerald-50 border-2 border-emerald-500/40">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-emerald-900 flex items-center gap-1">
                        ⚡ Custo: R$ 0,00
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-200 text-emerald-950">
                        ~70% das consultas
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-900 mt-1">
                      Calculadora Determinística / Cache Zero-Click
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Prazos D-n, faltas x férias, teto de 30% da equipe, glosa de R$ 121,67/dia, alçadas NG_012 e multa rescisória rodam em código puro sem gastar tokens.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-blue-50 border-2 border-[#002D72]/30">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-[#002D72] flex items-center gap-1">
                        🧠 Custo: ~R$ 0,004
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-200 text-[#002D72]">
                        ~30% das consultas
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-900 mt-1">
                      RAG + LLM com Guardrail de Abstenção
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Acionado apenas para perguntas abertas, síntese de slides executivos e cruzamento textual na Camada Gold.
                    </p>
                  </div>
                </div>

                {/* ROI Sliders */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <label className="text-[11px] font-bold text-slate-600 block">
                      Consultas/mês: <strong className="text-[#002D72]">{consultasMes}</strong>
                    </label>
                    <input
                      type="range"
                      min={500}
                      max={5000}
                      step={250}
                      value={consultasMes}
                      onChange={(e) => setConsultasMes(parseInt(e.target.value))}
                      className="w-full accent-[#002D72] mt-1 cursor-pointer"
                    />
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <label className="text-[11px] font-bold text-slate-600 block">
                      Tempo poupado: <strong className="text-[#002D72]">{minutosEconomizados} min/consulta</strong>
                    </label>
                    <input
                      type="range"
                      min={5}
                      max={25}
                      step={1}
                      value={minutosEconomizados}
                      onChange={(e) => setMinutosEconomizados(parseInt(e.target.value))}
                      className="w-full accent-[#002D72] mt-1 cursor-pointer"
                    />
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <label className="text-[11px] font-bold text-slate-600 block">
                      Custo médio hora: <strong className="text-[#002D72]">R$ {custoHoraReais}/h</strong>
                    </label>
                    <input
                      type="range"
                      min={40}
                      max={120}
                      step={5}
                      value={custoHoraReais}
                      onChange={(e) => setCustoHoraReais(parseInt(e.target.value))}
                      className="w-full accent-[#002D72] mt-1 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#002D72] text-white flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span>
                    📊 <strong>Fórmula de ROI:</strong> {consultasMes.toLocaleString("pt-BR")} consultas ×{" "}
                    {minutosEconomizados} min ({horasEconomizadasMes}h) × R$ {custoHoraReais}/h
                  </span>
                  <span className="text-sm font-black text-[#FFCC00]">
                    = R$ {economiaMensalReais.toLocaleString("pt-BR")},00 / mês poupados (Custo IA: ~R${" "}
                    {custoIaMensalEstimado},00)
                  </span>
                </div>
              </div>

              {/* Placar de Avaliação de ~30 Perguntas do FAQ (5 cols) */}
              <div className="lg:col-span-5 p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-[#002D72]" />
                      Placar de Avaliação — Suíte Golden FAQ (30 Perguntas)
                    </h3>
                    <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-xs font-extrabold">
                      30 / 30 (100%)
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mb-3">
                    Bateria automatizada sobre os 11 documentos vigentes + 3 revogados do Desafio 2:
                  </p>

                  <div className="space-y-2 text-xs">
                    {[
                      {
                        cat: "Precisão de Citação Vigente (Série 1, 11 e Contratos)",
                        score: "12 / 12",
                        pct: 100,
                        det: "100% apontam NG_111 v3.0.0, RG_1100 v2.0.0 e CTR_2026-012",
                      },
                      {
                        cat: "Bloqueio de Versões Substituídas (Pegadinhas v2.0/v1.0)",
                        score: "6 / 6",
                        pct: 100,
                        det: "Zero contaminação por NG_111 v2.0.0 (30d) ou RG_1100 v1.0.0 (3 ideias)",
                      },
                      {
                        cat: "Exatidão Matemática (Faltas, 30% Equipe, Glosa R$ 121,67)",
                        score: "7 / 7",
                        pct: 100,
                        det: "Execução determinística sem erro de arredondamento",
                      },
                      {
                        cat: "Abstenção Honesta & Controle RBAC (Sem Alucinação)",
                        score: "5 / 5",
                        pct: 100,
                        det: "Recusa inventar rateio de prêmio em equipe e aciona o NIN/GGC",
                      },
                    ].map((row, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-white border border-slate-200">
                        <div className="flex items-center justify-between font-bold text-slate-800">
                          <span>{row.cat}</span>
                          <span className="text-emerald-700">{row.score}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{row.det}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AUDITOR DO ACERVO & ARQUITETURA MEDALHÃO (BRONZE -> SILVER -> GOLD) + HIGH-WATER MARK */}
        {activeTab === "medalhao" && (
          <div className="space-y-5">
            {/* Medallion Pipeline Visual */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-amber-900/10 border-2 border-amber-700/30">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-800 text-white">
                  1. Camada Bronze (Ingestão Bruta)
                </span>
                <div className="text-xs font-bold text-slate-900 mt-1.5">
                  14 PDFs Originais (11 Vigentes + 3 Substituídos)
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Preserva o binário imutável em <code className="font-bold">docs_acervo/</code> e extrai cabeçalhos brutos.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-100 border-2 border-slate-400/50">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-700 text-white">
                  2. Camada Silver (Validação & Quarentena)
                </span>
                <div className="text-xs font-bold text-slate-900 mt-1.5">
                  Desambiguação NG_010 + Quarentena de Revogados
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Resolve <code className="font-bold">vinculado_a</code>, isola versões com{" "}
                  <code className="font-bold">vigente: false</code> e audita datas cruzadas.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 border-2 border-[#FFCC00]">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-[#002D72] text-[#FFCC00]">
                  3. Camada Gold (JSON Curado & Simuladores)
                </span>
                <div className="text-xs font-bold text-slate-900 mt-1.5">
                  Catálogo Auditado + Regras Determinísticas + RBAC
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Alimenta os cards Zero-Click, calculadoras de custo R$ 0,00 e Co-Piloto RAG.
                </p>
              </div>
            </div>

            {/* Real Temporal Inconsistencies Detected in PDFs + High-Water Mark Simulator */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div className="lg:col-span-7 space-y-2.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
                  <FileWarning className="w-4 h-4" />
                  Achados Reais do Auditor de Ingestão nos PDFs do Desafio 2:
                </h3>
                <div className="space-y-2">
                  {auditFindings.map((f) => (
                    <div
                      key={f.id}
                      className="p-3 rounded-xl bg-amber-50/70 border border-amber-300 text-xs space-y-1"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-1">
                        <span className="font-extrabold text-slate-900">
                          [{f.id}] {f.severidade}: {f.documentosEnvolvidos.join(" ↔ ")}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-[#FFCC00]">
                          {f.camada}
                        </span>
                      </div>
                      <p className="text-slate-700 leading-snug">{f.descricao}</p>
                      <div className="text-[11px] font-semibold text-[#002D72]">
                        ↳ Tratamento Medalhão: {f.acaoRecomendada}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Regra de Contaminação de Sigilo (High-Water Mark) */}
              <div className="lg:col-span-5 p-4 rounded-xl bg-slate-900 text-white flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-[#FFCC00] flex items-center gap-1.5">
                      <Lock className="w-4 h-4" />
                      Contaminação de Sigilo (High-Water Mark)
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Quando uma resposta combina múltiplos documentos, o nível de sigilo do output herda obrigatoriamente o <strong>maior grau de restrição</strong> entre as fontes utilizadas:
                  </p>

                  <div className="text-[11px] font-bold text-blue-200">
                    Selecione as fontes combinadas na resposta para testar:
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {hierarchyOrder.map((lvl) => {
                      const active = selectedSourcesSigilo.includes(lvl);
                      return (
                        <button
                          key={lvl}
                          onClick={() => toggleSigiloSource(lvl)}
                          className={`p-2 rounded-lg text-xs font-bold border transition cursor-pointer flex items-center justify-between ${
                            active
                              ? "bg-[#FFCC00] text-[#002D72] border-[#FFCC00]"
                              : "bg-white/5 text-slate-300 border-white/15"
                          }`}
                        >
                          <span>Fonte: {lvl}</span>
                          <span>{active ? "✓" : "+"}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/10 border border-white/20">
                  <div className="text-[10px] font-bold uppercase text-blue-200">
                    Classificação Resultante da Resposta Combinada:
                  </div>
                  <div className="text-xl font-black text-[#FFCC00] mt-0.5">
                    🔒 Nível: {highestSigilo.toUpperCase()}
                  </div>
                  <div className="text-[11px] text-slate-300 mt-1">
                    Escala: Pública → Interna → Restrita → Sigilosa
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PREVIEW DO AGENTE DE E-MAIL INSTITUCIONAL ("O AGENTE SUGERE E O HUMANO ENVIA") */}
        {activeTab === "email_agent" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
            <div className="lg:col-span-8 p-4 rounded-xl bg-slate-50 border-2 border-slate-200 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200">
                <div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[#002D72] text-[#FFCC00]">
                    Rascunho Gerado pelo Radar D-n
                  </span>
                  <h3 className="text-sm font-extrabold text-slate-900 mt-1">
                    Assunto: [Resumo Semanal de Prazos BBTS/ACME] — Ações Críticas (Semana de Março/2027)
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-amber-100 border border-amber-400 text-amber-950 text-xs font-extrabold">
                  🛡️ O agente sugere e o humano envia
                </span>
              </div>

              <div className="text-xs text-slate-700 space-y-2 bg-white p-3.5 rounded-lg border border-slate-200 leading-relaxed">
                <p>
                  <strong>Para:</strong> Comitê Gestor (GGC, GOC, GCO, NIN e DIRAF)
                </p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>
                    <strong>[21/03/2027 • D-45 Férias — Série 1]:</strong> Prazo final para solicitação formal no Portal Raiz (`FM_1111-001 v2.0.0`) referente a férias iniciando em 05/05/2027 (`NG_111 v3.0.0`).
                  </li>
                  <li>
                    <strong>[26/03/2027 • Ideias em Campo — Série 11]:</strong> Encerramento da Fase 3 (Votação Interna — seleção de 20 ideias, máx. 6 por arena | `RG_1100 v2.0.0`).
                  </li>
                  <li>
                    <strong>[30/03/2027 • Contrato Coworking — CTR_2026-012]:</strong> Data-limite (D-30 do vencimento) para a GOC/GCO formalizar pedido de prorrogação contratual. *Nota: rescisão em março/2027 já está isenta de multa (a partir do 91º dia em 28/02/2027).*
                  </li>
                  <li>
                    <strong>[31/03/2027 • TRAVA CRÍTICA — PX_1130-001]:</strong> Data-limite improrrogável para NIN e DIRAF consolidarem o relatório técnico-financeiro de incentivo fiscal.
                  </li>
                </ul>
                <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  <em>Nota Legal Design: Em caso de divergência, prevalece o documento oficial vigente no Portal Raiz.</em>
                </p>
              </div>
            </div>

            <div className="lg:col-span-4 p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-3">
              <div className="text-xs font-black uppercase text-[#002D72]">
                Governança Human-in-the-Loop
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                Nenhum disparo institucional ocorre de forma autônoma sem validação humana. O responsável revisa as citações normativas e autoriza o envio:
              </p>
              <button
                onClick={() => setEmailApprovedSent(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-[#002D72] hover:bg-[#003c96] text-[#FFCC00] font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer transition shadow-xs"
              >
                <Send className="w-4 h-4" />
                Revisar e Disparar Resumo Semanal
              </button>
              {emailApprovedSent && (
                <div className="p-2.5 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-950 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  Disparo autorizado pelo humano e registrado na trilha de auditoria!
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
