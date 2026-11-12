'use client';
import { useState } from 'react';
import Link from 'next/link';
import { FileText, MessageSquare, RotateCcw } from 'lucide-react';
import { useWorkspace } from '@/features/workspace/context';
import { PageHeading, EmptyState } from '@/components/ui/primitives';
import { useRecords } from '@/features/reports/use-records';
import { recordHref } from './related';
import { useConversationHistory } from './use-conversations';
export default function History() {
  const {gateway,reload}=useWorkspace();const {records,error:recordError}=useRecords();const {conversations,error}=useConversationHistory();const [query,setQuery]=useState('');
  const matches=(text:string)=>text.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR'));
  const saved=records.filter(r=>matches(r.title));const chats=conversations.filter(c=>matches(c.title));
  return <><PageHeading eyebrow="CONHECIMENTO QUE CONTINUA" title="Histórico e análises salvas" description="Retome uma conversa ou reutilize uma análise com seu contexto e suas fontes." action={gateway?.mode==='demo' && <button className="secondary-button" onClick={()=>{if(window.confirm('Limpar conversas, resumos, avaliações e pedidos de demonstração deste navegador?')){gateway.reset();window.dispatchEvent(new Event('raiziq:demo-reset'));window.dispatchEvent(new Event('raiziq:conversation-updated'));reload();}}}><RotateCcw size={15}/>Limpar demonstração</button>}/><div className="toolbar"><input aria-label="Buscar no histórico" placeholder="Buscar conversas e registros salvos…" value={query} onChange={e=>setQuery(e.target.value)}/></div>{(error||recordError) && <p role="alert" className="notice">{error||recordError}</p>}
    <div className="section-heading"><h2>Conversas</h2></div>{!chats.length?<EmptyState title="Nenhuma conversa encontrada">As consultas deste perfil aparecerão aqui.</EmptyState>:<div className="document-list">{chats.map(chat=><Link className="document-row" key={chat.id} href={'/?conversation='+encodeURIComponent(chat.id)}><MessageSquare size={20}/><span className="document-title"><strong>{chat.title}</strong><small>{chat.count} resposta(s) · {new Date(chat.createdAt).toLocaleString('pt-BR')}</small></span></Link>)}</div>}
    <div className="section-heading"><h2>Análises e resumos</h2></div>{!saved.length?<EmptyState title="Nenhum registro salvo">Salve uma análise ou uma versão de resumo para reutilizar depois.</EmptyState>:<div className="document-list">{saved.map(record=><Link className="document-row" key={record.id} href={recordHref(record)}><FileText size={20}/><span className="document-title"><strong>{record.title}</strong><small>{record.kind==='report'?'Resumo executivo':'Análise'} · {record.facts.length} evidência(s) · {new Date(record.createdAt).toLocaleString('pt-BR')}</small></span></Link>)}</div>}
  </>;
}
