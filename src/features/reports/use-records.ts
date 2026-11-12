'use client';
import { useEffect, useState } from 'react';
import type { SavedRecord } from '@/contracts/models';
import { useWorkspace } from '@/features/workspace/context';
export function useRecords() {
  const { gateway, context }=useWorkspace();
  const [records,setRecords]=useState<SavedRecord[]>([]);
  const [error,setError]=useState('');
  const [loading,setLoading]=useState(true);
  useEffect(()=>{const controller=new AbortController(); gateway?.records(context.persona,controller.signal).then(list=>{if(!controller.signal.aborted){setRecords(list);setLoading(false);}}).catch(e=>{if(!controller.signal.aborted){setError(e instanceof Error?e.message:'Não foi possível carregar os registros.');setLoading(false);}});return()=>controller.abort();},[gateway,context.persona]);
  return { records,setRecords,error,loading };
}
