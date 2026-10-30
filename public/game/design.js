// The design studio (design.html?cottage=teacup): the cottage on a hill, a
// rainbow of colors and a row of patterns. Pick a color and a pattern, then
// tap a part of the cottage (its walls, its chimney, the teacup's saucer...)
// to fill it. The design lives in the page's address, so "See it in the
// village" carries it along, and coming back (or reloading) picks up where
// you left off.
import { cottageById, cottageDrawing, PALETTE, paintFill, PATTERNS } from './cottages.js';
import { designFromQuery, designQuery, newDesign } from './design-state.js';

let samples = 0;

// A little square of a paint, for the pattern buttons and the brush.
function paintSample(paint) {
  const { fill, def } = paintFill(paint, `sample-${++samples}`);
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = `<defs>${def}</defs><rect width="24" height="24" fill="${fill}" />`;
  return svg;
}

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
  const patterns = document.querySelector('.patterns');
  const now = document.querySelector('.paint-now');
  const village = document.querySelector('.studio-village');
  const brush = { color: PALETTE[0], pattern: PATTERNS[0] };

  // What the brush paints, said aloud: "light green", "light green stripes".
  const brushName = () =>
    brush.pattern.id === 'plain' ? brush.color.name : `${brush.color.name} ${brush.pattern.name}`;

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
      shape.setAttribute('aria-label', `Paint the ${part.label.toLowerCase()} ${brushName()}`);
    }
    stage.replaceChildren(drawing);
    if (focused) drawing.querySelector(`[data-part="${focused}"][tabindex]`).focus();

    const query = designQuery(design);
    window.history.replaceState(null, '', query);
    village.href = `./village.html${query}`;
  };

  const paint = (part) => {
    design.outside[part] = { color: brush.color.color, pattern: brush.pattern.id };
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

  // Show the brush: mark its color and pattern, show each pattern in its
  // color, and show the two together beside the hint.
  const showBrush = () => {
    for (const swatch of palette.children) {
      swatch.setAttribute('aria-pressed', String(swatch.dataset.color === brush.color.color));
    }
    for (const button of patterns.children) {
      button.setAttribute('aria-pressed', String(button.dataset.pattern === brush.pattern.id));
      button.querySelector('svg').replaceWith(
        paintSample({ color: brush.color.color, pattern: button.dataset.pattern }),
      );
    }
    now.replaceChildren(paintSample({ color: brush.color.color, pattern: brush.pattern.id }));
    show(); // so the parts' labels say the new brush
  };

  for (const choice of PALETTE) {
    const swatch = document.createElement('button');
    swatch.type = 'button';
    swatch.className = 'swatch';
    swatch.style.background = choice.color;
    swatch.dataset.color = choice.color;
    swatch.setAttribute('aria-label', choice.name);
    swatch.addEventListener('click', () => {
      brush.color = choice;
      showBrush();
    });
    palette.append(swatch);
  }

  for (const pattern of PATTERNS) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'pattern';
    button.dataset.pattern = pattern.id;
    const name = document.createElement('span');
    name.textContent = pattern.name;
    button.append(document.createElementNS('http://www.w3.org/2000/svg', 'svg'), name);
    button.addEventListener('click', () => {
      brush.pattern = pattern;
      showBrush();
    });
    patterns.append(button);
  }

  document.querySelector('.studio-reset').addEventListener('click', () => {
    design = newDesign(cottage);
    show();
  });

  showBrush();
}
