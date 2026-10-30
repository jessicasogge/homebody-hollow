// @vitest-environment jsdom
// script.js: the home page's row of cottages and its Start button.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { open } from './helpers.js';

const home = () => open('index.html', '../public/script.js');

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('the row of cottages', () => {
  it('shows all six on the shelf', async () => {
    await home();
    expect(document.querySelectorAll('.street svg.cottage')).toHaveLength(6);
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
    expect(button.textContent).toBe('Opening picker...');
    expect(button.disabled).toBe(true);
  });

  it('opens the cottage picker a moment after the click', async () => {
    vi.useFakeTimers();
    const location = await home();
    document.querySelector('.start-btn').click();
    expect(location.href).toBe('http://localhost/index.html');
    vi.advanceTimersByTime(250);
    expect(location.href).toBe('./pick-a-cottage.html');
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
