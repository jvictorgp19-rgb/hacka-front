'use client';
import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
export default function Dialog({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { if (open && !ref.current?.open) ref.current?.showModal(); if (!open) ref.current?.close(); }, [open]);
  return <dialog className="detail-dialog" ref={ref} aria-label={title} onCancel={onClose} onClose={onClose}><header><h2>{title}</h2><button className="icon-button" aria-label="Fechar detalhes" onClick={onClose}><X size={18}/></button></header>{children}</dialog>;
}
