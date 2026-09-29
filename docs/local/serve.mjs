import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';

// Explicit allowlist: never expose repository files or environment variables.
const files = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/index.html', ['index.html', 'text/html; charset=utf-8']],
  ['/integracoes.html', ['integracoes.html', 'text/html; charset=utf-8']],
  ['/style.css', ['style.css', 'text/css; charset=utf-8']],
  ['/app.js', ['app.js', 'text/javascript; charset=utf-8']],
]);
const server = createServer(async (req, res) => {
  const headers = {
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'X-Robots-Tag': 'noindex, nofollow, noarchive',
    'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'none'; img-src 'self' data:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'",
  };
  if (!['127.0.0.1:4178', 'localhost:4178'].includes(req.headers.host)) {
    res.writeHead(403, headers).end('Acesso somente local.'); return;
  }
  if (!['GET', 'HEAD'].includes(req.method)) {
    res.writeHead(405, { ...headers, Allow: 'GET, HEAD' }).end(); return;
  }
  const file = files.get(req.url);
  if (!file) { res.writeHead(404, headers).end('Página não encontrada.'); return; }
  try {
    const body = await readFile(new URL(file[0], import.meta.url));
    res.writeHead(200, { ...headers, 'Content-Type': file[1] });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch {
    res.writeHead(500, headers).end('Não foi possível abrir a documentação.');
  }
});
server.on('error', error => {
  console.error(error.code === 'EADDRINUSE' ? 'A porta 4178 está ocupada. Feche a outra instância antes de iniciar.' : error.message);
  process.exitCode = 1;
});
server.listen(4178, '127.0.0.1', () => console.log('LineUp Docs local: http://127.0.0.1:4178 — Ctrl+C para encerrar.'));
