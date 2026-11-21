// @vitest-environment jsdom
// game/track.js: counting game events on GoatCounter.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { track } from '../public/game/track.js';

afterEach(() => {
  delete window.goatcounter;
});

describe('counting an event', () => {
  it('counts it as an event under homebody-hollow/, apart from PetriPals', () => {
    window.goatcounter = { count: vi.fn() };
    track('moved-in/teacup', 'Moved in a Teacup Cottage');
    expect(window.goatcounter.count).toHaveBeenCalledWith({
      path: 'homebody-hollow/moved-in/teacup',
      title: 'Moved in a Teacup Cottage',
      event: true,
    });
  });

  it('uses the name as the title if there isn\'t one', () => {
    window.goatcounter = { count: vi.fn() };
    track('cleared-village');
    expect(window.goatcounter.count).toHaveBeenCalledWith(expect.objectContaining({ title: 'cleared-village' }));
  });

  it('does nothing if GoatCounter didn\'t load (an ad blocker, or offline)', () => {
    expect(() => track('moved-in/boot')).not.toThrow();
  });

  it('never breaks the game if counting fails', () => {
    window.goatcounter = {
      count: () => {
        throw new Error('no');
      },
    };
    expect(() => track('moved-in/boot')).not.toThrow();
  });
});
