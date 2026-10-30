// @vitest-environment jsdom
// game/design.js: the design studio (design.html?cottage=teacup). Pick a
// color, then tap a part of the cottage to fill it.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PALETTE } from '../public/game/cottages.js';
import { open } from './helpers.js';

const studio = async (query) => {
  const replaceState = vi.spyOn(window.history, 'replaceState');
  const location = await open('design.html', '../public/game/design.js', `design.html${query}`);
  return { location, replaceState };
};

const drawing = () => document.querySelector('.stage-cottage svg');
const color = (name) => document.querySelector(`.swatch[aria-label="${name}"]`);
// A part's first filled shape (not the dark outline under a line).
const part = (key) => drawing().querySelector(`[data-part="${key}"]:not([fill="none"])`);
const tap = (el) => el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
const press = (el, key) => el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));

afterEach(() => {
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
    expect(document.querySelector('.paint-now').style.background).toBe('rgb(96, 165, 250)');
    expect(color('blue').getAttribute('aria-pressed')).toBe('true');
    expect(document.querySelectorAll('.swatch[aria-pressed="true"]')).toHaveLength(1);
  });

  it('picking a color doesn\'t paint anything by itself', async () => {
    await studio('?cottage=teacup');
    const before = drawing().innerHTML;
    color('blue').click();
    expect(drawing().innerHTML.replace(/aria-label="[^"]*"/g, '')).toBe(
      before.replace(/aria-label="[^"]*"/g, ''),
    );
  });

  it('fills the part you tap with the color you picked', async () => {
    await studio('?cottage=teacup');
    color('blue').click();
    tap(part('walls'));
    expect(part('walls').getAttribute('fill')).toBe('#60a5fa');
    expect(drawing().innerHTML).not.toContain('#fbcfe8'); // the cup's old pink, handle too
    expect(part('saucer').getAttribute('fill')).toBe('#f472b6'); // the saucer, untouched
  });

  it('fills every shape of a part at once', async () => {
    await studio('?cottage=pot');
    color('dark red').click();
    tap(part('trim'));
    const lidAndHandles = drawing().querySelectorAll('[data-part="trim"]');
    expect(lidAndHandles).toHaveLength(4);
    for (const shape of lidAndHandles) expect(shape.getAttribute('fill')).toBe('#dc2626');
  });

  it('can paint different parts different colors', async () => {
    await studio('?cottage=mushroom');
    color('red').click();
    tap(part('trim'));
    color('white').click();
    tap(part('door'));
    expect(part('trim').getAttribute('fill')).toBe('#f87171');
    expect(part('door').getAttribute('fill')).toBe('#ffffff');
  });

  it('does nothing when you tap something that isn\'t a part, like a window', async () => {
    const { replaceState } = await studio('?cottage=teacup');
    color('blue').click();
    const calls = replaceState.mock.calls.length;
    tap(drawing().querySelector('.window'));
    tap(document.querySelector('.stage-hill'));
    expect(replaceState.mock.calls.length).toBe(calls);
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
      expect(stops.map((s) => s.dataset.part)).toEqual(['walls', 'trim', 'saucer', 'door']);
      expect(stops[0].tagName).toBe('path');
      expect(stops[0].getAttribute('fill')).toBe('#fbcfe8'); // the cup, not its handle's outline
      expect(stops.every((s) => s.getAttribute('role') === 'button')).toBe(true);
      expect(stops[0].getAttribute('aria-label')).toBe('Paint the cup light green');
    });

    it('puts the stop for a part drawn only in lines on its line', async () => {
      await studio('?cottage=leaf');
      const veins = drawing().querySelector('[data-part="trim"][tabindex]');
      expect(veins.getAttribute('fill')).toBe('none');
      expect(veins.getAttribute('stroke')).toBe('#84cc16');
    });

    it.each(['Enter', ' '])('paints a part with %j, and keeps it focused', async (key) => {
      await studio('?cottage=teacup');
      color('dark green').click();
      const cup = drawing().querySelector('[data-part="walls"][tabindex]');
      cup.focus();
      press(cup, key);
      expect(part('walls').getAttribute('fill')).toBe('#16a34a');
      expect(document.activeElement.dataset.part).toBe('walls');
      expect(document.activeElement.isConnected).toBe(true);
    });

    it('ignores other keys', async () => {
      await studio('?cottage=teacup');
      color('dark green').click();
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
    expect(replaceState).toHaveBeenLastCalledWith(null, '', '?cottage=teacup&walls=%2360a5fa');
  });

  it('opens with the colors in the address', async () => {
    await studio('?cottage=teacup&walls=%2360a5fa&trim=%23facc15');
    expect(part('walls').getAttribute('fill')).toBe('#60a5fa');
    expect(part('trim').getAttribute('fill')).toBe('#facc15');
  });

  it('sends the design along to the village', async () => {
    await studio('?cottage=pot');
    const village = document.querySelector('.studio-village');
    expect(village.getAttribute('href')).toBe('./village.html?cottage=pot');
    color('red').click();
    tap(part('door'));
    expect(village.getAttribute('href')).toBe('./village.html?cottage=pot&door=%23f87171');
  });

  it('puts every color back with Start over', async () => {
    const { replaceState } = await studio('?cottage=teacup&walls=%2360a5fa&door=%234a2530');
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

  it('has a Move in! button, which does nothing yet', async () => {
    const { replaceState } = await studio('?cottage=teacup');
    const calls = replaceState.mock.calls.length;
    document.querySelector('.studio-done').click();
    expect(replaceState.mock.calls.length).toBe(calls);
    expect(document.querySelector('.studio-done').textContent).toBe('Move in!');
  });

  it('links back to the picker', async () => {
    await studio('?cottage=pot');
    expect(document.querySelector('.studio-back').getAttribute('href')).toBe('./pick-a-cottage.html');
  });

  it.each([
    ['no cottage', ''],
    ['a cottage that doesn\'t exist', '?cottage=castle'],
  ])('sends you to the picker when the address has %s', async (_, query) => {
    const { location } = await studio(query);
    expect(location.replace).toHaveBeenCalledWith('./pick-a-cottage.html');
    expect(document.querySelector('.palette').children).toHaveLength(0);
  });
});
