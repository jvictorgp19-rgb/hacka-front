"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  FileCheck2,
  Sparkles,
  MessageSquareText,
  X,
  ChevronRight,
  ShieldAlert,
  HelpCircle,
  Lock,
} from "lucide-react";
import { apiChat } from "@/lib/api";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  bullets?: string[];
  citations?: { codigo: string; titulo: string; versao: string; status: string }[];
  costBadge?: {
    type: "deterministic" | "rag_llm";
    label: string;
    latencyMs: number;
    sigiloNivel: "Pública" | "Interna" | "Restrita" | "Sigilosa";
  };
  revokedAlert?: {
    codigo: string;
    versaoRevogada: string;
    substituidoPor: string;
    pegadinha: string;
  };
  honestAbstention?: {
    lacuna: string;
    donoDominio: string;
    botaoAcao: string;
    detalhesExtras: string[];
  };
  rbacBlock?: {
    dominioResponsavel: string;
    nivelExigido: string;
    mensagem: string;
  };
}

interface CopilotSidebarProps {
  tema: "ferias" | "inovacao" | "locacao";
  perfilLabel: string;
  personaId?: string;
}

const QUICK_PROMPTS_BY_THEME: Record<"ferias" | "inovacao" | "locacao", string[]> = {
  ferias: [
    "Quero sair de férias em 05/05/2027. Qual o meu cronograma D-n?",
    "Posso pedir férias com 30 dias de antecedência?",
    "Carlos tem equipe de 9 pessoas: quantas podem sair juntas?",
    "Qual o dossiê restrito de auditoria da folha para ressarcimento D-15?",
  ],
  inovacao: [
    "Como o prêmio é dividido em equipe no Ideias em Campo e se alguém for afastado?",
    "Quem aprova um protótipo de R$ 18.000,00 vs R$ 18.000,01?",
    "Posso inscrever 3 ideias no programa Ideias em Campo 2027?",
    "O que acontece se o projeto perder a trava de 31 de março do incentivo fiscal?",
  ],
  locacao: [
    "Se rescindirmos o contrato CTR_2026-012 em março de 2027, pagamos multa?",
    "Qual o desconto se a internet do coworking cair por mais de 4h?",
    "Qual a data-limite para pedir prorrogação do contrato CTR_2026-012?",
    "Quais foram as 3 cotações comparadas na NT_2026-018?",
  ],
};

export default function CopilotSidebar({
  tema,
  perfilLabel,
  personaId,
}: CopilotSidebarProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Olá! Sou o Co-Piloto Raiz IQ (Iteração 3 • Zero-Click). Opero com Roteador Híbrido de Custo, Trava Anti-Revogados, Abstenção Honesta e Controle RBAC.",
      costBadge: {
        type: "deterministic",
        label: "⚡ Custo: R$ 0,00 (Calculadora Determinística / Cache)",
        latencyMs: 5,
        sigiloNivel: "Interna",
      },
      bullets: [
        "**Citação Vigente Obrigatória:** Todas as respostas citam código e versão (`NG_111 v3.0.0`, `RG_1100 v2.0.0`, `CTR_2026-012 v1.0.0`).",
        "**Abstenção Honesta & RBAC:** Quando algo não consta no acervo (ex: rateio de prêmio em equipe no `RG_1100`), o sistema se abstém e oferece botão para acionar o Dono (`[Perguntar ao NIN]` / `[GGC]`).",
      ],
      citations: [
        {
          codigo: "NG_010",
          titulo: "Gestão de Documentos Organizacionais",
          versao: "v0.2.0",
          status: "Vigente",
        },
      ],
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<Record<string, string>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (questionText: string) => {
    const trimmed = questionText.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      text: trimmed,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const { data } = await apiChat({
        message: trimmed,
        tema,
        perfil: perfilLabel,
        personaId,
      });

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: data.answer || "Consulta processada no acervo oficial:",
        bullets: data.bullets || [],
        citations: data.citations || [],
        costBadge: data.costBadge,
        revokedAlert: data.revokedAlert,
        honestAbstention: data.honestAbstention,
        rbacBlock: data.rbacBlock,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          text: "Erro ao consultar a rota /api/chat. Verifique a conexão local.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderFormattedText = (str: string) => {
    const parts = str.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, idx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={idx} className="font-bold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={idx}
            className="px-1.5 py-0.5 rounded bg-blue-100 text-[#002D72] font-mono text-[11px] font-bold"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  const panelContent = (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#002D72] via-[#00388c] to-slate-900 text-white p-4 border-b border-blue-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#FFCC00] text-[#002D72] shadow-sm">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-extrabold text-sm tracking-tight">
                  Co-Piloto Raiz IQ (RAG + FinOps)
                </h2>
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Camada Gold
                </span>
              </div>
              <p className="text-[11px] text-blue-200">
                Roteador de Custo • Abstenção Honesta • RBAC
              </p>
            </div>
          </div>

          <button
            onClick={() => setMobileOpen(false)}
            className="xl:hidden p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20"
            aria-label="Fechar Co-Piloto"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Prompt Pills */}
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#002D72]" />
          Testes Rápidos do Pitch ({tema.toUpperCase()}):
        </div>
        <div className="flex flex-col gap-1.5">
          {QUICK_PROMPTS_BY_THEME[tema].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => sendMessage(prompt)}
              className="text-left text-[11px] font-medium px-2.5 py-1.5 rounded-lg bg-white hover:bg-blue-50 text-slate-700 hover:text-[#002D72] border border-slate-200 hover:border-[#002D72]/40 transition flex items-center justify-between gap-2 cursor-pointer group"
            >
              <span className="truncate">{prompt}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#002D72] shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 max-h-[540px] xl:max-h-[620px] bg-slate-50/40">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${
              m.role === "user" ? "items-end" : "items-start"
            }`}
          >
            <div
              className={`max-w-[96%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                m.role === "user"
                  ? "bg-[#002D72] text-white rounded-br-xs shadow-xs"
                  : "bg-white text-slate-800 border border-slate-200 rounded-bl-xs shadow-xs space-y-3"
              }`}
            >
              {/* Live Cost Router & Sigilo Badge inside Assistant Response */}
              {m.role === "assistant" && m.costBadge && (
                <div className="flex flex-wrap items-center justify-between gap-1.5 pb-2 border-b border-slate-100">
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${
                      m.costBadge.type === "deterministic"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                        : "bg-blue-50 text-[#002D72] border-blue-200"
                    }`}
                  >
                    {m.costBadge.label}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    🔒 Sigilo: {m.costBadge.sigiloNivel} ({m.costBadge.latencyMs}ms)
                  </span>
                </div>
              )}

              <p className={m.role === "user" ? "font-medium" : "font-semibold text-[#002D72]"}>
                {renderFormattedText(m.text)}
              </p>

              {/* Revoked Rule Warning Banner */}
              {m.revokedAlert && (
                <div className="p-3 rounded-xl bg-amber-100/90 border-2 border-amber-500 text-amber-950 space-y-1">
                  <div className="flex items-center gap-1.5 font-extrabold text-[11px] uppercase tracking-wider text-amber-900">
                    <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
                    ALERTA DE REGRA REVOGADA ({m.revokedAlert.codigo})
                  </div>
                  <p className="text-[11px] font-medium leading-snug">
                    {m.revokedAlert.pegadinha}
                  </p>
                  <div className="text-[10px] font-bold text-amber-800 pt-1">
                    Substituído por: {m.revokedAlert.substituidoPor}
                  </div>
                </div>
              )}

              {/* Honest Abstention Box (Step 6) */}
              {m.honestAbstention && (
                <div className="p-3 rounded-xl bg-amber-50 border-2 border-amber-400 text-slate-900 space-y-2">
                  <div className="flex items-center gap-1.5 font-black text-[11px] uppercase text-amber-950">
                    <HelpCircle className="w-4 h-4 text-amber-700 shrink-0" />
                    Não consta no RG_1100 • Dono: {m.honestAbstention.donoDominio}
                  </div>
                  <p className="text-[11px] text-slate-700">{m.honestAbstention.lacuna}</p>
                  <button
                    onClick={() =>
                      setActionFeedback((prev) => ({
                        ...prev,
                        [m.id]: "Protocolo enviado ao NIN! Aguardando Resposta Curada.",
                      }))
                    }
                    className="px-3 py-1.5 rounded-lg bg-[#002D72] text-[#FFCC00] font-extrabold text-[11px] cursor-pointer hover:bg-[#003c96] transition"
                  >
                    {m.honestAbstention.botaoAcao}
                  </button>
                  {actionFeedback[m.id] && (
                    <div className="text-[11px] font-bold text-emerald-800 bg-emerald-100 p-1.5 rounded">
                      ✓ {actionFeedback[m.id]}
                    </div>
                  )}
                </div>
              )}

              {/* RBAC Block Box (Step 7) */}
              {m.rbacBlock && (
                <div className="p-3 rounded-xl bg-rose-50 border-2 border-rose-400 text-rose-950 space-y-2">
                  <div className="flex items-center gap-1.5 font-black text-[11px] uppercase text-rose-900">
                    <Lock className="w-4 h-4 text-rose-700 shrink-0" />
                    {m.rbacBlock.mensagem}
                  </div>
                  <button
                    onClick={() =>
                      setActionFeedback((prev) => ({
                        ...prev,
                        [m.id]:
                          "Solicitação #REQ-2026-089 enviada à Curadora da GGC para Resposta Curada!",
                      }))
                    }
                    className="px-3 py-1.5 rounded-lg bg-rose-700 text-white font-extrabold text-[11px] cursor-pointer hover:bg-rose-800 transition"
                  >
                    [Solicitar Resposta Curada à GGC]
                  </button>
                  {actionFeedback[m.id] && (
                    <div className="text-[11px] font-bold text-emerald-800 bg-emerald-100 p-1.5 rounded">
                      ✓ {actionFeedback[m.id]}
                    </div>
                  )}
                </div>
              )}

              {/* Bullets */}
              {m.bullets && m.bullets.length > 0 && (
                <ul className="space-y-2 pl-1">
                  {m.bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#002D72] mt-1.5 shrink-0" />
                      <span className="text-[11.5px] leading-relaxed">
                        {renderFormattedText(b)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Official Document Citations */}
              {m.citations && m.citations.length > 0 && (
                <div className="pt-2 border-t border-slate-100">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Fontes Oficiais Vigentes Citadas:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {m.citations.map((cit) => (
                      <span
                        key={cit.codigo}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold"
                      >
                        <FileCheck2 className="w-3 h-3 text-emerald-600" />
                        {cit.codigo} ({cit.versao})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-500 p-2">
            <div className="w-2 h-2 rounded-full bg-[#002D72] animate-ping" />
            Roteando consulta no Raiz IQ...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage(input);
        }}
        className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pergunte ou teste uma regra do acervo..."
          className="flex-1 text-xs px-3 py-2.5 rounded-xl bg-slate-100 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#002D72] focus:bg-white text-slate-800"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="p-2.5 rounded-xl bg-[#002D72] hover:bg-[#003c96] disabled:opacity-40 text-[#FFCC00] transition cursor-pointer shrink-0"
          aria-label="Enviar pergunta"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );

  return (
    <>
      <div className="hidden xl:block sticky top-28 h-[calc(100vh-8rem)]">
        {panelContent}
      </div>

      <div className="xl:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed bottom-12 right-5 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-[#002D72] text-[#FFCC00] font-extrabold text-xs shadow-xl border-2 border-[#FFCC00] cursor-pointer"
        >
          <MessageSquareText className="w-4 h-4" />
          Co-Piloto Raiz IQ
        </button>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end p-3">
            <div className="w-full max-w-md h-full">{panelContent}</div>
          </div>
        )}
      </div>
    </>
  );
}
