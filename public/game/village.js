// Your village (village.html): six lots on the grass by the dirt road. An
// empty lot is for sale: tap it to pick a cottage to build there. Tap a
// cottage you've built to change it. On a phone, the street swipes. Clear
// village empties every lot, after asking.
import { cottageById, cottageDrawing } from './cottages.js';
import { friendById, friendOnPorch } from './friends.js';
import { groundDrawing } from './ground.js';
import { LOT_COUNT, loadLots, saveLots } from './lots.js';
import { track } from './track.js';
import { withYard } from './yard.js';

const lots = loadLots();
const street = document.querySelector('.lots');

lots.forEach((built, i) => {
  const link = document.createElement('a');
  link.className = 'lot';
  if (built) {
    const cottage = cottageById(built.cottage);
    link.href = `./visit.html?lot=${i}`;
    link.setAttribute('aria-label', `Visit your ${cottage.name}`);
    const drawing = cottageDrawing(cottage, built.outside);
    drawing.classList.add('lit');
    // The link says which cottage it is, so the picture is hidden from
    // screen readers.
    drawing.setAttribute('aria-hidden', 'true');
    drawing.removeAttribute('role');
    drawing.removeAttribute('aria-label');
    const scene = withYard(drawing, built.yard, cottage.ground);
    // Who lives there, in front of it.
    const friend = friendById(built.friend);
    if (friend) scene.append(friendOnPorch(friend, cottage));
    link.append(scene);
  } else {
    link.href = `./pick-a-cottage.html?lot=${i}`;
    link.setAttribute('aria-label', 'Empty lot: build a cottage here');
    link.innerHTML = `
      <span class="empty-lot" aria-hidden="true">
        <span class="for-sale">For sale</span>
        <span class="plus">+</span>
      </span>`;
  }
  street.append(link);
});
street.after(groundDrawing());

const built = lots.filter(Boolean).length;
document.querySelector('.village-hint').textContent =
  built === 0
    ? 'Tap a lot to build your first cottage.'
    : built === lots.length
      ? 'Your village is full! Tap a cottage to visit it.'
      : 'Tap a lot to build, or a cottage to visit it.';
document.querySelector('.lot-count').textContent = `${built} of ${lots.length} lots built`;

// Day or night: night from 7pm to 6am by your clock, to start. Tap the sun
// for night, or the moon for day. At night the sky darkens, the windows
// glow, and friends doze by their doors.
const scene = document.querySelector('.village-scene');
const sky = document.querySelector('.sky-toggle');
const showNight = (night) => {
  scene.classList.toggle('night', night);
  sky.setAttribute('aria-pressed', String(night));
  sky.title = night ? 'Tap the moon for day' : 'Tap the sun for night';
};
const hour = new Date().getHours();
showNight(hour >= 19 || hour < 6);
sky.addEventListener('click', () => showNight(!scene.classList.contains('night')));

// The season, by the month (in the north): spring from March, summer from
// June, autumn from September and winter from December. Tap it for the
// next one. The grass changes with it, and petals, leaves or snow fall.
const SEASONS = [
  { id: 'spring', name: 'Spring', falling: 'petal' },
  { id: 'summer', name: 'Summer', falling: null },
  { id: 'autumn', name: 'Autumn', falling: 'leaf' },
  { id: 'winter', name: 'Winter', falling: 'flake' },
];
const seasonButton = document.querySelector('.season-toggle');
const weather = document.querySelector('.weather');
let season = SEASONS[Math.floor(((new Date().getMonth() + 10) % 12) / 3)];
const showSeason = () => {
  for (const { id } of SEASONS) scene.classList.toggle(`season-${id}`, id === season.id);
  seasonButton.textContent = season.name;
  seasonButton.setAttribute('aria-label', `${season.name}: tap for ${SEASONS[(SEASONS.indexOf(season) + 1) % 4].name.toLowerCase()}`);
  // Each one falls from its own spot across the top, at its own pace.
  weather.replaceChildren(
    ...(season.falling ? Array.from({ length: 18 }, (_, i) => i) : []).map((i) => {
      const bit = document.createElement('span');
      bit.className = season.falling;
      bit.style.left = `${(i * 37) % 100}%`;
      bit.style.animationDelay = `${-((i * 1.3) % 8)}s`;
      bit.style.animationDuration = `${7 + (i % 5)}s`;
      return bit;
    }),
  );
};
showSeason();
seasonButton.addEventListener('click', () => {
  season = SEASONS[(SEASONS.indexOf(season) + 1) % 4];
  showSeason();
});

// Clear village: the first tap asks, "Yes, clear it" empties every lot and
// shows the empty village, "Keep them" puts the button back.
const clear = document.querySelector('.clear-village');
const start = clear.querySelector('.clear-start');
const asking = clear.querySelector('.clear-confirm');
clear.hidden = built === 0;
start.addEventListener('click', () => {
  start.hidden = true;
  asking.hidden = false;
  clear.querySelector('.clear-no').focus();
});
clear.querySelector('.clear-no').addEventListener('click', () => {
  asking.hidden = true;
  start.hidden = false;
  start.focus();
});
clear.querySelector('.clear-yes').addEventListener('click', () => {
  saveLots(Array(LOT_COUNT).fill(null));
  track('cleared-village', 'Cleared the village');
  window.location.reload();
});
