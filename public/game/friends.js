// The friends who can move into a cottage: a mouse, a frog, a bunny... One
// moves into each cottage, picked on the studio's Friend side, and stands on
// the grass by it.
const INK = '#4a2530';
const L = (w = 1.6) => `stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
const eyes = (x1, x2, y, r = 1.4) => `<circle cx="${x1}" cy="${y}" r="${r}" fill="${INK}" /><circle cx="${x2}" cy="${y}" r="${r}" fill="${INK}" />`;
const cheeks = (x1, x2, y) => `<circle cx="${x1}" cy="${y}" r="1.8" fill="#f9a8d4" opacity="0.8" /><circle cx="${x2}" cy="${y}" r="1.8" fill="#f9a8d4" opacity="0.8" />`;
const smile = (x, y) => `<path d="M${x - 1.6} ${y} Q${x} ${y + 1.6} ${x + 1.6} ${y}" fill="none" ${L(1.1)} />`;

// Each friend has an id (for the address, &friend=mouse), a name, what kind
// of animal they are, what they like, and a drawing on a 40 x 40 box,
// standing on its bottom edge.
export const FRIENDS = [
  {
    id: 'mouse',
    name: 'Pip',
    kind: 'mouse',
    likes: 'cheese, and naps in a sunny window',
    svg: `
      <path d="M29 34 Q38 33 36 25" fill="none" ${L(1.4)} />
      <ellipse cx="20" cy="31" rx="9" ry="8" fill="#d1d5db" ${L()} />
      <circle cx="12" cy="11" r="5.5" fill="#d1d5db" ${L()} /><circle cx="12" cy="11" r="3" fill="#f9a8d4" />
      <circle cx="28" cy="11" r="5.5" fill="#d1d5db" ${L()} /><circle cx="28" cy="11" r="3" fill="#f9a8d4" />
      <circle cx="20" cy="18" r="8" fill="#d1d5db" ${L()} />
      ${eyes(17, 23, 17)} <circle cx="20" cy="21" r="1.3" fill="#f472b6" /> ${cheeks(14.5, 25.5, 20.5)}
      <ellipse cx="16" cy="39" rx="3" ry="1.4" fill="#d1d5db" ${L(1.2)} /><ellipse cx="24" cy="39" rx="3" ry="1.4" fill="#d1d5db" ${L(1.2)} />`,
  },
  {
    id: 'frog',
    name: 'Lily',
    kind: 'frog',
    likes: 'rainy days and singing at night',
    svg: `
      <ellipse cx="20" cy="31" rx="12" ry="8" fill="#4ade80" ${L()} />
      <ellipse cx="20" cy="31" rx="7" ry="5" fill="#bbf7d0" />
      <ellipse cx="20" cy="20" rx="12" ry="8" fill="#4ade80" ${L()} />
      <circle cx="13" cy="13" r="4.5" fill="#4ade80" ${L()} /><circle cx="27" cy="13" r="4.5" fill="#4ade80" ${L()} />
      <circle cx="13" cy="13" r="2.6" fill="#ffffff" /><circle cx="27" cy="13" r="2.6" fill="#ffffff" />
      ${eyes(13.4, 26.6, 13.4, 1.4)}
      <path d="M15 22 Q20 25.5 25 22" fill="none" ${L(1.2)} /> ${cheeks(11, 29, 21)}
      <ellipse cx="11" cy="38.5" rx="4" ry="1.6" fill="#4ade80" ${L(1.2)} /><ellipse cx="29" cy="38.5" rx="4" ry="1.6" fill="#4ade80" ${L(1.2)} />`,
  },
  {
    id: 'bunny',
    name: 'Clover',
    kind: 'bunny',
    likes: 'carrot soup and hopping races',
    svg: `
      <ellipse cx="16" cy="7" rx="3.2" ry="8" fill="#ffffff" ${L()} /><ellipse cx="16" cy="7.5" rx="1.5" ry="5.5" fill="#f9a8d4" />
      <ellipse cx="24" cy="7" rx="3.2" ry="8" fill="#ffffff" ${L()} /><ellipse cx="24" cy="7.5" rx="1.5" ry="5.5" fill="#f9a8d4" />
      <ellipse cx="20" cy="31" rx="9" ry="8" fill="#ffffff" ${L()} />
      <circle cx="20" cy="20" r="7.5" fill="#ffffff" ${L()} />
      ${eyes(17.2, 22.8, 19.5)} <path d="M19 22.2 H21 L20 23.2 Z" fill="#f472b6" /> ${cheeks(15, 25, 22.5)}
      <ellipse cx="16" cy="39" rx="3" ry="1.4" fill="#ffffff" ${L(1.2)} /><ellipse cx="24" cy="39" rx="3" ry="1.4" fill="#ffffff" ${L(1.2)} />`,
  },
  {
    id: 'hedgehog',
    name: 'Bramble',
    kind: 'hedgehog',
    likes: 'blackberries and a cozy pile of leaves',
    svg: `
      <path d="M5 36 L4 29 L1 27 L5 23 L3 18 L8 16 L8 10 L13 11 L15 5 L20 9 L25 5 L27 11 L32 10 L32 16 L37 18 L35 23 L39 27 L36 29 L35 36 Z" fill="#92400e" ${L()} />
      <ellipse cx="20" cy="25" rx="10" ry="10" fill="#f5deb3" ${L()} />
      ${eyes(16.5, 23.5, 23)} <circle cx="20" cy="27" r="1.8" fill="${INK}" /> ${cheeks(14, 26, 27)}
      <ellipse cx="15" cy="38.5" rx="3" ry="1.5" fill="#f5deb3" ${L(1.2)} /><ellipse cx="25" cy="38.5" rx="3" ry="1.5" fill="#f5deb3" ${L(1.2)} />`,
  },
  {
    id: 'snail',
    name: 'Shelly',
    kind: 'snail',
    likes: 'slow mornings and leafy salads',
    svg: `
      <path d="M3 39 Q3 33 9 33 L9 22 Q9 17 12 17 Q15 17 15 22 L15 33 H36 Q39 33 38 39 Z" fill="#fde68a" ${L()} />
      <path d="M10 18 L8 11 M14 18 L16 11" ${L(1.2)} /><circle cx="8" cy="10.5" r="1.5" fill="${INK}" /><circle cx="16" cy="10.5" r="1.5" fill="${INK}" />
      ${smile(12, 23)} <circle cx="10" cy="22" r="1.4" fill="#f9a8d4" opacity="0.8" />
      <circle cx="26" cy="23" r="11" fill="#fb923c" ${L()} />
      <path d="M26 23 m0 -1.5 a1.5 1.5 0 1 1 -1.5 1.5 a3.5 3.5 0 0 1 3.5 -3.5 a5.5 5.5 0 0 1 5.5 5.5 a7.5 7.5 0 0 1 -7.5 7.5" fill="none" ${L(1.3)} />`,
  },
  {
    id: 'fox',
    name: 'Rusty',
    kind: 'fox',
    likes: 'mystery books and long walks',
    svg: `
      <path d="M28 36 Q39 34 37 24 Q34 29 29 30 Z" fill="#fb923c" ${L(1.4)} /><path d="M36 26 Q37 24 37 24 Q34 28 33 28" fill="#ffffff" />
      <ellipse cx="20" cy="31" rx="9" ry="8" fill="#fb923c" ${L()} /><ellipse cx="20" cy="32" rx="5" ry="5" fill="#ffffff" />
      <path d="M11 15 L10 4 L17 10 Z" fill="#fb923c" ${L()} /><path d="M29 15 L30 4 L23 10 Z" fill="#fb923c" ${L()} />
      <path d="M11 13 Q11 8 20 8 Q29 8 29 13 Q29 21 20 25 Q11 21 11 13 Z" fill="#fb923c" ${L()} />
      <path d="M13 17 Q16 18 20 25 Q24 18 27 17 Q26 22 20 25 Q14 22 13 17 Z" fill="#ffffff" />
      ${eyes(16.5, 23.5, 15)} <circle cx="20" cy="22.5" r="1.4" fill="${INK}" />
      <ellipse cx="16" cy="39" rx="3" ry="1.4" fill="${INK}" /><ellipse cx="24" cy="39" rx="3" ry="1.4" fill="${INK}" />`,
  },
  {
    id: 'owl',
    name: 'Hoot',
    kind: 'owl',
    likes: 'stargazing and very big books',
    svg: `
      <path d="M8 12 L9 4 L14 9 M32 12 L31 4 L26 9" fill="#a16207" ${L()} />
      <path d="M8 20 Q8 7 20 7 Q32 7 32 20 L32 30 Q32 39 20 39 Q8 39 8 30 Z" fill="#a16207" ${L()} />
      <ellipse cx="20" cy="30" rx="7" ry="7" fill="#fde68a" />
      <path d="M17 28 l1.5 1.5 l1.5 -1.5 l1.5 1.5 l1.5 -1.5 M17 32 l1.5 1.5 l1.5 -1.5 l1.5 1.5 l1.5 -1.5" fill="none" stroke="#d97706" stroke-width="0.9" />
      <circle cx="15" cy="17" r="4.8" fill="#ffffff" ${L(1.3)} /><circle cx="25" cy="17" r="4.8" fill="#ffffff" ${L(1.3)} />
      ${eyes(15, 25, 17, 2.2)} <path d="M18.5 21 L21.5 21 L20 24 Z" fill="#f97316" ${L(1)} />
      <path d="M8 22 Q4 28 8 33 M32 22 Q36 28 32 33" fill="none" ${L(1.4)} />`,
  },
  {
    id: 'duck',
    name: 'Puddle',
    kind: 'duckling',
    likes: 'splashing and bread crumbs',
    svg: `
      <ellipse cx="21" cy="30" rx="12" ry="8.5" fill="#fde047" ${L()} />
      <path d="M24 28 Q30 27 31 31 Q27 33 24 31" fill="#facc15" ${L(1.2)} />
      <circle cx="16" cy="17" r="8" fill="#fde047" ${L()} />
      <path d="M7 18 Q2 18.5 3 20.5 Q6 21.5 8.5 20" fill="#fb923c" ${L(1.2)} />
      <circle cx="14" cy="15.5" r="1.4" fill="${INK}" /> <circle cx="17" cy="20" r="1.8" fill="#f9a8d4" opacity="0.8" />
      <path d="M16 9 Q17 6 19 7" fill="none" ${L(1.2)} />
      <path d="M17 38.5 h4 M23 38.5 h4" stroke="#fb923c" stroke-width="2.4" stroke-linecap="round" />`,
  },
];

export const friendById = (id) => FRIENDS.find((friend) => friend.id === id);

// A friend's drawing, hidden from screen readers (their name is always said
// beside it).
export function friendDrawing(friend) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 40 40');
  svg.setAttribute('class', 'friend');
  svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = friend.svg;
  return svg;
}
