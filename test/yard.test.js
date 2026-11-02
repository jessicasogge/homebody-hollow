// @vitest-environment jsdom
// game/yard.js: rocks, trees and flowers around a cottage.
import { describe, expect, it } from 'vitest';
import { COTTAGES, cottageById, cottageDrawing } from '../public/game/cottages.js';
import { withYard, YARD, yardFrom, yardIcon } from '../public/game/yard.js';

describe('the yard', () => {
  it('can have rocks, trees and flowers', () => {
    expect(YARD.map((option) => option.id)).toEqual(['rocks', 'trees', 'flowers']);
  });

  it('keeps just one real option, so a yard isn\'t too busy', () => {
    expect(yardFrom(['flowers', 'rocks', 'flowers', 'castle', ''])).toEqual(['rocks']);
    expect(yardFrom(['trees'])).toEqual(['trees']);
    expect(yardFrom(['castle'])).toEqual([]);
    expect(yardFrom([])).toEqual([]);
  });

  it('puts the rocks just outside the cottage at the ground, clear of the boot\'s toe', () => {
    const rocks = (id) => {
      const cottage = cottageById(id);
      const wrap = withYard(cottageDrawing(cottage), ['rocks'], cottage.ground);
      return [...wrap.querySelectorAll('.yard-in-front ellipse[rx="8"]')].map((e) => Number(e.getAttribute('cx')));
    };
    // The boot's toe ends at 114 on its box, 134 on the yard's: the big
    // rock on the right is 8 wide, so it starts at 136.
    expect(rocks('boot')).toEqual([32, 144]);
    // A narrow cottage keeps its rocks close.
    expect(rocks('soda-cup')).toEqual([46, 114]);
  });

  it('gives every cottage how far it reaches across at the ground', () => {
    for (const cottage of COTTAGES) {
      const [left, right] = cottage.ground;
      expect(left).toBeGreaterThanOrEqual(0);
      expect(right).toBeLessThanOrEqual(120);
      expect(left).toBeLessThan(right);
    }
  });

  it('stacks the trees behind the cottage and the rocks and flowers in front', () => {
    const drawing = cottageDrawing(cottageById('pot'));
    const wrap = withYard(drawing, ['rocks', 'trees', 'flowers']);
    const [behind, middle, inFront] = wrap.children;
    expect(middle).toBe(drawing);
    expect(behind.getAttribute('class')).toBe('yard yard-behind');
    expect(inFront.getAttribute('class')).toBe('yard yard-in-front');
    expect(behind.querySelectorAll('.pine-tier').length).toBeGreaterThan(0); // the trees' branches
    expect(inFront.querySelectorAll('ellipse').length).toBeGreaterThan(0); // the rocks
    expect(inFront.querySelectorAll('path').length).toBeGreaterThan(0); // the flowers' stems
  });

  it('draws pine trees, two of them, four tiers each', () => {
    const behind = withYard(cottageDrawing(cottageById('pot')), ['trees']).querySelector('.yard-behind');
    expect(behind.querySelectorAll('.pine-tier')).toHaveLength(8);
    expect(behind.querySelectorAll('rect')).toHaveLength(2); // their trunks
  });

  it('draws the trees taller than every cottage, their tips above the box', () => {
    const behind = withYard(cottageDrawing(cottageById('pot')), ['trees']).querySelector('.yard-behind');
    const tops = [...behind.querySelectorAll('.pine-tier')].map((tier) =>
      Number(tier.getAttribute('d').match(/^M[\d.-]+ ([\d.-]+)/)[1]),
    );
    expect(Math.min(...tops)).toBeLessThan(0); // every cottage starts at 0 or below
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
