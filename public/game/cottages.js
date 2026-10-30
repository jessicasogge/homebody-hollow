// The cottages of the Hollow. Every cottage used to be something else. Each is
// drawn on a 120 x 140 box, standing on its bottom edge so they all line up
// on the home page's grass.

const INK = '#4a2530';
const LINE = `stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;

// A square window with crossed panes. Its glass lights up when tapped.
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

// An arched front door with a little knob.
function door(x, y, w, h, c) {
  const r = w / 2;
  return `
    <path d="M${x} ${y + h} V${y + r} A${r} ${r} 0 0 1 ${x + w} ${y + r} V${y + h} Z" ${fill(c, 'door')} ${LINE} />
    <circle cx="${x + w - 4}" cy="${y + h * 0.62}" r="1.4" fill="${INK}" />`;
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
      { key: 'walls', label: 'Cat', color: '#fdba74' },
      { key: 'trim', label: 'Ears', color: '#fb923c' },
      { key: 'tail', label: 'Tail', color: '#fb923c' },
      { key: 'nose', label: 'Nose', color: '#f9a8d4' },
      { key: 'door', label: 'Door', color: '#b45309' },
    ],
    svg: (c) => `
      <path d="M36 132 Q8 128 10 100 Q12 80 24 86" fill="none" stroke="${INK}" stroke-width="11" stroke-linecap="round" data-part="tail" />
      <path d="M36 132 Q8 128 10 100 Q12 80 24 86" fill="none" ${stroke(c, 'tail')} stroke-width="5" stroke-linecap="round" />
      <path d="M40 34 L36 6 L58 24 Z" ${fill(c, 'trim')} ${LINE} />
      <path d="M62 24 L86 6 L80 34 Z" ${fill(c, 'trim')} ${LINE} />
      <path d="M30 136 Q24 98 42 82 Q60 72 78 82 Q96 98 90 136 Z" ${fill(c, 'walls')} ${LINE} />
      <circle cx="60" cy="50" r="26" ${fill(c, 'walls')} ${LINE} />
      ${porthole(49, 46, 7)} ${porthole(71, 46, 7)}
      <path d="M56 58 H64 L60 63 Z" ${fill(c, 'nose')} ${LINE} />
      <path d="M60 63 V66 M60 66 Q56 70 53 67 M60 66 Q64 70 67 67" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round" />
      <path d="M44 60 L28 57 M44 64 L29 66 M76 60 L92 57 M76 64 L91 66" stroke="${INK}" stroke-width="1.5" stroke-linecap="round" />
      ${win(53, 92, 14)}
      ${door(38, 112, 14, 22, c)}`,
  },
];

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

// The cottage as an <svg>, labeled for screen readers, in its own paints or
// in `paints` (any parts left out keep their own).
export function cottageDrawing(cottage, paints = {}) {
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
  svg.setAttribute('aria-label', `${cottage.name}, ${cottage.looks}`);
  svg.innerHTML = `<defs>${defs.join('')}</defs>${cottage.svg(c, uid)}`;
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
