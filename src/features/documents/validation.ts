export const MAX_FILES = 10;
export const MAX_FILE_BYTES = 20 * 1024 * 1024;
export function fileKey(file: Pick<File, 'name' | 'size' | 'lastModified'>) { return `${file.name}:${file.size}:${file.lastModified}`; }
export async function validatePdf(file: File): Promise<string | null> {
  if (!file.name.toLowerCase().endsWith('.pdf') || (file.type && file.type !== 'application/pdf')) return 'Escolha um arquivo PDF.';
  if (!file.size || file.size > MAX_FILE_BYTES) return 'O arquivo deve ter entre 1 byte e 20 MiB.';
  if (await file.slice(0, 5).text() !== '%PDF-') return 'O conteúdo não tem a assinatura de um PDF.';
  return null;
}
