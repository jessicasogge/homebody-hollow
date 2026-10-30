// A cottage's design: which cottage, and how it looks outside and in.
//
//   { cottage: 'teacup', outside: { walls: '#fbcfe8', ... }, inside: {} }
//
// `outside` has a color for each of the cottage's parts. `inside` is for the
// rooms, which come later. The studio and the village both work from a
// design, and pass it between them in the page's address, so it survives a
// trip to the village and back, and a reload.
import { cottageById, defaultColors, partColors } from './cottages.js';

// A new design for `cottage`, in its own colors.
export function newDesign(cottage) {
  return { cottage: cottage.id, outside: defaultColors(cottage), inside: {} };
}

// The design in an address's query (?cottage=teacup&walls=%23bfdbfe...), or
// null if it doesn't name a real cottage. A color that isn't one of its
// part's choices (a typo, or anything else) is ignored, so the part keeps
// its own color.
export function designFromQuery(query) {
  const params = new URLSearchParams(query);
  const cottage = cottageById(params.get('cottage'));
  if (!cottage) return null;
  const design = newDesign(cottage);
  for (const part of cottage.parts) {
    const color = params.get(part.key);
    if (partColors(part).includes(color)) design.outside[part.key] = color;
  }
  return design;
}

// The query for `design`: the cottage, and only the colors that have been
// changed, so a fresh design's address is just ?cottage=teacup.
export function designQuery(design) {
  const cottage = cottageById(design.cottage);
  const params = new URLSearchParams({ cottage: cottage.id });
  for (const part of cottage.parts) {
    if (design.outside[part.key] !== part.color) params.set(part.key, design.outside[part.key]);
  }
  return `?${params}`;
}
