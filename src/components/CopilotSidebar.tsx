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
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  HelpCircle,
  Lock,
} from "lucide-react";
import { apiChat } from "@/lib/api";

export interface ChatMessage {
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
  isOpenDrawer?: boolean;
  onToggleDrawer?: () => void;
  externalQuery?: string | null;
  onExternalQueryHandled?: () => void;
}

const QUICK_PROMPTS_BY_THEME: Record<"ferias" | "inovacao" | "locacao", string[]> = {
  ferias: [
    "Quero sair de férias em 05/05/2027. Qual o meu cronograma D-n?",
    "Posso pedir férias com 30 dias de antecedência?",
    "Carlos tem equipe de 9 pessoas: quantas podem sair juntas?",
  ],
  inovacao: [
    "Como o prêmio é dividido em equipe no Ideias em Campo?",
    "Quem aprova um protótipo de R$ 18.000,00 vs R$ 18.000,01?",
    "Posso inscrever 3 ideias no programa Ideias em Campo 2027?",
  ],
  locacao: [
    "Se rescindirmos o contrato CTR_2026-012 em março de 2027, pagamos multa?",
    "Qual o desconto se a internet do coworking cair por mais de 4h?",
    "Qual a data-limite para pedir prorrogação do contrato CTR_2026-012?",
  ],
};

export default function CopilotSidebar({
  tema,
  perfilLabel,
  personaId,
  isOpenDrawer = false,
  onToggleDrawer,
  externalQuery,
  onExternalQueryHandled,
}: CopilotSidebarProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Olá! Sou o Co-Piloto Institucional BBTS. Respondo com base nas normas vigentes e bloqueio versões revogadas.",
      costBadge: {
        type: "deterministic",
        label: "⚡ Custo: R$ 0,00 (Calculadora Determinística / Cache)",
        latencyMs: 5,
        sigiloNivel: "Interna",
      },
      bullets: [
        "**Citação Vigente:** Todas as respostas são ancoradas na norma oficial (`NG_111 v3.0.0`, `RG_1100 v2.0.0`, `CTR_2026-012`).",
        "**Segurança Normativa:** Alertas automáticos contra regras antigas e abstenção honesta quando o tema exige deliberação do gestor da norma.",
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
  const [expandedMsgIds, setExpandedMsgIds] = useState<Record<string, boolean>>({});
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
          text: "Não foi possível processar a consulta no momento.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!externalQuery) return;
    // Adiado para fora do corpo do efeito: sendMessage atualiza estado.
    const timer = setTimeout(() => {
      sendMessage(externalQuery);
      onExternalQueryHandled?.();
    }, 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalQuery]);

  const toggleExpandMessage = (id: string) => {
    setExpandedMsgIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderFormattedText = (str: string) => {
    const parts = str.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, idx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={idx} className="font-semibold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={idx}
            className="px-1.5 py-0.5 rounded bg-slate-100 text-[#0038A8] font-mono text-[11px] font-semibold"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  if (!isOpenDrawer) {
    return (
      <button
        onClick={onToggleDrawer}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-5 py-3.5 rounded-full bg-[#0038A8] hover:bg-[#002D72] text-white font-semibold text-xs shadow-lg border border-white/20 transition cursor-pointer"
      >
        <span className="w-2 h-2 rounded-full bg-[#F8D117]" />
        <MessageSquareText className="w-4 h-4 text-[#F8D117]" />
        <span>Co-Piloto BBTS</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-[2px] flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl border-l border-[#E2E8F0] flex flex-col">
        {/* Clean Institutional Header */}
        <div className="bg-[#002D72] text-white px-6 py-4 flex items-center justify-between border-b-2 border-[#F8D117]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#0038A8] border border-white/15 flex items-center justify-center text-[#F8D117]">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm tracking-tight">Co-Piloto Normativo BBTS</h2>
              <p className="text-[11px] text-blue-200">Respostas diretas com fundamentação oficial</p>
            </div>
          </div>

          <button
            onClick={onToggleDrawer}
            className="p-1.5 rounded-lg text-blue-100 hover:text-white hover:bg-white/10 transition cursor-pointer"
            aria-label="Fechar Co-Piloto"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Clean Suggestions */}
        <div className="px-6 py-3 bg-[#F8FAFC] border-b border-[#E2E8F0]">
          <div className="text-[11px] font-medium text-slate-500 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#0038A8]" />
            Sugestões rápidas:
          </div>
          <div className="flex flex-col gap-1.5">
            {QUICK_PROMPTS_BY_THEME[tema].map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => sendMessage(prompt)}
                className="text-left text-xs px-3 py-2 rounded-lg bg-white hover:bg-blue-50/50 text-slate-700 hover:text-[#0038A8] border border-[#E2E8F0] transition flex items-center justify-between gap-2 cursor-pointer"
              >
                <span className="truncate">{prompt}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Messages Feed (Minimalist, max 3 lines visible initially + Expand button) */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-white">
          {messages.map((m) => {
            const isExpanded = !!expandedMsgIds[m.id];
            const visibleBullets = m.bullets
              ? isExpanded
                ? m.bullets
                : m.bullets.slice(0, 1)
              : [];

            return (
              <div
                key={m.id}
                className={`flex flex-col ${
                  m.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[92%] rounded-xl p-4 text-xs leading-relaxed ${
                    m.role === "user"
                      ? "bg-[#0038A8] text-white"
                      : "bg-[#F8FAFC] text-slate-800 border border-[#E2E8F0] space-y-2.5"
                  }`}
                >
                  <p
                    className={`${
                      m.role === "user"
                        ? "font-medium"
                        : "font-semibold text-[#002D72] line-clamp-3"
                    }`}
                  >
                    {renderFormattedText(m.text)}
                  </p>

                  {/* Short summary bullet (capped at 3 lines unless expanded) */}
                  {visibleBullets.length > 0 && (
                    <ul className="space-y-1.5">
                      {visibleBullets.map((b, i) => (
                        <li
                          key={i}
                          className={`text-slate-600 flex items-start gap-2 ${
                            !isExpanded ? "line-clamp-2" : ""
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#0038A8] mt-1.5 shrink-0" />
                          <span>{renderFormattedText(b)}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Alerts if present */}
                  {m.revokedAlert && (
                    <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px]">
                      <div className="font-semibold flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        Atenção: Versão anterior ({m.revokedAlert.codigo}) revogada.
                      </div>
                      {isExpanded && (
                        <p className="mt-1 text-amber-800">{m.revokedAlert.pegadinha}</p>
                      )}
                    </div>
                  )}

                  {m.honestAbstention && (
                    <div className="p-2.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 space-y-1.5">
                      <div className="font-semibold flex items-center gap-1 text-[11px]">
                        <HelpCircle className="w-3.5 h-3.5 text-[#0038A8]" />
                        Não consta no RG_1100 • Dono: {m.honestAbstention.donoDominio}
                      </div>
                      <button
                        onClick={() =>
                          setActionFeedback((prev) => ({
                            ...prev,
                            [m.id]: "Consulta encaminhada ao NIN.",
                          }))
                        }
                        className="px-2.5 py-1 rounded bg-[#0038A8] text-white font-medium text-[11px] cursor-pointer"
                      >
                        {m.honestAbstention.botaoAcao}
                      </button>
                      {actionFeedback[m.id] && (
                        <div className="text-[11px] text-emerald-700 font-medium">
                          ✓ {actionFeedback[m.id]}
                        </div>
                      )}
                    </div>
                  )}

                  {m.rbacBlock && (
                    <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 space-y-1.5">
                      <div className="font-semibold flex items-center gap-1 text-[11px]">
                        <Lock className="w-3.5 h-3.5 text-rose-600" />
                        {m.rbacBlock.mensagem}
                      </div>
                      <button
                        onClick={() =>
                          setActionFeedback((prev) => ({
                            ...prev,
                            [m.id]: "Pedido de Resposta Curada enviado à GGC.",
                          }))
                        }
                        className="px-2.5 py-1 rounded bg-rose-700 text-white font-medium text-[11px] cursor-pointer"
                      >
                        Solicitar Resposta Curada à GGC
                      </button>
                      {actionFeedback[m.id] && (
                        <div className="text-[11px] text-emerald-700 font-medium">
                          ✓ {actionFeedback[m.id]}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Expand button for technical foundation, citations & cost router */}
                  {m.role === "assistant" && (
                    <div className="pt-1 border-t border-[#E2E8F0]">
                      <button
                        onClick={() => toggleExpandMessage(m.id)}
                        className="text-[11px] font-medium text-[#0038A8] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {isExpanded ? (
                          <>
                            Ocultar fundamentação e fonte <ChevronUp className="w-3 h-3" />
                          </>
                        ) : (
                          <>
                            Ver fundamentação e fonte <ChevronDown className="w-3 h-3" />
                          </>
                        )}
                      </button>

                      {isExpanded && (
                        <div className="mt-2.5 space-y-2 pt-2 border-t border-slate-200/60">
                          {m.citations && m.citations.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {m.citations.map((cit) => (
                                <span
                                  key={cit.codigo}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-[#E2E8F0] text-slate-700 text-[10px] font-medium"
                                >
                                  <FileCheck2 className="w-3 h-3 text-emerald-600" />
                                  {cit.codigo} ({cit.versao})
                                </span>
                              ))}
                            </div>
                          )}

                          {m.costBadge && (
                            <div className="flex items-center justify-between text-[10px] text-slate-500 bg-white px-2.5 py-1.5 rounded border border-[#E2E8F0]">
                              <span>{m.costBadge.label}</span>
                              <span>Sigilo: {m.costBadge.sigiloNivel}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="text-xs text-slate-400 py-2">Consultando acervo oficial BBTS...</div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="p-4 bg-white border-t border-[#E2E8F0] flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua dúvida normativa..."
            className="flex-1 text-xs px-3.5 py-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] focus:outline-none focus:border-[#0038A8] text-slate-800"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-3.5 py-2.5 rounded-lg bg-[#F8D117] hover:bg-[#FFCC00] disabled:opacity-40 text-[#002D72] font-semibold text-xs transition cursor-pointer shrink-0"
            aria-label="Enviar"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
