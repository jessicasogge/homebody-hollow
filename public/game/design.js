// The design page: shows the house picked on the picker (?house=boot), with
// its lights on, since someone just moved in.
import { houseById, houseDrawing } from './houses.js';

const id = new URLSearchParams(window.location.search).get('house');
const house = houseById(id);

if (!house) {
  // No house, or one that doesn't exist: go pick one.
  window.location.replace('./pick-a-house.html');
} else {
  const drawing = houseDrawing(house);
  drawing.classList.add('lit');
  document.querySelector('.design-house').append(drawing);
  document.querySelector('.design-name').textContent = house.name;
  document.title = `Homebody Hollow | ${house.name}`;
}
