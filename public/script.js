// The home page: the row of tiny houses, and the "Press Start to Play" button.
import { HOUSES, houseDrawing } from './game/houses.js';

const street = document.querySelector('.street');
street?.append(...HOUSES.map(houseDrawing));

// An easter egg: tap a house and someone's home. The lights come on and the
// chimney puffs smoke. Tap again and they've gone to bed.
street?.addEventListener('click', (event) => {
  event.target.closest('.house')?.classList.toggle('lit');
});

const startButton = document.querySelector('.start-btn');

if (startButton) {
  const label = startButton.textContent;

  startButton.addEventListener('click', () => {
    startButton.textContent = 'Opening picker...';
    startButton.disabled = true;

    setTimeout(() => {
      window.location.href = './pick-a-house.html';
    }, 250);
  });

  // When you come back with the browser's Back button, the browser may show
  // this page exactly as it was left, still saying "Opening picker...".
  // Put the button back the way it started.
  window.addEventListener('pageshow', () => {
    startButton.textContent = label;
    startButton.disabled = false;
  });
}
