// @vitest-environment jsdom
// game/cottages.js: the six cottages, and how each is drawn.
import { describe, expect, it } from 'vitest';
import { COTTAGES, cottageById, cottageDrawing, cottageTile } from '../public/game/cottages.js';

describe('the cottages', () => {
  it('are the six from the drawing, in order', () => {
    expect(COTTAGES.map((c) => c.name)).toEqual([
      'Tiptoe Cottage',
      'Soda Cottage',
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

  it('the leaf\'s slits show the page through them', () => {
    const svg = cottageDrawing(cottageById('leaf'));
    expect(svg.innerHTML).toContain('fill: var(--bg)');
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
