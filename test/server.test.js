// server.js: `npm start`, for playing the game locally on port 3009.
import { spawn } from 'node:child_process';
import { request } from 'node:http';
import { rmSync, writeFileSync } from 'node:fs';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { portFrom, server } from '../server.js';

let base;

// Try the server out on a spare port the system picks, so the tests don't
// clash with a copy you're already running on 3009.
beforeAll(async () => {
  await new Promise((resolve) => server.listen(0, resolve));
  base = `http://localhost:${server.address().port}`;
});

afterAll(() => new Promise((resolve) => server.close(resolve)));

describe('the port', () => {
  it('is 3009', () => {
    expect(portFrom({})).toBe(3009);
  });

  it('can be changed with PORT', () => {
    expect(portFrom({ PORT: '4000' })).toBe(4000);
  });

  it('is 3009 again if PORT isn\'t a number', () => {
    expect(portFrom({ PORT: 'soon' })).toBe(3009);
  });
});

describe('npm start', () => {
  it('starts the server and says where to find it', async () => {
    const child = spawn(process.execPath, ['server.js'], { env: { ...process.env, PORT: '3019' } });
    try {
      const said = await new Promise((resolve, reject) => {
        child.stdout.on('data', (data) => resolve(String(data)));
        child.on('error', reject);
      });
      expect(said).toBe('Listening on http://localhost:3019\n');
      expect((await fetch('http://localhost:3019/')).status).toBe(200);
    } finally {
      child.kill();
    }
  });
});

describe('the local server', () => {
  it('serves the home page at /', async () => {
    const res = await fetch(`${base}/`);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('text/html; charset=utf-8');
    expect(await res.text()).toContain('<h1 class="logo">Homebody Hollow</h1>');
  });

  it.each([
    ['/styles.css', 'text/css; charset=utf-8'],
    ['/script.js', 'text/javascript; charset=utf-8'],
    ['/favicon.svg', 'image/svg+xml'],
    ['/fonts/fredoka-700.woff2', 'font/woff2'],
    ['/fonts/Fredoka-OFL.txt', 'text/plain; charset=utf-8'],
    ['/pick-a-cottage.html', 'text/html; charset=utf-8'],
  ])('serves %s as %s', async (path, type) => {
    const res = await fetch(`${base}${path}`);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe(type);
  });

  it('serves a kind of file it doesn\'t know as plain bytes', async () => {
    const odd = 'public/odd-file-for-a-test.xyz';
    writeFileSync(odd, 'hello');
    try {
      const res = await fetch(`${base}/odd-file-for-a-test.xyz`);
      expect(res.status).toBe(200);
      expect(res.headers.get('content-type')).toBe('application/octet-stream');
    } finally {
      rmSync(odd);
    }
  });

  it('serves the design page with its ?cottage= address', async () => {
    expect((await fetch(`${base}/design.html?cottage=boot`)).status).toBe(200);
  });

  it('says "Not found" for a folder with no index page', async () => {
    expect((await fetch(`${base}/fonts/`)).status).toBe(404);
  });

  it('says "Not found" for a page that isn\'t there', async () => {
    const res = await fetch(`${base}/castle.html`);
    expect(res.status).toBe(404);
    expect(await res.text()).toBe('Not found');
  });

  // Sent as is: fetch() would tidy the "../" away before it left.
  it.each([
    '/../server.js',
    '/../package.json',
    '/fonts/../../server.js',
    '/%2e%2e/server.js',
    '/..%2Fserver.js',
    '/fonts/..%2F..%2Fpackage.json',
  ])(
    'won\'t serve files outside public/ (%s)',
    async (path) => {
      const status = await new Promise((resolve, reject) => {
        request(`${base}${path}`, { path }, (res) => {
          res.resume();
          resolve(res.statusCode);
        })
          .on('error', reject)
          .end();
      });
      expect(status).toBe(404);
    },
  );

  it('doesn\'t fall over on a garbled address', async () => {
    expect((await fetch(`${base}/%E0%A4%A`)).status).toBe(404);
    expect((await fetch(`${base}/`)).status).toBe(200);
  });
});
