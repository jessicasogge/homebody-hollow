// @vitest-environment jsdom
// game/village.js: your cottage in the village (village.html?cottage=teacup).
import { afterEach, describe, expect, it, vi } from 'vitest';
import { COTTAGES } from '../public/game/cottages.js';
import { open } from './helpers.js';

const village = (query) => open('village.html', '../public/game/village.js', `village.html${query}`);
const street = () => [...document.querySelector('.village-street').children];
const yours = () => document.querySelector('.village-street svg.yours');

afterEach(() => {
  window.sessionStorage.clear();
  vi.unstubAllGlobals();
});

describe('the village', () => {
  const names = () =>
    [...document.querySelectorAll('.village-street svg.cottage')].map(
      (svg) => svg.getAttribute('aria-label').split(',')[0],
    );

  it.each(COTTAGES.map((c, i) => [c.id, i]))(
    'always has the cottages in the same order, with yours (the %s) in its own spot',
    async (id, i) => {
      await village(`?cottage=${id}`);
      expect(names()).toEqual(COTTAGES.map((c) => c.name));
      expect(street().findIndex((el) => el.classList.contains('yours-wrap'))).toBe(i);
      expect(document.querySelectorAll('.village-street svg.yours')).toHaveLength(1);
    },
  );

  it('slides the row so yours is in the middle, and again when the window changes size', async () => {
    await village('?cottage=pot');
    const row = document.querySelector('.village-street');
    const home = document.querySelector('.yours-wrap');
    let scrolled;
    Object.defineProperty(row, 'scrollLeft', { set: (x) => (scrolled = x), get: () => scrolled });
    Object.defineProperty(row, 'clientWidth', { value: 300 });
    Object.defineProperty(home, 'offsetLeft', { value: 260 });
    Object.defineProperty(home, 'offsetWidth', { value: 140 });
    window.dispatchEvent(new Event('resize'));
    expect(scrolled).toBe(260 + 70 - 150);
  });

  it('paints yours the way you designed it, and its neighbors their own way', async () => {
    await village('?cottage=teacup&walls=%2360a5fa');
    expect(yours().innerHTML).toContain('#60a5fa');
    expect(yours().getAttribute('aria-label')).toMatch(/^Teacup Cottage, /);
    for (const neighbor of document.querySelectorAll('.village-street svg:not(.yours)')) {
      expect(neighbor.innerHTML).not.toContain('#60a5fa');
    }
  });

  it('shows the other cottages you painted while the tab was open', async () => {
    window.sessionStorage.setItem(
      'homebody-hollow:designs',
      JSON.stringify({ mushroom: '?cottage=mushroom&trim=%23f87171', leaf: '?cottage=leaf' }),
    );
    await village('?cottage=boot&walls=%2360a5fa');
    const drawn = (name) =>
      [...document.querySelectorAll('.village-street svg')].find((svg) =>
        svg.getAttribute('aria-label').startsWith(name),
      );
    expect(drawn('Toadstool Cottage').querySelector('[data-part="trim"]').getAttribute('fill')).toBe('#f87171');
    expect(drawn('Rainleaf Cottage').querySelector('[data-part="walls"]').getAttribute('fill')).toBe('#4d7c0f');
    expect(drawn('Teacup Cottage').querySelector('[data-part="walls"]:not([fill="none"])').getAttribute('fill')).toBe('#fbcfe8');
    // Only yours gets the sign.
    expect(document.querySelectorAll('.yours-sign')).toHaveLength(1);
  });

  it('shows yours the way the address says, even if it was remembered differently', async () => {
    window.sessionStorage.setItem(
      'homebody-hollow:designs',
      JSON.stringify({ boot: '?cottage=boot&walls=%23ffffff' }),
    );
    await village('?cottage=boot&walls=%2360a5fa');
    expect(yours().querySelector('[data-part="walls"]').getAttribute('fill')).toBe('#60a5fa');
  });

  it('lights yours up and puts a sign over it', async () => {
    await village('?cottage=pot');
    expect(yours().classList.contains('lit')).toBe(true);
    expect(document.querySelector('.yours-sign').textContent).toBe('Your cottage');
  });

  it('stands the cottages on the grass by the road', async () => {
    await village('?cottage=pot');
    expect(document.querySelector('.village-street').nextElementSibling.getAttribute('class')).toBe('ground');
  });

  it('says whose cottage it is', async () => {
    await village('?cottage=mushroom');
    expect(document.querySelector('.village-caption').textContent).toBe(
      'Here\'s Toadstool Cottage, in the village!',
    );
    expect(document.title).toBe('Homebody Hollow | Toadstool Cottage in the Village');
  });

  it('goes back to the studio with the design still there', async () => {
    await village('?cottage=teacup&walls=%2360a5fa');
    expect(document.querySelector('.village-back').getAttribute('href')).toBe(
      './design.html?cottage=teacup&walls=%2360a5fa',
    );
  });

  it.each([
    ['no cottage', ''],
    ['a cottage that doesn\'t exist', '?cottage=castle'],
  ])('sends you to the picker when the address has %s', async (_, query) => {
    const { replace } = await village(query);
    expect(replace).toHaveBeenCalledWith('./pick-a-cottage.html');
    expect(street()).toHaveLength(0);
  });
});
