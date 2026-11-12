'use client';
import type { ReactNode } from 'react';
import { ArrowUpRight, FileText } from 'lucide-react';
import type { Fact } from '@/contracts/models';
import { useWorkspace } from '@/features/workspace/context';
export function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <header className="page-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </header>
  );
}
export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="empty-state">
      <FileText size={24} />
      <h2>{title}</h2>
      {children && <p>{children}</p>}
    </div>
  );
}
export function EvidenceCard({ fact, action }: { fact: Fact; action?: ReactNode }) {
  const { openSource } = useWorkspace();
  return (
    <article className="evidence-card">
      <div className="card-meta">
        <span>{fact.area}</span>
        <span>
          {fact.citation.codigo} · v{fact.citation.versao}
        </span>
      </div>
      <h3>{fact.title}</h3>
      <p>{fact.text}</p>
      <footer>
        <button className="source-link" onClick={() => openSource(fact.citation)}>
          <FileText size={14} />
          {fact.citation.item}
          <ArrowUpRight size={14} />
        </button>
        {action}
      </footer>
    </article>
  );
}
