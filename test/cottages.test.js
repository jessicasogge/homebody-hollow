// @vitest-environment jsdom
// game/cottages.js: the six cottages, and how each is drawn.
import { describe, expect, it } from 'vitest';
import {
  COTTAGES,
  cottageById,
  cottageDrawing,
  cottageTile,
  defaultColors,
  PALETTE,
  partColors,
} from '../public/game/cottages.js';

describe('the cottages', () => {
  it('are the six from the drawing, in order', () => {
    expect(COTTAGES.map((c) => c.name)).toEqual([
      'Tiptoe Cottage',
      'Soda Pop Cottage',
      'Stewpot Cottage',
      'Teacup Cottage',
      'Toadstool Cottage',
      'Rainleaf Cottage',
    ]);
  });

  it('each has its own id, safe to put in an address', () => {
    const ids = COTTAGES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z-]+$/);
  });

  it('each has a tile color and a description for screen readers', () => {
    for (const cottage of COTTAGES) {
      expect(cottage.tile).toMatch(/^rgba\(/);
      expect(cottage.looks.length).toBeGreaterThan(10);
    }
  });

  it('are found by id', () => {
    expect(cottageById('teacup').name).toBe('Teacup Cottage');
    expect(cottageById('castle')).toBeUndefined();
    expect(cottageById(null)).toBeUndefined();
  });
});

describe('a cottage drawing', () => {
  it.each(COTTAGES)('$name is an SVG on the shared 120 x 140 box', (cottage) => {
    const svg = cottageDrawing(cottage);
    expect(svg.tagName).toBe('svg');
    expect(svg.getAttribute('viewBox')).toBe('0 0 120 140');
    expect(svg.classList.contains('cottage')).toBe(true);
  });

  it.each(COTTAGES)('$name has windows to light up, and chimney smoke', (cottage) => {
    const svg = cottageDrawing(cottage);
    expect(svg.querySelectorAll('.window').length).toBeGreaterThan(0);
    expect(svg.querySelectorAll('.smoke').length).toBe(2);
  });

  it.each(COTTAGES)('$name says its name and look to screen readers', (cottage) => {
    const svg = cottageDrawing(cottage);
    expect(svg.getAttribute('role')).toBe('img');
    expect(svg.getAttribute('aria-label')).toBe(`${cottage.name}, ${cottage.looks}`);
  });

  it('the leaf\'s slits are cut out, so whatever is behind it shows through', () => {
    const svg = cottageDrawing(cottageById('leaf'));
    const mask = svg.querySelector('mask');
    expect(mask.querySelectorAll('path[fill="black"]')).toHaveLength(6);
    expect(svg.querySelector('g[mask]').getAttribute('mask')).toBe(`url(#${mask.id})`);
  });

  it('each leaf on a page gets its own mask, so they don\'t share one', () => {
    const leaf = cottageById('leaf');
    const ids = [cottageDrawing(leaf), cottageDrawing(leaf)].map((svg) => svg.querySelector('mask').id);
    expect(ids[0]).not.toBe(ids[1]);
  });
});

describe('painting a cottage', () => {
  it.each(COTTAGES)('$name has walls, trim and a door to paint, each with its own label', (cottage) => {
    const keys = cottage.parts.map((part) => part.key);
    expect(keys).toEqual(expect.arrayContaining(['walls', 'trim', 'door']));
    expect(new Set(keys).size).toBe(keys.length);
    for (const part of cottage.parts) {
      expect(part.label).toBeTruthy();
      expect(part.color).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it.each(COTTAGES)('$name is drawn in its own colors to start', (cottage) => {
    expect(defaultColors(cottage)).toEqual(
      Object.fromEntries(cottage.parts.map((part) => [part.key, part.color])),
    );
    const html = cottageDrawing(cottage).innerHTML;
    for (const part of cottage.parts) expect(html).toContain(part.color);
  });

  it.each(COTTAGES)('$name can have every part painted a new color', (cottage) => {
    // Paint each part on its own, so a color showing up proves that part used it.
    for (const part of cottage.parts) {
      const plum = '#4a2530' === part.color ? '#ffffff' : '#123456';
      const html = cottageDrawing(cottage, { [part.key]: plum }).innerHTML;
      expect(html, part.key).toContain(plum);
    }
  });

  it('keeps the parts it isn\'t given in their own colors', () => {
    const teacup = cottageById('teacup');
    const html = cottageDrawing(teacup, { walls: '#93c5fd' }).innerHTML;
    expect(html).toContain('#93c5fd');
    expect(html).not.toContain('#fbcfe8'); // the old wall color
    expect(html).toContain('#f9a8d4'); // the rim, untouched
  });

  it('offers each part its own color first, then the palette, with no repeats', () => {
    const cuff = cottageById('boot').parts.find((part) => part.key === 'trim');
    const colors = partColors(cuff);
    expect(colors[0]).toBe(cuff.color);
    expect(new Set(colors).size).toBe(colors.length);
    for (const color of PALETTE) expect(colors).toContain(color);

    const leaf = cottageById('leaf').parts.find((part) => part.key === 'walls');
    expect(partColors(leaf)).toHaveLength(PALETTE.length); // its own color is in the palette
  });
});

describe('a cottage tile, for the picker', () => {
  it('puts the drawing on the cottage\'s own color', () => {
    const cottage = cottageById('mushroom');
    const tile = cottageTile(cottage);
    expect(tile.className).toBe('cottage-tile');
    expect(tile.style.getPropertyValue('--tile')).toBe(cottage.tile);
    expect(tile.querySelector('svg.cottage')).not.toBeNull();
  });

  it('hides the picture from screen readers, since the card names it', () => {
    const svg = cottageTile(cottageById('boot')).querySelector('svg');
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.hasAttribute('role')).toBe(false);
    expect(svg.hasAttribute('aria-label')).toBe(false);
  });
});
