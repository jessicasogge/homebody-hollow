# Homebody Hollow

A cozy browser game about tiny cottages that used to be something else: a boot,
a soda cup, a cooking pot, a teacup, a mushroom, a monstera leaf. Pick one and
design it your way.

A [Tiny Game Arcade](https://jessicasogge.github.io/tiny-game-arcade/) game.

## What's here so far

- `public/index.html`: the landing page, with the row of cottages on the grass.
  Tap a cottage and its lights come on. Start opens the picker.
- `public/pick-a-cottage.html`: the cottage picker, a card for each cottage.
- `public/design.html`: the design studio. Pick a color and a pattern, then
  tap a part of your cottage (its walls, door, chimney, the teacup's
  saucer...) to fill it, then see it in the village. The Inside side, for
  the rooms, comes later.
- `public/village.html`: your cottage in the middle of the village, on the
  grass by the dirt road, with the other cottages as its neighbors.
- `public/game/design-state.js`: a cottage's design,
  `{ cottage, outside, inside }`, with a paint (a color and a pattern) for
  each part outside. The studio and the village pass it along in the
  page's address.
- `public/game/cottages.js`: the cottages, drawn as SVG, shared by every page.
- `public/styles.css`: the game's look.

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
