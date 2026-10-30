// Serves public/ for playing the game locally: npm start, then open
// http://localhost:3009. No dependencies, just Node's own http module.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const ROOT = join(import.meta.dirname, 'public');
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};

// The port to use: PORT if it's set, otherwise 3009.
export function portFrom(env) {
  return Number(env.PORT) || 3009;
}

export const server = createServer(async (req, res) => {
  try {
    let path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (path.endsWith('/')) path += 'index.html';
    // normalize() folds away any "../", so a request can't reach outside public/.
    const file = join(ROOT, normalize(path));
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('Not found');
  }
});

// Start listening when run with `npm start`, but not when a test imports
// this file to try the server out on a port of its own.
/* v8 ignore next 4 */
if (import.meta.main) {
  const port = portFrom(process.env);
  server.listen(port, () => console.log(`Listening on http://localhost:${port}`));
}
