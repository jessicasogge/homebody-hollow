// The design studio: the cottage on a hill, a rainbow of colors and two rows
// of patterns. Pick a color and a pattern, in either order (each keeps the
// other; "solid" takes the pattern off), then tap a part of the cottage (its
// walls, its windows, the teacup's saucer...) to fill it. A Yard button
// puts rocks, trees or flowers around it. Inside shows its rooms, with the
// ladders between them: pick something (a bed, a lamp...), then tap a room,
// and it goes in the furthest left spot there. Take out, then tap a thing,
// takes it out.
//
// It builds a new cottage or changes one you've built:
// - design.html?cottage=teacup&lot=2 builds a new teacup, in its own
//   colors, for lot 2. Move in! puts it there and goes to your village. The
//   design lives in the address as you paint, so a reload keeps it.
// - design.html?lot=2 changes the cottage on lot 2. Done saves it; Move out
//   empties the lot.
import { cottageById, cottageDrawing, insideDrawing, PALETTE, paintFill, PATTERNS } from './cottages.js';
import { designFromQuery, designQuery, newDesign } from './design-state.js';
import { arrange, FURNITURE, furnitureById, ROOM_LIMIT } from './furniture.js';
import { firstEmptyLot, loadLots, lotNumber, saveLots } from './lots.js';
import { withYard, YARD, yardIcon } from './yard.js';

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
  const yardOptions = document.querySelector('.yard-options');
  const brush = { color: PALETTE[0], pattern: PATTERNS[0] };
  // Outside (painting the cottage) or inside (its rooms).
  let view = 'outside';
  // Inside, what you're about to put in a room (a thing's id), or
  // 'take-out', or nothing yet.
  let holding = null;
  const note = document.querySelector('.inside-note');

  // Where the cottage goes: its own lot when changing it; for a new one, the
  // lot it was picked for if that's still empty, or else the first empty
  // one. A full village has nowhere to put a new cottage.
  const home = editing ? lot : lot !== null && lots[lot] === null ? lot : firstEmptyLot(lots);

  // What the brush paints, said aloud: "light green" (solid), "light green
  // stripes".
  const brushName = () =>
    brush.pattern.id === 'plain' ? brush.color.name : `${brush.color.name} ${brush.pattern.name}`;

  // Draw the cottage, outside ready to paint, or inside with its rooms. A new
  // cottage keeps its design in the address, so a reload keeps it. If a part
  // or a room had the keyboard's focus, it keeps it in the new drawing.
  const show = () => {
    if (view === 'inside') {
      showInside();
    } else {
      showOutside();
    }
    if (!editing) {
      const query = designQuery(design);
      window.history.replaceState(null, '', lot === null ? query : `${query}&lot=${lot}`);
    }
  };

  // The rooms, each a stop for the keyboard, saying what's in it.
  const showInside = () => {
    const focused = document.activeElement?.dataset?.room;
    const drawing = insideDrawing(cottage, design.outside, design.inside);
    for (const [i, room] of cottage.inside.rooms.entries()) {
      const shape = drawing.querySelector(`.room[data-room="${i}"]`);
      const things = design.inside[i].map((id) => furnitureById(id).name);
      shape.setAttribute('tabindex', '0');
      shape.setAttribute('role', 'button');
      shape.setAttribute('aria-label', `${room.name}: ${things.length ? things.join(', ') : 'empty'}`);
    }
    stage.replaceChildren(withYard(drawing, design.yard));
    if (focused) drawing.querySelector(`.room[data-room="${focused}"]`).focus();
  };

  const showOutside = () => {
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
    stage.replaceChildren(withYard(drawing, design.yard));
    for (const button of yardOptions.children) {
      button.setAttribute('aria-pressed', String(design.yard.includes(button.dataset.yard)));
    }
    if (focused) drawing.querySelector(`[data-part="${focused}"][tabindex]`).focus();
  };

  // Put what you're holding in room `i`, or with Take out, take thing
  // `thing` out of it. Says what happened, or why not.
  const fill = (i, thing) => {
    const room = cottage.inside.rooms[i];
    const things = design.inside[i];
    if (holding === 'take-out') {
      if (thing === undefined) {
        note.textContent = `Tap a thing in ${room.name.toLowerCase()} to take it out.`;
        return;
      }
      const [id] = things.splice(Number(thing), 1);
      note.textContent = `Took the ${furnitureById(id).name} out of ${room.name.toLowerCase()}.`;
    } else if (!holding) {
      note.textContent = 'Pick something to put in first.';
      return;
    } else if (things.length >= ROOM_LIMIT) {
      note.textContent = `${room.name} is full: ${ROOM_LIMIT} things is the most a room holds.`;
      return;
    } else if (!arrange(room, [...things, holding])) {
      note.textContent = `There's no space for the ${furnitureById(holding).name} in ${room.name.toLowerCase()}.`;
      return;
    } else {
      things.push(holding);
      note.textContent = `Put the ${furnitureById(holding).name} in ${room.name.toLowerCase()}.`;
    }
    show();
  };

  const paint = (part) => {
    design.outside[part] = { color: brush.color.color, pattern: brush.pattern.id };
    show();
  };

  // Tap a part (or press Enter or Space on it) to fill it with the brush.
  // Inside, there's nothing to paint.
  stage.addEventListener('click', (event) => {
    if (view === 'inside') {
      const room = event.target.closest('[data-room]')?.dataset;
      if (room) fill(Number(room.room), room.thing);
      return;
    }
    const part = event.target.closest('[data-part]')?.dataset.part;
    if (part) paint(part);
  });
  stage.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const { part, room } = event.target.dataset ?? {};
    if (view === 'inside' && room) {
      event.preventDefault();
      fill(Number(room));
    } else if (view === 'outside' && part) {
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

  // Each Yard button puts its rocks, trees or flowers in, instead of what
  // was there; tapping the one that's in takes it out.
  for (const option of YARD) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'yard-option';
    button.dataset.yard = option.id;
    button.setAttribute('aria-label', option.name);
    button.title = option.name;
    button.append(yardIcon(option.id));
    button.addEventListener('click', () => {
      design.yard = design.yard.includes(option.id) ? [] : [option.id];
      show();
    });
    yardOptions.append(button);
  }

  // Outside and Inside: the paints and yard, or the things for the rooms.
  const insidePanel = document.querySelector('.inside-panel');
  const furniture = document.querySelector('.furniture');
  const takeOut = document.querySelector('.take-out');
  const hold = (what) => {
    holding = holding === what ? null : what;
    for (const button of furniture.children) {
      button.setAttribute('aria-pressed', String(button.dataset.thing === holding));
    }
    takeOut.setAttribute('aria-pressed', String(holding === 'take-out'));
    note.textContent = '';
  };
  for (const thing of FURNITURE) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'furniture-option';
    button.dataset.thing = thing.id;
    button.setAttribute('aria-pressed', 'false');
    button.setAttribute('aria-label', thing.name);
    button.title = thing.name;
    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.setAttribute('viewBox', '0 0 26 26');
    icon.setAttribute('aria-hidden', 'true');
    icon.innerHTML = thing.draw((26 - thing.width) / 2, thing.place === 'wall' ? 17 : 23);
    button.append(icon);
    button.addEventListener('click', () => hold(thing.id));
    furniture.append(button);
  }
  takeOut.addEventListener('click', () => hold('take-out'));
  for (const button of document.querySelectorAll('.mode')) {
    button.addEventListener('click', () => {
      view = button.dataset.view;
      for (const other of document.querySelectorAll('.mode')) {
        other.classList.toggle('on', other === button);
        other.setAttribute('aria-pressed', String(other === button));
      }
      document.querySelector('.tool-panel').hidden = view === 'inside';
      insidePanel.hidden = view === 'outside';
      show();
    });
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
