'use client';
import { useState } from 'react';
import Link from 'next/link';
import { CircleHelp, ArrowUpRight } from 'lucide-react';
import Dialog from '@/components/ui/Dialog';
import { useWorkspace } from '@/features/workspace/context';
const steps = [
  { title: 'Ana: férias em 05/05/2027', persona: 'ana', href: '/simuladores/?tema=ferias' },
  {
    title: 'Ana: 30 dias ou 45 dias?',
    persona: 'ana',
    href: '/?pergunta=' + encodeURIComponent('Não eram 30 dias para pedir férias?'),
  },
  { title: 'Carlos: equipe de nove pessoas', persona: 'carlos', href: '/simuladores/?tema=ferias' },
  {
    title: 'Diretora: alçada de R$ 18.000,01',
    persona: 'diretora_diraf',
    href: '/simuladores/?tema=inovacao',
  },
  { title: 'Rafael: prazos e multa do contrato', persona: 'rafael', href: '/prazos/?mes=2027-03' },
  {
    title: 'Abstenção: rateio do prêmio em equipe',
    persona: 'marina',
    href: '/?pergunta=' + encodeURIComponent('Como dividir o prêmio em equipe?'),
  },
  { title: 'Curadoria: pedido e resposta orientada', persona: 'ana', href: '/administracao/' },
  { title: 'Executivo: resumo por seleção', persona: 'diretora_diraf', href: '/resumos/' },
];
export default function DemoGuide() {
  const { gateway, context, setContext } = useWorkspace();
  const [open, setOpen] = useState(false);
  if (gateway?.mode !== 'demo') return null;
  return (
    <>
      <button
        className="icon-button"
        aria-label="Roteiro da demonstração"
        onClick={() => setOpen(true)}
      >
        <CircleHelp size={18} />
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Roteiro da demonstração">
        <p className="muted">
          Oito cenários do acervo sintético. Revise as premissas e envie as consultas manualmente.
        </p>
        <ol className="demo-guide">
          {steps.map((step, i) => (
            <li key={step.title}>
              <Link
                href={step.href}
                onClick={() => {
                  setContext({ ...context, persona: step.persona });
                  setOpen(false);
                }}
              >
                <span>{i + 1}</span>
                <strong>{step.title}</strong>
                <ArrowUpRight size={16} />
              </Link>
            </li>
          ))}
        </ol>
      </Dialog>
    </>
  );
}
