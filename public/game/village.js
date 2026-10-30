// The village (village.html?cottage=teacup&walls=...): your cottage, as
// designed in the studio, in the middle of the row on the grass by the dirt
// road, with the other cottages as its neighbors.
import { COTTAGES, cottageById, cottageDrawing } from './cottages.js';
import { designFromQuery, designQuery } from './design-state.js';
import { groundDrawing } from './ground.js';

const design = designFromQuery(window.location.search);

if (!design) {
  window.location.replace('./pick-a-cottage.html');
} else {
  const yours = cottageById(design.cottage);

  // Yours, a little bigger, with its lights on and a sign over it.
  const drawing = cottageDrawing(yours, design.outside);
  drawing.classList.add('yours', 'lit');
  const sign = document.createElement('span');
  sign.className = 'yours-sign';
  sign.textContent = 'Your cottage';
  const home = document.createElement('div');
  home.className = 'yours-wrap';
  home.append(sign, drawing);

  // The neighbors on either side. The row is centered on yours, so on a
  // narrow screen they run off both edges and yours stays in view.
  const neighbors = COTTAGES.filter((cottage) => cottage !== yours).map((cottage) =>
    cottageDrawing(cottage),
  );
  const half = Math.ceil(neighbors.length / 2);
  const street = document.querySelector('.village-street');
  street.append(...neighbors.slice(0, half), home, ...neighbors.slice(half));
  street.after(groundDrawing());

  document.querySelector('.village-caption').textContent = `Here's ${yours.name}, in the village!`;
  document.querySelector('.village-back').href = `./design.html${designQuery(design)}`;
  document.title = `Homebody Hollow | ${yours.name} in the Village`;
}
