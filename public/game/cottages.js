// The cottages of the Hollow. Every cottage used to be something else. Each is
// drawn on a 120 x 140 box, standing on its bottom edge so they all line up
// on the home page's grass.

import { arrange, furnitureById } from './furniture.js';

const INK = '#4a2530';
const LINE = `stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;

// A square window with crossed panes. Its glass is painted on its own.
function win(x, y, s = 12) {
  return `
    <rect class="window" x="${x}" y="${y}" width="${s}" height="${s}" rx="2" ${LINE} />
    <path d="M${x + s / 2} ${y} V${y + s} M${x} ${y + s / 2} H${x + s}" stroke="${INK}" stroke-width="1.5" />`;
}

// A round window, for cottages that are round themselves.
function porthole(cx, cy, r = 7) {
  return `
    <circle class="window" cx="${cx}" cy="${cy}" r="${r}" ${LINE} />
    <path d="M${cx} ${cy - r} V${cy + r} M${cx - r} ${cy} H${cx + r}" stroke="${INK}" stroke-width="1.5" />`;
}

// Paint a shape in a part's paint (its color, or its pattern), and tag it
// with the part, so tapping it in the studio knows what to fill. `stroke`
// is for parts drawn as lines (the teacup's handle, the leaf's veins),
// which are too thin for a pattern, so they take just the color.
const fill = (c, part) => `fill="${c[part].fill}" data-part="${part}"`;
const stroke = (c, part) => `stroke="${c[part].color}" data-part="${part}"`;

// A wider, invisible line along a thin one (the boot's stitching), so it's
// big enough to tap.
const tapArea = (part) => `stroke="transparent" stroke-width="8" data-part="${part}"`;

// An arched front door with a little knob. It goes with the front wall, so
// it's left out inside.
function door(x, y, w, h, c) {
  const r = w / 2;
  return `
    <g class="outside-only">
      <path d="M${x} ${y + h} V${y + r} A${r} ${r} 0 0 1 ${x + w} ${y + r} V${y + h} Z" ${fill(c, 'door')} ${LINE} />
      <circle cx="${x + w - 4}" cy="${y + h * 0.62}" r="1.4" fill="${INK}" />
    </g>`;
}

// A monstera slit: a notch cut in from the leaf's edge (between edge points
// a and b) to a point inside. `hole` is the notch, for the leaf's mask, so
// whatever is behind the leaf shows through; `outline` is its two sides.
function slit(ax, ay, bx, by, tx, ty) {
  const out = (x, y) => [x + (x - tx) * 0.25, y + (y - ty) * 0.25];
  const [oax, oay] = out(ax, ay);
  const [obx, oby] = out(bx, by);
  return {
    hole: `<path d="M${oax} ${oay} L${tx} ${ty} L${obx} ${oby} Z" fill="black" />`,
    outline: `<path d="M${ax} ${ay} L${tx} ${ty} L${bx} ${by}" fill="none" ${LINE} />`,
  };
}

const LEAF_SLITS = [
  slit(15, 36, 19, 31, 44, 44), slit(7, 69, 7, 64, 38, 66), slit(16, 94, 20, 98, 42, 88),
  slit(105, 36, 101, 31, 76, 44), slit(113, 69, 113, 64, 82, 66), slit(104, 94, 100, 98, 78, 88),
];

// The colors you can paint with, in the studio, in rainbow order: a light
// and a bright row of nine, then a row of neutrals.
const HUES = [
  ['red', '#fecaca', '#ef4444'],
  ['orange', '#fed7aa', '#f97316'],
  ['yellow', '#fef08a', '#facc15'],
  ['lime', '#d9f99d', '#84cc16'],
  ['green', '#bbf7d0', '#22c55e'],
  ['teal', '#99f6e4', '#14b8a6'],
  ['blue', '#bfdbfe', '#3b82f6'],
  ['purple', '#ddd6fe', '#8b5cf6'],
  ['pink', '#fbcfe8', '#ec4899'],
];

const NEUTRALS = [
  ['white', '#ffffff'], ['cream', '#fef3c7'], ['tan', '#d6b38a'], ['brown', '#a16207'],
  ['dark brown', '#713f12'], ['light gray', '#e5e7eb'], ['gray', '#9ca3af'], ['plum', '#4a2530'],
  ['black', '#1f2937'],
];

export const PALETTE = [
  ...HUES.map(([name, light]) => ({ name: `light ${name}`, color: light })),
  ...HUES.map(([name, , bright]) => ({ name, color: bright })),
  ...NEUTRALS.map(([name, color]) => ({ name, color })),
];

// The colors a part can be: its own, or any in the palette.
export function partColors(part) {
  return [part.color, ...PALETTE.map(({ color }) => color).filter((color) => color !== part.color)];
}

// The patterns you can paint with, two rows of six. Each is a tile of
// marks laid over the color, `size` wide.
export const PATTERNS = [
  // No pattern, just the color. (Its id is 'plain' in the address.)
  { id: 'plain', name: 'solid' },
  { id: 'stripes', name: 'stripes', size: 8, marks: '<rect width="4" height="8" />' },
  { id: 'dots', name: 'dots', size: 8, marks: '<circle cx="4" cy="4" r="1.7" />' },
  {
    id: 'checks',
    name: 'checks',
    size: 10,
    marks: '<rect width="5" height="5" /><rect x="5" y="5" width="5" height="5" />',
  },
  {
    id: 'bricks',
    name: 'bricks',
    size: 12,
    marks: '<path d="M0 0.5 H12 M0 6.5 H12 M3 0.5 V6.5 M9 6.5 V12.5" fill="none" stroke-width="1" />',
  },
  {
    id: 'hearts',
    name: 'hearts',
    size: 12,
    marks: '<path d="M6 9.6 L2.7 6.3 A1.85 1.85 0 1 1 6 3.8 A1.85 1.85 0 1 1 9.3 6.3 Z" />',
  },
  {
    id: 'zigzag',
    name: 'zigzag',
    size: 10,
    marks: '<path d="M0 7 L2.5 3 L5 7 L7.5 3 L10 7" fill="none" stroke-width="1.6" />',
  },
  {
    id: 'waves',
    name: 'waves',
    size: 12,
    marks: '<path d="M0 6 Q3 2 6 6 T12 6" fill="none" stroke-width="1.6" />',
  },
  {
    id: 'scales',
    name: 'scales',
    size: 10,
    marks:
      '<path d="M0 10 A5 5 0 0 1 10 10 M-5 5 A5 5 0 0 1 5 5 M5 5 A5 5 0 0 1 15 5" fill="none" stroke-width="1.2" />',
  },
  { id: 'diamonds', name: 'diamonds', size: 10, marks: '<path d="M5 1.5 L8.5 5 L5 8.5 L1.5 5 Z" />' },
  {
    id: 'stars',
    name: 'stars',
    size: 12,
    marks: '<path d="M6 2.2 L7.06 4.94 L9.99 5.1 L7.71 6.96 L8.47 9.8 L6 8.2 L3.53 9.8 L4.29 6.96 L2.01 5.1 L4.94 4.94 Z" />',
  },
  {
    id: 'flowers',
    name: 'flowers',
    size: 12,
    // Five petals, with the color showing through in the middle.
    marks:
      '<circle cx="6" cy="3.5" r="1.5" /><circle cx="8.38" cy="5.23" r="1.5" /><circle cx="7.47" cy="8.02" r="1.5" /><circle cx="4.53" cy="8.02" r="1.5" /><circle cx="3.62" cy="5.23" r="1.5" />',
  },
];

export const patternById = (id) => PATTERNS.find((pattern) => pattern.id === id);

// The marks are dark on a light color and light on a dark one, so they show
// on any color.
function marksColor(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return 0.299 * r + 0.587 * g + 0.114 * b > 150
    ? `fill="${INK}" stroke="${INK}" opacity="0.18"`
    : 'fill="#ffffff" stroke="#ffffff" opacity="0.35"';
}

// A paint: a color and a pattern, like { color: '#60a5fa', pattern: 'dots' }.
// Its fill is the color, or for a pattern, a link to the pattern's <pattern>
// (`def`), which needs its own `id` on the page.
export function paintFill(paint, id) {
  const pattern = patternById(paint.pattern);
  if (!pattern?.marks) return { fill: paint.color, def: '' };
  const { size, marks } = pattern;
  return {
    fill: `url(#${id})`,
    def: `
      <pattern id="${id}" patternUnits="userSpaceOnUse" width="${size}" height="${size}">
        <rect width="${size}" height="${size}" fill="${paint.color}" />
        <g ${marksColor(paint.color)}>${marks}</g>
      </pattern>`,
  };
}

// Where a cottage's windows go in its parts. Each window is a part of its
// own (Window 1, Window 2... in the order they're drawn), starting a warm,
// lit-up yellow; they're added below, once each cottage's windows are
// counted, and painted after the cottage is drawn, in cottageDrawing.
const WINDOWS = { key: 'windows' };
const WINDOW_COLOR = '#fde047';

// Each cottage has an id (for the address, ?cottage=boot), a name, the color
// of its tile on the picker, and what it looks like (for screen readers).
// Its parts are the pieces you can paint in the studio, each with its own
// color to start, and a name. Its svg draws it in a set of paints, one per
// part (`c`), with `uid` to keep its ids apart from other drawings' on the
// same page.
export const COTTAGES = [
  {
    id: 'boot',
    name: 'Tiptoe Cottage',
    tile: 'rgba(202, 138, 4, 0.25)',
    looks: 'a brown boot with a folded cuff, windows zigzagging down the shaft and a door in the toe',
    parts: [
      { key: 'walls', label: 'Boot', color: '#a16207' },
      { key: 'trim', label: 'Cuff', color: '#ca8a04' },
      { key: 'sole', label: 'Sole', color: '#713f12' },
      { key: 'stitching', label: 'Stitching', color: '#713f12' },
      { key: 'chimney', label: 'Chimney', color: '#78716c' },
      WINDOWS,
      { key: 'door', label: 'Door', color: '#b45309' },
    ],
    svg: (c) => `
      <rect x="29" y="4" width="7" height="18" ${fill(c, 'chimney')} ${LINE} />
      <path d="M30 30 H72 Q69 66 73 88 Q100 90 110 110 Q114 124 104 128 H24 Q20 112 28 98 Q25 64 30 30 Z" ${fill(c, 'walls')} ${LINE} />
      <path d="M78 128 Q78 100 104 104" fill="none" ${stroke(c, 'stitching')} stroke-width="2" stroke-dasharray="3 3" />
      <path d="M78 128 Q78 100 104 104" fill="none" ${tapArea('stitching')} />
      <path d="M24 20 H76 V32 Q70 38 63 32 Q56 38 50 32 Q43 38 37 32 Q30 38 24 32 Z" ${fill(c, 'trim')} ${LINE} />
      <rect x="22" y="124" width="26" height="12" rx="2" ${fill(c, 'sole')} ${LINE} />
      <path d="M48 128 H104 Q114 128 112 136 H48 Z" ${fill(c, 'sole')} ${LINE} />
      ${win(34, 40, 11)} ${win(52, 56, 11)} ${win(34, 72, 11)} ${win(52, 88, 11)} ${win(34, 104, 11)}
      ${door(88, 108, 14, 20, c)}`,
  },
  {
    id: 'soda-cup',
    name: 'Soda Pop Cottage',
    tile: 'rgba(239, 68, 68, 0.2)',
    looks: 'a red soda cup with a striped bendy straw for a chimney',
    parts: [
      { key: 'walls', label: 'Cup', color: '#ef4444' },
      { key: 'trim', label: 'Lid', color: '#fca5a5' },
      { key: 'straw', label: 'Straw', color: '#dc2626' },
      WINDOWS,
      { key: 'door', label: 'Door', color: '#b45309' },
    ],
    svg: (c) => `
      <path d="M66 40 V18 L88 8" fill="none" stroke="${INK}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" data-part="straw" />
      <path d="M66 40 V18 L88 8" fill="none" stroke="#fef2f2" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" data-part="straw" />
      <path d="M66 40 V18 L88 8" fill="none" ${stroke(c, 'straw')} stroke-width="5" stroke-dasharray="4 4" stroke-linejoin="round" />
      <path d="M28 46 H92 L84 136 H36 Z" ${fill(c, 'walls')} ${LINE} />
      <rect x="22" y="36" width="76" height="12" rx="6" ${fill(c, 'trim')} ${LINE} />
      <path d="M31 80 H89" stroke="${INK}" stroke-width="2" />
      ${win(40, 56)} ${win(68, 56)} ${win(46, 90)}
      ${door(64, 114, 14, 20, c)}`,
  },
  {
    id: 'pot',
    name: 'Stewpot Cottage',
    tile: 'rgba(94, 234, 212, 0.35)',
    looks: 'a round teal cooking pot with handles and porthole windows',
    parts: [
      { key: 'walls', label: 'Pot', color: '#99f6e4' },
      { key: 'trim', label: 'Lid & handles', color: '#5eead4' },
      WINDOWS,
      { key: 'door', label: 'Door', color: '#b45309' },
    ],
    svg: (c) => `
      <rect x="54" y="20" width="12" height="10" rx="3" ${fill(c, 'trim')} ${LINE} />
      <path d="M22 44 Q60 26 98 44 Z" ${fill(c, 'trim')} ${LINE} />
      <rect x="2" y="64" width="20" height="14" rx="7" ${fill(c, 'trim')} ${LINE} />
      <rect x="98" y="64" width="20" height="14" rx="7" ${fill(c, 'trim')} ${LINE} />
      <path d="M14 48 H106 V104 Q106 136 74 136 H46 Q14 136 14 104 Z" ${fill(c, 'walls')} ${LINE} />
      <path d="M14 48 H106" stroke="${INK}" stroke-width="3" />
      ${porthole(38, 72, 9)} ${porthole(82, 72, 9)} ${porthole(40, 106, 7)} ${porthole(80, 106, 7)}
      ${door(53, 114, 14, 20, c)}`,
  },
  {
    id: 'teacup',
    name: 'Teacup Cottage',
    tile: 'rgba(244, 114, 182, 0.25)',
    looks: 'a pink teacup on a saucer with a little chimney on the rim',
    parts: [
      { key: 'walls', label: 'Cup', color: '#fbcfe8' },
      { key: 'trim', label: 'Rim', color: '#f9a8d4' },
      { key: 'saucer', label: 'Saucer', color: '#f472b6' },
      { key: 'chimney', label: 'Chimney', color: '#78716c' },
      WINDOWS,
      { key: 'door', label: 'Door', color: '#b45309' },
    ],
    svg: (c) => `
      <rect x="72" y="34" width="7" height="16" ${fill(c, 'chimney')} ${LINE} />
      <path d="M92 70 Q118 70 114 92 Q110 110 88 108" fill="none" stroke="${INK}" stroke-width="11" stroke-linecap="round" data-part="walls" />
      <path d="M92 70 Q118 70 114 92 Q110 110 88 108" fill="none" ${stroke(c, 'walls')} stroke-width="5" stroke-linecap="round" />
      <path d="M14 52 H98 Q98 128 56 128 Q14 128 14 52 Z" ${fill(c, 'walls')} ${LINE} />
      <ellipse cx="56" cy="52" rx="42" ry="6" ${fill(c, 'trim')} ${LINE} />
      <ellipse cx="56" cy="130" rx="52" ry="7" ${fill(c, 'saucer')} ${LINE} />
      ${win(28, 68, 12)} ${win(72, 68, 12)}
      ${door(49, 98, 14, 26, c)}`,
  },
  {
    id: 'mushroom',
    name: 'Toadstool Cottage',
    tile: 'rgba(20, 184, 166, 0.25)',
    looks: 'a mushroom with a teal spotted cap and a door in its stem',
    parts: [
      { key: 'walls', label: 'Stem', color: '#fef3c7' },
      { key: 'trim', label: 'Cap', color: '#14b8a6' },
      { key: 'chimney', label: 'Chimney', color: '#78716c' },
      WINDOWS,
      { key: 'door', label: 'Door', color: '#b45309' },
    ],
    svg: (c) => `
      <rect x="80" y="14" width="7" height="16" ${fill(c, 'chimney')} ${LINE} />
      <path d="M38 76 Q34 110 30 136 H90 Q86 110 82 76 Z" ${fill(c, 'walls')} ${LINE} />
      <path d="M6 78 Q8 22 60 20 Q112 22 114 78 Z" ${fill(c, 'trim')} ${LINE} />
      ${porthole(30, 56, 7)} ${porthole(60, 40, 7)} ${porthole(90, 56, 7)}
      ${win(40, 90, 11)}
      ${door(55, 108, 16, 26, c)}`,
  },
  {
    id: 'leaf',
    name: 'Rainleaf Cottage',
    tile: 'rgba(132, 204, 22, 0.3)',
    looks: 'a heart-shaped monstera leaf with deep slits, on a curly stem, with a ladder up to the door',
    parts: [
      { key: 'walls', label: 'Leaf', color: '#4d7c0f' },
      { key: 'trim', label: 'Veins', color: '#84cc16' },
      { key: 'stem', label: 'Stem', color: '#65a30d' },
      { key: 'chimney', label: 'Chimney', color: '#78716c' },
      WINDOWS,
      { key: 'door', label: 'Door', color: '#a3e635' },
    ],
    svg: (c, uid) => `
      <defs>
        <mask id="slits-${uid}" maskUnits="userSpaceOnUse" x="0" y="0" width="120" height="140">
          <rect width="120" height="140" fill="white" />
          ${LEAF_SLITS.map((s) => s.hole).join('')}
        </mask>
      </defs>
      <rect x="74" y="2" width="7" height="16" ${fill(c, 'chimney')} ${LINE} />
      <path d="M60 98 Q64 118 54 130 Q46 138 40 130" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round" data-part="stem" />
      <path d="M60 98 Q64 118 54 130 Q46 138 40 130" fill="none" ${stroke(c, 'stem')} stroke-width="3" stroke-linecap="round" />
      <g mask="url(#slits-${uid})">
        <path d="M60 100 Q44 112 24 102 Q4 88 6 62 Q8 32 34 18 Q48 10 60 4 Q72 10 86 18 Q112 32 114 62 Q116 88 96 102 Q76 112 60 100 Z" ${fill(c, 'walls')} ${LINE} />
        <path d="M60 8 V98 M60 50 Q36 44 12 46 M60 74 Q36 72 10 84 M60 50 Q84 44 108 46 M60 74 Q84 72 110 84" fill="none" ${stroke(c, 'trim')} stroke-width="2" />
      </g>
      ${LEAF_SLITS.map((s) => s.outline).join('')}
      ${win(44, 30, 10)} ${win(66, 30, 10)} ${win(44, 58, 10)} ${win(66, 58, 10)}
      ${door(53, 76, 14, 20, c)}
      <path d="M86 102 V136 M98 100 V136 M86 110 H98 M86 118 H98 M86 126 H98 M86 134 H98" stroke="${INK}" stroke-width="2" />`,
  },
  {
    id: 'cat',
    name: 'Whisker Cottage',
    tile: 'rgba(251, 146, 60, 0.25)',
    looks: 'a sitting orange cat with porthole eyes, a window in its tummy, a curly tail and a door at its feet',
    parts: [
      { key: 'walls', label: 'Body', color: '#fdba74' },
      { key: 'head', label: 'Head', color: '#fdba74' },
      { key: 'trim', label: 'Ears', color: '#fb923c' },
      { key: 'tail', label: 'Tail', color: '#fb923c' },
      { key: 'nose', label: 'Nose', color: '#f9a8d4' },
      WINDOWS,
      { key: 'door', label: 'Door', color: '#b45309' },
    ],
    svg: (c) => `
      <path d="M36 132 Q8 128 10 100 Q12 80 24 86" fill="none" stroke="${INK}" stroke-width="11" stroke-linecap="round" data-part="tail" />
      <path d="M36 132 Q8 128 10 100 Q12 80 24 86" fill="none" ${stroke(c, 'tail')} stroke-width="5" stroke-linecap="round" />
      <path d="M40 34 L36 6 L58 24 Z" ${fill(c, 'trim')} ${LINE} />
      <path d="M62 24 L86 6 L80 34 Z" ${fill(c, 'trim')} ${LINE} />
      <path d="M30 136 Q24 98 42 82 Q60 72 78 82 Q96 98 90 136 Z" ${fill(c, 'walls')} ${LINE} />
      <circle cx="60" cy="50" r="26" ${fill(c, 'head')} ${LINE} />
      ${porthole(49, 46, 7)} ${porthole(71, 46, 7)}
      <path d="M56 58 H64 L60 63 Z" ${fill(c, 'nose')} ${LINE} />
      <path d="M60 63 V66 M60 66 Q56 70 53 67 M60 66 Q64 70 67 67" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round" />
      <path class="outside-only" d="M44 60 L28 57 M44 64 L29 66 M76 60 L92 57 M76 64 L91 66" stroke="${INK}" stroke-width="1.5" stroke-linecap="round" />
      ${win(53, 92, 14)}
      ${door(38, 112, 14, 22, c)}`,
  },
  {
    id: 'handbag',
    name: 'Handbag Cottage',
    tile: 'rgba(167, 139, 250, 0.3)',
    looks: 'a purple handbag with a curved flap, a round gold clasp and a big arched handle on top',
    parts: [
      { key: 'walls', label: 'Bag', color: '#a78bfa' },
      { key: 'trim', label: 'Flap', color: '#7c3aed' },
      { key: 'handle', label: 'Handle', color: '#7c3aed' },
      { key: 'clasp', label: 'Clasp', color: '#facc15' },
      WINDOWS,
      { key: 'door', label: 'Door', color: '#b45309' },
    ],
    svg: (c) => `
      <path d="M32 66 Q30 14 60 14 Q90 14 88 66" fill="none" stroke="${INK}" stroke-width="12" stroke-linecap="round" data-part="handle" />
      <path d="M32 66 Q30 14 60 14 Q90 14 88 66" fill="none" ${stroke(c, 'handle')} stroke-width="6" stroke-linecap="round" />
      <path d="M12 62 H108 L100 126 Q99 136 89 136 H31 Q21 136 20 126 Z" ${fill(c, 'walls')} ${LINE} />
      <path d="M12 62 H108 L106 78 Q60 104 14 78 Z" ${fill(c, 'trim')} ${LINE} />
      <path d="M20 70 H100" stroke="${INK}" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.5" />
      <circle cx="60" cy="90" r="6" ${fill(c, 'clasp')} ${LINE} />
      ${win(26, 100, 13)} ${win(81, 100, 13)}
      ${door(53, 106, 14, 28, c)}`,
  },
  {
    id: 'puppy',
    name: 'Puppy Cottage',
    tile: 'rgba(214, 179, 138, 0.35)',
    looks: 'a tan puppy with a big head, floppy ears, its tongue out, a curly tail, windows along its side and a door for one of its legs',
    parts: [
      { key: 'walls', label: 'Body', color: '#d6b38a' },
      { key: 'head', label: 'Head', color: '#d6b38a' },
      { key: 'trim', label: 'Ears', color: '#92400e' },
      { key: 'muzzle', label: 'Muzzle', color: '#fef3c7' },
      { key: 'tail', label: 'Tail', color: '#d6b38a' },
      WINDOWS,
      { key: 'door', label: 'Door', color: '#b45309' },
    ],
    // Its door is one of its front legs.
    svg: (c) => `
      <path d="M20 104 Q4 98 8 82 Q12 70 21 76 Q26 82 19 86" fill="none" stroke="${INK}" stroke-width="10" stroke-linecap="round" data-part="tail" />
      <path d="M20 104 Q4 98 8 82 Q12 70 21 76 Q26 82 19 86" fill="none" ${stroke(c, 'tail')} stroke-width="4.5" stroke-linecap="round" />
      <rect x="20" y="118" width="12" height="18" rx="6" ${fill(c, 'walls')} ${LINE} />
      <rect x="35" y="118" width="12" height="18" rx="6" ${fill(c, 'walls')} ${LINE} />
      <rect x="77" y="118" width="12" height="18" rx="6" ${fill(c, 'walls')} ${LINE} />
      <rect x="14" y="92" width="76" height="34" rx="17" ${fill(c, 'walls')} ${LINE} />
      <ellipse cx="57" cy="70" rx="10" ry="20" transform="rotate(22 57 70)" ${fill(c, 'trim')} ${LINE} />
      <ellipse cx="111" cy="70" rx="10" ry="20" transform="rotate(-22 111 70)" ${fill(c, 'trim')} ${LINE} />
      <circle cx="84" cy="66" r="28" ${fill(c, 'head')} ${LINE} />
      <path d="M79 39 Q82 31 85 38 Q88 32 90 40" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
      <ellipse cx="84" cy="79" rx="13" ry="10" ${fill(c, 'muzzle')} ${LINE} />
      <ellipse cx="84" cy="74" rx="5" ry="3.6" fill="${INK}" />
      <circle cx="82.5" cy="73" r="1.2" fill="#ffffff" />
      <path d="M84 77.5 V80 M84 80 Q81 83.5 78 81 M84 80 Q87 83.5 90 81" fill="none" stroke="${INK}" stroke-width="1.6" stroke-linecap="round" />
      <path d="M81 82.5 Q81 90 84 90 Q87 90 87 82.5 Z" fill="#f472b6" stroke="${INK}" stroke-width="1.3" />
      ${porthole(73, 61, 7)} ${porthole(95, 61, 7)}
      ${win(26, 101, 10)} ${win(42, 101, 10)}
      ${door(62, 112, 12, 24, c)}`,
  },
];

// Each cottage's inside: its rooms, empty for you to fill with whatever you
// like, one above the other, with fixed ladders between the floors. It's
// drawn as the cottage with its front taken off, like a dollhouse:
// - `shapes`: the outline of each hollow part of the cottage, and the part
//   whose paint its cut walls show (the cat's head and body are both rooms).
// - `rooms`: from the top down, each with a name, its wallpaper, how far
//   down the cottage it goes (`top` to `bottom`), and where things go in
//   it: the line its
//   floor is on and the stretches of floor clear of its walls and ladder
//   (`floor`), and the same for pictures and shelves on its wall
//   (`wall`), as [line, [left, right], ...].
// - `floors`: each floor's top and how thick it is.
// - `ladders`: each one's left side, top and bottom.
// - `front`: what stays in front of the rooms (the boot's cuff, the
//   teacup's saucer...). The door goes with the front wall.
// - `under`, if it has one: what goes over the cottage but under its rooms
//   (the puppy's door is a leg, so a plain leg goes where it was).
// The door, and anything on the front that would poke out past the cut
// walls (the cat's whiskers), is marked outside-only, and left out.
const INSIDES = {
  boot: {
    shapes: [['walls', '<path d="M30 30 H72 Q69 66 73 88 Q100 90 110 110 Q114 124 104 128 H24 Q20 112 28 98 Q25 64 30 30 Z"']],
    rooms: [
      { name: 'Top of the shaft', wallpaper: '#dbeafe', top: 30, bottom: 62,
        floor: [62, [35, 58]], wall: [44, [35, 58]] },
      { name: 'Middle of the shaft', wallpaper: '#fef9c3', top: 62, bottom: 96,
        floor: [96, [33, 58]], wall: [78, [33, 58]] },
      { name: 'The foot', wallpaper: '#fce7f3', top: 96, bottom: 130,
        floor: [124, [30, 58], [68, 100]], wall: [106, [30, 58], [68, 100]] },
    ],
    floors: [[62, 4], [96, 4], [124, 6]],
    ladders: [[60, 62, 124]],
    front: (c) => `
      <path d="M24 20 H76 V32 Q70 38 63 32 Q56 38 50 32 Q43 38 37 32 Q30 38 24 32 Z" ${fill(c, 'trim')} ${LINE} />
      <rect x="22" y="124" width="26" height="12" rx="2" ${fill(c, 'sole')} ${LINE} />
      <path d="M48 128 H104 Q114 128 112 136 H48 Z" ${fill(c, 'sole')} ${LINE} />`,
  },
  'soda-cup': {
    shapes: [['walls', '<path d="M28 46 H92 L84 136 H36 Z"']],
    rooms: [
      { name: 'Upstairs', wallpaper: '#e0f2fe', top: 46, bottom: 80,
        floor: [78, [33, 87]], wall: [60, [33, 87]] },
      { name: 'Downstairs', wallpaper: '#fef3c7', top: 80, bottom: 136,
        floor: [130, [48, 80]], wall: [112, [48, 82]] },
    ],
    floors: [[78, 4], [130, 8]],
    ladders: [[40, 78, 130]],
    front: (c) => `
      <rect x="22" y="36" width="76" height="12" rx="6" ${fill(c, 'trim')} ${LINE} />`,
  },
  pot: {
    shapes: [['walls', '<path d="M14 48 H106 V104 Q106 136 74 136 H46 Q14 136 14 104 Z"']],
    rooms: [
      { name: 'Upstairs', wallpaper: '#fef3c7', top: 48, bottom: 90,
        floor: [88, [19, 101]], wall: [68, [19, 101]] },
      { name: 'Downstairs', wallpaper: '#fce7f3', top: 90, bottom: 136,
        floor: [128, [27, 41], [50, 93]], wall: [110, [19, 41], [50, 101]] },
    ],
    floors: [[88, 4], [128, 10]],
    ladders: [[42, 88, 128]],
    front: (c) => `
      <path d="M10 48 H110" stroke="${INK}" stroke-width="3" stroke-linecap="round" />`,
  },
  teacup: {
    shapes: [['walls', '<path d="M14 52 H98 Q98 128 56 128 Q14 128 14 52 Z"']],
    rooms: [
      { name: 'Upstairs', wallpaper: '#fdf2f8', top: 50, bottom: 88,
        floor: [86, [22, 90]], wall: [68, [22, 90]] },
      { name: 'Downstairs', wallpaper: '#ecfccb', top: 88, bottom: 130,
        floor: [118, [36, 76]], wall: [102, [26, 79]] },
    ],
    floors: [[86, 4], [118, 12]],
    ladders: [[80, 86, 118]],
    front: (c) => `
      <ellipse cx="56" cy="52" rx="42" ry="6" ${fill(c, 'trim')} ${LINE} />
      <ellipse cx="56" cy="130" rx="52" ry="7" ${fill(c, 'saucer')} ${LINE} />`,
  },
  mushroom: {
    shapes: [
      ['walls', '<path d="M38 76 Q34 110 30 136 H90 Q86 110 82 76 Z"'],
      ['trim', '<path d="M6 78 Q8 22 60 20 Q112 22 114 78 Z"'],
    ],
    rooms: [
      { name: 'In the cap', wallpaper: '#fef9c3', top: 18, bottom: 78,
        floor: [74, [14, 106]], wall: [56, [24, 96]] },
      { name: 'In the stem', wallpaper: '#ffedd5', top: 78, bottom: 136,
        floor: [130, [36, 45], [54, 84]], wall: [112, [36, 45], [54, 84]] },
    ],
    floors: [[74, 4], [130, 8]],
    ladders: [[46, 74, 130]],
    front: () => '',
  },
  leaf: {
    shapes: [['walls', '<path d="M60 100 Q44 112 24 102 Q4 88 6 62 Q8 32 34 18 Q48 10 60 4 Q72 10 86 18 Q112 32 114 62 Q116 88 96 102 Q76 112 60 100 Z"']],
    rooms: [
      { name: 'Up top', wallpaper: '#ecfccb', top: 0, bottom: 54,
        floor: [52, [20, 100]], wall: [36, [28, 92]] },
      { name: 'Down below', wallpaper: '#fef3c7', top: 54, bottom: 110,
        floor: [94, [18, 71], [79, 100]], wall: [76, [18, 71], [79, 100]] },
    ],
    floors: [[52, 4], [94, 12]],
    ladders: [[72, 52, 94]],
    front: (c) => `
      <path d="M86 102 V136 M98 100 V136 M86 110 H98 M86 118 H98 M86 126 H98 M86 134 H98" stroke="${INK}" stroke-width="2" />`,
  },
  cat: {
    shapes: [
      ['walls', '<path d="M30 136 Q24 98 42 82 Q60 72 78 82 Q96 98 90 136 Z"'],
      ['head', '<circle cx="60" cy="50" r="26"'],
    ],
    rooms: [
      { name: 'In the head', wallpaper: '#ede9fe', top: 20, bottom: 70,
        floor: [66, [46, 74]], wall: [50, [44, 76]] },
      { name: 'In the body', wallpaper: '#fef3c7', top: 70, bottom: 140,
        floor: [130, [35, 56], [64, 86]], wall: [112, [35, 56], [64, 86]] },
    ],
    floors: [[66, 4], [130, 8]],
    ladders: [[57, 66, 130]],
    front: () => '',
  },
  handbag: {
    shapes: [['walls', '<path d="M12 62 H108 L100 126 Q99 136 89 136 H31 Q21 136 20 126 Z"']],
    rooms: [
      { name: 'Under the flap', wallpaper: '#fdf2f8', top: 60, bottom: 92,
        floor: [90, [20, 53], [67, 100]], wall: [74, [20, 100]] },
      { name: 'In the bag', wallpaper: '#f5f3ff', top: 92, bottom: 140,
        floor: [130, [37, 93]], wall: [112, [37, 96]] },
    ],
    floors: [[90, 4], [130, 8]],
    ladders: [[30, 90, 130]],
    front: (c) => `
      <path d="M12 62 H108" stroke="${INK}" stroke-width="3" />
      <circle cx="60" cy="90" r="6" ${fill(c, 'clasp')} ${LINE} />`,
  },
  puppy: {
    shapes: [
      ['walls', '<rect x="14" y="92" width="76" height="34" rx="17"'],
      ['head', '<circle cx="84" cy="66" r="28"'],
    ],
    rooms: [
      { name: 'In the head', wallpaper: '#e0f2fe', top: 36, bottom: 82,
        floor: [78, [64, 104]], wall: [58, [68, 100]] },
      { name: 'In the body', wallpaper: '#fef9c3', top: 82, bottom: 130,
        floor: [120, [24, 79]], wall: [106, [30, 76]] },
    ],
    floors: [[78, 4], [120, 8]],
    ladders: [[80, 78, 120]],
    front: (c) => `
      <path d="M79 39 Q82 31 85 38 Q88 32 90 40" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />`,
    under: (c) => `<rect x="62" y="118" width="12" height="18" rx="6" ${fill(c, 'walls')} ${LINE} />`,
  },
};

for (const cottage of COTTAGES) cottage.inside = INSIDES[cottage.id];

// Count each cottage's windows by drawing it with blank paint, then put a
// part for each where its list says WINDOWS.
for (const cottage of COTTAGES) {
  const blank = new Proxy({}, { get: () => ({ fill: '', color: '' }) });
  const count = cottage.svg(blank, 0).match(/class="window"/g).length;
  const windows = Array.from({ length: count }, (_, i) => ({
    key: `window${i + 1}`,
    label: `Window ${i + 1}`,
    color: WINDOW_COLOR,
  }));
  cottage.parts.splice(cottage.parts.indexOf(WINDOWS), 1, ...windows);
}

export function cottageById(id) {
  return COTTAGES.find((cottage) => cottage.id === id);
}

// Each cottage's own paint for every part: its own color, plain.
export function defaultPaints(cottage) {
  return Object.fromEntries(
    cottage.parts.map((part) => [part.key, { color: part.color, pattern: 'plain' }]),
  );
}

let drawings = 0;

const WOOD = '#c08457';

// A ladder: its left side, top and bottom, with a rung every 5.
function ladder([x, top, bottom]) {
  let rungs = '';
  for (let y = top + 4; y < bottom; y += 5) rungs += ` M${x} ${y} H${x + 6}`;
  return `<path d="M${x} ${top} V${bottom} M${x + 6} ${top} V${bottom}${rungs}" fill="none" stroke="${WOOD}" stroke-width="1.6" stroke-linecap="round" pointer-events="none" />`;
}

// The cottage cut open: the cottage, then its rooms in its hollow parts,
// with what's in them (`contents`, a list of ids for each room), then the
// cut edges of its walls (a thick band in their paint), then what's in
// front. Each room, and everything in it, is marked with its number
// (data-room), and each thing with its place in the room's list
// (data-thing), for tapping. Taps go through the floors and ladders to the
// room behind.
function rooms(cottage, contents, c, uid) {
  const { shapes, rooms: list, floors, ladders, front, under } = cottage.inside;
  const outlines = (attrs) => shapes.map(([part, shape]) => `${shape} fill="none" ${attrs(part)} />`).join('');
  const things = list.map((room, i) => {
    const ids = contents[i] ?? [];
    return (arrange(room, ids) ?? [])
      .map(({ id, index, x, y }) => `<g class="thing" data-room="${i}" data-thing="${index}">${furnitureById(id).draw(x, y)}</g>`)
      .join('');
  });
  return `
    ${cottage.svg(c, uid)}
    ${under?.(c) ?? ''}
    <clipPath id="inside-${uid}">${shapes.map(([, shape]) => `${shape} />`).join('')}</clipPath>
    <g clip-path="url(#inside-${uid})">
      ${list.map(({ wallpaper, top, bottom }, i) => `<rect class="room" data-room="${i}" x="-10" y="${top}" width="140" height="${bottom - top}" fill="${wallpaper}" />`).join('')}
      ${floors.map(([y, h]) => `<rect x="-10" y="${y}" width="140" height="${h}" fill="${WOOD}" stroke="${INK}" stroke-width="1.2" pointer-events="none" />`).join('')}
      ${ladders.map(ladder).join('')}
      ${things.join('')}
    </g>
    ${outlines(() => `stroke="${INK}" stroke-width="9" stroke-linejoin="round"`)}
    ${outlines((part) => `stroke="${c[part].color}" stroke-width="4.5" stroke-linejoin="round"`)}
    ${front(c)}`;
}

// A drawing of the cottage in its own paints or in `paints` (any parts left
// out keep their own), labeled `label` for screen readers. `draw` draws it
// in its paints, `c`.
function drawing(cottage, paints, label, draw) {
  const uid = ++drawings;
  const c = {};
  const defs = [];
  for (const [part, paint] of Object.entries({ ...defaultPaints(cottage), ...paints })) {
    const { fill, def } = paintFill(paint, `paint-${uid}-${part}`);
    c[part] = { fill, color: paint.color };
    defs.push(def);
  }
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 120 140');
  svg.setAttribute('class', 'cottage');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', label);
  svg.innerHTML = `<defs>${defs.join('')}</defs>${draw(c, uid)}`;
  svg.querySelectorAll('.window').forEach((glass, i) => {
    const part = `window${i + 1}`;
    glass.setAttribute('fill', c[part].fill);
    glass.dataset.part = part;
  });
  return svg;
}

// The cottage as an <svg>, labeled for screen readers, in its own paints or
// in `paints`.
export function cottageDrawing(cottage, paints = {}) {
  return drawing(cottage, paints, `${cottage.name}, ${cottage.looks}`, cottage.svg);
}

// The cottage's inside: the cottage with its front taken off, showing its
// rooms, and what's in them (`contents`, a list of ids for each room).
export function insideDrawing(cottage, paints = {}, contents = []) {
  const label = `Inside ${cottage.name}: ${cottage.inside.rooms
    .map((room, i) => {
      const names = (contents[i] ?? []).map((id) => furnitureById(id).name);
      return `${room.name.toLowerCase()}, ${names.length ? names.join(', ') : 'empty'}`;
    })
    .join('; ')}`;
  const svg = drawing(cottage, paints, label, (c, uid) => rooms(cottage, contents, c, uid));
  svg.classList.add('inside');
  svg.querySelectorAll('.outside-only').forEach((mark) => mark.remove());
  return svg;
}

// The cottage on its colored tile, for the picker. The name next to it says
// which cottage it is, so the picture is hidden from screen readers.
export function cottageTile(cottage) {
  const tile = document.createElement('div');
  tile.className = 'cottage-tile';
  tile.style.setProperty('--tile', cottage.tile);
  const svg = cottageDrawing(cottage);
  svg.removeAttribute('role');
  svg.removeAttribute('aria-label');
  svg.setAttribute('aria-hidden', 'true');
  tile.append(svg);
  return tile;
}
