// A cottage's design: which cottage, and how it looks outside and in.
//
//   { cottage: 'teacup',
//     outside: { walls: { color: '#fbcfe8', pattern: 'plain' }, ... },
//     yard: ['flowers'],
//     inside: {} }
//
// `outside` has a paint (a color and a pattern) for each of the cottage's
// parts. `yard` is what's around it: rocks, trees or flowers, or nothing.
// `inside` is for the rooms, which come later. The studio and the
// village both work from a design, and pass it between them in the page's
// address, so it survives a trip to the village and back, and a reload.
import { cottageById, defaultPaints, partColors, patternById } from './cottages.js';
import { yardFrom } from './yard.js';

// A new design for `cottage`, in its own colors, all plain, with an empty
// yard.
export function newDesign(cottage) {
  return { cottage: cottage.id, outside: defaultPaints(cottage), yard: [], inside: {} };
}

// The design in an address's query, or null if it doesn't name a real
// cottage. Each painted part is its color, then its pattern if it has one:
// ?cottage=teacup&walls=%2360a5fa%3Adots (that is, walls=#60a5fa:dots).
// A color that isn't one of its part's choices, or a pattern that isn't
// one of the patterns (a typo, or anything else), is ignored, so the part
// keeps its own paint. The yard is its option, &yard=flowers; anything that
// isn't one is ignored, and only the first of several is kept.
export function designFromQuery(query) {
  const params = new URLSearchParams(query);
  const cottage = cottageById(params.get('cottage'));
  if (!cottage) return null;
  const design = newDesign(cottage);
  for (const part of cottage.parts) {
    // Before each window had its own paint, one `windows` paint was for all.
    const value = params.get(part.key) ?? (part.key.startsWith('window') ? params.get('windows') : null);
    const [color, pattern = 'plain'] = (value ?? '').split(':');
    if (partColors(part).includes(color) && patternById(pattern)) {
      design.outside[part.key] = { color, pattern };
    }
  }
  design.yard = yardFrom((params.get('yard') ?? '').split(','));
  return design;
}

// The query for `design`: the cottage, and only the parts that have been
// painted, and its yard if it has one, so a fresh design's address is just
// ?cottage=teacup.
export function designQuery(design) {
  const cottage = cottageById(design.cottage);
  const params = new URLSearchParams({ cottage: cottage.id });
  for (const part of cottage.parts) {
    const { color, pattern } = design.outside[part.key];
    if (color !== part.color || pattern !== 'plain') {
      params.set(part.key, pattern === 'plain' ? color : `${color}:${pattern}`);
    }
  }
  if (design.yard.length) params.set('yard', design.yard.join(','));
  return `?${params}`;
}
