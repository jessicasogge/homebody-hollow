// @vitest-environment jsdom
// game/friends.js: the friends who can move into a cottage.
import { describe, expect, it } from 'vitest';
import { COTTAGES, cottageById } from '../public/game/cottages.js';
import { FRIENDS, friendById, friendDrawing, friendOnPorch } from '../public/game/friends.js';

describe('the friends', () => {
  it('are eight, each with their own id and name', () => {
    expect(FRIENDS.map((f) => `${f.name} the ${f.kind}`)).toEqual([
      'Pip the mouse',
      'Lily the frog',
      'Clover the bunny',
      'Bramble the hedgehog',
      'Shelly the snail',
      'Rusty the fox',
      'Hoot the owl',
      'Puddle the duckling',
    ]);
    expect(new Set(FRIENDS.map((f) => f.id)).size).toBe(FRIENDS.length);
  });

  it('each like something', () => {
    for (const friend of FRIENDS) expect(friend.likes).toBeTruthy();
  });

  it('are found by id, or not at all', () => {
    expect(friendById('owl').name).toBe('Hoot');
    expect(friendById('dragon')).toBeUndefined();
  });

  it('fit inside their 40 x 40 box, outline and all, so nothing is cut off', () => {
    // Each round shape's top, less half its outline, is inside the box.
    for (const friend of FRIENDS) {
      const svg = friendDrawing(friend);
      for (const shape of svg.querySelectorAll('ellipse, circle')) {
        const cy = Number(shape.getAttribute('cy'));
        const r = Number(shape.getAttribute('ry') ?? shape.getAttribute('r'));
        const stroke = Number(shape.getAttribute('stroke-width') ?? 0);
        expect(cy - r - stroke / 2, `${friend.id}`).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('are drawn on a 40 x 40 box, hidden from screen readers', () => {
    const svg = friendDrawing(friendById('mouse'));
    expect(svg.getAttribute('viewBox')).toBe('0 0 40 40');
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.querySelectorAll('ellipse, circle, path').length).toBeGreaterThan(3);
  });
});

describe('a friend on a cottage\'s porch', () => {
  it('stands beside the door, where the cottage says', () => {
    const here = friendOnPorch(friendById('owl'), cottageById('pot'));
    expect(here.className).toBe('friend-here');
    expect(here.style.getPropertyValue('--porch')).toBe(`${(70 / 120) * 100}%`);
    expect(here.querySelector('svg.friend')).not.toBeNull();
    expect(here.querySelector('.friend-bubble')).toBeNull();
  });

  it('can say hello', () => {
    const here = friendOnPorch(friendById('owl'), cottageById('pot'), 'Hi! I\'m Hoot.');
    expect(here.querySelector('.friend-bubble').textContent).toBe('Hi! I\'m Hoot.');
  });

  it('fits in front of every cottage, 24 wide on its 120', () => {
    for (const cottage of COTTAGES) {
      expect(cottage.porch).toBeGreaterThanOrEqual(0);
      expect(cottage.porch + 24).toBeLessThanOrEqual(120);
    }
  });
});
