// The house picker: a card for each house, with its picture, name and what
// it used to be. The whole card is the link that picks it.
import { HOUSES, houseTile } from './houses.js';

function card(house) {
  const link = document.createElement('a');
  link.className = 'house-card';
  link.href = `./design.html?house=${house.id}`;

  const name = document.createElement('h2');
  name.textContent = house.name;

  const was = document.createElement('p');
  was.className = 'was';
  was.textContent = `Used to be ${house.was}`;

  link.append(houseTile(house), name, was);
  return link;
}

document.querySelector('.picker-grid').append(...HOUSES.map(card));
