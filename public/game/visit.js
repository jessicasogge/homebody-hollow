// Visiting a cottage in your village (visit.html?lot=2): the cottage on its
// hill with its friend in front, to look at without changing anything.
// Outside and Inside show it either way; beside it, who lives there. Change
// it goes to the studio to change it.
import { cottageById, cottageDrawing, insideDrawing } from './cottages.js';
import { friendById, friendDrawing, friendOnPorch } from './friends.js';
import { loadLots, lotNumber } from './lots.js';
import { withYard } from './yard.js';

const lot = lotNumber(new URLSearchParams(window.location.search).get('lot'));
const design = lot === null ? null : loadLots()[lot];

if (!design) {
  // Nothing built there to visit: back to the village.
  window.location.replace('./village.html');
} else {
  const cottage = cottageById(design.cottage);
  const friend = friendById(design.friend);
  document.querySelector('.design-name').textContent = cottage.name;
  document.title = `Homebody Hollow | Visit ${cottage.name}`;
  document.querySelector('.visit-change').href = `./design.html?lot=${lot}`;

  const stage = document.querySelector('.stage-cottage');
  let view = 'outside';

  // The cottage, from outside (lights on) or inside, in its yard, with its
  // friend in front of it outside. Nothing in it can be tapped.
  const show = () => {
    const drawing =
      view === 'inside'
        ? insideDrawing(cottage, design.outside, design.inside)
        : cottageDrawing(cottage, design.outside);
    if (view === 'outside') drawing.classList.add('lit');
    const scene = withYard(drawing, design.yard, cottage.ground);
    if (friend && view === 'outside') scene.append(friendOnPorch(friend, cottage));
    stage.replaceChildren(scene);
  };

  for (const button of document.querySelectorAll('.mode')) {
    button.addEventListener('click', () => {
      view = button.dataset.view;
      for (const other of document.querySelectorAll('.mode')) {
        other.classList.toggle('on', other === button);
        other.setAttribute('aria-pressed', String(other === button));
      }
      show();
    });
  }

  // Who lives there.
  const card = document.querySelector('.visit-friend');
  if (friend) {
    card.querySelector('.friend-card-pic').append(friendDrawing(friend));
    card.querySelector('.friend-card-name').textContent = `${friend.name} the ${friend.kind} lives here`;
    card.querySelector('.friend-card-likes').textContent = `Likes ${friend.likes}.`;
  } else {
    card.querySelector('.friend-card-name').textContent = 'Nobody lives here yet';
    card.querySelector('.friend-card-likes').textContent = 'Pick a friend to move in.';
  }

  show();
}
