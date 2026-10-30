// @vitest-environment jsdom
// game/village.js: your cottage in the village (village.html?cottage=teacup).
import { afterEach, describe, expect, it, vi } from 'vitest';
import { open } from './helpers.js';

const village = (query) => open('village.html', '../public/game/village.js', `village.html${query}`);
const street = () => [...document.querySelector('.village-street').children];
const yours = () => document.querySelector('.village-street svg.yours');

afterEach(() => vi.unstubAllGlobals());

describe('the village', () => {
  it('has every cottage, yours in the middle', async () => {
    await village('?cottage=teacup');
    const row = street();
    expect(row).toHaveLength(6);
    expect(row[3].classList.contains('yours-wrap')).toBe(true);
    expect(document.querySelectorAll('.village-street svg.cottage')).toHaveLength(6);
  });

  it.each(['boot', 'leaf'])('keeps yours in the middle when it\'s the %s', async (id) => {
    await village(`?cottage=${id}`);
    expect(street()[3].classList.contains('yours-wrap')).toBe(true);
    expect(document.querySelectorAll('.village-street svg.yours')).toHaveLength(1);
  });

  it('paints yours the way you designed it, and its neighbors their own way', async () => {
    await village('?cottage=teacup&walls=%2393c5fd');
    expect(yours().innerHTML).toContain('#93c5fd');
    expect(yours().getAttribute('aria-label')).toMatch(/^Teacup Cottage, /);
    for (const neighbor of document.querySelectorAll('.village-street svg:not(.yours)')) {
      expect(neighbor.innerHTML).not.toContain('#93c5fd');
    }
  });

  it('lights yours up and puts a sign over it', async () => {
    await village('?cottage=pot');
    expect(yours().classList.contains('lit')).toBe(true);
    expect(document.querySelector('.yours-sign').textContent).toBe('Your cottage');
  });

  it('stands the cottages on the grass by the road', async () => {
    await village('?cottage=pot');
    expect(document.querySelector('.village-street').nextElementSibling.getAttribute('class')).toBe('ground');
  });

  it('says whose cottage it is', async () => {
    await village('?cottage=mushroom');
    expect(document.querySelector('.village-caption').textContent).toBe(
      'Here\'s Toadstool Cottage, in the village!',
    );
    expect(document.title).toBe('Homebody Hollow | Toadstool Cottage in the Village');
  });

  it('goes back to the studio with the design still there', async () => {
    await village('?cottage=teacup&walls=%2393c5fd');
    expect(document.querySelector('.village-back').getAttribute('href')).toBe(
      './design.html?cottage=teacup&walls=%2393c5fd',
    );
  });

  it.each([
    ['no cottage', ''],
    ['a cottage that doesn\'t exist', '?cottage=castle'],
  ])('sends you to the picker when the address has %s', async (_, query) => {
    const { replace } = await village(query);
    expect(replace).toHaveBeenCalledWith('./pick-a-cottage.html');
    expect(street()).toHaveLength(0);
  });
});
