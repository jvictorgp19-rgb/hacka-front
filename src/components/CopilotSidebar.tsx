"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  AlertTriangle,
  FileCheck2,
  Sparkles,
  MessageSquareText,
  X,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  bullets?: string[];
  citations?: { codigo: string; titulo: string; versao: string; status: string }[];
  revokedAlert?: {
    codigo: string;
    versaoRevogada: string;
    substituidoPor: string;
    pegadinha: string;
  };
}

interface CopilotSidebarProps {
  tema: "ferias" | "inovacao" | "locacao";
  perfilLabel: string;
}

const QUICK_PROMPTS_BY_THEME: Record<"ferias" | "inovacao" | "locacao", string[]> = {
  ferias: [
    "Posso pedir férias com 30 dias de antecedência?",
    "Tive 8 faltas injustificadas, quantos dias de férias tenho direito?",
    "Como funciona o limite de 30% da equipe e o cancelamento a partir de D-19?",
    "Como funciona a desambiguação do campo vinculado_a na NG_010?",
  ],
  inovacao: [
    "Posso inscrever 3 ideias no programa Ideias em Campo 2027?",
    "Como somar 800 pontos na gamificação e ganhar R$ 10.000 cumulativos?",
    "Quem aprova protótipos de R$ 18k, R$ 50k e R$ 150k?",
    "O que acontece se o projeto perder a trava de 31 de março do incentivo fiscal?",
  ],
  locacao: [
    "Qual o desconto se a internet do coworking cair por mais de 4h?",
    "Se a ACME rescindir no 91º dia, qual o valor da multa?",
    "Qual a rotina mensal entre o dia 25 (NF), Atesto GOC e dia 8 (GFI)?",
    "Quais foram as 3 cotações comparadas na NT_2026-018?",
  ],
};

export default function CopilotSidebar({ tema, perfilLabel }: CopilotSidebarProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Olá! Sou o Co-Piloto Executivo de Legal Design & UX Writing da BBTS / ACME. Respondo estritamente com base no acervo normativo vigente e bloqueio regras revogadas automaticamente.",
      bullets: [
        "**Citação Obrigatória:** Todas as respostas indicam o código e versão vigente (ex: `NG_111 v3.0.0`, `RG_1100 v2.0.0`, `CTR_2026-012 v1.0.0`).",
        "**Trava Histórica Ativa:** Alertarei imediatamente caso sua dúvida envolva regras revogadas (como férias com 30 dias de antecedência ou limite de 3 ideias por pessoa).",
      ],
      citations: [
        { codigo: "NG_010", titulo: "Gestão de Documentos Organizacionais", versao: "v0.2.0", status: "Vigente" },
      ],
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
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
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          tema,
          perfil: perfilLabel,
        }),
      });
      const data = await res.json();

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: data.answer || "Consulta processada no acervo oficial:",
        bullets: data.bullets || [],
        citations: data.citations || [],
        revokedAlert: data.revokedAlert,
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

  // Helper to format markdown bold inside bullets cleanly
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
                  Co-Piloto Executivo RAG
                </h2>
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  JSON Oficial
                </span>
              </div>
              <p className="text-[11px] text-blue-200">
                UX Writing • Citação Normativa • Trava de Revogados
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
          Perguntas Frequentes & Pegadinhas ({tema.toUpperCase()}):
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
              className={`max-w-[95%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                m.role === "user"
                  ? "bg-[#002D72] text-white rounded-br-xs shadow-xs"
                  : "bg-white text-slate-800 border border-slate-200 rounded-bl-xs shadow-xs space-y-3"
              }`}
            >
              <p className={m.role === "user" ? "font-medium" : "font-semibold text-[#002D72]"}>
                {m.text}
              </p>

              {/* Revoked Rule Warning Banner inside Chat */}
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
            Consultando acervo_estruturado_acme_bbts.json...
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
          placeholder="Pergunte sobre prazos, alçadas, descontos ou regras..."
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
      {/* Desktop Sticky Sidebar */}
      <div className="hidden xl:block sticky top-24 h-[calc(100vh-7rem)]">
        {panelContent}
      </div>

      {/* Mobile Floating Trigger & Drawer */}
      <div className="xl:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-[#002D72] text-[#FFCC00] font-extrabold text-xs shadow-xl border-2 border-[#FFCC00] cursor-pointer"
        >
          <MessageSquareText className="w-4 h-4" />
          Co-Piloto Executivo RAG
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
