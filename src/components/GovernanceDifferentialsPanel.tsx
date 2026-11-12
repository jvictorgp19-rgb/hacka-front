"use client";

import React, { useState, useEffect } from "react";
import { Radar, Lock, Database, TrendingUp, Send, CheckCircle2, FileWarning, Presentation, Mail, UserCheck, ShieldCheck, Award } from "lucide-react";
import {
  apiIngestAudit,
  apiRadar,
  apiAccessList,
  IngestAuditFinding,
  RadarEvent,
  AccessRequestItem,
  RbacLevel,
} from "@/lib/api";

export type GovernanceSubTab = "radar" | "acesso" | "medalhao" | "finops_ppt";

interface GovernanceDifferentialsPanelProps {
  initialSubTab?: GovernanceSubTab;
  onSwitchPersona?: (personaId: string) => void;
}

export default function GovernanceDifferentialsPanel({
  initialSubTab = "radar",
  onSwitchPersona,
}: GovernanceDifferentialsPanelProps) {
  const [tabChoice, setTabChoice] = useState({ base: initialSubTab, value: initialSubTab });
  const subTab = tabChoice.base === initialSubTab ? tabChoice.value : initialSubTab;
  const setSubTab = (value: GovernanceSubTab) => setTabChoice({ base: initialSubTab, value });
  const [radarEvents, setRadarEvents] = useState<RadarEvent[]>([]);
  const [accessRequests, setAccessRequests] = useState<AccessRequestItem[]>([]);
  const [auditFindings, setAuditFindings] = useState<IngestAuditFinding[]>([]);

  // Sub-tab (b) Access & Curated Response state
  const [rbacStage, setRbacStage] = useState<"blocked" | "requested" | "curated_approved">(
    "requested"
  );
  const [curatedResponseText, setCuratedResponseText] = useState<string>(
    "Orientação Oficial Curada GGC #2026-89: Para cancelamento de férias a partir de D-19 por necessidade de serviço (autorizado pelo Diretor da área), o ressarcimento cobre despesas não reembolsáveis comprovadas em até 15 dias corridos, limitado a R$ 2.500,00 (NG_111 v3.0.0 item 4.9), pago na folha seguinte pela GFI sem expor dados salariais restritos."
  );

  // Sub-tab (c) High-Water Mark state
  const [selectedSourcesSigilo, setSelectedSourcesSigilo] = useState<RbacLevel[]>([
    "Pública",
    "Interna",
    "Restrita",
  ]);

  // Sub-tab (d) FinOps & PPT/Email state
  const [consultasMes, setConsultasMes] = useState<number>(2000);
  const [minutosEconomizados, setMinutosEconomizados] = useState<number>(10);
  const [custoHoraReais, setCustoHoraReais] = useState<number>(60);
  const [activeSlide, setActiveSlide] = useState<number>(1);
  const [emailApprovedSent, setEmailApprovedSent] = useState<boolean>(false);

  useEffect(() => {
    apiRadar().then((r) => setRadarEvents(r.data));
    apiAccessList().then((a) => setAccessRequests(a.data));
    apiIngestAudit().then((i) => setAuditFindings(i.data));
  }, []);

  const horasEconomizadasMes = Number(((consultasMes * minutosEconomizados) / 60).toFixed(1));
  const economiaMensalReais = Math.round(horasEconomizadasMes * custoHoraReais);

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
    <div className="space-y-6">
      {/* Clean Sub-navigation Header */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#E2E8F0]">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0038A8]">
              Governança Corporativa & Conformidade
            </span>
            <h2 className="text-xl font-bold text-[#002D72] mt-0.5">
              Central de Radar, Data Mesh, Auditoria Medalhão e FinOps
            </h2>
          </div>

          {/* 4 Clean Sub-tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: "radar", label: "a) Radar de Prazos", icon: Radar },
              { id: "acesso", label: "b) Acesso & Resposta Curada", icon: Lock },
              { id: "medalhao", label: "c) Auditor & Medalhão", icon: Database },
              { id: "finops_ppt", label: "d) FinOps & Resumo Executivo", icon: TrendingUp },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = subTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSubTab(tab.id as GovernanceSubTab)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-2 border ${
                    isSelected
                      ? "bg-[#0038A8] text-white border-[#002D72] shadow-2xs"
                      : "bg-[#F8FAFC] hover:bg-slate-100 text-slate-700 border-[#E2E8F0]"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-[#F8D117]" : "text-[#0038A8]"}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* SUB-ABA (A): RADAR DE PRAZOS */}
        {subTab === "radar" && (
          <div className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600">
                Monitoramento proativo de marcos contratuais (`CTR_2026-012`), travas fiscais (`PX_1130-001`) e janelas operacionais:
              </p>
              <span className="text-xs font-medium text-slate-500">
                ⚡ Custo: R$ 0,00 (Motor Determinístico)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {radarEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="p-5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-[#0038A8] bg-blue-50 px-2.5 py-1 rounded border border-blue-100">
                        📅 {ev.dataLimite}
                      </span>
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                          ev.criticidade === "Crítica"
                            ? "bg-amber-100 text-amber-900"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        Prioridade {ev.criticidade}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mt-3">{ev.titulo}</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{ev.detalhe}</p>
                  </div>

                  <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-slate-500">
                    <span>Fonte: <strong className="text-slate-700">{ev.documento}</strong></span>
                    <span>Responsável: <strong className="text-[#002D72]">{ev.responsavel}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUB-ABA (B): PEDIDOS DE ACESSO & RESPOSTA CURADA (DATA MESH) */}
        {subTab === "acesso" && (
          <div className="pt-6 space-y-6">
            <p className="text-sm text-slate-600">
              Fluxo de Governança Data Mesh: quando um documento possui restrição RBAC, o dono do domínio (`GGC` / `NIN`) responde via <strong>Resposta Curada</strong> sem abrir o PDF restrito original.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Step 1 */}
              <div className="p-5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#002D72] flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-[#0038A8]" /> 1. Solicitação RBAC
                  </span>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                    Nível: Restrita
                  </span>
                </div>
                {accessRequests[0] && (
                  <div className="text-xs text-slate-600 space-y-1.5">
                    <div>
                      <strong>Solicitante:</strong> {accessRequests[0].solicitante}
                    </div>
                    <div>
                      <strong>Dono do Domínio:</strong> {accessRequests[0].dominioDono}
                    </div>
                    <p className="p-3 rounded-lg bg-white border border-[#E2E8F0] text-slate-700">
                      &ldquo;{accessRequests[0].perguntaOriginal}&rdquo;
                    </p>
                  </div>
                )}
                <button
                  onClick={() => {
                    setRbacStage("requested");
                    onSwitchPersona?.("curadora_ggc");
                  }}
                  className="w-full py-2 rounded-lg bg-[#0038A8] hover:bg-[#002D72] text-white font-semibold text-xs transition cursor-pointer"
                >
                  Alternar para Visão da Curadora GGC
                </button>
              </div>

              {/* Step 2 */}
              <div className="p-5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#002D72] flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-[#0038A8]" /> 2. Emissão de Resposta Curada
                  </span>
                  <span className="text-[11px] text-slate-500">PDF mantido fechado</span>
                </div>
                <textarea
                  rows={4}
                  value={curatedResponseText}
                  onChange={(e) => setCuratedResponseText(e.target.value)}
                  className="w-full text-xs p-3 rounded-lg border border-[#E2E8F0] bg-white text-slate-800 focus:outline-none focus:border-[#0038A8]"
                />
                <button
                  onClick={() => setRbacStage("curated_approved")}
                  className="w-full py-2.5 rounded-lg bg-[#F8D117] hover:bg-[#FFCC00] text-[#002D72] font-bold text-xs transition cursor-pointer"
                >
                  Aprovar via RESPOSTA CURADA
                </button>
              </div>

              {/* Step 3 */}
              <div className="p-5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#002D72] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> 3. Trilha de Auditoria
                  </span>
                  <span className="text-[11px] font-medium text-emerald-700">Imutável</span>
                </div>
                {rbacStage === "curated_approved" ? (
                  <div className="space-y-2 text-xs">
                    <div className="p-3 rounded-lg bg-white border border-emerald-200 text-slate-700 space-y-1">
                      <div className="font-bold text-emerald-800">
                        Protocolo #AUD-2026-991 • Aprovado
                      </div>
                      <div> Aprovadora: Curadora da GGC</div>
                      <div> Modalidade: Resposta Curada (Sem exposição de folha)</div>
                    </div>
                    <p className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-[#E2E8F0]">
                      {curatedResponseText}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 py-8 text-center">
                    Clique em &ldquo;Aprovar via RESPOSTA CURADA&rdquo; para registrar na trilha de auditoria.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SUB-ABA (C): AUDITOR DO ACERVO & ARQUITETURA MEDALHÃO */}
        {subTab === "medalhao" && (
          <div className="pt-6 space-y-6">
            {/* Clean 3-Layer Medallion Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  camada: "Camada Bronze",
                  sub: "Ingestão Bruta Imutável",
                  desc: "Armazena os 14 PDFs originais em docs_acervo/vigentes e docs_acervo/substituidos.",
                },
                {
                  camada: "Camada Silver",
                  sub: "Validação, Desambiguação & Quarentena",
                  desc: "Verifica o campo vinculado_a (NG_010), isola versões substituídas e aponta anacronismos de datas.",
                },
                {
                  camada: "Camada Gold",
                  sub: " Acervo Estruturado & Simuladores",
                  desc: "Disponibiliza o JSON oficial auditado para as calculadoras determinísticas e Co-Piloto.",
                },
              ].map((c, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <span className="text-xs font-bold text-[#0038A8]">{c.camada}</span>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">{c.sub}</div>
                  <p className="text-xs text-slate-600 mt-1">{c.desc}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Temporal Inconsistencies */}
              <div className="lg:col-span-7 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <FileWarning className="w-4 h-4 text-[#0038A8]" />
                  Inconsistências Temporais Reais Detectadas nos PDFs:
                </h3>
                <div className="space-y-2.5">
                  {auditFindings.map((f) => (
                    <div
                      key={f.id}
                      className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#002D72]">
                          {f.severidade}: {f.documentosEnvolvidos.join(" ↔ ")}
                        </span>
                        <span className="text-[11px] text-slate-500">{f.camada}</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed">{f.descricao}</p>
                      <div className="text-slate-800 font-medium pt-1">
                        Tratamento: {f.acaoRecomendada}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* High-Water Mark Simulator */}
              <div className="lg:col-span-5 p-5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#002D72] flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-[#0038A8]" />
                    Regra de Contaminação de Sigilo (High-Water Mark)
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Ao combinar documentos de diferentes níveis, a resposta herda automaticamente o maior grau de sigilo:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {hierarchyOrder.map((lvl) => {
                      const active = selectedSourcesSigilo.includes(lvl);
                      return (
                        <button
                          key={lvl}
                          onClick={() => toggleSigiloSource(lvl)}
                          className={`p-2.5 rounded-lg text-xs font-semibold border transition cursor-pointer flex items-center justify-between ${
                            active
                              ? "bg-[#0038A8] text-white border-[#002D72]"
                              : "bg-white text-slate-600 border-[#E2E8F0]"
                          }`}
                        >
                          <span>{lvl}</span>
                          <span>{active ? "✓" : "+"}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-white border border-[#E2E8F0]">
                  <div className="text-[11px] text-slate-500">Nível Resultante Aplicado:</div>
                  <div className="text-lg font-bold text-[#002D72] mt-0.5">
                    Sigilo: {highestSigilo}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Pública → Interna → Restrita → Sigilosa
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUB-ABA (D): FINOPS, PLACAR FAQ & RESUMO EXECUTIVO (PPT / E-MAIL) */}
        {subTab === "finops_ppt" && (
          <div className="pt-6 space-y-6">
            {/* Row 1: ROI & Golden FAQ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#002D72]">
                    Roteador de Custo & Calculadora de ROI
                  </h3>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                    Economia: R$ {economiaMensalReais.toLocaleString("pt-BR")},00/mês
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-white border border-[#E2E8F0]">
                    <span className="text-slate-500 block">Consultas/mês</span>
                    <strong className="text-sm text-slate-900">{consultasMes}</strong>
                    <input
                      type="range"
                      min={500}
                      max={5000}
                      step={250}
                      value={consultasMes}
                      onChange={(e) => setConsultasMes(parseInt(e.target.value))}
                      className="w-full accent-[#0038A8] mt-1 cursor-pointer"
                    />
                  </div>
                  <div className="p-3 rounded-lg bg-white border border-[#E2E8F0]">
                    <span className="text-slate-500 block">Minutos poupados</span>
                    <strong className="text-sm text-slate-900">{minutosEconomizados} min</strong>
                    <input
                      type="range"
                      min={5}
                      max={25}
                      value={minutosEconomizados}
                      onChange={(e) => setMinutosEconomizados(parseInt(e.target.value))}
                      className="w-full accent-[#0038A8] mt-1 cursor-pointer"
                    />
                  </div>
                  <div className="p-3 rounded-lg bg-white border border-[#E2E8F0]">
                    <span className="text-slate-500 block">Valor Hora</span>
                    <strong className="text-sm text-slate-900">R$ {custoHoraReais}/h</strong>
                    <input
                      type="range"
                      min={40}
                      max={120}
                      step={5}
                      value={custoHoraReais}
                      onChange={(e) => setCustoHoraReais(parseInt(e.target.value))}
                      className="w-full accent-[#0038A8] mt-1 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="text-xs text-slate-600 flex justify-between pt-2 border-t border-[#E2E8F0]">
                  <span>⚡ Calculadora Determinística: <strong>R$ 0,00</strong></span>
                  <span>🧠 Consulta RAG + LLM: <strong>~R$ 0,004</strong></span>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#002D72] flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-[#0038A8]" />
                    Avaliação Golden FAQ (~30 Perguntas do Desafio 2)
                  </h3>
                  <span className="text-xs font-bold text-[#0038A8]">30 / 30 (100%)</span>
                </div>
                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div className="p-3 rounded-lg bg-white border border-[#E2E8F0]">
                    <div className="font-bold text-slate-800">Citações Vigentes</div>
                    <div className="text-slate-500 mt-0.5">12/12 precisas (Série 1, 11 e CTR)</div>
                  </div>
                  <div className="p-3 rounded-lg bg-white border border-[#E2E8F0]">
                    <div className="font-bold text-slate-800">Trava de Revogados</div>
                    <div className="text-slate-500 mt-0.5">6/6 bloqueios (v2.0 e v1.0)</div>
                  </div>
                  <div className="p-3 rounded-lg bg-white border border-[#E2E8F0]">
                    <div className="font-bold text-slate-800">Cálculo Determinístico</div>
                    <div className="text-slate-500 mt-0.5">7/7 exatos (D-n, 30%, Glosa)</div>
                  </div>
                  <div className="p-3 rounded-lg bg-white border border-[#E2E8F0]">
                    <div className="font-bold text-slate-800">Abstenção & RBAC</div>
                    <div className="text-slate-500 mt-0.5">5/5 encaminhados ao NIN/GGC</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: PPT Preview & Weekly Email Agent */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Executive PPT Preview */}
              <div className="p-5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#002D72] flex items-center gap-1.5">
                    <Presentation className="w-4 h-4 text-[#0038A8]" />
                    Gerador PPT — Ideias em Campo 2027
                  </span>
                  <div className="flex gap-1">
                    {[1, 2, 3].map((s) => (
                      <button
                        key={s}
                        onClick={() => setActiveSlide(s)}
                        className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
                          activeSlide === s
                            ? "bg-[#0038A8] text-white"
                            : "bg-white text-slate-600 border border-[#E2E8F0]"
                        }`}
                      >
                        Slide {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-white border border-[#E2E8F0] text-xs space-y-2">
                  {activeSlide === 1 && (
                    <>
                      <div className="font-bold text-slate-900">
                        Slide 1: Orçamento 2027 (R$ 96.000,00)
                      </div>
                      <p className="text-slate-600">
                        Kits Prototipagem R$ 36.000 (37,5%) • Imersão R$ 30.000 (31,3%) • Prêmios Colocação R$ 16.000 (16,7%) • Arenas R$ 8.000 (8,3%) • Comunicação R$ 6.000 (6,3%).
                      </p>
                    </>
                  )}
                  {activeSlide === 2 && (
                    <>
                      <div className="font-bold text-slate-900">
                        Slide 2: 7 Fases (01/02 a 30/06/2027)
                      </div>
                      <p className="text-slate-600">
                        Elegibilidade: 6 meses de casa e até 2 ideias por pessoa. Inscrição (fev), Triagem (12/03), Votação Top 20 (15-26/03), Imersão (05-09/04), Protótipo TRL 4 (até 31/05), Banca (15/06).
                      </p>
                    </>
                  )}
                  {activeSlide === 3 && (
                    <>
                      <div className="font-bold text-slate-900">
                        Slide 3: Alçadas (NG_012) & Trava Fiscal (31/03)
                      </div>
                      <p className="text-slate-600">
                        Até R$ 18k: Gerente NIN | R$ 18.000,01 a R$ 120k: Diretor DIRTEC | &gt; R$ 120k: Comitê. Trava de documentação fiscal em 31/03.
                      </p>
                    </>
                  )}
                  <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                    Fontes citadas: NT_2026-021 v1.0.0 e RG_1100 v2.0.0
                  </div>
                </div>
              </div>

              {/* Weekly Email Agent */}
              <div className="p-5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#002D72] flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-[#0038A8]" />
                      Resumo Semanal de Prazos (E-mail Institucional)
                    </span>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
                      O agente sugere e o humano envia
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-[#E2E8F0] leading-relaxed">
                    <strong>Resumo de Março/2027:</strong> D-45 Férias em 21/03 (`NG_111 v3.0.0`), encerramento da votação Ideias em Campo em 26/03 (`RG_1100 v2.0.0`), limite de prorrogação do coworking em 30/03 (`CTR_2026-012`) e trava fiscal em 31/03 (`PX_1130-001`).
                  </p>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <button
                    onClick={() => setEmailApprovedSent(true)}
                    className="px-4 py-2 rounded-lg bg-[#F8D117] hover:bg-[#FFCC00] text-[#002D72] font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" /> Aprovar e Enviar Resumo
                  </button>
                  {emailApprovedSent && (
                    <span className="text-xs font-medium text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Enviado com sucesso
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
