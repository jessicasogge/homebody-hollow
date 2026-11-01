# Homebody Hollow

A cozy browser game about tiny cottages that used to be something else: a boot,
a soda cup, a cooking pot, a teacup, a mushroom, a monstera leaf, a cat, a
handbag, a puppy. Pick one and design it your way.

A [Tiny Game Arcade](https://jessicasogge.github.io/tiny-game-arcade/) game.

## What's here so far

- `public/index.html`: the landing page, with the row of cottages on the grass.
  Tap a cottage and its lights come on. Start opens your village.
- `public/village.html`: your village, six lots on the grass by the dirt
  road. Tap an empty lot ("For sale") to build there, or a cottage you've
  built to change it. Any cottage can go on any lot, as many times as you
  like. On a phone, the street swipes. Clear village (after asking) empties
  every lot.
- `public/pick-a-cottage.html`: the cottage picker, a card for each cottage.
- `public/design.html`: the design studio. Pick a color and a pattern (or
  solid), in either order, then tap a part of your cottage (its walls,
  door, chimney, windows, the teacup's saucer...) to fill it, and put rocks,
  pine trees or flowers in its yard (one of them). A new cottage starts in
  its own colors; Move in! puts it on its lot. A cottage you've built opens
  as you left it, with Done and Move out. Inside shows its rooms, cut open
  like a dollhouse with fixed ladders between the floors: pick something (a
  bed, a toilet, a rug...), then tap a room, and it goes in the furthest
  left spot there, up to four things a room. Take out, then tap a thing,
  takes it out.
- `public/game/design-state.js`: a cottage's design,
  `{ cottage, outside, yard, inside }`, with a paint (a color and a pattern)
  for each part outside, and what's in each room inside.
- `public/game/furniture.js`: the things for the rooms, and where each goes
  in a room (along the floor, on the wall, or a rug under everything).
- `public/game/lots.js`: your village's six lots, saved in the browser
  (localStorage), so your village is still there next time.
- `public/game/yard.js`: rocks, pine trees or flowers around a cottage
  (one of them): the trees behind it, the rocks and flowers in front.
- `public/game/cottages.js`: the cottages, drawn as SVG, shared by every page.
- `public/styles.css`: the game's look.
- `public/apple-touch-icon.png`, `public/favicon-32.png`: the teacup cottage,
  for a phone's home screen and for browsers without SVG tab icons.
- `public/social-preview.png`: the picture a shared link shows (iMessage,
  Slack, Discord, social media): the six cottages by the road, with the
  title. They were drawn from the game's own cottages, so if a cottage
  changes, they need drawing again.

## Playing it locally

It's plain HTML, CSS and JavaScript with no build step. With Node 22.18 or
newer:

```sh
npm start
```

then open <http://localhost:3009>.

## Tests

```sh
npm install         # once, for the test tools
npm test            # run the tests
npm run test:watch  # rerun them as you change things
npm run test:coverage
```

The tests in `test/` load each real page into a simulated browser page
(jsdom) and check what you'd see and where each button and card takes you.
They also start the local server and check it serves the game, on port
3009, and nothing outside `public/`.

`npm run test:coverage` also fails if the tests stop running every line of
the game. GitHub runs it on every pull request, and before every deploy.

## Publishing

`.github/workflows/pages.yml` publishes `public/` to GitHub Pages on every push
to `main`, once the tests pass. Turn it on once under **Settings → Pages →
Source: GitHub Actions**.
