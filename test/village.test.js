// @vitest-environment jsdom
// game/village.js: your village (village.html), six lots by the road.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cottageById } from '../public/game/cottages.js';
import { designFromQuery, newDesign } from '../public/game/design-state.js';
import { loadLots, saveLots } from '../public/game/lots.js';
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
    expect(first.querySelector('svg.cottage').getAttribute('aria-label')).toBeNull();
    expect(first.getAttribute('aria-label')).toBe('Visit your Soda Pop Cottage');
    expect(third.querySelector('.for-sale')).not.toBeNull();
    expect(fourth.querySelector('svg.cottage.lit')).not.toBeNull();
    expect(document.querySelector('.lot-count').textContent).toBe('2 of 6 lots built');
    expect(document.querySelector('.village-hint').textContent).toBe(
      'Tap a lot to build, or a cottage to visit it.',
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

  it('shows each cottage\'s yard around it', async () => {
    build({ 0: designFromQuery('?cottage=pot&yard=trees'), 1: newDesign(cottageById('pot')) });
    await village();
    const [withTrees, bare] = lots();
    expect(withTrees.querySelector('.yard-behind').innerHTML).not.toBe('');
    expect(bare.querySelector('.yard-behind').innerHTML).toBe('');
  });

  it('shows who lives in each cottage, in front of it, without a hello', async () => {
    build([designFromQuery('?cottage=boot&friend=hedgehog'), designFromQuery('?cottage=pot')]);
    await village();
    const [boot, pot] = lots();
    const here = boot.querySelector('.with-yard > .friend-here');
    expect(here.querySelector('svg.friend')).not.toBeNull();
    expect(here.style.getPropertyValue('--porch')).toBe('50%'); // the boot's porch, 60 of 120
    expect(here.querySelector('.friend-bubble')).toBeNull();
    expect(pot.querySelector('.friend-here')).toBeNull();
  });

  it('sends a built cottage to its visit page, to look around', async () => {
    build({ 2: newDesign(cottageById('boot')) });
    await village();
    expect(lots()[2].getAttribute('href')).toBe('./visit.html?lot=2');
  });

  it('says so when the village is full', async () => {
    build(Object.fromEntries([0, 1, 2, 3, 4, 5].map((i) => [i, newDesign(cottageById('pot'))])));
    await village();
    expect(document.querySelectorAll('.for-sale')).toHaveLength(0);
    expect(document.querySelector('.village-hint').textContent).toBe(
      'Your village is full! Tap a cottage to visit it.',
    );
  });

  it('stands the lots on the grass by the road', async () => {
    await village();
    expect(document.querySelector('.lots').nextElementSibling.getAttribute('class')).toBe('ground');
  });

  describe('Clear village', () => {
    const clear = () => document.querySelector('.clear-village');
    const shown = (sel) => !document.querySelector(sel).hidden;

    it('isn\'t there when there\'s nothing to clear', async () => {
      await village();
      expect(clear().hidden).toBe(true);
    });

    it('is there once you\'ve built a cottage, with the question tucked away', async () => {
      build({ 3: newDesign(cottageById('cat')) });
      await village();
      expect(clear().hidden).toBe(false);
      expect(shown('.clear-start')).toBe(true);
      expect(shown('.clear-confirm')).toBe(false);
      expect(document.querySelector('.clear-start').textContent).toBe('Clear village');
    });

    it('asks first, and clears nothing until you say yes', async () => {
      build({ 0: newDesign(cottageById('boot')) });
      await village();
      document.querySelector('.clear-start').click();
      expect(shown('.clear-start')).toBe(false);
      expect(shown('.clear-confirm')).toBe(true);
      expect(document.querySelector('.clear-confirm p').textContent).toBe(
        'Remove all your cottages? This can\'t be undone.',
      );
      expect(document.activeElement.textContent).toBe('Keep them');
      expect(loadLots()[0].cottage).toBe('boot');
    });

    it('keeps everything with "Keep them"', async () => {
      build({ 0: newDesign(cottageById('boot')) });
      await village();
      document.querySelector('.clear-start').click();
      document.querySelector('.clear-no').click();
      expect(shown('.clear-start')).toBe(true);
      expect(shown('.clear-confirm')).toBe(false);
      expect(loadLots()[0].cottage).toBe('boot');
    });

    it('empties every lot with "Yes, clear it", and shows the empty village', async () => {
      build(Object.fromEntries([0, 1, 2, 3, 4, 5].map((i) => [i, newDesign(cottageById('pot'))])));
      const reload = vi.fn();
      const location = await village();
      location.reload = reload;
      document.querySelector('.clear-start').click();
      document.querySelector('.clear-yes').click();
      expect(loadLots()).toEqual([null, null, null, null, null, null]);
      expect(reload).toHaveBeenCalled();
    });

    it('counts clearing the village on GoatCounter', async () => {
      build({ 0: newDesign(cottageById('pot')) });
      vi.stubGlobal('goatcounter', { count: vi.fn() });
      const location = await village();
      location.reload = vi.fn();
      document.querySelector('.clear-start').click();
      document.querySelector('.clear-yes').click();
      expect(window.goatcounter.count).toHaveBeenCalledWith({
        path: 'homebody-hollow/cleared-village',
        title: 'Cleared the village',
        event: true,
      });
    });
  });

  describe('day and night', () => {
    const at = (hour) => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(new Date(2026, 10, 26, hour, 30));
    };
    const scene = () => document.querySelector('.village-scene');
    const sky = () => document.querySelector('.sky-toggle');
    afterEach(() => vi.useRealTimers());

    it.each([7, 12, 18])('is day at %i:30, with the sun', async (hour) => {
      at(hour);
      await village();
      expect(scene().classList.contains('night')).toBe(false);
      expect(sky().getAttribute('aria-pressed')).toBe('false');
      expect(sky().title).toBe('Tap the sun for night');
    });

    it.each([19, 23, 0, 5])('is night at %i:30, with the moon', async (hour) => {
      at(hour);
      await village();
      expect(scene().classList.contains('night')).toBe(true);
      expect(sky().getAttribute('aria-pressed')).toBe('true');
      expect(sky().title).toBe('Tap the moon for day');
    });

    it('turns to night when you tap the sun, and back to day when you tap the moon', async () => {
      at(12);
      await village();
      expect(sky().getAttribute('aria-label')).toBe('Night');
      sky().click();
      expect(scene().classList.contains('night')).toBe(true);
      sky().click();
      expect(scene().classList.contains('night')).toBe(false);
    });
  });

  describe('seasons', () => {
    const inMonth = (month) => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(new Date(2026, month, 15, 12));
    };
    const scene = () => document.querySelector('.village-scene');
    const button = () => document.querySelector('.season-toggle');
    afterEach(() => vi.useRealTimers());

    it.each([
      [2, 'spring'],
      [4, 'spring'],
      [5, 'summer'],
      [7, 'summer'],
      [8, 'autumn'],
      [10, 'autumn'],
      [11, 'winter'],
      [0, 'winter'],
      [1, 'winter'],
    ])('in month %i (from 0) is %s', async (month, season) => {
      inMonth(month);
      await village();
      expect(scene().classList.contains(`season-${season}`)).toBe(true);
      expect(button().textContent.toLowerCase()).toBe(season);
    });

    it('goes to the next season when you tap it, round the year, and says so', async () => {
      inMonth(10);
      await village();
      expect(button().getAttribute('aria-label')).toBe('Autumn: tap for winter');
      button().click();
      expect(scene().classList.contains('season-winter')).toBe(true);
      expect(scene().classList.contains('season-autumn')).toBe(false);
      button().click();
      expect(button().textContent).toBe('Spring');
      expect(button().getAttribute('aria-label')).toBe('Spring: tap for summer');
    });

    it('has nothing falling', async () => {
      inMonth(10);
      await village();
      expect(document.querySelector('.weather')).toBeNull();
    });
  });

  it('links back to the home page', async () => {
    await village();
    expect(document.querySelector('.studio-back').getAttribute('href')).toBe('./index.html');
    expect(document.querySelector('h1').textContent).toBe('Your Village');
  });
});
