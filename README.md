# Homebody Hollow

A cozy browser game about tiny houses that used to be something else: a boot,
a soda cup, a cooking pot, a teacup, a mushroom, a monstera leaf. Pick one and
design it your way.

The sister game to [PetriPals](https://jessicasogge.github.io/petripals/) and
[FunGals](https://jessicasogge.github.io/fungals/).

## What's here so far

- `public/index.html`: the landing page, with the row of houses on a shelf.
  Tap a house and its lights come on. Start opens the picker.
- `public/pick-a-house.html`: the house picker, a card for each house.
- `public/design.html`: where you'll design the house you picked. For now it
  shows the house with its lights on and says the design studio is coming.
- `public/game/houses.js`: the houses, drawn as SVG, shared by every page.
- `public/styles.css`: the game's look.

## Playing it locally

It's plain HTML, CSS and JavaScript with no build step and no dependencies.
With Node 22 or newer:

```sh
npm start
```

then open <http://localhost:3009>.

## Publishing

`.github/workflows/pages.yml` publishes `public/` to GitHub Pages on every push
to `main`. Turn it on once under **Settings → Pages → Source: GitHub Actions**.
