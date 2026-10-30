// The design page: shows the cottage picked on the picker (?cottage=boot), with
// its lights on, since someone just moved in.
import { cottageById, cottageDrawing } from './cottages.js';

const id = new URLSearchParams(window.location.search).get('cottage');
const cottage = cottageById(id);

if (!cottage) {
  // No cottage, or one that doesn't exist: go pick one.
  window.location.replace('./pick-a-cottage.html');
} else {
  const drawing = cottageDrawing(cottage);
  drawing.classList.add('lit');
  document.querySelector('.design-cottage').append(drawing);
  document.querySelector('.design-name').textContent = cottage.name;
  document.title = `Homebody Hollow | ${cottage.name}`;
}
