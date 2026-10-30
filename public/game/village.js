// Your village (village.html): six lots on the grass by the dirt road. An
// empty lot is for sale: tap it to pick a cottage to build there. Tap a
// cottage you've built to change it. On a phone, the street swipes. Clear
// village empties every lot, after asking.
import { cottageById, cottageDrawing } from './cottages.js';
import { groundDrawing } from './ground.js';
import { LOT_COUNT, loadLots, saveLots } from './lots.js';
import { withYard } from './yard.js';

const lots = loadLots();
const street = document.querySelector('.lots');

lots.forEach((built, i) => {
  const link = document.createElement('a');
  link.className = 'lot';
  if (built) {
    const cottage = cottageById(built.cottage);
    link.href = `./design.html?lot=${i}`;
    link.setAttribute('aria-label', `Change your ${cottage.name}`);
    const drawing = cottageDrawing(cottage, built.outside);
    drawing.classList.add('lit');
    // The link says which cottage it is, so the picture is hidden from
    // screen readers.
    drawing.setAttribute('aria-hidden', 'true');
    drawing.removeAttribute('role');
    drawing.removeAttribute('aria-label');
    link.append(withYard(drawing, built.yard));
  } else {
    link.href = `./pick-a-cottage.html?lot=${i}`;
    link.setAttribute('aria-label', 'Empty lot: build a cottage here');
    link.innerHTML = `
      <span class="empty-lot" aria-hidden="true">
        <span class="for-sale">For sale</span>
        <span class="plus">+</span>
      </span>`;
  }
  street.append(link);
});
street.after(groundDrawing());

const built = lots.filter(Boolean).length;
document.querySelector('.village-hint').textContent =
  built === 0
    ? 'Tap a lot to build your first cottage.'
    : built === lots.length
      ? 'Your village is full! Tap a cottage to change it.'
      : 'Tap a lot to build, or a cottage to change it.';
document.querySelector('.lot-count').textContent = `${built} of ${lots.length} lots built`;

// Clear village: the first tap asks, "Yes, clear it" empties every lot and
// shows the empty village, "Keep them" puts the button back.
const clear = document.querySelector('.clear-village');
const start = clear.querySelector('.clear-start');
const asking = clear.querySelector('.clear-confirm');
clear.hidden = built === 0;
start.addEventListener('click', () => {
  start.hidden = true;
  asking.hidden = false;
  clear.querySelector('.clear-no').focus();
});
clear.querySelector('.clear-no').addEventListener('click', () => {
  asking.hidden = true;
  start.hidden = false;
  start.focus();
});
clear.querySelector('.clear-yes').addEventListener('click', () => {
  saveLots(Array(LOT_COUNT).fill(null));
  window.location.reload();
});
