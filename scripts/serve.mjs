// Read-only local preview of the exported frontend. No application/API endpoints.
import { createServer } from 'node:http';
import { readFile, stat, realpath } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root = resolve(process.env.PREVIEW_DIR || 'out');
const port = Number(process.env.PREVIEW_PORT || 3000);
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.txt': 'text/plain; charset=utf-8',
  '.pdf': 'application/pdf',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
};
createServer(async (req, res) => {
  if (!['GET', 'HEAD'].includes(req.method || '')) {
    res.writeHead(405);
    res.end();
    return;
  }
  try {
    const pathname = decodeURIComponent(new URL(req.url || '/', 'http://localhost').pathname);
    let path = resolve(root, '.' + pathname);
    if (path !== root && !path.startsWith(root + sep)) {
      res.writeHead(403);
      res.end();
      return;
    }
    let status = 200;
    try {
      if ((await stat(path)).isDirectory()) path = resolve(path, 'index.html');
      await stat(path);
    } catch {
      path = resolve(root, '404.html');
      status = 404;
    }
    const actual = await realpath(path);
    if (!actual.startsWith(root + sep)) {
      res.writeHead(403);
      res.end();
      return;
    }
    const data = await readFile(actual);
    res.writeHead(status, {
      'Content-Type': mime[extname(actual)] || 'application/octet-stream',
      'Content-Length': data.length,
      'Cache-Control': 'no-store',
    });
    res.end(req.method === 'HEAD' ? undefined : data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Artefato não encontrado. Execute npm run build.');
  }
}).listen(port, process.env.PREVIEW_HOST || '127.0.0.1', () =>
  console.log(`Frontend estático: http://127.0.0.1:${port} (${root})`),
);
