// The cottage picker: a card for each cottage, with its picture and name. The
// whole card is the link that picks it, for the lot in the address
// (pick-a-cottage.html?lot=2) if there is one.
import { COTTAGES, cottageTile } from './cottages.js';
import { lotNumber } from './lots.js';

const lot = lotNumber(new URLSearchParams(window.location.search).get('lot'));

function card(cottage) {
  const link = document.createElement('a');
  link.className = 'cottage-card';
  link.href = `./design.html?cottage=${cottage.id}${lot === null ? '' : `&lot=${lot}`}`;

  const name = document.createElement('h2');
  name.textContent = cottage.name;

  link.append(cottageTile(cottage), name);
  return link;
}

document.querySelector('.picker-grid').append(...COTTAGES.map(card));
