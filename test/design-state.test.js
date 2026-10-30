// game/design-state.js: a cottage's design, and carrying it in the address.
import { describe, expect, it } from 'vitest';
import { COTTAGES, cottageById } from '../public/game/cottages.js';
import { designFromQuery, designQuery, newDesign } from '../public/game/design-state.js';

describe('a new design', () => {
  it('names its cottage, has its own colors outside, and room for the inside', () => {
    expect(newDesign(cottageById('teacup'))).toEqual({
      cottage: 'teacup',
      outside: { walls: '#fbcfe8', trim: '#f9a8d4', saucer: '#f472b6', door: '#b45309' },
      inside: {},
    });
  });
});

describe('reading a design from the address', () => {
  it('starts from the cottage\'s own colors', () => {
    expect(designFromQuery('?cottage=boot')).toEqual(newDesign(cottageById('boot')));
  });

  it('takes the colors in the address', () => {
    const design = designFromQuery('?cottage=teacup&walls=%2360a5fa&door=%234a2530');
    expect(design.outside.walls).toBe('#60a5fa');
    expect(design.outside.door).toBe('#4a2530');
    expect(design.outside.trim).toBe('#f9a8d4');
  });

  it.each([
    ['not a color', 'blue'],
    ['a color that isn\'t one of the choices', '#123456'],
    ['something sneaky', '" onload="alert(1)'],
  ])('ignores %s, so the part keeps its own color', (_, value) => {
    const design = designFromQuery(`?cottage=pot&walls=${encodeURIComponent(value)}`);
    expect(design.outside.walls).toBe('#99f6e4');
  });

  it('ignores colors for parts the cottage doesn\'t have', () => {
    expect(designFromQuery('?cottage=pot&saucer=%23ffffff').outside).not.toHaveProperty('saucer');
  });

  it.each([['no cottage', ''], ['a cottage that doesn\'t exist', '?cottage=castle']])(
    'is nothing when the address has %s',
    (_, query) => {
      expect(designFromQuery(query)).toBeNull();
    },
  );
});

describe('writing a design into the address', () => {
  it('is just the cottage, when nothing has been painted', () => {
    expect(designQuery(newDesign(cottageById('leaf')))).toBe('?cottage=leaf');
  });

  it('adds only the parts that were painted', () => {
    const design = newDesign(cottageById('teacup'));
    design.outside.walls = '#60a5fa';
    expect(designQuery(design)).toBe('?cottage=teacup&walls=%2360a5fa');
  });

  it.each(COTTAGES)('reads back the same $name design it wrote', (cottage) => {
    const design = newDesign(cottage);
    for (const part of cottage.parts) design.outside[part.key] = '#facc15';
    expect(designFromQuery(designQuery(design))).toEqual(design);
  });
});
