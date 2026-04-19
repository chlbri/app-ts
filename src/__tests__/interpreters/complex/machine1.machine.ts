import { createMachine } from '#machine';
import { typings, type inferT } from '#utils/typings';
import isOnline from 'is-online';
import { asset, intermediary } from './machine1.machine.typings';
import { emptyFn } from '#fixtures';

export const BLOCK_IMMO_INTERMEDIARY: inferT<typeof intermediary> = {
  id: 'block-immo-001',
  wallet: '0xblockimmo123456',
  personality: 'company',
  companyName: 'Block Immo Services',
  registrationNumber: 'BLOCKIMMO-001',
  contacts: {
    phoneNumbers: [{ countryCode: +225, number: '0759260709' }],
    emails: ['contact@block-immo.fr'],
    websites: ['https://block-immo.fr'],
  },
};

const CHECK_DELAY = 300;

export const machine = createMachine(
  'src/__tests__/interpreters/complex/machine1.machine',
  {
    initial: 'idle',
    states: {
      idle: {
        on: {
          START: [
            {
              target: '/checking',
              description: 'Start the machine',
              guards: { and: ['assetIsDefined', 'mandatoryIsDefined'] },
              actions: [
                'provideAsset',
                'addMandatoryIntermediary',
                {
                  name: 'addBlockImmoIntermediary',
                  description:
                    'BLOCK_IMMO is here the second intermediary',
                },
              ],
            },
            {
              target: '/checking',
              description: 'Start the machine',
              guards: 'assetIsDefined',
              actions: [
                'provideAsset',
                {
                  name: 'addBlockImmoIntermediary',
                  description: 'BLOCK_IMMO is the first intermediary',
                },
              ],
            },
            {
              actions: ['error.noAsset'],
            },
          ],
        },
      },
      checking: {
        entry: 'setOnlineStatus',
        tags: ['un', 'deux'],
        after: {
          CHECK_DELAY: '/working',
        },
      },
      working: {
        initial: 'idle',
        states: {
          idle: {
            on: {
              RESET: {
                target: '/idle',
                actions: ['reset'],
              },
              ADD_INTERMEDIARY: [
                {
                  description: 'Add an intermediary',
                  guards: {
                    and: [
                      {
                        name: 'intermediariesAreNotFull',
                        description: 'Max 3/5/7 intermediaries',
                      },
                      'intermediaryIsNotAdded',
                    ],
                  },
                  target: '/working/adding',
                  actions: 'addIntermediary',
                },
                {
                  actions: ['error.addIntermediary'],
                },
              ],
            },
          },
          adding: {
            after: {
              ADD_DELAY: '/working/idle',
            },
          },
        },
      },
    },
  },
  {
    eventsMap: {
      START: {
        asset,
        mandatory: intermediary,
      },
      ADD_INTERMEDIARY: intermediary,
      RESET: 'primitive',
    },

    context: typings.partial({
      asset,
      intermediaries: typings.array(intermediary),
      internetStatus: 'boolean',
      errors: typings.partial({
        noAsset: 'string',
        intermediary: {
          offline: 'string',
        },
      }),
    }),
  },
).provideOptions(({ assign, erase, batch }) => ({
  actions: {
    provideAsset: assign('context.asset', {
      START: ({ payload, tags }) => {
        if (tags === 'deux') {
          /**EMPTY */
        }
        return payload.asset;
      },
    }),

    reset: batch(
      erase('context.asset'),
      erase('context.intermediaries'),
      erase('context.internetStatus'),
      erase('context.errors'),
    ),

    addMandatoryIntermediary: assign('context.intermediaries', {
      START: ({ payload }) => [payload.mandatory!],
    }),

    addBlockImmoIntermediary: assign('context.intermediaries', {
      START: ({ context: { intermediaries = [] } }) => [
        ...intermediaries,
        BLOCK_IMMO_INTERMEDIARY,
      ],
    }),

    'error.noAsset': assign(
      'context.errors.noAsset',
      () => 'Asset is required to start the machine',
    ),

    setOnlineStatus: assign(
      'context.internetStatus',
      () => isOnline({ timeout: CHECK_DELAY / 2 }),
      { error: emptyFn },
    ),

    addIntermediary: assign(
      'context.intermediaries',
      {
        ADD_INTERMEDIARY: async ({
          payload,
          context: { intermediaries = [] },
        }) => [...intermediaries, payload],
      },
      { error: emptyFn },
    ),

    'error.addIntermediary': assign(
      'context.errors.intermediary.offline',
      () => 'Cannot add this intermediary',
    ),
  },

  guards: {
    assetIsDefined: {
      START: ({ payload }) => !!payload.asset,
    },

    mandatoryIsDefined: {
      START: ({ payload }) => !!payload.mandatory,
    },

    intermediariesAreNotFull: ({
      context: { asset, intermediaries = [] },
    }) => {
      const value = asset!.value;
      const max = value > 30_000_000 ? 7 : value > 3_000_000 ? 5 : 3;

      return intermediaries.length < max;
    },
    intermediaryIsNotAdded: {
      ADD_INTERMEDIARY: ({
        context: { intermediaries = [] },
        payload,
      }) => {
        const check =
          payload &&
          !intermediaries.some(
            intermediary => intermediary.id === payload.id,
          );
        return check;
      },
    },
  },
  delays: {
    MAX_MUTATE: 1000,
    CHECK_DELAY,
    ADD_DELAY: 100,
  },
}));
