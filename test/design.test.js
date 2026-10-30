// @vitest-environment jsdom
// game/design.js: the design studio (design.html?cottage=teacup).
import { afterEach, describe, expect, it, vi } from 'vitest';
import { open } from './helpers.js';

const studio = async (query) => {
  const replaceState = vi.spyOn(window.history, 'replaceState');
  const location = await open('design.html', '../public/game/design.js', `design.html${query}`);
  return { location, replaceState };
};

const stageDrawing = () => document.querySelector('.stage-cottage svg');
const swatch = (part, color) =>
  document.querySelector(`.swatch[data-part="${part}"][data-color="${color}"]`);
const picked = (part) => document.querySelector(`.swatch.on[data-part="${part}"]`).dataset.color;

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('the studio', () => {
  it('shows the cottage you picked, with its name and its lights on', async () => {
    await studio('?cottage=teacup');
    expect(document.querySelector('.design-name').textContent).toBe('Teacup Cottage');
    expect(stageDrawing().getAttribute('aria-label')).toMatch(/^Teacup Cottage, /);
    expect(stageDrawing().classList.contains('lit')).toBe(true);
  });

  it('puts the cottage\'s name in the tab title', async () => {
    await studio('?cottage=boot');
    expect(document.title).toBe('Homebody Hollow | Tiptoe Cottage');
  });

  it('has a row of colors for each of the cottage\'s parts', async () => {
    await studio('?cottage=leaf');
    const headings = [...document.querySelectorAll('.tool-panel h2')].map((h) => h.textContent);
    expect(headings).toEqual(['Leaf', 'Veins', 'Stem', 'Door']);
    expect(document.querySelectorAll('.swatches[role="group"]')).toHaveLength(4);
  });

  it('starts with each part\'s own color picked', async () => {
    await studio('?cottage=teacup');
    expect(picked('walls')).toBe('#fbcfe8');
    expect(picked('door')).toBe('#b45309');
    expect(document.querySelectorAll('.swatch.on')).toHaveLength(4);
    expect(swatch('walls', '#fbcfe8').getAttribute('aria-pressed')).toBe('true');
  });

  it('names every color for screen readers', async () => {
    await studio('?cottage=boot');
    for (const button of document.querySelectorAll('.swatch')) {
      expect(button.getAttribute('aria-label')).toMatch(/^[a-z ]+$/);
    }
    expect(swatch('walls', '#a16207').getAttribute('aria-label')).toBe('its own color');
    expect(swatch('trim', '#a16207').getAttribute('aria-label')).toBe('brown');
  });

  it('repaints the cottage when you pick a color', async () => {
    await studio('?cottage=teacup');
    swatch('walls', '#93c5fd').click();
    expect(stageDrawing().innerHTML).toContain('#93c5fd');
    expect(stageDrawing().innerHTML).not.toContain('#fbcfe8');
    expect(stageDrawing().classList.contains('lit')).toBe(true);
    expect(picked('walls')).toBe('#93c5fd');
    expect(swatch('walls', '#fbcfe8').getAttribute('aria-pressed')).toBe('false');
  });

  it('keeps the design in the address, so a reload keeps it', async () => {
    const { replaceState } = await studio('?cottage=teacup');
    swatch('walls', '#93c5fd').click();
    expect(replaceState).toHaveBeenLastCalledWith(null, '', '?cottage=teacup&walls=%2393c5fd');
  });

  it('opens with the colors in the address', async () => {
    await studio('?cottage=teacup&walls=%2393c5fd&trim=%23fde047');
    expect(picked('walls')).toBe('#93c5fd');
    expect(picked('trim')).toBe('#fde047');
    expect(stageDrawing().innerHTML).toContain('#93c5fd');
  });

  it('sends the design along to the village', async () => {
    await studio('?cottage=pot');
    const village = document.querySelector('.studio-village');
    expect(village.getAttribute('href')).toBe('./village.html?cottage=pot');
    swatch('door', '#ef4444').click();
    expect(village.getAttribute('href')).toBe('./village.html?cottage=pot&door=%23ef4444');
  });

  it('puts every color back with Start over', async () => {
    const { replaceState } = await studio('?cottage=teacup&walls=%2393c5fd&door=%234a2530');
    document.querySelector('.studio-reset').click();
    expect(picked('walls')).toBe('#fbcfe8');
    expect(picked('door')).toBe('#b45309');
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
    expect(document.querySelector('.tool-panel').children).toHaveLength(0);
  });
});
