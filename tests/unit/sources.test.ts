import { it, expect } from 'vitest';
import { sourceUrlSchema } from '@/contracts/models';
it('aceita apenas referências de fonte navegáveis com protocolos seguros', () => {
  expect(sourceUrlSchema.safeParse('/documents/NG_111@3.0.0/file').success).toBe(true);
  expect(sourceUrlSchema.safeParse('https://example.test/documento').success).toBe(true);
  for (const value of [
    'javascript:alert(1)',
    '//example.test',
    '/\\example.test',
    'data:text/html,x',
    'https://',
  ])
    expect(sourceUrlSchema.safeParse(value).success).toBe(false);
});
