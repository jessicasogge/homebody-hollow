// @vitest-environment jsdom
// game/yard.js: rocks, trees and flowers around a cottage.
import { describe, expect, it } from 'vitest';
import { cottageById, cottageDrawing } from '../public/game/cottages.js';
import { withYard, YARD, yardFrom, yardIcon } from '../public/game/yard.js';

describe('the yard', () => {
  it('can have rocks, trees and flowers', () => {
    expect(YARD.map((option) => option.id)).toEqual(['rocks', 'trees', 'flowers']);
  });

  it('keeps only real options, each once, in order', () => {
    expect(yardFrom(['flowers', 'rocks', 'flowers', 'castle', ''])).toEqual(['rocks', 'flowers']);
    expect(yardFrom([])).toEqual([]);
  });

  it('stacks the trees behind the cottage and the rocks and flowers in front', () => {
    const drawing = cottageDrawing(cottageById('pot'));
    const wrap = withYard(drawing, ['rocks', 'trees', 'flowers']);
    const [behind, middle, inFront] = wrap.children;
    expect(middle).toBe(drawing);
    expect(behind.getAttribute('class')).toBe('yard yard-behind');
    expect(inFront.getAttribute('class')).toBe('yard yard-in-front');
    expect(behind.querySelectorAll('ellipse').length).toBeGreaterThan(0); // the trees' leaves
    expect(inFront.querySelectorAll('ellipse').length).toBeGreaterThan(0); // the rocks
    expect(inFront.querySelectorAll('path').length).toBeGreaterThan(0); // the flowers' stems
  });

  it('draws the trees taller than every cottage, reaching above its box', () => {
    const behind = withYard(cottageDrawing(cottageById('pot')), ['trees']).querySelector('.yard-behind');
    const leaves = behind.querySelector('ellipse');
    const top = Number(leaves.getAttribute('cy')) - Number(leaves.getAttribute('ry'));
    expect(top).toBeLessThan(0); // every cottage starts at 0 or below
  });

  it('draws nothing around a cottage with an empty yard', () => {
    const wrap = withYard(cottageDrawing(cottageById('pot')));
    for (const layer of wrap.querySelectorAll('.yard')) expect(layer.innerHTML).toBe('');
  });

  it('draws only what\'s in the yard', () => {
    const wrap = withYard(cottageDrawing(cottageById('pot')), ['flowers']);
    expect(wrap.querySelector('.yard-behind').innerHTML).toBe('');
    expect(wrap.querySelector('.yard-in-front ellipse')).toBeNull(); // no rocks
    expect(wrap.querySelector('.yard-in-front path')).not.toBeNull();
  });

  it('is hidden from screen readers, and stands beside the cottage on a wider box', () => {
    for (const layer of withYard(cottageDrawing(cottageById('pot')), ['trees']).querySelectorAll('.yard')) {
      expect(layer.getAttribute('aria-hidden')).toBe('true');
      expect(layer.getAttribute('viewBox')).toBe('0 0 160 140');
    }
  });

  it.each(YARD.map((option) => option.id))('has a little picture of the %s, for its button', (id) => {
    const icon = yardIcon(id);
    expect(icon.innerHTML).not.toBe('');
    expect(icon.getAttribute('aria-hidden')).toBe('true');
  });
});
