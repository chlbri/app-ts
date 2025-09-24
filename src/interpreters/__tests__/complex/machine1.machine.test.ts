import { interpret } from '#interpreter';
import { decomposeSV } from '#utils';
import sleep from '@bemedev/sleep';
import { createFakeWaiter } from '@bemedev/vitest-extended';
import { BLOCK_IMMO_INTERMEDIARY, machine } from './machine1.machine';
import {
  ASSET_1,
  INTERMEDIARY_1,
  INTERMEDIARY_2,
} from './machine1.machine.fixtures';

const waiter = createFakeWaiter(vi);

vi.useFakeTimers();

describe('Complex machine 1', () => {
  const service = interpret(machine);

  afterAll(service.stop);

  test('#00 => start the machine', service.start);

  test('#01 => service add options', () => {
    service.addOptions(() => ({
      promises: {
        checkOnline: async () => {
          await sleep(100); // Simulation réseau
          return true;
        },
        getIntermediaries: async () => {
          await sleep(200);
          return [];
        },
        addIntermediary: {
          ADD_INTERMEDIARY: async ({ payload }) => {
            await sleep(100); // Simulation blockchain
            return payload;
          },
        },
      },
    }));
  });

  test('#02 => provide asset', () => {
    service.send({
      type: 'START',
      payload: {
        asset: ASSET_1,
      },
    });
  });

  describe('#03 => Check context', () => {
    test('#01 => the asset is undefined', () => {
      expect(service.select('asset')).toEqual(ASSET_1);
    });

    describe('#02 => the intermediaries', () => {
      test('#01 => should have length 1', () => {
        expect(service.select('intermediaries')).toHaveLength(1);
      });

      test('#02 => The Block_Immo intermediary is present', () => {
        expect(service.select('intermediaries')[0]).toEqual(
          BLOCK_IMMO_INTERMEDIARY,
        );
      });
    });
  });

  test("#04 => Wait the machine to be in 'workig/adding' state", () =>
    waiter(500));

  test('#05 => state is at "working.idle"', () => {
    const decomposed = decomposeSV(service.state.value);
    expect(decomposed).toContain('working.idle');
    expect(decomposed).toContain('working');
    expect(decomposed).not.toContain('working.adding');
  });

  test('#06 => add an intermediary', async () => {
    service.send({
      type: 'ADD_INTERMEDIARY',
      payload: INTERMEDIARY_1,
    });
  });

  test('#07 => state is at "working.adding"', () => {
    const decomposed = decomposeSV(service.state.value);
    expect(decomposed).toContain('working.adding');
    expect(decomposed).toContain('working');
    expect(decomposed).not.toContain('working.idle');
  });

  test('#08 => Wait the machine to be in "working.idle" state', () => {
    return waiter(150);
  });

  test('#09 => state is at "working.idle"', () => {
    const decomposed = decomposeSV(service.state.value);
    expect(decomposed).toContain('working.idle');
    expect(decomposed).toContain('working');
    expect(decomposed).not.toContain('working.adding');
  });

  describe('#10 => Check context', () => {
    test('#01 => the asset is undefined', () => {
      expect(service.select('asset')).toEqual(ASSET_1);
    });

    describe('#02 => the intermediaries', () => {
      test('#01 => should have length 1', () => {
        expect(service.select('intermediaries')).toHaveLength(2);
      });

      test('#02 => The Block_Immo intermediary is present', () => {
        expect(service.select('intermediaries')[0]).toEqual(
          BLOCK_IMMO_INTERMEDIARY,
        );
      });

      test('#03 => The new intermediary is present', () => {
        expect(service.select('intermediaries')[1]).toEqual(
          INTERMEDIARY_1,
        );
      });
    });
  });

  test('#11 => reset the context', () => {
    service.send('RESET');
  });

  describe('#12 => Check context', () => {
    test('#01 => the asset is undefined', () => {
      expect(service.select('asset')).toBeUndefined();
    });

    test('#02 => the intermediaries is an empty array', () => {
      expect(service.select('intermediaries')).toBeUndefined();
    });
  });

  test('#13 => state is at "idle"', () => {
    const decomposed = decomposeSV(service.state.value);
    expect(decomposed).toContain('idle');
    expect(decomposed).not.toContain('checking');
    expect(decomposed).not.toContain('working');
  });

  test('#14 => provide asset and a mandatory', () => {
    service.send({
      type: 'START',
      payload: {
        asset: ASSET_1,
        mandatory: INTERMEDIARY_2,
      },
    });
  });

  describe('#15 => Check context', () => {
    test('#01 => the asset is undefined', () => {
      expect(service.select('asset')).toEqual(ASSET_1);
    });

    describe('#02 => the intermediaries', () => {
      test('#01 => should have length 1', () => {
        expect(service.select('intermediaries')).toHaveLength(2);
      });

      test('#02 => The Block_Immo intermediary is present', () => {
        expect(service.select('intermediaries')[1]).toEqual(
          BLOCK_IMMO_INTERMEDIARY,
        );
      });

      test('#03 => The new intermediary is present', () => {
        expect(service.select('intermediaries')[0]).toEqual(
          INTERMEDIARY_2,
        );
      });
    });
  });

  test("16 => Wait the machine to be in 'workig/adding' state", () =>
    waiter(500));

  test('#17 => state is at "working.idle"', () => {
    const decomposed = decomposeSV(service.state.value);
    expect(decomposed).toContain('working.idle');
    expect(decomposed).toContain('working');
    expect(decomposed).not.toContain('working.adding');
  });

  test('#18 => Add the same intermediary ', () => {
    service.send({
      type: 'ADD_INTERMEDIARY',
      payload: INTERMEDIARY_2,
    });
  });

  test('#19 => state is at "working.idle"', () => {
    const decomposed = decomposeSV(service.state.value);
    expect(decomposed).toContain('working.idle');
    expect(decomposed).toContain('working');
    expect(decomposed).not.toContain('working.adding');
  });

  describe('#20 => Check context', () => {
    test('#01 => the asset is undefined', () => {
      expect(service.select('asset')).toEqual(ASSET_1);
    });

    describe('#02 => the intermediaries', () => {
      test('#01 => should have length 1', () => {
        expect(service.select('intermediaries')).toHaveLength(2);
      });

      test('#02 => The Block_Immo intermediary is present', () => {
        expect(service.select('intermediaries')[1]).toEqual(
          BLOCK_IMMO_INTERMEDIARY,
        );
      });

      test('#03 => The new intermediary is present', () => {
        expect(service.select('intermediaries')[0]).toEqual(
          INTERMEDIARY_2,
        );
      });
    });
  });

  test('#21 => Add other intermediary ', () => {
    service.send({
      type: 'ADD_INTERMEDIARY',
      payload: INTERMEDIARY_1,
    });
  });

  test('#22 => state is at "working.adding"', () => {
    const decomposed = decomposeSV(service.state.value);
    expect(decomposed).toContain('working.adding');
    expect(decomposed).toContain('working');
    expect(decomposed).not.toContain('working.idle');
  });

  test('#23 => Wait the machine to be in "working.idle" state', () =>
    waiter(150));

  test('#24 => state is at "working.idle"', () => {
    const decomposed = decomposeSV(service.state.value);
    expect(decomposed).toContain('working.idle');
    expect(decomposed).toContain('working');
    expect(decomposed).not.toContain('working.adding');
  });

  describe('#25 => Check context', () => {
    test('#01 => the asset is undefined', () => {
      expect(service.select('asset')).toEqual(ASSET_1);
    });

    describe('#02 => the intermediaries', () => {
      test('#01 => should have length 1', () => {
        expect(service.select('intermediaries')).toHaveLength(3);
      });

      test('#02 => The Block_Immo intermediary is present', () => {
        expect(service.select('intermediaries')[1]).toEqual(
          BLOCK_IMMO_INTERMEDIARY,
        );
      });

      test('#03 => The new intermediary is present', () => {
        expect(service.select('intermediaries')[0]).toEqual(
          INTERMEDIARY_2,
        );
      });

      test('#04 => The new intermediary is present', () => {
        expect(service.select('intermediaries')[2]).toEqual(
          INTERMEDIARY_1,
        );
      });
    });
  });
});
