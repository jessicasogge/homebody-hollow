// @vitest-environment jsdom
// game/village.js: your village (village.html), six lots by the road.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cottageById } from '../public/game/cottages.js';
import { designFromQuery, newDesign } from '../public/game/design-state.js';
import { saveLots } from '../public/game/lots.js';
import { open } from './helpers.js';

const village = () => open('village.html', '../public/game/village.js');
const lots = () => [...document.querySelectorAll('.lots > .lot')];
const build = (houses) => saveLots(Array.from({ length: 6 }, (_, i) => houses[i] ?? null));

afterEach(() => {
  window.localStorage.clear();
  vi.unstubAllGlobals();
});

describe('your village', () => {
  it('starts as six empty lots, for sale', async () => {
    await village();
    expect(lots()).toHaveLength(6);
    for (const lot of lots()) {
      expect(lot.querySelector('.for-sale').textContent).toBe('For sale');
      expect(lot.querySelector('svg')).toBeNull();
    }
    expect(document.querySelector('.village-hint').textContent).toBe(
      'Tap a lot to build your first cottage.',
    );
    expect(document.querySelector('.lot-count').textContent).toBe('0 of 6 lots built');
  });

  it('sends each empty lot to the picker, for that lot', async () => {
    await village();
    expect(lots().map((lot) => lot.getAttribute('href'))).toEqual(
      [0, 1, 2, 3, 4, 5].map((i) => `./pick-a-cottage.html?lot=${i}`),
    );
    expect(lots()[0].getAttribute('aria-label')).toBe('Empty lot: build a cottage here');
  });

  it('shows the cottages you built, on their lots, painted your way', async () => {
    build({ 0: designFromQuery('?cottage=soda-cup&walls=%233b82f6'), 3: newDesign(cottageById('teacup')) });
    await village();
    const [first, , third, fourth] = lots();
    expect(first.querySelector('[data-part="walls"]').getAttribute('fill')).toBe('#3b82f6');
    expect(first.querySelector('svg').getAttribute('aria-label')).toBeNull();
    expect(first.getAttribute('aria-label')).toBe('Change your Soda Pop Cottage');
    expect(third.querySelector('.for-sale')).not.toBeNull();
    expect(fourth.querySelector('svg.cottage.lit')).not.toBeNull();
    expect(document.querySelector('.lot-count').textContent).toBe('2 of 6 lots built');
    expect(document.querySelector('.village-hint').textContent).toBe(
      'Tap a lot to build, or a cottage to change it.',
    );
  });

  it('can have the same cottage more than once', async () => {
    build({
      0: designFromQuery('?cottage=soda-cup&walls=%233b82f6'),
      1: designFromQuery('?cottage=soda-cup&walls=%2322c55e'),
    });
    await village();
    const sodas = lots().slice(0, 2).map((lot) => lot.querySelector('[data-part="walls"]').getAttribute('fill'));
    expect(sodas).toEqual(['#3b82f6', '#22c55e']);
  });

  it('sends a built cottage to the studio, to change it', async () => {
    build({ 2: newDesign(cottageById('boot')) });
    await village();
    expect(lots()[2].getAttribute('href')).toBe('./design.html?lot=2');
  });

  it('says so when the village is full', async () => {
    build(Object.fromEntries([0, 1, 2, 3, 4, 5].map((i) => [i, newDesign(cottageById('pot'))])));
    await village();
    expect(document.querySelectorAll('.for-sale')).toHaveLength(0);
    expect(document.querySelector('.village-hint').textContent).toBe(
      'Your village is full! Tap a cottage to change it.',
    );
  });

  it('stands the lots on the grass by the road', async () => {
    await village();
    expect(document.querySelector('.lots').nextElementSibling.getAttribute('class')).toBe('ground');
  });

  it('links back to the home page', async () => {
    await village();
    expect(document.querySelector('.studio-back').getAttribute('href')).toBe('./index.html');
    expect(document.querySelector('h1').textContent).toBe('Your Village');
  });
});
