// game/design-state.js: a cottage's design, and carrying it in the address.
import { describe, expect, it } from 'vitest';
import { COTTAGES, cottageById } from '../public/game/cottages.js';
import { designFromQuery, designQuery, newDesign } from '../public/game/design-state.js';

const plain = (color) => ({ color, pattern: 'plain' });

describe('a new design', () => {
  it('names its cottage, has its own colors outside, all plain, an empty yard, and room for the inside', () => {
    expect(newDesign(cottageById('teacup'))).toEqual({
      cottage: 'teacup',
      outside: {
        walls: plain('#fbcfe8'),
        trim: plain('#f9a8d4'),
        saucer: plain('#f472b6'),
        chimney: plain('#78716c'),
        door: plain('#b45309'),
      },
      yard: [],
      inside: {},
    });
  });
});

describe('reading a design from the address', () => {
  it('starts from the cottage\'s own colors', () => {
    expect(designFromQuery('?cottage=boot')).toEqual(newDesign(cottageById('boot')));
  });

  it('takes the colors in the address', () => {
    const design = designFromQuery('?cottage=teacup&walls=%233b82f6&door=%234a2530');
    expect(design.outside.walls).toEqual(plain('#3b82f6'));
    expect(design.outside.door).toEqual(plain('#4a2530'));
    expect(design.outside.trim).toEqual(plain('#f9a8d4'));
  });

  it('takes a pattern after the color', () => {
    const design = designFromQuery('?cottage=teacup&walls=%233b82f6%3Astripes');
    expect(design.outside.walls).toEqual({ color: '#3b82f6', pattern: 'stripes' });
  });

  it.each([
    ['not a color', 'blue'],
    ['a color that isn\'t one of the choices', '#123456'],
    ['a pattern that isn\'t one of the patterns', '#3b82f6:plaid'],
    ['something sneaky', '" onload="alert(1)'],
    ['a sneaky pattern', '#3b82f6:"><script>'],
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

describe('the yard in the address', () => {
  it('reads the yard\'s options, by commas', () => {
    expect(designFromQuery('?cottage=pot&yard=rocks%2Cflowers').yard).toEqual(['rocks', 'flowers']);
  });

  it('keeps them in order, each once, and ignores anything else', () => {
    expect(designFromQuery('?cottage=pot&yard=flowers,castle,rocks,flowers').yard).toEqual(['rocks', 'flowers']);
  });

  it('writes the yard only when it has something in it', () => {
    const design = newDesign(cottageById('pot'));
    expect(designQuery(design)).toBe('?cottage=pot');
    design.yard = ['trees', 'flowers'];
    expect(designFromQuery(designQuery(design)).yard).toEqual(['trees', 'flowers']);
  });
});

describe('writing a design into the address', () => {
  it('is just the cottage, when nothing has been painted', () => {
    expect(designQuery(newDesign(cottageById('leaf')))).toBe('?cottage=leaf');
  });

  it('adds only the parts that were painted, plain ones as just a color', () => {
    const design = newDesign(cottageById('teacup'));
    design.outside.walls = plain('#3b82f6');
    expect(designQuery(design)).toBe('?cottage=teacup&walls=%233b82f6');
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
