import { interpret } from '#interpreter';
import { decomposeSV } from '#utils';
import sleep from '@bemedev/sleep';
import { createFakeWaiter } from '@bemedev/vitest-extended';
import deepEqual from 'fast-deep-equal';
import { BLOCK_IMMO_INTERMEDIARY, machine } from './machine1.machine';
import { ASSET_1, INTERMEDIARY_1 } from './machine1.machine.fixtures';

const waiter = createFakeWaiter(vi);

vi.useFakeTimers();

describe('Complex machine 1', () => {
  const service = interpret(machine);

  beforeAll(() => {
    service.subscribe(
      state => {
        console.warn('current', '=>', state.value);
      },
      {
        equals: (a, b) => {
          return deepEqual(a.value, b.value);
        },
      },
    );
  });

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

    // console.warn(service.state.status);
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

  test("#04 => Wait the machine to be in 'proceeding' state", () =>
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
});
