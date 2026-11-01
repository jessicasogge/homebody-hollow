// game/furniture.js: the things for a cottage's rooms, and where each goes.
import { describe, expect, it } from 'vitest';
import { arrange, BOX, boxes, boxesFor, FURNITURE, furnitureById, putIn, ROOM_LIMIT } from '../public/game/furniture.js';

// A room with a stretch of floor from 10 to 50 (boxes 0 to 19) and one from
// 60 to 70 (boxes 20 to 24), and a wall from 10 to 40 (boxes 0 to 14).
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

describe('the boxes in a room', () => {
  it('split each stretch of floor or wall into boxes, 2 wide', () => {
    expect(BOX).toBe(2);
    const floor = boxes(room.floor);
    expect(floor).toHaveLength(25);
    expect(floor[0]).toEqual({ left: 10, middle: 11, stretch: 0 });
    expect(floor[20]).toEqual({ left: 60, middle: 61, stretch: 1 });
  });

  it('sit in the middle of a stretch that isn\'t a whole number of boxes', () => {
    expect(boxes([0, [0, 5]])).toEqual([
      { left: 0.5, middle: 1.5, stretch: 0 },
      { left: 2.5, middle: 3.5, stretch: 0 },
    ]);
  });

  it('give each thing as many as it\'s wide', () => {
    expect(boxesFor(furnitureById('bed'))).toBe(11);
    expect(boxesFor(furnitureById('lamp'))).toBe(4);
    expect(boxesFor(furnitureById('chair'))).toBe(4);
  });
});

describe('arranging a room', () => {
  it('puts each thing in the middle of its boxes, on the floor or the wall', () => {
    expect(arrange(room, [{ id: 'bed', box: 0 }, { id: 'lamp', box: 13 }, { id: 'picture', box: 2 }])).toEqual([
      { id: 'picture', index: 2, x: 14.5, y: 80 },
      { id: 'bed', index: 0, x: 10, y: 100 },
      { id: 'lamp', index: 1, x: 36, y: 100 },
    ]);
  });

  it('keeps two empty boxes between things in the same stretch', () => {
    expect(arrange(room, [{ id: 'bed', box: 0 }, { id: 'lamp', box: 12 }])).toBeNull();
    expect(arrange(room, [{ id: 'lamp', box: 13 }, { id: 'bed', box: 0 }])).not.toBeNull();
    // Across the ladder, they can be next to each other.
    expect(arrange(room, [{ id: 'bed', box: 9 }, { id: 'lamp', box: 20 }])).not.toBeNull();
  });

  it('lays a rug under everything, without taking up their space', () => {
    expect(arrange(room, [{ id: 'bed', box: 0 }, { id: 'rug', box: 0 }])[0]).toEqual({ id: 'rug', index: 1, x: 10, y: 100 });
  });

  it('won\'t take too many things, things off the end of a stretch, or what isn\'t a thing', () => {
    expect(arrange(room, [{ id: 'bed', box: 15 }])).toBeNull();
    expect(arrange(room, [{ id: 'lamp', box: -1 }])).toBeNull();
    expect(arrange(room, [{ id: 'lamp', box: 1.5 }])).toBeNull();
    expect(arrange(room, [{ id: 'piano', box: 0 }])).toBeNull();
    const four = [0, 6, 12, 20].map((box) => ({ id: 'chair', box }));
    expect(arrange(room, four)).not.toBeNull();
    expect(arrange(room, [...four, { id: 'picture', box: 0 }])).toBeNull();
  });
});

describe('putting a thing in a room', () => {
  it('puts it where you tap', () => {
    expect(putIn(room, [], 'lamp', 40)).toEqual([{ id: 'lamp', box: 13 }]);
    expect(putIn(room, [], 'picture', 21)).toEqual([{ id: 'picture', box: 3 }]);
  });

  it('moves it over a little, if it\'s too close to something there', () => {
    const things = [{ id: 'lamp', box: 13 }];
    expect(putIn(room, things, 'chair', 34)).toEqual([...things, { id: 'chair', box: 7 }]);
  });

  it('won\'t put it far from where you tapped', () => {
    expect(putIn(room, [{ id: 'bed', box: 0 }], 'lamp', 20)).toBeNull();
  });

  it('with no tap, puts it in the furthest left boxes it fits', () => {
    expect(putIn(room, [{ id: 'bed', box: 0 }], 'lamp')).toEqual([{ id: 'bed', box: 0 }, { id: 'lamp', box: 13 }]);
  });

  it('won\'t put a fifth thing in a room', () => {
    const four = [0, 6, 12, 20].map((box) => ({ id: 'chair', box }));
    expect(putIn(room, four, 'picture')).toBeNull();
  });
});
