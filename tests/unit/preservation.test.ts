import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import manifest from '../../docs/checkpoints/baseline-acervo.json';
import acervo from '../../src/data/acervo_estruturado_acme_bbts.json';

describe('preservação do acervo sintético', () => {
  it('mantém todos os bytes dos PDFs da linha de base', () => {
    for (const [path, hash] of Object.entries(manifest)) {
      expect(createHash('sha256').update(readFileSync(path)).digest('hex'), path).toBe(hash);
    }
  });
  it('preserva versões antigas e a distinção entre registros e arquivos', () => {
    expect(acervo.documentos_acervo).toHaveLength(11);
    expect(acervo.documentos_substituidos_bloqueados).toHaveLength(3);
    expect(new Set(Object.values(manifest)).size).toBe(13);
    expect(acervo.documentos_substituidos_bloqueados.every(d => !d.vigente)).toBe(true);
  });
  it('mantém os gabaritos de prazos e orçamento do acervo', () => {
    expect(acervo.jornadas_por_tema.ferias.regras_simuladores.antecedencia_minima_dias_corridos).toBe(45);
    expect(acervo.jornadas_por_tema.inovacao.regras_simuladores.orcamento_total_2027).toBe(96000);
  });
});
