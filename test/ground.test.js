// @vitest-environment jsdom
// game/ground.js: the grass and winding dirt road under the home page's
// cottages, with a flower on each plant.
import { describe, expect, it } from 'vitest';
import { groundDrawing, PLANTS, ROAD } from '../public/game/ground.js';

describe('the ground', () => {
  it('is a picture only, hidden from screen readers', () => {
    const svg = groundDrawing();
    expect(svg.tagName).toBe('svg');
    expect(svg.getAttribute('class')).toBe('ground');
    expect(svg.getAttribute('aria-hidden')).toBe('true');
  });

  it('is cropped, not squashed, on a narrow screen', () => {
    const svg = groundDrawing();
    expect(svg.getAttribute('viewBox')).toBe('0 0 960 110');
    expect(svg.getAttribute('preserveAspectRatio')).toBe('xMidYMid slice');
  });

  it('has grass and a road', () => {
    const svg = groundDrawing();
    expect(svg.querySelector('.grass')).not.toBeNull();
    expect(svg.querySelector('.road').getAttribute('d')).toBe(ROAD);
  });

  it('has one flower on every plant, and no more', () => {
    const svg = groundDrawing();
    const plants = svg.querySelectorAll('.plant');
    expect(plants).toHaveLength(PLANTS.length);
    for (const plant of plants) {
      expect(plant.querySelectorAll('.flower')).toHaveLength(1);
      expect(plant.querySelectorAll('.flower circle')).toHaveLength(5); // five petals
    }
  });

  it('mixes the flowers\' colors', () => {
    const colors = [...groundDrawing().querySelectorAll('.flower circle:first-child')].map((c) =>
      c.getAttribute('fill'),
    );
    expect(new Set(colors).size).toBe(5);
  });
});

// The road's middle, as points: the path is a start point then cubic curves
// (C, and S, which mirrors the last control point), so it's walked here
// step by step.
function roadPoints() {
  const parts = ROAD.match(/[MCS]|-?\d+(?:\.\d+)?/g);
  const points = [];
  let cur;
  let lastCtrl;
  for (let i = 0; i < parts.length; ) {
    const cmd = parts[i++];
    const nums = (n) => parts.slice(i, (i += n)).map(Number);
    if (cmd === 'M') {
      const [x, y] = nums(2);
      cur = [x, y];
      continue;
    }
    let c1;
    let c2;
    let end;
    if (cmd === 'C') {
      const n = nums(6);
      [c1, c2, end] = [n.slice(0, 2), n.slice(2, 4), n.slice(4, 6)];
    } else {
      const n = nums(4);
      c1 = [2 * cur[0] - lastCtrl[0], 2 * cur[1] - lastCtrl[1]];
      [c2, end] = [n.slice(0, 2), n.slice(2, 4)];
    }
    for (let s = 0; s <= 100; s++) {
      const t = s / 100;
      const m = 1 - t;
      const at = (k) => m ** 3 * cur[k] + 3 * m * m * t * c1[k] + 3 * m * t * t * c2[k] + t ** 3 * end[k];
      points.push([at(0), at(1)]);
    }
    lastCtrl = c2;
    cur = end;
  }
  return points;
}

describe('the flowers and the road', () => {
  const road = roadPoints();
  const ROAD_HALF_WIDTH = 17; // the road's outline is 34 wide
  const FLOWER_RADIUS = 5.2; // its petals reach this far from its middle

  it('walks the road from one side of the picture to the other', () => {
    expect(road[0][0]).toBe(0);
    expect(road.at(-1)[0]).toBe(960);
  });

  it.each(PLANTS)('the flower at %i, %i is clear of the road', (x, y) => {
    const flower = [x, y - 12];
    const nearest = Math.min(...road.map(([rx, ry]) => Math.hypot(rx - flower[0], ry - flower[1])));
    expect(nearest - ROAD_HALF_WIDTH - FLOWER_RADIUS).toBeGreaterThan(2);
  });
});
