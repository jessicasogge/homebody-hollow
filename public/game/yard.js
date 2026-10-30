// A cottage's yard: rocks, trees and flowers around it, any or none.
//
// They're drawn on a box a third wider than the cottage's (160 x 140, with
// the cottage's 120 x 140 in the middle, from x 20 to 140), so they can
// stand beside it: the trees behind it, peeking out on each side, and the
// rocks and flowers in front, at its feet. withYard() stacks the three.

const INK = '#4a2530';
const LINE = `stroke="${INK}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"`;

// What you can put in a yard, in the order they're listed and stored.
export const YARD = [
  { id: 'rocks', name: 'rocks' },
  { id: 'trees', name: 'trees' },
  { id: 'flowers', name: 'flowers' },
];

// A yard from what's asked for: only real options, each once, in order.
export function yardFrom(ids) {
  return YARD.map(({ id }) => id).filter((id) => ids.includes(id));
}

// A pine: four stacked tiers on a short trunk, its tip above every
// cottage's roof and chimney. (It reaches a little above the box; the yard
// is drawn with room above.)
const PINE_TIERS = [
  // [top, bottom, half the width at the bottom]
  [-8, 24, 16],
  [14, 52, 20],
  [40, 82, 24],
  [66, 114, 27],
];

const tree = (x) => `
  <rect x="${x - 3}" y="112" width="6" height="26" rx="2" fill="#92400e" ${LINE} />
  ${[...PINE_TIERS]
    .reverse()
    .map(
      ([top, bottom, half]) =>
        `<path class="pine-tier" d="M${x} ${top} L${x + half} ${bottom} H${x - half} Z" fill="#16a34a" ${LINE} />`,
    )
    .join('')}`;

const rock = (x, y, rx, ry) => `
  <ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#9ca3af" ${LINE} />
  <ellipse cx="${x - rx / 3}" cy="${y - ry / 3}" rx="${rx / 3}" ry="${ry / 4}" fill="#e5e7eb" />`;

const flower = (x, y, color) => {
  const petals = [0, 72, 144, 216, 288]
    .map((deg) => {
      const r = (deg * Math.PI) / 180;
      return `<circle cx="${(x + 2.6 * Math.sin(r)).toFixed(1)}" cy="${(y - 2.6 * Math.cos(r)).toFixed(1)}" r="2.2" fill="${color}" stroke="${INK}" stroke-width="0.8" />`;
    })
    .join('');
  return `
  <path d="M${x} ${y} V138" stroke="#16a34a" stroke-width="1.8" stroke-linecap="round" />
  ${petals}
  <circle cx="${x}" cy="${y}" r="1.4" fill="#f59e0b" />`;
};

// Each option's drawing, behind the cottage or in front of it.
const BEHIND = {
  trees: tree(12) + tree(148),
};

const IN_FRONT = {
  rocks: rock(28, 134, 8, 5) + rock(16, 137, 5, 3) + rock(132, 134, 8, 5) + rock(144, 137, 5, 3),
  flowers:
    flower(6, 128, '#f472b6') +
    flower(13, 124, '#facc15') +
    flower(20, 129, '#ffffff') +
    flower(140, 129, '#ffffff') +
    flower(147, 124, '#f472b6') +
    flower(154, 128, '#facc15'),
};

function layer(yard, drawings, side) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 160 140');
  svg.setAttribute('class', `yard yard-${side}`);
  svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = yard.map((id) => drawings[id] ?? '').join('');
  return svg;
}

// A small picture of an option, for its button in the studio.
export function yardIcon(id) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', { trees: '-20 -12 64 152', rocks: '6 126 32 16', flowers: '0 118 26 22' }[id]);
  svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = (BEHIND[id] ?? '') + (IN_FRONT[id] ?? '');
  return svg;
}

// The cottage's drawing with its yard around it: trees behind, then the
// cottage, then rocks and flowers in front. The yard doesn't take taps, so
// in the studio a tap still paints the part of the cottage under it.
export function withYard(drawing, yard = []) {
  const wrap = document.createElement('div');
  wrap.className = 'with-yard';
  wrap.append(layer(yard, BEHIND, 'behind'), drawing, layer(yard, IN_FRONT, 'in-front'));
  return wrap;
}
