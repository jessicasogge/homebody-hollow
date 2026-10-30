// The design studio (design.html?cottage=teacup): the cottage on a hill, and
// a rainbow of colors. Pick a color, then tap a part of the cottage (its
// walls, its door, the teacup's saucer...) to fill it. The design lives in
// the page's address, so "See it in the village" carries it along, and
// coming back (or reloading) picks up where you left off.
import { cottageById, cottageDrawing, PALETTE } from './cottages.js';
import { designFromQuery, designQuery, newDesign } from './design-state.js';

let design = designFromQuery(window.location.search);

if (!design) {
  // No cottage, or one that doesn't exist: go pick one.
  window.location.replace('./pick-a-cottage.html');
} else {
  const cottage = cottageById(design.cottage);
  document.querySelector('.design-name').textContent = cottage.name;
  document.title = `Homebody Hollow | ${cottage.name}`;

  const stage = document.querySelector('.stage-cottage');
  const palette = document.querySelector('.palette');
  const now = document.querySelector('.paint-now');
  const village = document.querySelector('.studio-village');
  let brush = PALETTE[0];

  // Draw the cottage, ready to paint, and keep the address (and the village
  // link) in step with the design. If a part had the keyboard's focus, it
  // keeps it in the new drawing.
  const show = () => {
    const focused = document.activeElement?.dataset?.part;
    const drawing = cottageDrawing(cottage, design.outside);
    drawing.classList.add('lit');
    // One stop per part for the keyboard, on its first filled shape (the
    // teacup's cup, not the outline of its handle), or its first line.
    for (const part of cottage.parts) {
      const shape =
        drawing.querySelector(`[data-part="${part.key}"]:not([fill="none"])`) ??
        drawing.querySelector(`[data-part="${part.key}"]`);
      shape.setAttribute('tabindex', '0');
      shape.setAttribute('role', 'button');
      shape.setAttribute('aria-label', `Paint the ${part.label.toLowerCase()} ${brush.name}`);
    }
    stage.replaceChildren(drawing);
    if (focused) drawing.querySelector(`[data-part="${focused}"][tabindex]`).focus();

    const query = designQuery(design);
    window.history.replaceState(null, '', query);
    village.href = `./village.html${query}`;
  };

  const paint = (part) => {
    design.outside[part] = brush.color;
    show();
  };

  // Tap a part (or press Enter or Space on it) to fill it with the brush.
  stage.addEventListener('click', (event) => {
    const part = event.target.closest('[data-part]')?.dataset.part;
    if (part) paint(part);
  });
  stage.addEventListener('keydown', (event) => {
    const part = event.target.dataset?.part;
    if (part && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      paint(part);
    }
  });

  const pick = (choice, swatch) => {
    brush = choice;
    for (const other of palette.children) other.setAttribute('aria-pressed', String(other === swatch));
    now.style.background = choice.color;
    show(); // so the parts' labels say the new color
  };

  for (const choice of PALETTE) {
    const swatch = document.createElement('button');
    swatch.type = 'button';
    swatch.className = 'swatch';
    swatch.style.background = choice.color;
    swatch.dataset.color = choice.color;
    swatch.setAttribute('aria-label', choice.name);
    swatch.addEventListener('click', () => pick(choice, swatch));
    palette.append(swatch);
  }

  document.querySelector('.studio-reset').addEventListener('click', () => {
    design = newDesign(cottage);
    show();
  });

  pick(PALETTE[0], palette.firstElementChild);
}
