// The cottage picker: a card for each cottage, with its picture and name. The
// whole card is the link that picks it.
import { COTTAGES, cottageTile } from './cottages.js';

function card(cottage) {
  const link = document.createElement('a');
  link.className = 'cottage-card';
  link.href = `./design.html?cottage=${cottage.id}`;

  const name = document.createElement('h2');
  name.textContent = cottage.name;

  link.append(cottageTile(cottage), name);
  return link;
}

document.querySelector('.picker-grid').append(...COTTAGES.map(card));
