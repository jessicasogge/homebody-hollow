// Checks the things every page shares, and that every link and file a page
// points at is really there.
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { read } from './helpers.js';

const PAGES = ['index.html', 'pick-a-cottage.html', 'design.html'];

describe('every page', () => {
  it.each(PAGES)('%s has the tab icon and the home-screen name', (page) => {
    const html = read(page);
    expect(html).toContain('<link rel="icon" href="./favicon.svg" type="image/svg+xml" />');
    expect(html).toContain('<meta name="apple-mobile-web-app-title" content="Homebody Hollow" />');
  });

  it.each(PAGES)('%s fits a phone\'s screen', (page) => {
    expect(read(page)).toContain('<meta name="viewport" content="width=device-width, initial-scale=1" />');
  });

  it.each(PAGES)('%s has a title and a description', (page) => {
    const html = read(page);
    expect(html).toMatch(/<title>Homebody Hollow[^<]*<\/title>/);
    expect(html).toMatch(/<meta name="description" content="[^"]+" \/>/);
  });

  it.each(PAGES)('%s is signed at the foot', (page) => {
    expect(read(page)).toContain('<footer class="signature">jsogge 2026</footer>');
  });

  it.each(PAGES)('%s only points at files that exist', (page) => {
    const refs = [...read(page).matchAll(/(?:href|src)="\.\/([^"?#]+)/g)].map((m) => m[1]);
    expect(refs.length).toBeGreaterThan(0);
    for (const ref of refs) expect(existsSync(resolve(process.cwd(), 'public', ref)), ref).toBe(true);
  });

  it.each(PAGES)('%s says "cottage", never "house"', (page) => {
    expect(read(page)).not.toMatch(/house/i);
  });
});

describe('the fonts', () => {
  it.each(['fredoka-600.woff2', 'fredoka-700.woff2', 'nunito-700.woff2'])('has %s', (font) => {
    expect(existsSync(resolve(process.cwd(), 'public/fonts', font))).toBe(true);
  });

  it('ships their license', () => {
    expect(existsSync(resolve(process.cwd(), 'public/fonts/Fredoka-OFL.txt'))).toBe(true);
    expect(existsSync(resolve(process.cwd(), 'public/fonts/Nunito-OFL.txt'))).toBe(true);
  });
});
