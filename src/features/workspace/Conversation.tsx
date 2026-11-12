'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUp, CalendarDays, FileText, Paperclip, ShieldCheck, Sprout, Users } from 'lucide-react';
import { useWorkspace } from './context';
import type { Answer } from '@/contracts/models';
const examples = [
  { title: 'Planejar minhas férias', detail: 'Prazos, regras e próximos passos', query: 'Quero férias em 05/05/2027. Qual o prazo?', icon: CalendarDays },
  { title: 'Entender uma aprovação', detail: 'Alçadas de prototipagem', query: 'Quem aprova R$ 18.000,01 em protótipo?', icon: ShieldCheck },
  { title: 'Consultar um contrato', detail: 'Rescisão e obrigações do coworking', query: 'Se rescindir o contrato em março, há multa?', icon: FileText },
  { title: 'Ver o limite da equipe', detail: 'Regras para ausências simultâneas', query: 'Equipe de 9: quantos podem sair juntos?', icon: Users },
];
export default function Conversation() {
  const { gateway, context, openSource } = useWorkspace();
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { const reset = () => { setAnswers([]); setQuery(''); setError(''); }; window.addEventListener('raiziq:new-conversation', reset); return () => window.removeEventListener('raiziq:new-conversation', reset); }, []);
  async function send(value: string) {
    if (!gateway || !value.trim() || busy) return;
    setBusy(true); setError('');
    try { const answer = await gateway.ask(value.trim(), context); setAnswers(list => [...list, answer]); setQuery(''); }
    catch (e) { setError(e instanceof Error ? e.message : 'Não foi possível consultar.'); }
    finally { setBusy(false); }
  }
  return <section className="conversation" aria-label="Conversa com o acervo">
    {!answers.length && <><header className="conversation-intro"><span className="intro-mark"><Sprout size={27}/></span><div className="eyebrow">CONHECIMENTO QUE VIRA DECISÃO</div><h1>O que vamos esclarecer hoje?</h1><p>Encontre a regra, entenda o que importa e decida com a fonte ao seu lado.</p></header><div className="suggestions">{examples.map(item => <button className="suggestion" key={item.title} onClick={() => { setQuery(item.query); void send(item.query); }} disabled={busy}><item.icon size={18}/><span><strong>{item.title}</strong><small>{item.detail}</small></span></button>)}</div></>}
    <div className="message-list" aria-live="polite">{answers.map(answer => <div key={answer.id}><div className="user-message"><p>{answer.query}</p></div><article className="assistant-message"><div className="assistant-label"><Sprout size={16}/>Raiz IQ <span className="tag">{answer.origin === 'demo' ? 'Cenário demonstrativo' : 'Resposta da API'}</span></div><p>{answer.text}</p><div className="message-sources">{answer.citations.map(source => <button key={source.id} onClick={() => openSource(source)}><FileText size={13}/>{source.codigo} · {source.item}</button>)}</div></article></div>)}</div>
    {error && <p className="notice" role="alert">{error}</p>}
    <div className="composer-wrap"><form className="composer" onSubmit={e => { e.preventDefault(); void send(query); }}><textarea aria-label="Sua pergunta" placeholder="Pergunte sobre normas, prazos ou decisões…" value={query} onChange={e => setQuery(e.target.value)} rows={2}/><div className="composer-toolbar"><div className="composer-context"><Link href="/acervo/" title="Enviar documentos" aria-label="Enviar documentos"><Paperclip size={17}/></Link><span>Acervo corporativo</span><span>·</span><span>Fontes verificáveis</span></div><button className="primary-button" aria-label="Enviar pergunta" disabled={busy || !query.trim()}>{busy ? 'Consultando…' : <ArrowUp size={18}/>}</button></div></form><p className="composer-hint">{gateway?.mode === 'demo' ? 'Demo com dados sintéticos e cenários limitados. Não executa RAG ou ações externas.' : 'Confira as fontes antes de tomar uma decisão.'}</p></div>
  </section>;
}
