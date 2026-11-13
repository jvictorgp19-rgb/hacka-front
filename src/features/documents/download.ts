/** Browsers download only the authenticated response; never an alternative public URL. */
export function downloadName(name: string) {
  return name.replace(/[\\/\u0000-\u001f\u007f]/g, '_').slice(0, 200) || 'documento.pdf';
}
export function saveUploadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob),
    link = document.createElement('a');
  try {
    link.href = url;
    link.download = downloadName(name);
    link.click();
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
