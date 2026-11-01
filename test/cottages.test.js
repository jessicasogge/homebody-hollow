// @vitest-environment jsdom
// game/cottages.js: the cottages, and how each is drawn.
import { describe, expect, it } from 'vitest';
import {
  COTTAGES,
  cottageById,
  cottageDrawing,
  cottageTile,
  defaultPaints,
  insideDrawing,
  PALETTE,
  paintFill,
  partColors,
  patternById,
  PATTERNS,
} from '../public/game/cottages.js';
import { putIn } from '../public/game/furniture.js';

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
  it.each(COTTAGES)('$name has a part for each window, each starting a lit-up yellow', (cottage) => {
    const glass = [...cottageDrawing(cottage).querySelectorAll('.window')];
    const windows = cottage.parts.filter((part) => part.key.startsWith('window'));
    expect(glass.length).toBeGreaterThan(0);
    expect(windows).toEqual(
      glass.map((_, i) => ({ key: `window${i + 1}`, label: `Window ${i + 1}`, color: '#fde047' })),
    );
    glass.forEach((pane, i) => {
      expect(pane.getAttribute('fill')).toBe('#fde047');
      expect(pane.dataset.part).toBe(`window${i + 1}`);
    });
  });

  it('paints each window on its own, in a color or a pattern', () => {
    const boot = cottageById('boot');
    const one = cottageDrawing(boot, {
      window2: { color: '#3b82f6', pattern: 'plain' },
      window4: { color: '#f472b6', pattern: 'hearts' },
    });
    const fills = [...one.querySelectorAll('.window')].map((w) => w.getAttribute('fill'));
    expect(fills[0]).toBe('#fde047');
    expect(fills[1]).toBe('#3b82f6');
    expect(fills[2]).toBe('#fde047');
    expect(fills[3]).toMatch(/^url\(#paint-\d+-window4\)$/);
    expect(fills[4]).toBe('#fde047');
  });

  it('counts the eyes of the cat and the puppy as windows, so each eye can be painted', () => {
    expect(cottageById('cat').parts.filter((p) => p.key.startsWith('window'))).toHaveLength(3);
    expect(cottageById('puppy').parts.filter((p) => p.key.startsWith('window'))).toHaveLength(4);
  });
});

describe('the handbag', () => {
  it('has a bag, a flap, a handle, a clasp, windows and a door to paint', () => {
    expect(cottageById('handbag').parts.map((part) => part.label)).toEqual([
      'Bag', 'Flap', 'Handle', 'Clasp', 'Window 1', 'Window 2', 'Door',
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
      'Body', 'Head', 'Ears', 'Muzzle', 'Tail', 'Window 1', 'Window 2', 'Window 3', 'Window 4', 'Door',
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
      'Body', 'Head', 'Ears', 'Tail', 'Nose', 'Window 1', 'Window 2', 'Window 3', 'Door',
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

describe('inside a cottage', () => {
  it('has rooms, from the top down, each with a name', () => {
    for (const cottage of COTTAGES) {
      const { rooms } = cottage.inside;
      expect(rooms.length).toBeGreaterThanOrEqual(2);
      for (const [i, room] of rooms.entries()) {
        expect(room.name).toBeTruthy();
        expect(room.top).toBeLessThan(room.bottom);
        if (i > 0) expect(room.top).toBe(rooms[i - 1].bottom);
      }
    }
  });

  it('gives the boot a room in its shaft and one in its foot, and the cat and puppy one in the head and one in the body', () => {
    expect(cottageById('boot').inside.rooms.map((r) => r.name)).toEqual(['The shaft', 'The foot']);
    for (const id of ['cat', 'puppy']) {
      expect(cottageById(id).inside.rooms.map((r) => r.name)).toEqual(['In the head', 'In the body']);
    }
  });

  it('has a ladder up to every floor above the ground', () => {
    for (const cottage of COTTAGES) {
      const { rooms, ladders } = cottage.inside;
      const upper = rooms.slice(1).map((room, i) => cottage.inside.floors[i][0]);
      for (const y of upper) {
        expect(ladders.some(([, top, bottom]) => top <= y && bottom > y)).toBe(true);
      }
    }
  });

  it('draws every cottage open, with each of its rooms, and no door', () => {
    for (const cottage of COTTAGES) {
      const svg = insideDrawing(cottage);
      const { rooms } = cottage.inside;
      expect(svg.querySelectorAll('.room')).toHaveLength(rooms.length);
      expect(svg.querySelector('[data-part="door"]')).toBeNull();
      expect(cottageDrawing(cottage).querySelector('[data-part="door"]')).not.toBeNull();
    }
  });

  it('gives the puppy a plain leg where its door was', () => {
    const svg = insideDrawing(cottageById('puppy'));
    const leg = svg.querySelector('clipPath').previousElementSibling;
    expect(leg.getAttribute('x')).toBe('62');
    expect(leg.dataset.part).toBe('walls');
  });

  it('draws each room, empty, and says so', () => {
    const svg = insideDrawing(cottageById('boot'));
    expect(svg.classList.contains('inside')).toBe(true);
    expect(svg.querySelectorAll('.room')).toHaveLength(2);
    expect(svg.querySelectorAll('.thing')).toHaveLength(0);
    expect(svg.getAttribute('aria-label')).toBe(
      'Inside Tiptoe Cottage: the shaft, empty; the foot, empty',
    );
  });

  it('puts an invisible box over each thing, its size, so a tap anywhere on it counts', () => {
    const svg = insideDrawing(cottageById('teacup'), {}, [[{ id: 'lamp', box: 0 }], []]);
    const area = svg.querySelector('.thing .thing-area');
    expect(area.getAttribute('fill')).toBe('transparent');
    expect([area.getAttribute('width'), area.getAttribute('height')]).toEqual(['8', '18']);
    expect(area.getAttribute('y')).toBe(String(86 - 18)); // up from the floor
  });

  it('draws what\'s in each room, and says so', () => {
    const svg = insideDrawing(cottageById('boot'), {}, [
      [{ id: 'bed', box: 0 }, { id: 'picture', box: 0 }],
      [{ id: 'stove', box: 0 }],
    ]);
    const things = [...svg.querySelectorAll('.thing')];
    expect(things.map((g) => [g.dataset.room, g.dataset.thing])).toEqual([
      ['0', '1'], // the picture, on the wall, drawn first
      ['0', '0'],
      ['1', '0'],
    ]);
    expect(svg.getAttribute('aria-label')).toBe(
      'Inside Tiptoe Cottage: the shaft, bed, picture; the foot, stove',
    );
  });

  it('has space for a toilet and a sink side by side at the top of the boot', () => {
    const top = cottageById('boot').inside.rooms[0];
    expect(putIn(top, putIn(top, [], 'toilet'), 'sink')).toEqual([
      { id: 'toilet', box: 0 },
      { id: 'sink', box: 8 },
    ]);
  });

  it('hangs pictures and shelves above chairs and sofas', () => {
    // Chairs and sofas are 14 high.
    for (const cottage of COTTAGES) {
      for (const room of cottage.inside.rooms) expect(room.floor[0] - room.wall[0]).toBeGreaterThanOrEqual(15);
    }
  });

  it('hangs pictures and shelves low enough to clear the floor above', () => {
    // The tallest thing on a wall (a bookshelf) is 7 high.
    for (const cottage of COTTAGES) {
      const { rooms, floors } = cottage.inside;
      rooms.forEach((room, i) => {
        if (i === 0) return;
        const [y, h] = floors[i - 1];
        expect(room.wall[0] - 7).toBeGreaterThan(y + h);
      });
    }
  });

  it('keeps everything in a room inside it, clear of its ladders', () => {
    for (const cottage of COTTAGES) {
      const { rooms, ladders } = cottage.inside;
      for (const room of rooms) {
        const [floorY, ...floor] = room.floor;
        const [wallY, ...wall] = room.wall;
        expect(floorY).toBeGreaterThan(room.top);
        expect(floorY).toBeLessThanOrEqual(room.bottom);
        expect(wallY).toBeLessThan(floorY);
        for (const [left, right] of [...floor, ...wall]) {
          expect(left).toBeLessThan(right);
          for (const [x, top, bottom] of ladders) {
            const crosses = top < floorY && bottom >= floorY;
            if (crosses) expect(right <= x || left >= x + 6).toBe(true);
          }
        }
      }
    }
  });

  it('keeps the rooms inside the cottage\'s shape', () => {
    const svg = insideDrawing(cottageById('cat'));
    const clip = svg.querySelector('clipPath');
    expect(clip.children).toHaveLength(2); // the head and the body
    expect(svg.querySelector('.room').parentElement.getAttribute('clip-path')).toBe(`url(#${clip.id})`);
  });

  it('leaves out the cat\'s whiskers, which would poke out past its walls', () => {
    expect(cottageDrawing(cottageById('cat')).querySelector('.outside-only')).not.toBeNull();
    expect(insideDrawing(cottageById('cat')).querySelector('.outside-only')).toBeNull();
  });

  it('cuts its walls in their own paint', () => {
    const svg = insideDrawing(cottageById('cat'), {
      walls: { color: '#3b82f6', pattern: 'dots' },
      head: { color: '#22c55e', pattern: 'plain' },
    });
    const cut = (color) => svg.querySelector(`[stroke="${color}"][stroke-width="4.5"]`);
    expect(cut('#3b82f6').tagName).toBe('path'); // the body
    expect(cut('#22c55e').tagName).toBe('circle'); // the head
  });

  it('keeps the cottage\'s paints on what stays in front, like the saucer', () => {
    const svg = insideDrawing(cottageById('teacup'), { saucer: { color: '#22c55e', pattern: 'plain' } });
    const saucers = svg.querySelectorAll('[data-part="saucer"]');
    expect(saucers).toHaveLength(2); // the cottage's, and in front of the rooms
    expect(saucers[1].getAttribute('fill')).toBe('#22c55e');
  });
});
