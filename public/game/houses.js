// The houses of the Hollow. Every house used to be something else. Each is
// drawn on a 120 x 140 box, standing on its bottom edge so they all line up
// on the home page's shelf.

const INK = '#4a2530';
const LINE = `stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;

// A square window with crossed panes. Its glass lights up when tapped.
function win(x, y, s = 12) {
  return `
    <rect class="window" x="${x}" y="${y}" width="${s}" height="${s}" rx="2" ${LINE} />
    <path d="M${x + s / 2} ${y} V${y + s} M${x} ${y + s / 2} H${x + s}" stroke="${INK}" stroke-width="1.5" />`;
}

// A round window, for houses that are round themselves.
function porthole(cx, cy, r = 7) {
  return `
    <circle class="window" cx="${cx}" cy="${cy}" r="${r}" ${LINE} />
    <path d="M${cx} ${cy - r} V${cy + r} M${cx - r} ${cy} H${cx + r}" stroke="${INK}" stroke-width="1.5" />`;
}

// An arched front door with a little knob.
function door(x, y, w = 14, h = 20, color = '#b45309') {
  const r = w / 2;
  return `
    <path d="M${x} ${y + h} V${y + r} A${r} ${r} 0 0 1 ${x + w} ${y + r} V${y + h} Z" fill="${color}" ${LINE} />
    <circle cx="${x + w - 4}" cy="${y + h * 0.62}" r="1.4" fill="${INK}" />`;
}

// Two puffs of smoke over a chimney at (x, y). Hidden until the lights are on.
function smoke(x, y) {
  return `
    <circle class="smoke" cx="${x}" cy="${y - 6}" r="5" fill="#ffffff" />
    <circle class="smoke" cx="${x + 4}" cy="${y - 10}" r="4" fill="#ffffff" />`;
}

// A monstera slit: a notch cut in from the leaf's edge (between edge points
// a and b) to a point inside, showing the page through it.
function slit(ax, ay, bx, by, tx, ty) {
  const out = (x, y) => [x + (x - tx) * 0.25, y + (y - ty) * 0.25];
  const [oax, oay] = out(ax, ay);
  const [obx, oby] = out(bx, by);
  return `
    <path d="M${oax} ${oay} L${tx} ${ty} L${obx} ${oby} Z" style="fill: var(--bg)" />
    <path d="M${ax} ${ay} L${tx} ${ty} L${bx} ${by}" fill="none" ${LINE} />`;
}

// Each house has an id (for the address, ?house=boot), a name, the color of
// its tile on the picker, and what it looks like (for screen readers).
export const HOUSES = [
  {
    id: 'boot',
    name: 'Bootle Cottage',
    tile: 'rgba(202, 138, 4, 0.25)',
    looks: 'a brown boot with a folded cuff, windows zigzagging down the shaft and a door in the toe',
    svg: `
      ${smoke(33, 6)}
      <rect x="29" y="4" width="7" height="18" fill="#78716c" ${LINE} />
      <path d="M30 30 H72 Q69 66 73 88 Q100 90 110 110 Q114 124 104 128 H24 Q20 112 28 98 Q25 64 30 30 Z" fill="#a16207" ${LINE} />
      <path d="M78 128 Q78 100 104 104" fill="none" stroke="#713f12" stroke-width="2" stroke-dasharray="3 3" />
      <path d="M24 20 H76 V32 Q70 38 63 32 Q56 38 50 32 Q43 38 37 32 Q30 38 24 32 Z" fill="#ca8a04" ${LINE} />
      <rect x="22" y="124" width="26" height="12" rx="2" fill="#713f12" ${LINE} />
      <path d="M48 128 H104 Q114 128 112 136 H48 Z" fill="#713f12" ${LINE} />
      ${win(34, 40, 11)} ${win(52, 56, 11)} ${win(34, 72, 11)} ${win(52, 88, 11)} ${win(34, 104, 11)}
      ${door(88, 108, 14, 20)}`,
  },
  {
    id: 'soda-cup',
    name: 'Fizzwick Tower',
    tile: 'rgba(239, 68, 68, 0.2)',
    looks: 'a red soda cup with a striped bendy straw for a chimney',
    svg: `
      ${smoke(90, 4)}
      <path d="M66 40 V18 L88 8" fill="none" stroke="${INK}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M66 40 V18 L88 8" fill="none" stroke="#fef2f2" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M66 40 V18 L88 8" fill="none" stroke="#dc2626" stroke-width="5" stroke-dasharray="4 4" stroke-linejoin="round" />
      <path d="M28 46 H92 L84 136 H36 Z" fill="#ef4444" ${LINE} />
      <rect x="22" y="36" width="76" height="12" rx="6" fill="#fca5a5" ${LINE} />
      <path d="M31 80 H89" stroke="${INK}" stroke-width="2" />
      ${win(40, 56)} ${win(68, 56)} ${win(46, 90)}
      ${door(64, 114, 14, 20)}`,
  },
  {
    id: 'pot',
    name: 'Potluck Manor',
    tile: 'rgba(94, 234, 212, 0.35)',
    looks: 'a round teal cooking pot with handles and porthole windows',
    svg: `
      ${smoke(60, 20)}
      <rect x="54" y="20" width="12" height="10" rx="3" fill="#5eead4" ${LINE} />
      <path d="M22 44 Q60 26 98 44 Z" fill="#5eead4" ${LINE} />
      <rect x="2" y="64" width="20" height="14" rx="7" fill="#5eead4" ${LINE} />
      <rect x="98" y="64" width="20" height="14" rx="7" fill="#5eead4" ${LINE} />
      <path d="M14 48 H106 V104 Q106 136 74 136 H46 Q14 136 14 104 Z" fill="#99f6e4" ${LINE} />
      <path d="M14 48 H106" stroke="${INK}" stroke-width="3" />
      ${porthole(38, 72, 9)} ${porthole(82, 72, 9)} ${porthole(40, 106, 7)} ${porthole(80, 106, 7)}
      ${door(53, 114, 14, 20)}`,
  },
  {
    id: 'teacup',
    name: 'Chamomile Cottage',
    tile: 'rgba(244, 114, 182, 0.25)',
    looks: 'a pink teacup on a saucer with a little chimney on the rim',
    svg: `
      ${smoke(76, 36)}
      <rect x="72" y="34" width="7" height="16" fill="#78716c" ${LINE} />
      <path d="M92 70 Q118 70 114 92 Q110 110 88 108" fill="none" stroke="${INK}" stroke-width="11" stroke-linecap="round" />
      <path d="M92 70 Q118 70 114 92 Q110 110 88 108" fill="none" stroke="#fbcfe8" stroke-width="5" stroke-linecap="round" />
      <path d="M14 52 H98 Q98 128 56 128 Q14 128 14 52 Z" fill="#fbcfe8" ${LINE} />
      <ellipse cx="56" cy="52" rx="42" ry="6" fill="#f9a8d4" ${LINE} />
      <ellipse cx="56" cy="130" rx="52" ry="7" fill="#f472b6" ${LINE} />
      ${win(28, 68, 12)} ${win(72, 68, 12)}
      ${door(49, 98, 14, 26)}`,
  },
  {
    id: 'mushroom',
    name: 'Toadstool Lodge',
    tile: 'rgba(20, 184, 166, 0.25)',
    looks: 'a mushroom with a teal spotted cap and a door in its stem',
    svg: `
      ${smoke(84, 14)}
      <rect x="80" y="14" width="7" height="16" fill="#78716c" ${LINE} />
      <path d="M38 76 Q34 110 30 136 H90 Q86 110 82 76 Z" fill="#fef3c7" ${LINE} />
      <path d="M6 78 Q8 22 60 20 Q112 22 114 78 Z" fill="#14b8a6" ${LINE} />
      ${porthole(30, 56, 7)} ${porthole(60, 40, 7)} ${porthole(90, 56, 7)}
      ${win(40, 90, 11)}
      ${door(55, 108, 16, 26)}`,
  },
  {
    id: 'leaf',
    name: 'Leafy Loft',
    tile: 'rgba(132, 204, 22, 0.3)',
    looks: 'a heart-shaped monstera leaf with deep slits, on a curly stem, with a ladder up to the door',
    svg: `
      ${smoke(78, 2)}
      <rect x="74" y="2" width="7" height="16" fill="#78716c" ${LINE} />
      <path d="M60 98 Q64 118 54 130 Q46 138 40 130" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round" />
      <path d="M60 98 Q64 118 54 130 Q46 138 40 130" fill="none" stroke="#65a30d" stroke-width="3" stroke-linecap="round" />
      <path d="M60 100 Q44 112 24 102 Q4 88 6 62 Q8 32 34 18 Q48 10 60 4 Q72 10 86 18 Q112 32 114 62 Q116 88 96 102 Q76 112 60 100 Z" fill="#4d7c0f" ${LINE} />
      <path d="M60 8 V98 M60 50 Q36 44 12 46 M60 74 Q36 72 10 84 M60 50 Q84 44 108 46 M60 74 Q84 72 110 84" fill="none" stroke="#84cc16" stroke-width="2" />
      ${slit(15, 36, 19, 31, 44, 44)} ${slit(7, 69, 7, 64, 38, 66)} ${slit(16, 94, 20, 98, 42, 88)}
      ${slit(105, 36, 101, 31, 76, 44)} ${slit(113, 69, 113, 64, 82, 66)} ${slit(104, 94, 100, 98, 78, 88)}
      ${win(44, 30, 10)} ${win(66, 30, 10)} ${win(44, 58, 10)} ${win(66, 58, 10)}
      ${door(53, 76, 14, 20, '#a3e635')}
      <path d="M86 102 V136 M98 100 V136 M86 110 H98 M86 118 H98 M86 126 H98 M86 134 H98" stroke="${INK}" stroke-width="2" />`,
  },
];

export function houseById(id) {
  return HOUSES.find((house) => house.id === id);
}

// The house as an <svg>, labeled for screen readers.
export function houseDrawing(house) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 120 140');
  svg.setAttribute('class', 'house');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', `${house.name}, ${house.looks}`);
  svg.innerHTML = house.svg;
  return svg;
}

// The house on its colored tile, for the picker. The name next to it says
// which house it is, so the picture is hidden from screen readers.
export function houseTile(house) {
  const tile = document.createElement('div');
  tile.className = 'house-tile';
  tile.style.setProperty('--tile', house.tile);
  const svg = houseDrawing(house);
  svg.removeAttribute('role');
  svg.removeAttribute('aria-label');
  svg.setAttribute('aria-hidden', 'true');
  tile.append(svg);
  return tile;
}
