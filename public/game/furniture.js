// The things you can put in a cottage's rooms: a bed, a sofa, a stove, a
// picture... Pick one, then tap a room, and it goes in the best spot there
// is: things that stand go along the floor, pictures and shelves on the
// wall, and a rug under everything. Each room holds up to ROOM_LIMIT things,
// as many as fit.
//
// Each thing has an id (for the address, &room1=bed,lamp), a name, where it
// goes (`floor`, `wall` or `rug`), how wide it is, and a drawing. Each is
// drawn with its left edge at x, standing on y (for the wall, hanging with
// its bottom at y).

const INK = '#4a2530';
const WOOD = '#c08457';
const L = (w = 1.5) => `stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

export const ROOM_LIMIT = 4;

// The space between two things side by side.
const GAP = 1;

export const FURNITURE = [
  {
    id: 'bed',
    name: 'bed',
    place: 'floor',
    width: 22,
    draw: (x, y) => `
      <rect x="${x}" y="${y - 14}" width="3" height="14" rx="1" fill="${WOOD}" ${L()} />
      <rect x="${x + 2}" y="${y - 7}" width="20" height="5" rx="1.5" fill="#ffffff" ${L()} />
      <rect x="${x + 8}" y="${y - 8}" width="14" height="5" rx="1.5" fill="#60a5fa" ${L()} />
      <ellipse cx="${x + 6.5}" cy="${y - 8.5}" rx="3.5" ry="2" fill="#ffffff" ${L(1.2)} />
      <path d="M${x + 21} ${y - 2} V${y}" ${L()} />`,
  },
  {
    id: 'sofa',
    name: 'sofa',
    place: 'floor',
    width: 22,
    draw: (x, y) => `
      <rect x="${x + 2}" y="${y - 14}" width="18" height="9" rx="3" fill="#8b5cf6" ${L(1.2)} />
      <rect x="${x}" y="${y - 8}" width="22" height="6" rx="2.5" fill="#8b5cf6" ${L(1.2)} />
      <path d="M${x + 4} ${y - 8} V${y - 4} M${x + 18} ${y - 8} V${y - 4}" ${L(1)} />
      <path d="M${x + 1.5} ${y - 2} V${y} M${x + 20.5} ${y - 2} V${y}" ${L()} />`,
  },
  {
    id: 'armchair',
    name: 'armchair',
    place: 'floor',
    width: 16,
    draw: (x, y) => `
      <rect x="${x + 2}" y="${y - 14}" width="12" height="10" rx="3" fill="#22c55e" ${L(1.2)} />
      <rect x="${x}" y="${y - 8}" width="16" height="6" rx="2.5" fill="#22c55e" ${L(1.2)} />
      <path d="M${x + 2} ${y - 2} V${y} M${x + 14} ${y - 2} V${y}" ${L()} />`,
  },
  {
    id: 'table',
    name: 'tea table',
    place: 'floor',
    width: 14,
    draw: (x, y) => `
      <rect x="${x}" y="${y - 9}" width="14" height="2.5" rx="1" fill="${WOOD}" ${L(1.2)} />
      <path d="M${x + 2} ${y - 6.5} V${y} M${x + 12} ${y - 6.5} V${y}" ${L()} />
      <path d="M${x + 10} ${y - 12} q4 0 5 -3" fill="none" ${L(1.2)} />
      <ellipse cx="${x + 7}" cy="${y - 12}" rx="4" ry="3" fill="#ffffff" ${L(1.2)} />
      <circle cx="${x + 7}" cy="${y - 15.3}" r="0.9" fill="${INK}" />`,
  },
  {
    id: 'chair',
    name: 'chair',
    place: 'floor',
    width: 7,
    draw: (x, y) => `
      <path d="M${x + 0.5} ${y} V${y - 12}" ${L()} stroke-width="2" />
      <rect x="${x + 0.5}" y="${y - 6}" width="6" height="2" fill="#3b82f6" ${L(1.2)} />
      <path d="M${x + 6.5} ${y - 4} V${y}" ${L()} />`,
  },
  {
    id: 'stove',
    name: 'stove',
    place: 'floor',
    width: 14,
    draw: (x, y) => `
      <rect x="${x}" y="${y - 13}" width="14" height="13" rx="1.5" fill="#e5e7eb" ${L(1.2)} />
      <rect x="${x + 2.5}" y="${y - 9}" width="9" height="6" rx="1" fill="#9ca3af" ${L(1)} />
      <path d="M${x + 3} ${y - 17} H${x + 11} V${y - 14} Q${x + 11} ${y - 13} ${x + 10} ${y - 13} H${x + 4} Q${x + 3} ${y - 13} ${x + 3} ${y - 14} Z" fill="#ef4444" ${L(1)} />`,
  },
  {
    id: 'fireplace',
    name: 'fireplace',
    place: 'floor',
    width: 19,
    draw: (x, y) => `
      <rect x="${x + 1.5}" y="${y - 16}" width="16" height="16" fill="#fecaca" ${L(1.2)} />
      <rect x="${x}" y="${y - 18}" width="19" height="3" rx="1" fill="${WOOD}" ${L(1.2)} />
      <path d="M${x + 5.5} ${y} V${y - 8} A4 4 0 0 1 ${x + 13.5} ${y - 8} V${y} Z" fill="${INK}" />
      <path d="M${x + 9.5} ${y - 1} Q${x + 6.5} ${y - 4} ${x + 9.5} ${y - 8} Q${x + 12.5} ${y - 4} ${x + 9.5} ${y - 1} Z" fill="#f97316" />`,
  },
  {
    id: 'vanity',
    name: 'mirror',
    place: 'floor',
    width: 14,
    draw: (x, y) => `
      <rect x="${x}" y="${y - 8}" width="14" height="8" fill="${WOOD}" ${L(1.2)} />
      <path d="M${x + 7} ${y - 8} V${y - 10}" ${L()} />
      <ellipse cx="${x + 7}" cy="${y - 16}" rx="5" ry="6" fill="#e0f2fe" stroke="#facc15" stroke-width="2" />`,
  },
  {
    id: 'lamp',
    name: 'lamp',
    place: 'floor',
    width: 8,
    draw: (x, y) => `
      <path d="M${x + 4} ${y} V${y - 12} M${x + 1} ${y} H${x + 7}" ${L()} />
      <path d="M${x} ${y - 12} L${x + 2} ${y - 18} H${x + 6} L${x + 8} ${y - 12} Z" fill="#facc15" ${L(1.2)} />`,
  },
  {
    id: 'plant',
    name: 'plant',
    place: 'floor',
    width: 11,
    draw: (x, y) => `
      <path d="M${x + 5.5} ${y - 6} Q${x - 0.5} ${y - 12} ${x + 1.5} ${y - 16} M${x + 5.5} ${y - 6} Q${x + 5.5} ${y - 14} ${x + 6.5} ${y - 18} M${x + 5.5} ${y - 6} Q${x + 11.5} ${y - 12} ${x + 10.5} ${y - 15}" fill="none" stroke="#16a34a" stroke-width="2.4" stroke-linecap="round" />
      <path d="M${x + 1.5} ${y - 6} H${x + 9.5} L${x + 8.5} ${y} H${x + 2.5} Z" fill="#f97316" ${L(1.2)} />`,
  },
  {
    id: 'dog-bed',
    name: 'dog bed',
    place: 'floor',
    width: 18,
    draw: (x, y) => `
      <ellipse cx="${x + 9}" cy="${y - 3}" rx="9" ry="3.5" fill="#ef4444" ${L(1.2)} />
      <ellipse cx="${x + 9}" cy="${y - 4}" rx="5.5" ry="1.6" fill="#fecaca" />`,
  },
  {
    id: 'picture',
    name: 'picture',
    place: 'wall',
    width: 9,
    draw: (x, y) => `
      <rect x="${x}" y="${y - 7}" width="9" height="7" fill="#bfdbfe" stroke="${WOOD}" stroke-width="2" />
      <path d="M${x + 1} ${y - 1} L${x + 3.6} ${y - 3.9} L${x + 8} ${y - 1.5}" fill="none" stroke="#16a34a" stroke-width="1.2" />`,
  },
  {
    id: 'shelf',
    name: 'bookshelf',
    place: 'wall',
    width: 16,
    draw: (x, y) => {
      const colors = ['#ef4444', '#3b82f6', '#facc15', '#22c55e', '#8b5cf6'];
      const books = colors
        .map((color, i) => `<rect x="${x + 1.5 + i * 2.6}" y="${y - 8 - (i % 3)}" width="2.2" height="${6 + (i % 3)}" fill="${color}" stroke="${INK}" stroke-width="0.8" />`)
        .join('');
      return `${books}<rect x="${x}" y="${y - 2}" width="16" height="2" fill="${WOOD}" ${L(1.2)} />`;
    },
  },
  {
    id: 'rug',
    name: 'rug',
    place: 'rug',
    width: 20,
    draw: (x, y) => `<ellipse cx="${x + 10}" cy="${y - 0.6}" rx="10" ry="1.8" fill="#fca5a5" ${L(1)} />`,
  },
];

export const furnitureById = (id) => FURNITURE.find((thing) => thing.id === id);

// Put `things` side by side in `spaces` (each [left, right]), the widest
// first, each in the first space with room for it. Returns where each goes,
// as its left edge, in the same order as `things`, or null if they don't all
// fit.
function line(things, spaces) {
  const free = spaces.map(([left, right]) => ({ left, right }));
  const lefts = new Array(things.length);
  const order = things.map((thing, i) => i).sort((a, b) => things[b].width - things[a].width);
  for (const i of order) {
    const space = free.find(({ left, right }) => right - left >= things[i].width);
    if (!space) return null;
    lefts[i] = space.left;
    space.left += things[i].width + GAP;
  }
  return lefts;
}

// Where everything in a room goes: each thing's id, its place in `ids`
// (`index`), its left edge and the line it stands (or hangs) on, in the
// order to draw them (the rug, then the wall, then the floor), or null if
// they don't all fit, or there are too many. `room` has its floor and its wall, each as the line things stand
// (or hang) on and the stretches of it there's space on:
// floor: [124, [30, 58], [68, 86]].
export function arrange(room, ids) {
  const things = ids.map(furnitureById);
  if (things.length > ROOM_LIMIT || things.includes(undefined)) return null;
  const placed = [];
  const rugs = things.filter((thing) => thing.place === 'rug');
  if (rugs.length > 1) return null;
  if (rugs.length) {
    // In the middle of the widest stretch of floor.
    const [y, ...spaces] = room.floor;
    const [left, right] = spaces.reduce((a, b) => (b[1] - b[0] > a[1] - a[0] ? b : a));
    if (right - left < rugs[0].width) return null;
    placed.push({ id: 'rug', index: ids.indexOf('rug'), x: (left + right - rugs[0].width) / 2, y });
  }
  for (const place of ['wall', 'floor']) {
    const row = ids.map((id, index) => index).filter((index) => things[index].place === place);
    const [y, ...spaces] = room[place];
    const lefts = line(row.map((index) => things[index]), spaces);
    if (!lefts) return null;
    row.forEach((index, i) => placed.push({ id: ids[index], index, x: lefts[i], y }));
  }
  return placed;
}
