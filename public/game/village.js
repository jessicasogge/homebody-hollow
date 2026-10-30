// The village (village.html?cottage=teacup&walls=...): every cottage in a
// row on the grass by the dirt road, always in the same order, with yours
// as you designed it in the studio, in its own spot.
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

  // The neighbors in their own colors, everyone in the picker's order.
  const street = document.querySelector('.village-street');
  street.append(...COTTAGES.map((cottage) => (cottage === yours ? home : cottageDrawing(cottage))));
  street.after(groundDrawing());

  // On a screen too narrow for the whole row, slide it so yours is in the
  // middle, with its neighbors running off both edges.
  const centerYours = () => {
    street.scrollLeft = home.offsetLeft + home.offsetWidth / 2 - street.clientWidth / 2;
  };
  centerYours();
  window.addEventListener('resize', centerYours);

  document.querySelector('.village-caption').textContent = `Here's ${yours.name}, in the village!`;
  document.querySelector('.village-back').href = `./design.html${designQuery(design)}`;
  document.title = `Homebody Hollow | ${yours.name} in the Village`;
}
