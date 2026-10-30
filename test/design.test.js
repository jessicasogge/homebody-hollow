// @vitest-environment jsdom
// game/design.js: the design studio (design.html?cottage=teacup). Pick a
// color, then tap a part of the cottage to fill it.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PALETTE, PATTERNS } from '../public/game/cottages.js';
import { cottageById } from '../public/game/cottages.js';
import { designFromQuery, newDesign } from '../public/game/design-state.js';
import { loadLots, saveLots } from '../public/game/lots.js';
import { open } from './helpers.js';

const studio = async (query) => {
  const replaceState = vi.spyOn(window.history, 'replaceState');
  const location = await open('design.html', '../public/game/design.js', `design.html${query}`);
  return { location, replaceState };
};

const drawing = () => document.querySelector('.stage-cottage svg.cottage');
const color = (name) => document.querySelector(`.swatch[aria-label="${name}"]`);
const pattern = (id) => document.querySelector(`.pattern[data-pattern="${id}"]`);
// A part's first filled shape (not the dark outline under a line).
const part = (key) => drawing().querySelector(`[data-part="${key}"]:not([fill="none"])`);
const tap = (el) => el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
const press = (el, key) => el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));

afterEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('the studio', () => {
  it('shows the cottage you picked, with its name and its lights on', async () => {
    await studio('?cottage=teacup');
    expect(document.querySelector('.design-name').textContent).toBe('Teacup Cottage');
    expect(drawing().getAttribute('aria-label')).toMatch(/^Teacup Cottage, /);
    expect(drawing().classList.contains('lit')).toBe(true);
  });

  it('puts the cottage\'s name in the tab title', async () => {
    await studio('?cottage=boot');
    expect(document.title).toBe('Homebody Hollow | Tiptoe Cottage');
  });

  it('has every color in the palette, in order, each named for screen readers', async () => {
    await studio('?cottage=pot');
    const swatches = [...document.querySelectorAll('.palette .swatch')];
    expect(swatches.map((s) => s.dataset.color)).toEqual(PALETTE.map((c) => c.color));
    expect(swatches.map((s) => s.getAttribute('aria-label'))).toEqual(PALETTE.map((c) => c.name));
  });

  it('starts with the first color picked', async () => {
    await studio('?cottage=pot');
    const picked = document.querySelectorAll('.swatch[aria-pressed="true"]');
    expect(picked).toHaveLength(1);
    expect(picked[0]).toBe(document.querySelector('.palette').firstElementChild);
  });

  it('shows the color you picked, and marks it', async () => {
    await studio('?cottage=pot');
    color('blue').click();
    expect(document.querySelector('.paint-now rect').getAttribute('fill')).toBe('#3b82f6');
    expect(color('blue').getAttribute('aria-pressed')).toBe('true');
    expect(document.querySelectorAll('.swatch[aria-pressed="true"]')).toHaveLength(1);
  });

  describe('patterns', () => {
    it('has a button for each pattern, solid picked to start', async () => {
      await studio('?cottage=pot');
      const buttons = [...document.querySelectorAll('.patterns .pattern')];
      expect(buttons.map((b) => b.dataset.pattern)).toEqual(PATTERNS.map((p) => p.id));
      expect(buttons.map((b) => b.getAttribute('aria-label'))).toEqual(PATTERNS.map((p) => p.name));
      expect(pattern('plain').getAttribute('aria-pressed')).toBe('true');
      expect(document.querySelectorAll('.pattern[aria-pressed="true"]')).toHaveLength(1);
    });

    it('shows just the pictures, no words, with each name on hover', async () => {
      await studio('?cottage=pot');
      for (const button of document.querySelectorAll('.pattern')) {
        expect(button.textContent.trim()).toBe('');
        expect(button.title).toBe(button.getAttribute('aria-label'));
      }
    });

    it('calls the no-pattern button "solid"', async () => {
      await studio('?cottage=pot');
      expect(pattern('plain').getAttribute('aria-label')).toBe('solid');
    });

    it('shows each pattern in the color you picked', async () => {
      await studio('?cottage=pot');
      color('green').click();
      for (const button of document.querySelectorAll('.pattern')) {
        expect(button.querySelector('svg').innerHTML).toContain('#22c55e');
      }
      expect(pattern('dots').querySelector('pattern')).not.toBeNull();
      expect(pattern('plain').querySelector('pattern')).toBeNull();
    });

    it('marks the pattern you picked, and shows it with the color', async () => {
      await studio('?cottage=pot');
      pattern('stripes').click();
      expect(pattern('stripes').getAttribute('aria-pressed')).toBe('true');
      expect(pattern('plain').getAttribute('aria-pressed')).toBe('false');
      expect(document.querySelector('.paint-now pattern')).not.toBeNull();
    });

    it('fills the part you tap with the pattern, in the color you picked', async () => {
      await studio('?cottage=teacup');
      color('yellow').click();
      pattern('dots').click();
      tap(part('saucer'));
      const fill = part('saucer').getAttribute('fill');
      expect(fill).toMatch(/^url\(#/);
      const tile = drawing().querySelector(fill.slice(4, -1));
      expect(tile.querySelector('rect').getAttribute('fill')).toBe('#facc15');
    });

    const paintedWalls = () =>
      new URLSearchParams(window.history.replaceState.mock.lastCall[2]).get('walls');

    it('keeps the pattern when you switch colors: red stripes, then blue, is blue stripes', async () => {
      await studio('?cottage=teacup');
      color('red').click();
      pattern('stripes').click();
      color('blue').click();
      expect(pattern('stripes').getAttribute('aria-pressed')).toBe('true');
      expect(color('blue').getAttribute('aria-pressed')).toBe('true');
      expect(document.querySelector('.paint-now pattern rect').getAttribute('fill')).toBe('#3b82f6');
      tap(part('walls'));
      expect(paintedWalls()).toBe('#3b82f6:stripes');
    });

    it('keeps the color when you switch patterns', async () => {
      await studio('?cottage=teacup');
      color('blue').click();
      pattern('stripes').click();
      pattern('dots').click();
      expect(color('blue').getAttribute('aria-pressed')).toBe('true');
      tap(part('walls'));
      expect(paintedWalls()).toBe('#3b82f6:dots');
    });

    it('paints the same in either order: stripes then blue, or blue then stripes', async () => {
      await studio('?cottage=teacup');
      pattern('stripes').click();
      color('blue').click();
      tap(part('walls'));
      const patternFirst = paintedWalls();

      await studio('?cottage=teacup');
      color('blue').click();
      pattern('stripes').click();
      tap(part('walls'));
      expect(paintedWalls()).toBe(patternFirst);
      expect(patternFirst).toBe('#3b82f6:stripes');
    });

    it('takes the pattern off only when you pick solid', async () => {
      await studio('?cottage=teacup&walls=%233b82f6%3Astripes');
      color('blue').click();
      pattern('stripes').click();
      color('pink').click();
      expect(pattern('stripes').getAttribute('aria-pressed')).toBe('true');
      pattern('plain').click();
      expect(pattern('plain').getAttribute('aria-pressed')).toBe('true');
      expect(color('pink').getAttribute('aria-pressed')).toBe('true'); // the color stays
      tap(part('walls'));
      expect(part('walls').getAttribute('fill')).toBe('#ec4899');
      expect(paintedWalls()).toBe('#ec4899');
    });

    it('opens with the patterns in the address', async () => {
      await studio('?cottage=pot&walls=%233b82f6%3Achecks');
      expect(part('walls').getAttribute('fill')).toMatch(/^url\(#/);
    });
  });

  it('picking a color or a pattern doesn\'t paint anything by itself', async () => {
    const { replaceState } = await studio('?cottage=teacup');
    color('blue').click();
    pattern('dots').click();
    expect(replaceState).toHaveBeenLastCalledWith(null, '', '?cottage=teacup');
    expect(drawing().querySelector('pattern')).toBeNull();
  });

  it('can paint the chimney', async () => {
    await studio('?cottage=mushroom');
    color('red').click();
    tap(part('chimney'));
    expect(part('chimney').getAttribute('fill')).toBe('#ef4444');
  });

  it('fills the part you tap with the color you picked', async () => {
    await studio('?cottage=teacup');
    color('blue').click();
    tap(part('walls'));
    expect(part('walls').getAttribute('fill')).toBe('#3b82f6');
    expect(drawing().innerHTML).not.toContain('#fbcfe8'); // the cup's old pink, handle too
    expect(part('saucer').getAttribute('fill')).toBe('#f472b6'); // the saucer, untouched
  });

  it('fills every shape of a part at once', async () => {
    await studio('?cottage=pot');
    color('red').click();
    tap(part('trim'));
    const lidAndHandles = drawing().querySelectorAll('[data-part="trim"]');
    expect(lidAndHandles).toHaveLength(4);
    for (const shape of lidAndHandles) expect(shape.getAttribute('fill')).toBe('#ef4444');
  });

  it('can paint different parts different colors', async () => {
    await studio('?cottage=mushroom');
    color('red').click();
    tap(part('trim'));
    color('white').click();
    tap(part('door'));
    expect(part('trim').getAttribute('fill')).toBe('#ef4444');
    expect(part('door').getAttribute('fill')).toBe('#ffffff');
  });

  it('does nothing when you tap something that isn\'t a part, like the hill', async () => {
    const { replaceState } = await studio('?cottage=teacup');
    color('blue').click();
    const calls = replaceState.mock.calls.length;
    tap(document.querySelector('.stage-hill'));
    tap(drawing().querySelector('rect.window + path')); // a window's panes
    expect(replaceState.mock.calls.length).toBe(calls);
  });

  it('paints just the window you tap', async () => {
    await studio('?cottage=boot');
    color('pink').click();
    tap(drawing().querySelectorAll('.window')[3]);
    const fills = [...drawing().querySelectorAll('.window')].map((pane) => pane.getAttribute('fill'));
    expect(fills).toEqual(['#fde047', '#fde047', '#fde047', '#ec4899', '#fde047']);
  });

  it('keeps its lights on after painting', async () => {
    await studio('?cottage=teacup');
    tap(part('door'));
    expect(drawing().classList.contains('lit')).toBe(true);
  });

  describe('with the keyboard', () => {
    it('can reach each part once, named with what it\'ll be painted', async () => {
      await studio('?cottage=teacup');
      color('light green').click();
      const stops = [...drawing().querySelectorAll('[tabindex="0"]')];
      // In the order they're drawn: the chimney first, since it's behind the cup.
      expect(stops.map((s) => s.dataset.part)).toEqual(['chimney', 'walls', 'trim', 'saucer', 'window1', 'window2', 'door']);
      expect(stops.every((s) => s.getAttribute('role') === 'button')).toBe(true);
      const cup = stops[1];
      expect(cup.tagName).toBe('path');
      expect(cup.getAttribute('fill')).toBe('#fbcfe8'); // the cup, not its handle's outline
      expect(cup.getAttribute('aria-label')).toBe('Paint the cup light green');
    });

    it('says the pattern too, when there is one', async () => {
      await studio('?cottage=teacup');
      color('light green').click();
      pattern('stripes').click();
      const cup = drawing().querySelector('[data-part="walls"][tabindex]');
      expect(cup.getAttribute('aria-label')).toBe('Paint the cup light green stripes');
    });

    it('puts the stop for a part drawn only in lines on its line', async () => {
      await studio('?cottage=leaf');
      const veins = drawing().querySelector('[data-part="trim"][tabindex]');
      expect(veins.getAttribute('fill')).toBe('none');
      expect(veins.getAttribute('stroke')).toBe('#84cc16');
    });

    it.each(['Enter', ' '])('paints a part with %j, and keeps it focused', async (key) => {
      await studio('?cottage=teacup');
      color('green').click();
      const cup = drawing().querySelector('[data-part="walls"][tabindex]');
      cup.focus();
      press(cup, key);
      expect(part('walls').getAttribute('fill')).toBe('#22c55e');
      expect(document.activeElement.dataset.part).toBe('walls');
      expect(document.activeElement.isConnected).toBe(true);
    });

    it('ignores other keys', async () => {
      await studio('?cottage=teacup');
      color('green').click();
      press(drawing().querySelector('[data-part="walls"][tabindex]'), 'a');
      expect(part('walls').getAttribute('fill')).toBe('#fbcfe8');
    });

    it('ignores Enter on something that isn\'t a part', async () => {
      const { replaceState } = await studio('?cottage=teacup');
      const calls = replaceState.mock.calls.length;
      press(drawing(), 'Enter');
      expect(replaceState.mock.calls.length).toBe(calls);
    });
  });

  it('keeps the design in the address, so a reload keeps it', async () => {
    const { replaceState } = await studio('?cottage=teacup');
    color('blue').click();
    tap(part('walls'));
    expect(replaceState).toHaveBeenLastCalledWith(null, '', '?cottage=teacup&walls=%233b82f6');
  });

  it('opens with the colors in the address', async () => {
    await studio('?cottage=teacup&walls=%233b82f6&trim=%23facc15');
    expect(part('walls').getAttribute('fill')).toBe('#3b82f6');
    expect(part('trim').getAttribute('fill')).toBe('#facc15');
  });

  it('puts every color back with Start over', async () => {
    const { replaceState } = await studio('?cottage=teacup&walls=%233b82f6&door=%234a2530');
    document.querySelector('.studio-reset').click();
    expect(part('walls').getAttribute('fill')).toBe('#fbcfe8');
    expect(part('door').getAttribute('fill')).toBe('#b45309');
    expect(replaceState).toHaveBeenLastCalledWith(null, '', '?cottage=teacup');
  });

  it('has Outside picked, and Inside not ready yet', async () => {
    await studio('?cottage=teacup');
    const [outside, inside] = document.querySelectorAll('.mode');
    expect(outside.getAttribute('aria-pressed')).toBe('true');
    expect(inside.disabled).toBe(true);
    expect(inside.textContent).toContain('soon');
  });

  describe('the yard', () => {
    const option = (id) => document.querySelector(`.yard-option[data-yard="${id}"]`);

    it('has a button each for rocks, trees and flowers, all off to start', async () => {
      await studio('?cottage=teacup');
      const buttons = [...document.querySelectorAll('.yard-options .yard-option')];
      expect(buttons.map((b) => b.getAttribute('aria-label'))).toEqual(['rocks', 'trees', 'flowers']);
      expect(buttons.every((b) => b.getAttribute('aria-pressed') === 'false')).toBe(true);
      expect(document.querySelector('.stage-cottage .yard-behind').innerHTML).toBe('');
    });

    it('puts one thing in the yard: picking another swaps it', async () => {
      const { replaceState } = await studio('?cottage=teacup');
      option('flowers').click();
      expect(option('flowers').getAttribute('aria-pressed')).toBe('true');
      expect(replaceState).toHaveBeenLastCalledWith(null, '', '?cottage=teacup&yard=flowers');
      option('trees').click();
      expect(option('trees').getAttribute('aria-pressed')).toBe('true');
      expect(option('flowers').getAttribute('aria-pressed')).toBe('false');
      expect(document.querySelectorAll('.yard-option[aria-pressed="true"]')).toHaveLength(1);
      expect(document.querySelector('.stage-cottage .yard-behind').innerHTML).not.toBe('');
      expect(document.querySelector('.stage-cottage .yard-in-front').innerHTML).toBe('');
      expect(replaceState).toHaveBeenLastCalledWith(null, '', '?cottage=teacup&yard=trees');
    });

    it('empties the yard when you tap the one that\'s in it', async () => {
      const { replaceState } = await studio('?cottage=teacup&yard=trees');
      option('trees').click();
      expect(document.querySelectorAll('.yard-option[aria-pressed="true"]')).toHaveLength(0);
      expect(document.querySelector('.stage-cottage .yard-behind').innerHTML).toBe('');
      expect(replaceState).toHaveBeenLastCalledWith(null, '', '?cottage=teacup');
    });

    it('opens with the yard in the address', async () => {
      await studio('?cottage=teacup&yard=rocks');
      expect(option('rocks').getAttribute('aria-pressed')).toBe('true');
    });

    it('moves in with the cottage, and comes back when you change it', async () => {
      await studio('?cottage=boot&lot=0');
      option('rocks').click();
      document.querySelector('.studio-done').click();
      expect(loadLots()[0].yard).toEqual(['rocks']);
      await studio('?lot=0');
      expect(option('rocks').getAttribute('aria-pressed')).toBe('true');
    });

    it('is cleared by Start over', async () => {
      await studio('?cottage=teacup&yard=rocks%2Ctrees');
      document.querySelector('.studio-reset').click();
      expect(document.querySelectorAll('.yard-option[aria-pressed="true"]')).toHaveLength(0);
    });
  });

  describe('building a new cottage', () => {
    const build = (houses) => saveLots(Array.from({ length: 6 }, (_, i) => houses[i] ?? null));

    it('starts in the cottage\'s own colors, with Move in!, and no Move out', async () => {
      build({ 2: designFromQuery('?cottage=teacup&walls=%233b82f6') });
      await studio('?cottage=teacup&lot=0');
      expect(part('walls').getAttribute('fill')).toBe('#fbcfe8');
      expect(document.querySelector('.studio-done').textContent).toBe('Move in!');
      expect(document.querySelector('.studio-moveout').hidden).toBe(true);
    });

    it('keeps the lot in the address with the design, so a reload keeps both', async () => {
      const { replaceState } = await studio('?cottage=teacup&lot=3');
      color('blue').click();
      tap(part('walls'));
      expect(replaceState).toHaveBeenLastCalledWith(null, '', '?cottage=teacup&walls=%233b82f6&lot=3');
    });

    it('moves in on the lot it was picked for, and goes to your village', async () => {
      const { location } = await studio('?cottage=soda-cup&lot=4');
      color('blue').click();
      tap(part('walls'));
      document.querySelector('.studio-done').click();
      const lots = loadLots();
      expect(lots[4].cottage).toBe('soda-cup');
      expect(lots[4].outside.walls).toEqual({ color: '#3b82f6', pattern: 'plain' });
      expect(lots.filter(Boolean)).toHaveLength(1);
      expect(location.href).toBe('./village.html');
    });

    it('can build the same cottage again on another lot', async () => {
      build({ 0: designFromQuery('?cottage=soda-cup&walls=%233b82f6') });
      await studio('?cottage=soda-cup&lot=1');
      color('green').click();
      tap(part('walls'));
      document.querySelector('.studio-done').click();
      const [first, second] = loadLots();
      expect([first.outside.walls.color, second.outside.walls.color]).toEqual(['#3b82f6', '#22c55e']);
    });

    it('moves in on the first empty lot if its lot was taken, or if it had none', async () => {
      build({ 0: newDesign(cottageById('pot')), 1: newDesign(cottageById('pot')) });
      await studio('?cottage=leaf&lot=0');
      document.querySelector('.studio-done').click();
      expect(loadLots()[2].cottage).toBe('leaf');
      expect(loadLots()[0].cottage).toBe('pot');

      await studio('?cottage=boot');
      document.querySelector('.studio-done').click();
      expect(loadLots()[3].cottage).toBe('boot');
    });

    it('can\'t move in when the village is full, and says why', async () => {
      build(Object.fromEntries([0, 1, 2, 3, 4, 5].map((i) => [i, newDesign(cottageById('pot'))])));
      await studio('?cottage=leaf');
      expect(document.querySelector('.studio-done').disabled).toBe(true);
      expect(document.querySelector('.studio-full').hidden).toBe(false);
      expect(document.querySelector('.studio-full').textContent).toBe(
        'Your village is full. Move a cottage out to make room.',
      );
    });

    it('has room to move in when there\'s an empty lot', async () => {
      await studio('?cottage=leaf&lot=0');
      expect(document.querySelector('.studio-done').disabled).toBe(false);
      expect(document.querySelector('.studio-full').hidden).toBe(true);
    });
  });

  describe('changing a cottage you built', () => {
    const built = () => saveLots([null, null, designFromQuery('?cottage=pot&walls=%233b82f6%3Adots'), null, null, null]);

    it('opens it painted the way you left it', async () => {
      built();
      await studio('?lot=2');
      expect(document.querySelector('.design-name').textContent).toBe('Stewpot Cottage');
      expect(part('walls').getAttribute('fill')).toMatch(/^url\(#/);
    });

    it('has Done and Move out instead of Move in!', async () => {
      built();
      await studio('?lot=2');
      expect(document.querySelector('.studio-done').textContent).toBe('Done');
      expect(document.querySelector('.studio-moveout').hidden).toBe(false);
    });

    it('leaves the address alone while you paint', async () => {
      built();
      const { replaceState } = await studio('?lot=2');
      color('red').click();
      tap(part('door'));
      expect(replaceState).not.toHaveBeenCalled();
    });

    it('saves your changes on its own lot with Done', async () => {
      built();
      const { location } = await studio('?lot=2');
      color('red').click();
      tap(part('door'));
      document.querySelector('.studio-done').click();
      const lots = loadLots();
      expect(lots[2].outside.door.color).toBe('#ef4444');
      expect(lots[2].outside.walls).toEqual({ color: '#3b82f6', pattern: 'dots' });
      expect(lots.filter(Boolean)).toHaveLength(1);
      expect(location.href).toBe('./village.html');
    });

    it('can be changed even when the village is full', async () => {
      saveLots([0, 1, 2, 3, 4, 5].map(() => newDesign(cottageById('pot'))));
      await studio('?lot=5');
      expect(document.querySelector('.studio-done').disabled).toBe(false);
    });

    it('empties its lot with Move out, and goes to your village', async () => {
      built();
      const { location } = await studio('?lot=2');
      document.querySelector('.studio-moveout').click();
      expect(loadLots()).toEqual([null, null, null, null, null, null]);
      expect(location.href).toBe('./village.html');
    });

    it('isn\'t saved if you leave without Done', async () => {
      built();
      await studio('?lot=2');
      color('red').click();
      tap(part('walls'));
      expect(loadLots()[2].outside.walls).toEqual({ color: '#3b82f6', pattern: 'dots' });
    });
  });

  it('links back to your village', async () => {
    await studio('?cottage=pot');
    expect(document.querySelector('.studio-back').getAttribute('href')).toBe('./village.html');
  });

  it.each([
    ['no cottage', ''],
    ['a cottage that doesn\'t exist', '?cottage=castle'],
  ])('sends you to the picker when the address has %s', async (_, query) => {
    const { location } = await studio(query);
    expect(location.replace).toHaveBeenCalledWith('./pick-a-cottage.html');
    expect(document.querySelector('.palette').children).toHaveLength(0);
  });

  it('sends you to your village when the address names an empty lot', async () => {
    const { location } = await studio('?lot=4');
    expect(location.replace).toHaveBeenCalledWith('./village.html');
  });

  it('sends you to the picker when the address names a lot that doesn\'t exist', async () => {
    const { location } = await studio('?lot=9');
    expect(location.replace).toHaveBeenCalledWith('./pick-a-cottage.html');
  });
});
