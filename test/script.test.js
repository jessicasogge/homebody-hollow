// @vitest-environment jsdom
// script.js: the home page's row of cottages and its Start button.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { COTTAGES } from '../public/game/cottages.js';
import { open } from './helpers.js';

const home = () => open('index.html', '../public/script.js');

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('the words on the home page', () => {
  it('say what the game is, under its name', async () => {
    await home();
    expect(document.querySelector('.tagline').textContent).toBe('Design your cottage, top to bottom.');
    expect(document.querySelector('.about').textContent.trim()).toBe('Pick a cottage and make it your own.');
  });

  it('say it\'s a Tiny Game Arcade game, linking to the arcade', async () => {
    await home();
    const arcade = document.querySelector('.arcade');
    expect(arcade.textContent.replace(/\s+/g, ' ').trim()).toBe('A Tiny Game Arcade game.');
    expect(arcade.querySelector('a').getAttribute('href')).toBe('https://jessicasogge.github.io/tiny-game-arcade/');
    expect(arcade.querySelector('a').textContent).toBe('Tiny Game Arcade');
  });
});

describe('the row of cottages', () => {
  it('shows them all, standing on the grass', async () => {
    await home();
    expect(document.querySelectorAll('.street svg.cottage')).toHaveLength(COTTAGES.length);
  });

  it('puts the grass and road right under them', async () => {
    await home();
    const street = document.querySelector('.street');
    expect(street.nextElementSibling.getAttribute('class')).toBe('ground');
    expect(document.querySelectorAll('.ground')).toHaveLength(1);
  });

  it('turns a cottage\'s lights on when tapped, and off when tapped again', async () => {
    await home();
    const cottage = document.querySelectorAll('.street .cottage')[3];
    cottage.querySelector('.window').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(cottage.classList.contains('lit')).toBe(true);
    cottage.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(cottage.classList.contains('lit')).toBe(false);
  });

  it('ignores taps on the gaps between cottages', async () => {
    await home();
    document.querySelector('.street').click();
    expect(document.querySelectorAll('.lit')).toHaveLength(0);
  });
});

describe('the Start button', () => {
  it('says "Press Start to Play" when the page opens', async () => {
    await home();
    const button = document.querySelector('.start-btn');
    expect(button.textContent).toBe('Press Start to Play');
    expect(button.disabled).toBe(false);
  });

  it('shows it heard the click right away, and can\'t be pressed twice', async () => {
    vi.useFakeTimers();
    await home();
    const button = document.querySelector('.start-btn');
    button.click();
    expect(button.textContent).toBe('Opening your village...');
    expect(button.disabled).toBe(true);
  });

  it('opens your village a moment after the click', async () => {
    vi.useFakeTimers();
    const location = await home();
    document.querySelector('.start-btn').click();
    expect(location.href).toBe('http://localhost/index.html');
    vi.advanceTimersByTime(250);
    expect(location.href).toBe('./village.html');
  });

  it('is back to normal when you come back with the Back button', async () => {
    vi.useFakeTimers();
    await home();
    const button = document.querySelector('.start-btn');
    button.click();
    window.dispatchEvent(new Event('pageshow'));
    expect(button.textContent).toBe('Press Start to Play');
    expect(button.disabled).toBe(false);
  });
});
