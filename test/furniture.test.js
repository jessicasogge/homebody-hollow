// game/furniture.js: the things for a cottage's rooms, and where each goes.
import { describe, expect, it } from 'vitest';
import { arrange, FURNITURE, furnitureById, ROOM_LIMIT } from '../public/game/furniture.js';

// A room with a stretch of floor from 10 to 50 and one from 60 to 70, and a
// wall from 10 to 40.
const room = { floor: [100, [10, 50], [60, 70]], wall: [80, [10, 40]] };

describe('the furniture', () => {
  it('has a bed, a sofa, a stove, a toilet, a sink, a lamp, a picture, a rug and more, each with its own id', () => {
    const ids = FURNITURE.map((thing) => thing.id);
    expect(ids).toEqual(expect.arrayContaining(['bed', 'sofa', 'stove', 'toilet', 'sink', 'lamp', 'picture', 'rug']));
    expect(ids).not.toContain('dog-bed');
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('goes on the floor, on the wall, or under everything', () => {
    for (const thing of FURNITURE) {
      expect(['floor', 'wall', 'rug']).toContain(thing.place);
      expect(thing.width).toBeGreaterThan(0);
      expect(thing.draw(0, 20)).toContain('<');
    }
    expect(furnitureById('picture').place).toBe('wall');
    expect(furnitureById('rug').place).toBe('rug');
  });

  it('holds up to four things a room', () => {
    expect(ROOM_LIMIT).toBe(4);
  });
});

describe('arranging a room', () => {
  it('puts each thing in the furthest left spot it fits, in the order you put them in', () => {
    expect(arrange(room, ['lamp', 'bed'])).toEqual([
      { id: 'lamp', index: 0, x: 10, y: 100 },
      { id: 'bed', index: 1, x: 21, y: 100 },
    ]);
  });

  it('keeps 3 between things, and moves on to the next stretch when one is full', () => {
    // The bed and stove fill the first stretch (22 + 3 + 14 = 39 of 40).
    expect(arrange(room, ['bed', 'stove', 'lamp']).map(({ x }) => x)).toEqual([10, 35, 60]);
  });

  it('fills a gap further left before going on', () => {
    // The fireplace doesn't fit after the bed, so it goes on to the next
    // stretch; the lamp still fits after the bed.
    const wider = { floor: [100, [10, 50], [60, 80]], wall: [80, [10, 40]] };
    expect(arrange(wider, ['bed', 'fireplace', 'lamp']).map(({ x }) => x)).toEqual([10, 60, 35]);
  });

  it('hangs pictures and shelves on the wall, and draws them before the floor', () => {
    expect(arrange(room, ['bed', 'picture'])).toEqual([
      { id: 'picture', index: 1, x: 10, y: 80 },
      { id: 'bed', index: 0, x: 10, y: 100 },
    ]);
  });

  it('lays a rug furthest left on the floor, under everything, without taking up space', () => {
    expect(arrange(room, ['bed', 'rug', 'stove'])).toEqual([
      { id: 'rug', index: 1, x: 10, y: 100 },
      { id: 'bed', index: 0, x: 10, y: 100 },
      { id: 'stove', index: 2, x: 35, y: 100 },
    ]);
  });

  it('won\'t take what doesn\'t fit, too many things, two rugs, or what isn\'t a thing', () => {
    expect(arrange(room, ['bed', 'lamp', 'lamp'])).not.toBeNull();
    expect(arrange(room, ['bed', 'stove', 'lamp', 'lamp'])).toBeNull();
    expect(arrange(room, ['bed', 'sofa'])).toBeNull();
    expect(arrange(room, ['shelf', 'shelf'])).toBeNull();
    expect(arrange(room, ['lamp', 'lamp', 'lamp', 'lamp', 'lamp'])).toBeNull();
    expect(arrange(room, ['rug', 'rug'])).toBeNull();
    expect(arrange({ floor: [100, [0, 10]], wall: [80, [0, 10]] }, ['rug'])).toBeNull();
    expect(arrange(room, ['piano'])).toBeNull();
  });
});
