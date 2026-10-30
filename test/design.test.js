// @vitest-environment jsdom
// game/design.js: the page for the cottage you picked (design.html?cottage=boot).
import { afterEach, describe, expect, it, vi } from 'vitest';
import { open } from './helpers.js';

const design = (query) => open('design.html', '../public/game/design.js', `design.html${query}`);

afterEach(() => vi.unstubAllGlobals());

describe('the design page', () => {
  it('shows the cottage you picked, with its name', async () => {
    await design('?cottage=teacup');
    expect(document.querySelector('.design-name').textContent).toBe('Teacup Cottage');
    expect(document.querySelector('.design-cottage svg').getAttribute('aria-label')).toMatch(
      /^Teacup Cottage, /,
    );
  });

  it('turns its lights on, since someone just moved in', async () => {
    await design('?cottage=leaf');
    expect(document.querySelector('.design-cottage svg').classList.contains('lit')).toBe(true);
  });

  it('puts the cottage\'s name in the tab title', async () => {
    await design('?cottage=boot');
    expect(document.title).toBe('Homebody Hollow | Tiptoe Cottage');
  });

  it('links back to the picker', async () => {
    await design('?cottage=pot');
    expect(document.querySelector('.back-link').getAttribute('href')).toBe('./pick-a-cottage.html');
  });

  it.each([
    ['no cottage', ''],
    ['a cottage that doesn\'t exist', '?cottage=castle'],
  ])('sends you to the picker when the address has %s', async (_, query) => {
    const location = await design(query);
    expect(location.replace).toHaveBeenCalledWith('./pick-a-cottage.html');
    expect(document.querySelector('.design-cottage').children).toHaveLength(0);
  });
});
