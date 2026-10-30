// game/design-state.js: a cottage's design, and carrying it in the address.
import { describe, expect, it } from 'vitest';
import { COTTAGES, cottageById } from '../public/game/cottages.js';
import { designFromQuery, designQuery, newDesign } from '../public/game/design-state.js';

const plain = (color) => ({ color, pattern: 'plain' });

describe('a new design', () => {
  it('names its cottage, has its own colors outside, all plain, and room for the inside', () => {
    expect(newDesign(cottageById('teacup'))).toEqual({
      cottage: 'teacup',
      outside: {
        walls: plain('#fbcfe8'),
        trim: plain('#f9a8d4'),
        saucer: plain('#f472b6'),
        chimney: plain('#78716c'),
        door: plain('#b45309'),
      },
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
    expect(design.outside.walls).toEqual(plain('#60a5fa'));
    expect(design.outside.door).toEqual(plain('#4a2530'));
    expect(design.outside.trim).toEqual(plain('#f9a8d4'));
  });

  it('takes a pattern after the color', () => {
    const design = designFromQuery('?cottage=teacup&walls=%2360a5fa%3Astripes');
    expect(design.outside.walls).toEqual({ color: '#60a5fa', pattern: 'stripes' });
  });

  it.each([
    ['not a color', 'blue'],
    ['a color that isn\'t one of the choices', '#123456'],
    ['a pattern that isn\'t one of the patterns', '#60a5fa:plaid'],
    ['something sneaky', '" onload="alert(1)'],
    ['a sneaky pattern', '#60a5fa:"><script>'],
  ])('ignores %s, so the part keeps its own paint', (_, value) => {
    const design = designFromQuery(`?cottage=pot&walls=${encodeURIComponent(value)}`);
    expect(design.outside.walls).toEqual(plain('#99f6e4'));
  });

  it('ignores paint for parts the cottage doesn\'t have', () => {
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

  it('adds only the parts that were painted, plain ones as just a color', () => {
    const design = newDesign(cottageById('teacup'));
    design.outside.walls = plain('#60a5fa');
    expect(designQuery(design)).toBe('?cottage=teacup&walls=%2360a5fa');
  });

  it('adds a pattern after the color', () => {
    const design = newDesign(cottageById('teacup'));
    design.outside.saucer = { color: '#facc15', pattern: 'dots' };
    expect(designQuery(design)).toBe('?cottage=teacup&saucer=%23facc15%3Adots');
  });

  it('adds a part painted in its own color, if it has a pattern', () => {
    const design = newDesign(cottageById('teacup'));
    design.outside.walls = { color: '#fbcfe8', pattern: 'hearts' };
    expect(designQuery(design)).toBe('?cottage=teacup&walls=%23fbcfe8%3Ahearts');
  });

  it.each(COTTAGES)('reads back the same $name design it wrote', (cottage) => {
    const design = newDesign(cottage);
    cottage.parts.forEach((part, i) => {
      design.outside[part.key] = { color: '#facc15', pattern: ['plain', 'checks', 'bricks'][i % 3] };
    });
    expect(designFromQuery(designQuery(design))).toEqual(design);
  });
});
