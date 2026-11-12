'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowUp, CalendarDays, FileText, Paperclip, ShieldCheck, Sprout, Square, Users } from 'lucide-react';
import { useWorkspace } from './context';
import { useUrlFilters } from '@/lib/url-filters';
import { ApiError, type Answer } from '@/contracts/models';
const examples = [
  { title: 'Planejar minhas férias', detail: 'Prazos, regras e próximos passos', query: 'Quero férias em 05/05/2027. Qual o prazo?', icon: CalendarDays },
  { title: 'Entender uma aprovação', detail: 'Alçadas de prototipagem', query: 'Quem aprova R$ 18.000,01 em protótipo?', icon: ShieldCheck },
  { title: 'Consultar um contrato', detail: 'Rescisão e obrigações do coworking', query: 'Se rescindir o contrato em março, há multa?', icon: FileText },
  { title: 'Ver o limite da equipe', detail: 'Regras para ausências simultâneas', query: 'Equipe de 9: quantos podem sair juntos?', icon: Users },
];
const stateLabels = { answered: 'Com base nas fontes', abstained: 'Evidência insuficiente', conflict: 'Mudança de versão', access_required: 'Orientação da área necessária' };
export default function Conversation() { const { context } = useWorkspace(); return <ConversationThread key={context.persona}/>; }
function ConversationThread() {
  const { gateway, context, openSource, setSelection } = useWorkspace();
  const { params, update } = useUrlFilters();
  const conversationId = params.get('conversation') || '';
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState('');
  const [error, setError] = useState('');
  const [threadLoading, setThreadLoading] = useState(true);
  const controller = useRef<AbortController | null>(null);
  const activeConversation = useRef('');
  useEffect(() => {
    const load = new AbortController();
    gateway?.messages(context.persona, load.signal).then(list => {
      if (load.signal.aborted) return;
      setAnswers(list.filter(answer => answer.context.conversationId === conversationId));
      activeConversation.current = conversationId; setThreadLoading(false);
    }).catch(e => { if (!load.signal.aborted) { setError(e instanceof Error ? e.message : 'Não foi possível abrir a conversa.'); setThreadLoading(false); } });
    return () => load.abort();
  }, [gateway, context.persona, conversationId]);
  useEffect(() => {
    const reset = () => { update({ conversation: '' }); controller.current?.abort(); activeConversation.current = ''; setAnswers([]); setQuery(''); setError(''); setBusy(false); setPending(''); };
    window.addEventListener('raiziq:new-conversation', reset);
    return () => { controller.current?.abort(); window.removeEventListener('raiziq:new-conversation', reset); };
  }, [update]);
  async function send(value: string) {
    if (!gateway || !value.trim() || busy) return;
    const request = new AbortController(); controller.current = request;
    if (!activeConversation.current) activeConversation.current = crypto.randomUUID();
    setBusy(true); setError(''); setPending(value);
    try {
      const answer = await gateway.ask(value.trim(), { ...context, conversationId: activeConversation.current }, request.signal);
      if (request.signal.aborted) return;
      setAnswers(list => [...list.filter(a => a.id !== answer.id), answer]);
      setQuery(''); update({ conversation: activeConversation.current });
    } catch (e) { if (request.signal.aborted || (e instanceof ApiError && e.code === 'ABORTED')) setError('Consulta cancelada. Sua pergunta permanece disponível.'); else setError(e instanceof Error ? e.message : 'Não foi possível consultar.'); }
    finally { if (controller.current === request) { setBusy(false); setPending(''); } }
  }
  return <section className="conversation" aria-label="Conversa com o acervo">
    {!answers.length && !busy && <><header className="conversation-intro"><span className="intro-mark"><Sprout size={27}/></span><div className="eyebrow">CONHECIMENTO QUE VIRA DECISÃO</div><h1>O que vamos esclarecer hoje?</h1><p>Encontre a regra, entenda o que importa e decida com a fonte ao seu lado.</p></header><div className="suggestions">{examples.map(item => <button className="suggestion" key={item.title} onClick={() => { setQuery(item.query); void send(item.query); }} disabled={busy || threadLoading}><item.icon size={18}/><span><strong>{item.title}</strong><small>{item.detail}</small></span></button>)}</div></>}
    <div className="message-list" aria-live="polite">{answers.map(answer => <div key={answer.id}><div className="user-message"><p>{answer.query}</p></div><article className="assistant-message"><div className="assistant-label"><Sprout size={16}/>Raiz IQ <span className="tag">{stateLabels[answer.status]}</span><span className="tag">{answer.origin === 'demo' ? 'Demonstração' : 'API'}</span></div><p>{answer.text}</p><details className="answer-details"><summary>Ver fundamentação e evidências</summary>{answer.facts.map(fact => <p key={fact.id}>{fact.text}</p>)}</details><div className="message-sources">{answer.citations.map(source => <button key={source.id} onClick={() => openSource(source)}><FileText size={13}/>{source.codigo} · {source.item}</button>)}</div><div className="answer-actions">{answer.facts.length>0 && <><Link className="source-link" href={'/analises/?ids=' + encodeURIComponent(answer.facts.map(f=>f.id).join(','))}>Explorar estas evidências</Link><Link className="source-link" href={'/simuladores/?tema=' + answer.facts[0].tema}>Abrir simulador</Link><Link className="source-link" href="/resumos/" onClick={()=>setSelection(answer.facts)}>Usar no resumo</Link></>}{answer.status==='access_required' && <Link className="source-link" href={'/administracao/?pedido=' + encodeURIComponent(answer.query)}>Solicitar orientação</Link>}</div></article></div>)}{busy && <div role="status"><div className="user-message"><p>{pending}</p></div><p className="muted">Consultando as fontes disponíveis…</p></div>}</div>
    {error && <div className="notice" role="alert"><p>{error}</p>{query && <button className="secondary-button" disabled={busy} onClick={()=>void send(query)}>Tentar novamente</button>}</div>}
    <div className="composer-wrap"><form className="composer" onSubmit={e => { e.preventDefault(); void send(query); }}><textarea aria-label="Sua pergunta" placeholder="Pergunte sobre normas, prazos ou decisões…" value={query} onChange={e => setQuery(e.target.value)} rows={2} onKeyDown={e=>{if(e.key==='Enter' && !e.shiftKey){e.preventDefault();void send(query);}}}/><div className="composer-toolbar"><div className="composer-context"><Link href="/acervo/" title="Enviar documentos" aria-label="Enviar documentos"><Paperclip size={17}/></Link><span>Acervo corporativo</span><span>·</span><span>Fontes verificáveis</span></div>{busy ? <button type="button" className="secondary-button" aria-label="Cancelar consulta" onClick={()=>controller.current?.abort()}><Square size={16}/></button> : <button className="primary-button" aria-label="Enviar pergunta" disabled={!query.trim() || threadLoading}><ArrowUp size={18}/></button>}</div></form><p className="composer-hint">{gateway?.mode === 'demo' ? 'Demo com dados sintéticos e cenários limitados. Não executa RAG ou ações externas.' : 'Confira as fontes antes de tomar uma decisão.'}</p></div>
  </section>;
}
