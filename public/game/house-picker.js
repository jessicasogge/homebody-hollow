// The house picker: a card for each house, with its picture and name. The
// whole card is the link that picks it.
import { HOUSES, houseTile } from './houses.js';

function card(house) {
  const link = document.createElement('a');
  link.className = 'house-card';
  link.href = `./design.html?house=${house.id}`;

  const name = document.createElement('h2');
  name.textContent = house.name;

  link.append(houseTile(house), name);
  return link;
}

document.querySelector('.picker-grid').append(...HOUSES.map(card));
