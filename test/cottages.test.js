// @vitest-environment jsdom
// game/cottages.js: the cottages, and how each is drawn.
import { describe, expect, it } from 'vitest';
import {
  COTTAGES,
  cottageById,
  cottageDrawing,
  cottageTile,
  defaultPaints,
  PALETTE,
  paintFill,
  partColors,
  patternById,
  PATTERNS,
} from '../public/game/cottages.js';

describe('the cottages', () => {
  it('are the six from the first drawing, then the cat, the handbag and the puppy, in order', () => {
    expect(COTTAGES.map((c) => c.name)).toEqual([
      'Tiptoe Cottage',
      'Soda Pop Cottage',
      'Stewpot Cottage',
      'Teacup Cottage',
      'Toadstool Cottage',
      'Rainleaf Cottage',
      'Whisker Cottage',
      'Handbag Cottage',
      'Puppy Cottage',
    ]);
  });

  it('each has its own id, safe to put in an address', () => {
    const ids = COTTAGES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z-]+$/);
  });

  it('each has a tile color and a description for screen readers', () => {
    for (const cottage of COTTAGES) {
      expect(cottage.tile).toMatch(/^rgba\(/);
      expect(cottage.looks.length).toBeGreaterThan(10);
    }
  });

  it('are found by id', () => {
    expect(cottageById('teacup').name).toBe('Teacup Cottage');
    expect(cottageById('castle')).toBeUndefined();
    expect(cottageById(null)).toBeUndefined();
  });
});

describe('a cottage drawing', () => {
  it.each(COTTAGES)('$name is an SVG on the shared 120 x 140 box', (cottage) => {
    const svg = cottageDrawing(cottage);
    expect(svg.tagName).toBe('svg');
    expect(svg.getAttribute('viewBox')).toBe('0 0 120 140');
    expect(svg.classList.contains('cottage')).toBe(true);
  });

  it.each(COTTAGES)('$name has windows to light up', (cottage) => {
    const svg = cottageDrawing(cottage);
    expect(svg.querySelectorAll('.window').length).toBeGreaterThan(0);
  });

  it.each(COTTAGES)('$name has no smoke puffing out of its chimney', (cottage) => {
    expect(cottageDrawing(cottage).querySelector('.smoke')).toBeNull();
  });

  it.each(COTTAGES)('$name says its name and look to screen readers', (cottage) => {
    const svg = cottageDrawing(cottage);
    expect(svg.getAttribute('role')).toBe('img');
    expect(svg.getAttribute('aria-label')).toBe(`${cottage.name}, ${cottage.looks}`);
  });

  it('the leaf\'s slits are cut out, so whatever is behind it shows through', () => {
    const svg = cottageDrawing(cottageById('leaf'));
    const mask = svg.querySelector('mask');
    expect(mask.querySelectorAll('path[fill="black"]')).toHaveLength(6);
    expect(svg.querySelector('g[mask]').getAttribute('mask')).toBe(`url(#${mask.id})`);
  });

  it('each leaf on a page gets its own mask, so they don\'t share one', () => {
    const leaf = cottageById('leaf');
    const ids = [cottageDrawing(leaf), cottageDrawing(leaf)].map((svg) => svg.querySelector('mask').id);
    expect(ids[0]).not.toBe(ids[1]);
  });
});

const plain = (color) => ({ color, pattern: 'plain' });

describe('the windows', () => {
  it.each(COTTAGES)('$name\'s windows are a part, starting a lit-up yellow', (cottage) => {
    expect(cottage.parts.find((part) => part.key === 'windows')).toEqual({
      key: 'windows',
      label: 'Windows',
      color: '#fde047',
    });
    const glass = [...cottageDrawing(cottage).querySelectorAll('.window')];
    expect(glass.length).toBeGreaterThan(0);
    for (const pane of glass) {
      expect(pane.getAttribute('fill')).toBe('#fde047');
      expect(pane.dataset.part).toBe('windows');
    }
  });

  it('paints every window at once, in a color or a pattern', () => {
    const boot = cottageById('boot');
    const blue = cottageDrawing(boot, { windows: { color: '#3b82f6', pattern: 'plain' } });
    expect([...blue.querySelectorAll('.window')].map((w) => w.getAttribute('fill'))).toEqual(
      Array(5).fill('#3b82f6'),
    );
    const hearts = cottageDrawing(boot, { windows: { color: '#f472b6', pattern: 'hearts' } });
    expect(hearts.querySelector('.window').getAttribute('fill')).toMatch(/^url\(#paint-\d+-windows\)$/);
  });
});

describe('the handbag', () => {
  it('has a bag, a flap, a handle, a clasp, windows and a door to paint', () => {
    expect(cottageById('handbag').parts.map((part) => part.label)).toEqual([
      'Bag', 'Flap', 'Handle', 'Clasp', 'Windows', 'Door',
    ]);
  });

  it('has a handle you can tap on its dark edge too, and two windows', () => {
    const svg = cottageDrawing(cottageById('handbag'));
    expect(svg.querySelectorAll('[data-part="handle"]')).toHaveLength(2);
    expect(svg.querySelectorAll('.window')).toHaveLength(2);
  });
});

describe('the puppy', () => {
  it('has a body, a head, ears, a muzzle, a tail, windows and a door to paint', () => {
    expect(cottageById('puppy').parts.map((part) => part.label)).toEqual([
      'Body', 'Head', 'Ears', 'Muzzle', 'Tail', 'Windows', 'Door',
    ]);
  });

  it('has three legs and a door for its fourth', () => {
    const svg = cottageDrawing(cottageById('puppy'));
    const legs = [...svg.querySelectorAll('rect[data-part="walls"]')].filter(
      (leg) => leg.getAttribute('y') === '118',
    );
    expect(legs).toHaveLength(3);
    const door = svg.querySelector('[data-part="door"]');
    expect(door.getAttribute('d')).toMatch(/^M62 136/); // standing on the ground, where a leg would be
  });
});

describe('the cat', () => {
  it('has a body, a head, ears, a tail, a nose and a door to paint', () => {
    expect(cottageById('cat').parts.map((part) => part.label)).toEqual([
      'Body', 'Head', 'Ears', 'Tail', 'Nose', 'Windows', 'Door',
    ]);
  });

  it('can have a head a different color from its body', () => {
    const svg = cottageDrawing(cottageById('cat'), {
      walls: { color: '#9ca3af', pattern: 'plain' },
      head: { color: '#ffffff', pattern: 'plain' },
    });
    expect(svg.querySelector('[data-part="walls"]').getAttribute('fill')).toBe('#9ca3af');
    expect(svg.querySelector('[data-part="head"]').getAttribute('fill')).toBe('#ffffff');
  });

  it('looks out of two porthole eyes, with a window in its tummy', () => {
    const svg = cottageDrawing(cottageById('cat'));
    expect(svg.querySelectorAll('circle.window')).toHaveLength(2);
    expect(svg.querySelectorAll('rect.window')).toHaveLength(1);
  });
});

describe('painting a cottage', () => {
  it('the boot\'s stitching is painted on its own, apart from its sole', () => {
    const boot = cottageById('boot');
    const svg = cottageDrawing(boot, { stitching: plain('#ec4899') });
    const stitching = svg.querySelector('[data-part="stitching"]');
    expect(stitching.getAttribute('stroke')).toBe('#ec4899');
    expect(stitching.getAttribute('stroke-dasharray')).toBe('3 3');
    for (const sole of svg.querySelectorAll('[data-part="sole"]')) {
      expect(sole.getAttribute('fill')).toBe('#713f12');
    }
  });

  it('the boot\'s stitching has a wider, invisible line along it, to tap', () => {
    const [line, tap] = cottageDrawing(cottageById('boot')).querySelectorAll('[data-part="stitching"]');
    expect(tap.getAttribute('d')).toBe(line.getAttribute('d'));
    expect(tap.getAttribute('stroke')).toBe('transparent');
    expect(Number(tap.getAttribute('stroke-width'))).toBeGreaterThan(Number(line.getAttribute('stroke-width')));
  });

  it.each(COTTAGES)('$name has walls, trim and a door to paint, each with its own label', (cottage) => {
    const keys = cottage.parts.map((part) => part.key);
    expect(keys).toEqual(expect.arrayContaining(['walls', 'trim', 'door']));
    expect(new Set(keys).size).toBe(keys.length);
    for (const part of cottage.parts) {
      expect(part.label).toBeTruthy();
      expect(part.color).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it.each(['boot', 'teacup', 'mushroom', 'leaf'])('the %s\'s chimney can be painted', (id) => {
    const cottage = cottageById(id);
    expect(cottage.parts.find((part) => part.key === 'chimney')).toEqual({
      key: 'chimney',
      label: 'Chimney',
      color: '#78716c',
    });
    const chimney = cottageDrawing(cottage, { chimney: plain('#dc2626') }).querySelector(
      '[data-part="chimney"]',
    );
    expect(chimney.getAttribute('fill')).toBe('#dc2626');
  });

  it.each(COTTAGES)('$name starts in its own colors, all plain', (cottage) => {
    expect(defaultPaints(cottage)).toEqual(
      Object.fromEntries(cottage.parts.map((part) => [part.key, plain(part.color)])),
    );
    const html = cottageDrawing(cottage).innerHTML;
    for (const part of cottage.parts) expect(html).toContain(part.color);
    expect(cottageDrawing(cottage).querySelector('pattern')).toBeNull();
  });

  it.each(COTTAGES)('$name can have every part painted a new color', (cottage) => {
    // Paint each part on its own, so a color showing up proves that part used it.
    for (const part of cottage.parts) {
      const html = cottageDrawing(cottage, { [part.key]: plain('#123456') }).innerHTML;
      expect(html, part.key).toContain('#123456');
    }
  });

  it.each(COTTAGES)('$name tags every part\'s shapes, so a tap knows what to paint', (cottage) => {
    const svg = cottageDrawing(cottage);
    const tagged = new Set([...svg.querySelectorAll('[data-part]')].map((el) => el.dataset.part));
    expect([...tagged].sort()).toEqual(cottage.parts.map((part) => part.key).sort());
  });

  it.each(COTTAGES)('$name\'s tagged shapes are painted in their part\'s color', (cottage) => {
    const colors = Object.fromEntries(cottage.parts.map((part) => [part.key, part.color]));
    for (const el of cottageDrawing(cottage).querySelectorAll('[data-part]')) {
      const painted = [el.getAttribute('fill'), el.getAttribute('stroke')];
      // A dark outline under a line-drawn part is tagged too, so a tap on its
      // edge still counts, without being painted itself; so is an invisible
      // tap area along a thin line.
      expect(
        painted.includes(colors[el.dataset.part]) ||
          painted.includes('#4a2530') ||
          painted.includes('#fef2f2') ||
          painted.includes('transparent'),
        el.outerHTML,
      ).toBe(true);
    }
  });

  it.each(COTTAGES)('$name can have every part painted in a pattern', (cottage) => {
    for (const part of cottage.parts) {
      const svg = cottageDrawing(cottage, { [part.key]: { color: '#a78bfa', pattern: 'dots' } });
      const pattern = svg.querySelector('pattern');
      expect(pattern.querySelector('rect').getAttribute('fill')).toBe('#a78bfa');
      const shapes = [...svg.querySelectorAll(`[data-part="${part.key}"]`)];
      // Every filled shape of the part shows the pattern; lines just take its color.
      expect(
        shapes.some((el) => el.getAttribute('fill') === `url(#${pattern.id})`) ||
          shapes.some((el) => el.getAttribute('stroke') === '#a78bfa'),
        part.key,
      ).toBe(true);
      for (const el of shapes) {
        const filled = el.getAttribute('fill') !== 'none';
        if (filled) expect(el.getAttribute('fill'), part.key).toBe(`url(#${pattern.id})`);
      }
    }
  });

  it('gives each drawing\'s patterns their own ids', () => {
    const pot = cottageById('pot');
    const ids = [1, 2].map(() =>
      cottageDrawing(pot, { walls: { color: '#a78bfa', pattern: 'dots' } }).querySelector('pattern').id,
    );
    expect(ids[0]).not.toBe(ids[1]);
  });

  it('keeps the parts it isn\'t given in their own colors', () => {
    const teacup = cottageById('teacup');
    const html = cottageDrawing(teacup, { walls: plain('#3b82f6') }).innerHTML;
    expect(html).toContain('#3b82f6');
    expect(html).not.toContain('#fbcfe8'); // the old wall color
    expect(html).toContain('#f9a8d4'); // the rim, untouched
  });

  it('offers each part its own color, or any in the palette, with no repeats', () => {
    const cuff = cottageById('boot').parts.find((part) => part.key === 'trim');
    const colors = partColors(cuff);
    expect(colors[0]).toBe(cuff.color);
    expect(new Set(colors).size).toBe(colors.length);
    for (const { color } of PALETTE) expect(colors).toContain(color);

    const cup = cottageById('teacup').parts.find((part) => part.key === 'walls');
    expect(partColors(cup)).toHaveLength(PALETTE.length); // its own color is in the palette
  });
});

describe('the palette', () => {
  it('has a light and a bright row of nine colors, then nine neutrals: 27 in all', () => {
    expect(PALETTE).toHaveLength(27);
    expect(PALETTE.slice(0, 9).every(({ name }) => name.startsWith('light '))).toBe(true);
    expect(PALETTE.slice(18).map(({ name }) => name)).toEqual([
      'white', 'cream', 'tan', 'brown', 'dark brown', 'light gray', 'gray', 'plum', 'black',
    ]);
  });

  it('runs in rainbow order across each row', () => {
    const hues = ['red', 'orange', 'yellow', 'lime', 'green', 'teal', 'blue', 'purple', 'pink'];
    expect(PALETTE.slice(0, 9).map(({ name }) => name)).toEqual(hues.map((hue) => `light ${hue}`));
    expect(PALETTE.slice(9, 18).map(({ name }) => name)).toEqual(hues);
  });

  it('has a different, named color in every spot', () => {
    expect(new Set(PALETTE.map(({ color }) => color)).size).toBe(PALETTE.length);
    expect(new Set(PALETTE.map(({ name }) => name)).size).toBe(PALETTE.length);
    for (const { color } of PALETTE) expect(color).toMatch(/^#[0-9a-f]{6}$/);
  });
});

describe('the patterns', () => {
  it('are two rows of six', () => {
    expect(PATTERNS.map((p) => p.id)).toEqual([
      'plain', 'stripes', 'dots', 'checks', 'bricks', 'hearts',
      'zigzag', 'waves', 'scales', 'diamonds', 'stars', 'flowers',
    ]);
    expect(new Set(PATTERNS.map((p) => p.name)).size).toBe(12);
    expect(patternById('dots').name).toBe('dots');
    expect(patternById('plaid')).toBeUndefined();
  });

  it('plain is just the color', () => {
    expect(paintFill(plain('#3b82f6'), 'p1')).toEqual({ fill: '#3b82f6', def: '' });
  });

  it.each(PATTERNS.filter((p) => p.marks).map((p) => p.id))('%s is a tile of the color with marks on it', (id) => {
    const { fill, def } = paintFill({ color: '#3b82f6', pattern: id }, 'p1');
    expect(fill).toBe('url(#p1)');
    expect(def).toContain('<pattern id="p1"');
    expect(def).toContain('fill="#3b82f6"');
    expect(def).toContain(patternById(id).marks);
  });

  it('draws its marks dark on a light color and light on a dark one, so they show', () => {
    expect(paintFill({ color: '#fef08a', pattern: 'dots' }, 'p').def).toContain('fill="#4a2530"');
    expect(paintFill({ color: '#1f2937', pattern: 'dots' }, 'p').def).toContain('fill="#ffffff"');
  });

  it('treats a pattern it doesn\'t know as plain', () => {
    expect(paintFill({ color: '#3b82f6', pattern: 'plaid' }, 'p')).toEqual({ fill: '#3b82f6', def: '' });
  });
});

describe('a cottage tile, for the picker', () => {
  it('puts the drawing on the cottage\'s own color', () => {
    const cottage = cottageById('mushroom');
    const tile = cottageTile(cottage);
    expect(tile.className).toBe('cottage-tile');
    expect(tile.style.getPropertyValue('--tile')).toBe(cottage.tile);
    expect(tile.querySelector('svg.cottage')).not.toBeNull();
  });

  it('hides the picture from screen readers, since the card names it', () => {
    const svg = cottageTile(cottageById('boot')).querySelector('svg');
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.hasAttribute('role')).toBe(false);
    expect(svg.hasAttribute('aria-label')).toBe(false);
  });
});
