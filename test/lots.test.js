// @vitest-environment jsdom
// game/lots.js: your village's six lots, kept in the browser.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cottageById } from '../public/game/cottages.js';
import { designFromQuery, newDesign } from '../public/game/design-state.js';
import { firstEmptyLot, loadLots, LOT_COUNT, lotNumber, saveLots } from '../public/game/lots.js';

const KEY = 'homebody-hollow:village';

afterEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe('your village\'s lots', () => {
  it('are six, all empty to start', () => {
    expect(LOT_COUNT).toBe(6);
    expect(loadLots()).toEqual([null, null, null, null, null, null]);
  });

  it('keep the cottages you build, in their lots, for next time', () => {
    const lots = loadLots();
    lots[0] = designFromQuery('?cottage=soda-cup&walls=%233b82f6%3Astripes');
    lots[3] = newDesign(cottageById('teacup'));
    saveLots(lots);
    expect(loadLots()).toEqual(lots);
    expect(JSON.parse(window.localStorage.getItem(KEY))).toEqual([
      '?cottage=soda-cup&walls=%233b82f6%3Astripes',
      null,
      null,
      '?cottage=teacup',
      null,
      null,
    ]);
  });

  it('can hold the same cottage more than once, each painted its own way', () => {
    const lots = loadLots();
    lots[0] = designFromQuery('?cottage=soda-cup&walls=%233b82f6');
    lots[1] = designFromQuery('?cottage=soda-cup&walls=%2322c55e');
    saveLots(lots);
    const [first, second] = loadLots();
    expect(first.cottage).toBe('soda-cup');
    expect(second.cottage).toBe('soda-cup');
    expect(first.outside.walls.color).toBe('#3b82f6');
    expect(second.outside.walls.color).toBe('#22c55e');
  });

  it('find the first empty lot, or none when the village is full', () => {
    const lots = loadLots();
    expect(firstEmptyLot(lots)).toBe(0);
    lots[0] = newDesign(cottageById('pot'));
    lots[1] = newDesign(cottageById('pot'));
    expect(firstEmptyLot(lots)).toBe(2);
    expect(firstEmptyLot(lots.map(() => newDesign(cottageById('pot'))))).toBeNull();
  });

  it.each([
    ['0', 0],
    ['5', 5],
    ['6', null],
    ['-1', null],
    ['2.5', null],
    ['two', null],
    ['', null],
    [null, null],
  ])('read a lot number from an address: %j is %j', (value, lot) => {
    expect(lotNumber(value)).toBe(lot);
  });

  it.each([
    ['isn\'t JSON', 'not json'],
    ['isn\'t a list', '{"0": "?cottage=pot"}'],
    ['has something odd in a lot', '[42, true]'],
    ['names a cottage that doesn\'t exist', '["?cottage=castle"]'],
  ])('start empty if what\'s stored %s', (_, stored) => {
    window.localStorage.setItem(KEY, stored);
    expect(loadLots()).toEqual([null, null, null, null, null, null]);
  });

  it('ignore a bad color in what\'s stored, like a bad address', () => {
    window.localStorage.setItem(KEY, JSON.stringify(['?cottage=pot&walls=%22%3E%3Cscript%3E']));
    expect(loadLots()[0]).toEqual(newDesign(cottageById('pot')));
  });

  it('still work when the browser won\'t store anything', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(() => saveLots([newDesign(cottageById('pot'))])).not.toThrow();
    expect(loadLots()).toEqual([null, null, null, null, null, null]);
  });
});
