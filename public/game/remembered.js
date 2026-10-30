// The cottages you've painted, remembered while this tab is open
// (sessionStorage), so the village can show them all, and the studio can
// pick up where you left off when you come back to one from the picker.
// Closing the tab forgets them.
//
// Each is kept as its address query (?cottage=teacup&walls=...), and read
// back through designFromQuery, so anything odd in storage is ignored the
// same way an odd address is.
import { designFromQuery, designQuery } from './design-state.js';

const KEY = 'homebody-hollow:designs';

// Storage can be missing or refuse (private browsing, blocked site data):
// then nothing is remembered, and everything still works.
function load() {
  try {
    const saved = JSON.parse(window.sessionStorage.getItem(KEY));
    return saved && typeof saved === 'object' ? saved : {};
  } catch {
    return {};
  }
}

function save(saved) {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(saved));
  } catch {
    // Not remembered, then.
  }
}

// Whether `design` has anything painted: its address says more than the
// cottage.
export const isPainted = (design) => designQuery(design) !== `?cottage=${design.cottage}`;

// Remember `design`, or forget its cottage if it's back to its own colors.
export function remember(design) {
  const saved = load();
  if (isPainted(design)) saved[design.cottage] = designQuery(design);
  else delete saved[design.cottage];
  save(saved);
}

// The remembered design for the cottage with this id, or null.
export function remembered(id) {
  const query = load()[id];
  const design = typeof query === 'string' ? designFromQuery(query) : null;
  return design?.cottage === id ? design : null;
}
