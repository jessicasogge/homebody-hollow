// @vitest-environment jsdom
// game/remembered.js: the cottages you've painted, remembered while the tab
// is open.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cottageById } from '../public/game/cottages.js';
import { designFromQuery, newDesign } from '../public/game/design-state.js';
import { isPainted, remember, remembered } from '../public/game/remembered.js';

const KEY = 'homebody-hollow:designs';

afterEach(() => {
  window.sessionStorage.clear();
  vi.restoreAllMocks();
});

describe('remembering painted cottages', () => {
  it('knows a fresh design from a painted one', () => {
    expect(isPainted(newDesign(cottageById('pot')))).toBe(false);
    expect(isPainted(designFromQuery('?cottage=pot&walls=%23ffffff'))).toBe(true);
  });

  it('remembers a painted cottage, and gives it back', () => {
    const design = designFromQuery('?cottage=teacup&walls=%2360a5fa%3Adots');
    remember(design);
    expect(remembered('teacup')).toEqual(design);
  });

  it('remembers each cottage on its own', () => {
    remember(designFromQuery('?cottage=boot&walls=%2360a5fa'));
    remember(designFromQuery('?cottage=leaf&door=%23ffffff'));
    expect(remembered('boot').outside.walls.color).toBe('#60a5fa');
    expect(remembered('leaf').outside.door.color).toBe('#ffffff');
  });

  it('forgets a cottage put back to its own colors', () => {
    remember(designFromQuery('?cottage=boot&walls=%2360a5fa'));
    remember(newDesign(cottageById('boot')));
    expect(remembered('boot')).toBeNull();
    expect(JSON.parse(window.sessionStorage.getItem(KEY))).toEqual({});
  });

  it('has nothing for a cottage that hasn\'t been painted', () => {
    expect(remembered('mushroom')).toBeNull();
  });

  it('keeps it in the tab\'s session storage, which closing the tab clears', () => {
    remember(designFromQuery('?cottage=pot&walls=%23ffffff'));
    expect(JSON.parse(window.sessionStorage.getItem(KEY))).toEqual({
      pot: '?cottage=pot&walls=%23ffffff',
    });
  });

  it.each([
    ['isn\'t JSON', 'not json'],
    ['isn\'t a list of cottages', '"hello"'],
    ['has something odd for a cottage', JSON.stringify({ boot: 42 })],
    ['has a bad color', JSON.stringify({ boot: '?cottage=boot&walls=%22%3E%3Cscript%3E' })],
    ['files a design under the wrong cottage', JSON.stringify({ boot: '?cottage=leaf&door=%23ffffff' })],
  ])('ignores what\'s stored if it %s', (_, stored) => {
    window.sessionStorage.setItem(KEY, stored);
    const boot = remembered('boot');
    expect(boot === null || !isPainted(boot)).toBe(true);
  });

  it('still works when the browser won\'t store anything', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(() => remember(designFromQuery('?cottage=pot&walls=%23ffffff'))).not.toThrow();
    expect(remembered('pot')).toBeNull();
  });
});
