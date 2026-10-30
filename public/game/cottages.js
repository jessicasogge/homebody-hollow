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

// Paint a shape in a part's color, and tag it with the part, so tapping it
// in the studio knows what to fill. `stroke` is for parts drawn as lines
// (the teacup's handle, the leaf's veins).
const fill = (c, part) => `fill="${c[part]}" data-part="${part}"`;
const stroke = (c, part) => `stroke="${c[part]}" data-part="${part}"`;

// An arched front door with a little knob.
function door(x, y, w, h, c) {
  const r = w / 2;
  return `
    <path d="M${x} ${y + h} V${y + r} A${r} ${r} 0 0 1 ${x + w} ${y + r} V${y + h} Z" ${fill(c, 'door')} ${LINE} />
    <circle cx="${x + w - 4}" cy="${y + h * 0.62}" r="1.4" fill="${INK}" />`;
}

// Two puffs of smoke over a chimney at (x, y). Hidden until the lights are on.
function smoke(x, y) {
  return `
    <circle class="smoke" cx="${x}" cy="${y - 6}" r="5" fill="#ffffff" />
    <circle class="smoke" cx="${x + 4}" cy="${y - 10}" r="4" fill="#ffffff" />`;
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

// The colors you can paint with, in the studio, in rainbow order: a light,
// a middle and a dark row of eleven, then a row of neutrals.
const HUES = [
  ['red', '#fecaca', '#f87171', '#dc2626'],
  ['orange', '#fed7aa', '#fb923c', '#ea580c'],
  ['yellow', '#fef08a', '#facc15', '#ca8a04'],
  ['lime', '#d9f99d', '#a3e635', '#65a30d'],
  ['green', '#bbf7d0', '#4ade80', '#16a34a'],
  ['teal', '#99f6e4', '#2dd4bf', '#0d9488'],
  ['sky blue', '#bae6fd', '#38bdf8', '#0284c7'],
  ['blue', '#bfdbfe', '#60a5fa', '#2563eb'],
  ['violet', '#ddd6fe', '#a78bfa', '#7c3aed'],
  ['purple', '#f5d0fe', '#e879f9', '#c026d3'],
  ['pink', '#fbcfe8', '#f472b6', '#db2777'],
];

const NEUTRALS = [
  ['white', '#ffffff'], ['cream', '#fef3c7'], ['sand', '#e7d5c0'], ['tan', '#d6b38a'],
  ['brown', '#a16207'], ['dark brown', '#713f12'], ['light gray', '#e5e7eb'], ['gray', '#9ca3af'],
  ['dark gray', '#4b5563'], ['plum', '#4a2530'], ['black', '#1f2937'],
];

export const PALETTE = [
  ...HUES.map(([name, light]) => ({ name: `light ${name}`, color: light })),
  ...HUES.map(([name, , middle]) => ({ name, color: middle })),
  ...HUES.map(([name, , , dark]) => ({ name: `dark ${name}`, color: dark })),
  ...NEUTRALS.map(([name, color]) => ({ name, color })),
];

// The colors a part can be: its own, or any in the palette.
export function partColors(part) {
  return [part.color, ...PALETTE.map(({ color }) => color).filter((color) => color !== part.color)];
}

// Each cottage has an id (for the address, ?cottage=boot), a name, the color
// of its tile on the picker, and what it looks like (for screen readers).
// Its parts are the pieces you can paint in the studio, each with its own
// color to start, and a name for screen readers. Its svg draws it in a set of colors, one per part (`c`),
// with `uid` to keep its ids apart from other drawings' on the same page.
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
      { key: 'door', label: 'Door', color: '#b45309' },
    ],
    svg: (c) => `
      ${smoke(33, 6)}
      <rect x="29" y="4" width="7" height="18" fill="#78716c" ${LINE} />
      <path d="M30 30 H72 Q69 66 73 88 Q100 90 110 110 Q114 124 104 128 H24 Q20 112 28 98 Q25 64 30 30 Z" ${fill(c, 'walls')} ${LINE} />
      <path d="M78 128 Q78 100 104 104" fill="none" ${stroke(c, 'sole')} stroke-width="2" stroke-dasharray="3 3" />
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
      ${smoke(90, 4)}
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
      ${smoke(60, 20)}
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
      { key: 'door', label: 'Door', color: '#b45309' },
    ],
    svg: (c) => `
      ${smoke(76, 36)}
      <rect x="72" y="34" width="7" height="16" fill="#78716c" ${LINE} />
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
      { key: 'door', label: 'Door', color: '#b45309' },
    ],
    svg: (c) => `
      ${smoke(84, 14)}
      <rect x="80" y="14" width="7" height="16" fill="#78716c" ${LINE} />
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
      { key: 'door', label: 'Door', color: '#a3e635' },
    ],
    svg: (c, uid) => `
      <defs>
        <mask id="slits-${uid}" maskUnits="userSpaceOnUse" x="0" y="0" width="120" height="140">
          <rect width="120" height="140" fill="white" />
          ${LEAF_SLITS.map((s) => s.hole).join('')}
        </mask>
      </defs>
      ${smoke(78, 2)}
      <rect x="74" y="2" width="7" height="16" fill="#78716c" ${LINE} />
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
];

export function cottageById(id) {
  return COTTAGES.find((cottage) => cottage.id === id);
}

// Each cottage's own colors, one per part: { walls: '#a16207', ... }.
export function defaultColors(cottage) {
  return Object.fromEntries(cottage.parts.map((part) => [part.key, part.color]));
}

let drawings = 0;

// The cottage as an <svg>, labeled for screen readers, in its own colors or
// in `colors` (any parts left out keep their own).
export function cottageDrawing(cottage, colors = {}) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 120 140');
  svg.setAttribute('class', 'cottage');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', `${cottage.name}, ${cottage.looks}`);
  svg.innerHTML = cottage.svg({ ...defaultColors(cottage), ...colors }, ++drawings);
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
