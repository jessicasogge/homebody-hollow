// @vitest-environment jsdom
// game/cottage-picker.js: Pick a Cottage, a card for each cottage.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { COTTAGES } from '../public/game/cottages.js';
import { open } from './helpers.js';

const picker = () => open('pick-a-cottage.html', '../public/game/cottage-picker.js');

afterEach(() => vi.unstubAllGlobals());

describe('the cottage picker', () => {
  it('has a card for every cottage, in order', async () => {
    await picker();
    const names = [...document.querySelectorAll('.cottage-card h2')].map((h) => h.textContent);
    expect(names).toEqual(COTTAGES.map((c) => c.name));
  });

  it('makes each whole card the link to design that cottage', async () => {
    await picker();
    const links = [...document.querySelectorAll('.picker-grid > a.cottage-card')];
    expect(links.map((a) => a.getAttribute('href'))).toEqual(
      COTTAGES.map((c) => `./design.html?cottage=${c.id}`),
    );
  });

  it('shows each cottage on its tile, with just its name under it', async () => {
    await picker();
    for (const card of document.querySelectorAll('.cottage-card')) {
      expect(card.querySelector('.cottage-tile svg.cottage')).not.toBeNull();
      expect(card.children).toHaveLength(2); // the tile and the name
    }
  });

  it('links back to the home page', async () => {
    await picker();
    expect(document.querySelector('.back-link').getAttribute('href')).toBe('./index.html');
  });
});
