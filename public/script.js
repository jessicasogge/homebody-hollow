// The home page: the row of tiny cottages, and the "Press Start to Play" button.
import { COTTAGES, cottageDrawing } from './game/cottages.js';
import { groundDrawing } from './game/ground.js';

const street = document.querySelector('.street');
street.append(...COTTAGES.map(cottageDrawing));
street.after(groundDrawing());

// An easter egg: tap a cottage and someone's home. The lights come on and the
// chimney puffs smoke. Tap again and they've gone to bed.
street.addEventListener('click', (event) => {
  event.target.closest('.cottage')?.classList.toggle('lit');
});

const startButton = document.querySelector('.start-btn');

const label = startButton.textContent;

startButton.addEventListener('click', () => {
  startButton.textContent = 'Opening picker...';
  startButton.disabled = true;

  setTimeout(() => {
    window.location.href = './pick-a-cottage.html';
  }, 250);
});

// When you come back with the browser's Back button, the browser may show
// this page exactly as it was left, still saying "Opening picker...".
// Put the button back the way it started.
window.addEventListener('pageshow', () => {
  startButton.textContent = label;
  startButton.disabled = false;
});
