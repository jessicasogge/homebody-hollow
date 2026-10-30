// Your village: six lots by the road, each empty (null) or holding a
// cottage you built, as a design: { cottage, outside, inside }. Any cottage
// can go on any lot, as many times as you like.
//
// It's kept in the browser (localStorage), so your village is still there
// next time. Each cottage is stored as its address query
// (?cottage=teacup&walls=...) and read back through designFromQuery, so
// anything odd in storage is ignored the same way an odd address is.
import { designFromQuery, designQuery } from './design-state.js';

const KEY = 'homebody-hollow:village';
export const LOT_COUNT = 6;

// A lot's number from an address (?lot=2), or null if it isn't one.
export function lotNumber(value) {
  return /^[0-9]$/.test(value ?? '') && Number(value) < LOT_COUNT ? Number(value) : null;
}

// Storage can be missing or refuse (private browsing, blocked site data):
// then the village starts empty each time, and everything else still works.
export function loadLots() {
  let saved = [];
  try {
    saved = JSON.parse(window.localStorage.getItem(KEY)) ?? [];
  } catch {
    // Nothing saved we can read.
  }
  if (!Array.isArray(saved)) saved = [];
  return Array.from({ length: LOT_COUNT }, (_, i) =>
    typeof saved[i] === 'string' ? designFromQuery(saved[i]) : null,
  );
}

export function saveLots(lots) {
  try {
    const saved = lots.map((built) => built && designQuery(built));
    window.localStorage.setItem(KEY, JSON.stringify(saved));
  } catch {
    // Not saved, then.
  }
}

// The first empty lot, or null if the village is full.
export function firstEmptyLot(lots) {
  const i = lots.indexOf(null);
  return i === -1 ? null : i;
}
