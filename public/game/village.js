// Your village (village.html): six lots on the grass by the dirt road. An
// empty lot is for sale: tap it to pick a cottage to build there. Tap a
// cottage you've built to change it. On a phone, the street swipes.
import { cottageById, cottageDrawing } from './cottages.js';
import { groundDrawing } from './ground.js';
import { loadLots } from './lots.js';

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
    link.append(drawing);
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
