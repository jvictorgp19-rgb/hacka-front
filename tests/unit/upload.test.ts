import { it, expect } from 'vitest';
import { validatePdf, MAX_FILE_BYTES } from '@/features/documents/validation';
it('aceita um PDF para seleção e rejeita extensão e assinatura inválidas', async () => {
  expect(await validatePdf(new File(['%PDF-1.4\n'], 'documento.pdf', { type: 'application/pdf' }))).toBeNull();
  expect(await validatePdf(new File(['texto'], 'documento.txt'))).toContain('PDF');
  expect(await validatePdf(new File(['texto'], 'documento.pdf'))).toContain('assinatura');
});
it('rejeita PDF vazio ou acima do limite antes de enviar', async () => {
  expect(await validatePdf(new File([], 'vazio.pdf'))).toContain('20 MiB');
  const file = { name: 'grande.pdf', type: 'application/pdf', size: MAX_FILE_BYTES + 1 } as File;
  expect(await validatePdf(file)).toContain('20 MiB');
});
