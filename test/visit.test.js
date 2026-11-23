// @vitest-environment jsdom
// game/visit.js: visiting a cottage in your village (visit.html?lot=2), to
// look at without changing it.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { designFromQuery } from '../public/game/design-state.js';
import { saveLots } from '../public/game/lots.js';
import { open } from './helpers.js';

const visit = (query) => open('visit.html', '../public/game/visit.js', `visit.html${query}`);
const build = (lot, query) => saveLots(Array.from({ length: 6 }, (_, i) => (i === lot ? designFromQuery(query) : null)));
const drawing = () => document.querySelector('.stage-cottage svg.cottage');
const tap = (el) => el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
const view = (name) => tap(document.querySelector(`.mode[data-view="${name}"]`));

afterEach(() => {
  window.localStorage.clear();
  vi.unstubAllGlobals();
});

describe('visiting a cottage', () => {
  it('shows it by name, from outside, painted your way, in its yard', async () => {
    build(2, '?cottage=pot&walls=%233b82f6&yard=trees');
    await visit('?lot=2');
    expect(document.querySelector('.design-name').textContent).toBe('Stewpot Cottage');
    expect(document.title).toBe('Homebody Hollow | Visit Stewpot Cottage');
    expect(drawing().classList.contains('lit')).toBe(true);
    expect(drawing().querySelector('[data-part="walls"]').getAttribute('fill')).toBe('#3b82f6');
    expect(document.querySelector('.stage-cottage .yard')).not.toBeNull();
  });

  it('shows who lives there, in front of it and on their card', async () => {
    build(0, '?cottage=boot&friend=hedgehog');
    await visit('?lot=0');
    expect(document.querySelector('.stage-cottage .friend-here svg.friend')).not.toBeNull();
    expect(document.querySelector('.friend-card-name').textContent).toBe('Bramble the hedgehog lives here');
    expect(document.querySelector('.friend-card-likes').textContent).toBe('Likes blackberries and a cozy pile of leaves.');
  });

  it('says so when nobody lives there yet', async () => {
    build(0, '?cottage=teacup');
    await visit('?lot=0');
    expect(document.querySelector('.stage-cottage .friend-here')).toBeNull();
    expect(document.querySelector('.friend-card-name').textContent).toBe('Nobody lives here yet');
    expect(document.querySelector('.friend-card-pic svg')).toBeNull();
  });

  it('shows the inside, with its things, and back to the outside', async () => {
    build(0, '?cottage=boot&friend=owl&room1=bed.0');
    await visit('?lot=0');
    view('inside');
    expect(drawing().classList.contains('inside')).toBe(true);
    expect(drawing().querySelectorAll('.thing')).toHaveLength(1);
    expect(document.querySelector('.stage-cottage .friend-here')).toBeNull();
    const [outside, inside] = document.querySelectorAll('.mode');
    expect(inside.getAttribute('aria-pressed')).toBe('true');
    expect(outside.getAttribute('aria-pressed')).toBe('false');
    view('outside');
    expect(drawing().classList.contains('inside')).toBe(false);
    expect(document.querySelector('.stage-cottage .friend-here')).not.toBeNull();
  });

  it('changes nothing when you tap it', async () => {
    build(0, '?cottage=teacup');
    await visit('?lot=0');
    tap(drawing().querySelector('[data-part="walls"]'));
    view('inside');
    tap(drawing().querySelector('.room'));
    expect(drawing().querySelectorAll('.thing')).toHaveLength(0);
    expect(localStorage.getItem('homebody-hollow:village')).toContain('"?cottage=teacup"');
  });

  it('goes to the studio to change it, and back to the village', async () => {
    build(3, '?cottage=teacup');
    await visit('?lot=3');
    expect(document.querySelector('.visit-change').getAttribute('href')).toBe('./design.html?lot=3');
    expect(document.querySelector('.studio-back').getAttribute('href')).toBe('./village.html');
  });

  it.each(['', '?lot=1', '?lot=9', '?lot=x'])('goes back to the village with nothing to visit (%s)', async (query) => {
    build(0, '?cottage=teacup');
    const location = await visit(query);
    expect(location.replace).toHaveBeenCalledWith('./village.html');
  });
});
