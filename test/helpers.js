// Shared by the tests that load a real page into jsdom, a simulated browser
// page.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { vi } from 'vitest';

// A page's file, read from the project folder. (jsdom changes import.meta.url
// to a web address, so it can't be found from there.)
export const read = (name) => readFileSync(resolve(process.cwd(), 'public', name), 'utf8');

// Put `page`'s body into the simulated page, pretend the address is
// `address`, and run `script` on it, fresh. Returns the stand-in location,
// so a test can see where the page sent you.
export async function open(page, script, address = page) {
  const url = new URL(`http://localhost/${address}`);
  const location = { href: url.href, search: url.search, replace: vi.fn() };
  vi.stubGlobal('location', location);
  const html = read(page);
  document.body.outerHTML = html.slice(html.indexOf('<body'), html.indexOf('</body>') + 7);
  document.title = html.match(/<title>(.*)<\/title>/)[1];
  vi.resetModules();
  await import(script);
  return location;
}
