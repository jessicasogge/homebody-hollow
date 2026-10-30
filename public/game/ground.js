// The ground under the home page's cottages: a strip of grass with a dirt
// road winding along in front of them, and a few tufts of grass. Drawn
// on a 960 x 110 box. On a narrow screen only its middle shows (the page
// crops it rather than squashing it).

// The middle of the road, left to right. The road is 34 wide around it.
export const ROAD = 'M0 62 C 90 40, 170 40, 250 58 S 410 84, 500 66 S 660 34, 760 52 S 900 78, 960 60';

// The grass: a wavy top the cottages stand on, and a wavy bottom.
const GRASS = 'M0 14 Q 240 2 480 10 T 960 12 V 96 Q 840 108 720 98 T 480 100 T 240 96 T 0 100 Z';

// Pebbles on the road: x, y and size.
const PEBBLES = [
  [40, 56, 3], [120, 49, 2.5], [205, 50, 3], [300, 66, 2.5], [370, 74, 3], [455, 70, 2],
  [545, 57, 3], [625, 46, 2.5], [705, 47, 3], [790, 58, 2], [860, 68, 3], [930, 62, 2.5],
];

// Tufts of grass, by where their blades meet: all in front of the road,
// where the cottages don't stand on them, and clear of the road's edge.
export const TUFTS = [[60, 92], [200, 94], [560, 96], [640, 92], [780, 96]];

// Four curved blades, spread a little at the bottom so the tuft doesn't
// come to a point (which reads as an arrow).
function tuft([x, y]) {
  const blades = [
    `M${x - 4} ${y} q -1 -5 -5 -8`,
    `M${x - 1} ${y} q -1 -7 1 -12`,
    `M${x + 1} ${y} q 2 -6 0 -10`,
    `M${x + 4} ${y} q 2 -4 6 -7`,
  ];
  return `<path class="tuft" d="${blades.join(' ')}" stroke="#5f8f2a" stroke-width="2" stroke-linecap="round" fill="none" />`;
}

export function groundDrawing() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'ground');
  svg.setAttribute('viewBox', '0 0 960 110');
  // Fill the height and crop the sides on a narrow screen, so the road and
  // grass keep their shape.
  svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
  svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = `
    <path class="grass" d="${GRASS}" fill="#cfe3a6" />
    <path class="road" d="${ROAD}" fill="none" stroke="#a87650" stroke-width="34" stroke-linecap="round" />
    <path d="${ROAD}" fill="none" stroke="#d4a373" stroke-width="28" stroke-linecap="round" />
    <path d="${ROAD}" fill="none" stroke="#c4925f" stroke-width="3" stroke-dasharray="14 10" transform="translate(0 -6)" />
    <path d="${ROAD}" fill="none" stroke="#c4925f" stroke-width="3" stroke-dasharray="10 14" transform="translate(0 6)" />
    ${PEBBLES.map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.7}" fill="#9a6a45" />`).join('')}
    ${TUFTS.map(tuft).join('')}`;
  return svg;
}
