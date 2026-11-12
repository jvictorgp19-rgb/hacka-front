'use client';
import { useState } from 'react';
import { useWorkspace } from '@/features/workspace/context';
import { PageHeading, EmptyState } from '@/components/ui/primitives';
import FeriasSimulators from '@/components/FeriasSimulators';
import InovacaoSimulators from '@/components/InovacaoSimulators';
import LocacaoSimulators from '@/components/LocacaoSimulators';
import acervo from '@/data/acervo_estruturado_acme_bbts.json';
export default function DetailedSimulators() {
  const { gateway } = useWorkspace();
  const [theme, setTheme] = useState('ferias');
  if (gateway?.mode === 'api')
    return (
      <>
        <PageHeading
          eyebrow="FERRAMENTAS DE APOIO"
          title="Simuladores"
          description="As simulações devem receber regras compatíveis com o acervo da API."
        />
        <EmptyState title="Regras de simulação externas ainda não conectadas">
          Nenhum conjunto demonstrativo substitui as regras do serviço.
        </EmptyState>
      </>
    );
  return (
    <>
      <PageHeading
        eyebrow="ENTENDA ANTES DE DECIDIR"
        title="Simuladores de regras"
        description="Explore cenários do acervo sintético. As simulações não aprovam operações reais."
      />
      <div className="segmented" aria-label="Tema do simulador">
        {[
          ['ferias', 'Férias'],
          ['inovacao', 'Inovação'],
          ['locacao', 'Locação'],
        ].map(([id, label]) => (
          <button key={id} aria-pressed={theme === id} onClick={() => setTheme(id)}>
            {label}
          </button>
        ))}
      </div>
      <div className="tools-legacy">
        {theme === 'ferias' ? (
          <FeriasSimulators
            regras={acervo.jornadas_por_tema.ferias.regras_simuladores}
            mermaidCode={
              acervo.documentos_acervo.find((d) => 'mermaid_code' in d)?.mermaid_code || ''
            }
          />
        ) : theme === 'inovacao' ? (
          <InovacaoSimulators
            regras={acervo.jornadas_por_tema.inovacao.regras_simuladores}
            alcadasNg012={acervo.alcadas_financeiras_ng012}
          />
        ) : (
          <LocacaoSimulators regras={acervo.jornadas_por_tema.locacao.regras_simuladores} />
        )}
      </div>
    </>
  );
}
