'use client';
import { useEffect, useState } from 'react';
import type { Answer } from '@/contracts/models';
import { useWorkspace } from '@/features/workspace/context';
export function useConversationHistory() {
  const { gateway, context }=useWorkspace();
  const [state,setState]=useState<{persona:string;messages:Answer[]}>({persona:'',messages:[]});
  const [error,setError]=useState('');
  const [revision,setRevision]=useState(0);
  useEffect(()=>{const update=()=>setRevision(n=>n+1);window.addEventListener('raiziq:conversation-updated',update);return()=>window.removeEventListener('raiziq:conversation-updated',update);},[]);
  useEffect(()=>{const controller=new AbortController(); gateway?.messages(context.persona,controller.signal).then(messages=>{if(!controller.signal.aborted){setState({persona:context.persona,messages});setError('');}}).catch(e=>{if(!controller.signal.aborted)setError(e instanceof Error?e.message:'Histórico indisponível.');});return()=>controller.abort();},[gateway,context.persona,revision]);
  const messages=state.persona===context.persona?state.messages:[];
  const groups=new Map<string,{id:string;title:string;createdAt:string;count:number}>();
  for(const message of [...messages].sort((a,b)=>a.createdAt.localeCompare(b.createdAt))) {
    const id=message.context.conversationId;if(!id)continue;
    const previous=groups.get(id);groups.set(id,{id,title:previous?.title||message.query,createdAt:message.createdAt,count:(previous?.count||0)+1});
  }
  return {conversations:[...groups.values()].sort((a,b)=>b.createdAt.localeCompare(a.createdAt)),error};
}
