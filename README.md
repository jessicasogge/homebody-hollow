# Homebody Hollow

A cozy browser game about tiny houses that used to be something else: a boot,
a soda cup, a cooking pot, a teacup, a mushroom, a monstera leaf. Pick one and
design it your way.

The sister game to [PetriPals](https://jessicasogge.github.io/petripals/) and
[FunGals](https://jessicasogge.github.io/fungals/).

## What's here so far

- `public/index.html`: the landing page, with the row of houses on a shelf.
  Tap a house and its lights come on.
- `public/script.js`: draws the houses.
- `public/styles.css`: the page's look.

The Start button doesn't go anywhere yet; the house picker comes next.

## Playing it locally

It's plain HTML, CSS and JavaScript with no build step. Serve `public/` with
any static server, for example:

```sh
npx serve public
```

## Publishing

`.github/workflows/pages.yml` publishes `public/` to GitHub Pages on every push
to `main`. Turn it on once under **Settings → Pages → Source: GitHub Actions**.
