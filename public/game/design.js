// The design studio (design.html?cottage=teacup): the cottage on a hill, and
// a row of colors for each of its parts. Picking a color repaints it. The
// design lives in the page's address, so "See it in the village" carries it
// along, and coming back (or reloading) picks up where you left off.
import { cottageById, cottageDrawing, partColors } from './cottages.js';
import { designFromQuery, designQuery, newDesign } from './design-state.js';

// What each color is called, for screen readers.
const COLOR_NAMES = {
  '#ffffff': 'white',
  '#fef3c7': 'cream',
  '#fde047': 'yellow',
  '#fb923c': 'orange',
  '#ef4444': 'red',
  '#f9a8d4': 'pink',
  '#c4b5fd': 'lavender',
  '#93c5fd': 'sky blue',
  '#99f6e4': 'mint',
  '#86efac': 'green',
  '#4d7c0f': 'leaf green',
  '#a16207': 'brown',
  '#4a2530': 'plum',
};

let design = designFromQuery(window.location.search);

if (!design) {
  // No cottage, or one that doesn't exist: go pick one.
  window.location.replace('./pick-a-cottage.html');
} else {
  const cottage = cottageById(design.cottage);
  document.querySelector('.design-name').textContent = cottage.name;
  document.title = `Homebody Hollow | ${cottage.name}`;

  const stage = document.querySelector('.stage-cottage');
  const panel = document.querySelector('.tool-panel');
  const village = document.querySelector('.studio-village');

  // Draw the cottage, mark the colors it's painted in, and keep the address
  // (and the village link) in step with the design.
  const show = () => {
    const drawing = cottageDrawing(cottage, design.outside);
    drawing.classList.add('lit');
    stage.replaceChildren(drawing);
    for (const swatch of panel.querySelectorAll('.swatch')) {
      const on = design.outside[swatch.dataset.part] === swatch.dataset.color;
      swatch.classList.toggle('on', on);
      swatch.setAttribute('aria-pressed', String(on));
    }
    const query = designQuery(design);
    window.history.replaceState(null, '', query);
    village.href = `./village.html${query}`;
  };

  for (const part of cottage.parts) {
    const heading = document.createElement('h2');
    heading.textContent = part.label;
    const row = document.createElement('div');
    row.className = 'swatches';
    row.setAttribute('role', 'group');
    row.setAttribute('aria-label', part.label);
    for (const color of partColors(part)) {
      const swatch = document.createElement('button');
      swatch.type = 'button';
      swatch.className = 'swatch';
      swatch.style.background = color;
      swatch.dataset.part = part.key;
      swatch.dataset.color = color;
      swatch.setAttribute('aria-label', color === part.color ? 'its own color' : COLOR_NAMES[color]);
      swatch.addEventListener('click', () => {
        design.outside[part.key] = color;
        show();
      });
      row.append(swatch);
    }
    panel.append(heading, row);
  }

  document.querySelector('.studio-reset').addEventListener('click', () => {
    design = newDesign(cottage);
    show();
  });

  show();
}
