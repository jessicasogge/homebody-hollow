// The design studio: the cottage on a hill, a rainbow of colors and two rows
// of patterns. Pick a color and a pattern, in either order (each keeps the
// other; "solid" takes the pattern off), then tap a part of the cottage (its
// walls, its chimney, the teacup's saucer...) to fill it.
//
// It builds a new cottage or changes one you've built:
// - design.html?cottage=teacup&lot=2 builds a new teacup, in its own
//   colors, for lot 2. Move in! puts it there and goes to your village. The
//   design lives in the address as you paint, so a reload keeps it.
// - design.html?lot=2 changes the cottage on lot 2. Done saves it; Move out
//   empties the lot.
import { cottageById, cottageDrawing, PALETTE, paintFill, PATTERNS } from './cottages.js';
import { designFromQuery, designQuery, newDesign } from './design-state.js';
import { firstEmptyLot, loadLots, lotNumber, saveLots } from './lots.js';

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

const params = new URLSearchParams(window.location.search);
const lots = loadLots();
const lot = lotNumber(params.get('lot'));
const editing = !params.has('cottage') && lot !== null && lots[lot] !== null;
let design = editing ? lots[lot] : designFromQuery(window.location.search);

if (!design) {
  // Nothing to build or change: back to the village, or to the picker if
  // there's no lot in the address either.
  window.location.replace(lot === null ? './pick-a-cottage.html' : './village.html');
} else {
  const cottage = cottageById(design.cottage);
  document.querySelector('.design-name').textContent = cottage.name;
  document.title = `Homebody Hollow | ${cottage.name}`;

  const stage = document.querySelector('.stage-cottage');
  const palette = document.querySelector('.palette');
  const patterns = document.querySelector('.patterns');
  const now = document.querySelector('.paint-now');
  const done = document.querySelector('.studio-done');
  const moveOut = document.querySelector('.studio-moveout');
  const brush = { color: PALETTE[0], pattern: PATTERNS[0] };

  // Where the cottage goes: its own lot when changing it; for a new one, the
  // lot it was picked for if that's still empty, or else the first empty
  // one. A full village has nowhere to put a new cottage.
  const home = editing ? lot : lot !== null && lots[lot] === null ? lot : firstEmptyLot(lots);

  // What the brush paints, said aloud: "light green" (solid), "light green
  // stripes".
  const brushName = () =>
    brush.pattern.id === 'plain' ? brush.color.name : `${brush.color.name} ${brush.pattern.name}`;

  // Draw the cottage, ready to paint. A new cottage keeps its design in the
  // address, so a reload keeps it. If a part had the keyboard's focus, it
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

    if (!editing) {
      const query = designQuery(design);
      window.history.replaceState(null, '', lot === null ? query : `${query}&lot=${lot}`);
    }
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
    // A new color keeps the pattern: red stripes, then blue, is blue stripes.
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
    // Just the picture: its name is for screen readers, and shows on hover.
    button.setAttribute('aria-label', pattern.name);
    button.title = pattern.name;
    button.append(document.createElementNS('http://www.w3.org/2000/svg', 'svg'));
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

  // Move in! (or Done, when changing a cottage) puts it on its lot and goes
  // to your village.
  if (editing) done.textContent = 'Done';
  if (home === null) {
    done.disabled = true;
    document.querySelector('.studio-full').hidden = false;
  }
  done.addEventListener('click', () => {
    lots[home] = design;
    saveLots(lots);
    window.location.href = './village.html';
  });

  // Move out empties the lot of the cottage you're changing.
  moveOut.hidden = !editing;
  moveOut.addEventListener('click', () => {
    lots[lot] = null;
    saveLots(lots);
    window.location.href = './village.html';
  });

  showBrush();
}
