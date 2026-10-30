// Checks the things every page shares, and that every link and file a page
// points at is really there.
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { read } from './helpers.js';

const PAGES = ['index.html', 'pick-a-cottage.html', 'design.html', 'village.html'];

describe('every page', () => {
  it.each(PAGES)('%s has the tab icon, with a PNG for browsers without SVG icons', (page) => {
    const html = read(page);
    expect(html).toContain('<link rel="icon" href="./favicon.svg" type="image/svg+xml" />');
    expect(html).toContain('<link rel="icon" href="./favicon-32.png" type="image/png" sizes="32x32" />');
  });

  it.each(PAGES)('%s has the home-screen icon and name, for saving it to a phone', (page) => {
    const html = read(page);
    expect(html).toContain('<link rel="apple-touch-icon" href="./apple-touch-icon.png" />');
    expect(html).toContain('<meta name="apple-mobile-web-app-title" content="Homebody Hollow" />');
  });

  it.each(PAGES)('%s shows the preview picture, its title and description when the link is shared', (page) => {
    const html = read(page);
    const meta = (property) => html.match(new RegExp(`<meta property="${property}" content="([^"]*)" />`))?.[1];
    const title = html.match(/<title>(.*)<\/title>/)[1];
    const description = html.match(/<meta name="description" content="([^"]*)" \/>/)[1];
    const url = `https://jessicasogge.github.io/homebody-hollow/${page === 'index.html' ? '' : page}`;
    expect(meta('og:title')).toBe(title);
    expect(meta('og:description')).toBe(description);
    expect(meta('og:url')).toBe(url);
    expect(html).toContain(`<link rel="canonical" href="${url}" />`);
    expect(meta('og:image')).toBe('https://jessicasogge.github.io/homebody-hollow/social-preview.png');
    expect([meta('og:image:width'), meta('og:image:height')]).toEqual(['1200', '630']);
    expect(meta('og:image:alt')).toBeTruthy();
    expect(html).toContain('<meta name="twitter:card" content="summary_large_image" />');
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

describe('the pictures', () => {
  const png = (name) => readFileSync(resolve(process.cwd(), 'public', name));
  const size = (file) => [file.readUInt32BE(16), file.readUInt32BE(20)];

  it.each([
    ['apple-touch-icon.png', 'the home-screen icon (iOS wants 180 by 180)', 180, 180],
    ['favicon-32.png', 'the PNG tab icon', 32, 32],
    ['social-preview.png', 'the shared-link preview', 1200, 630],
  ])('%s, %s, is a %i by %i PNG', (name, _, width, height) => {
    const file = png(name);
    expect(file.subarray(1, 4).toString()).toBe('PNG');
    expect(size(file)).toEqual([width, height]);
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
