import tupleOf from '#bemedev/features/arrays/castings/tuple';
import type { Keys } from '#bemedev/globals/types';
import { interpret } from '#interpreter';
import { createMachine } from '#machine';
import { type StateValue } from '#states';
import { typings } from '#utils';
import { createFakeWaiter } from '@bemedev/vitest-extended';
import { __tsSchema } from './machine.real.gen';
import type { inferT } from 'src/utils/typings';

beforeAll(() => {
  vi.useFakeTimers();
});

describe('REAL LIFE TESTS', () => {
  describe('#01 => Real life testing', () => {
    const actions = {
      exit: 'inc',
      entry: 'inc',
    } as const;

    const machine = createMachine(
      {
        __tsSchema,
        initial: 'idle',
        ...actions,
        states: {
          idle: {
            ...actions,
            on: {
              NEXT: '/parallel',
            },
            description: 'First state',
          },
          compound: {
            ...actions,
            on: {
              NEXT: '/idle',
            },
            initial: 'idle',
            states: {
              idle: {
                ...actions,
                on: {
                  NEXT: '/compound/next',
                },
              },
              next: {
                ...actions,
                on: {
                  PREVIOUS: '/compound/idle',
                  NEXT: '/parallel',
                },
              },
            },
          },
          parallel: {
            ...actions,
            on: {
              PREVIOUS: '/compound/next',
            },
            type: 'parallel',
            states: {
              atomic: {
                initial: 'idle',
                ...actions,
                on: {
                  NEXT: '/idle',
                },

                states: {
                  idle: {
                    entry: 'inc',
                    on: {
                      NEXT: '/parallel/atomic/next',
                    },
                  },
                  next: {
                    ...actions,
                    on: {
                      PREVIOUS: '/parallel/atomic/idle',
                    },
                  },
                },
              },
              compound: {
                ...actions,
                on: {
                  NEXT: '/compound/next',
                },
                initial: 'idle',
                states: {
                  idle: {
                    ...actions,
                    on: {
                      NEXT: '/parallel/compound/next',
                    },
                  },
                  next: {
                    ...actions,
                    on: {
                      NEXT: '/compound/idle',
                    },
                  },
                },
              },
            },
          },
        },
      },
      typings({
        eventsMap: {
          NEXT: 'primitive',
          PREVIOUS: 'primitive',
        },
        context: 'number',
      }),
    ).provideOptions(({ assign }) => ({
      actions: {
        inc: assign('context', ({ context }) => context + 1),
      },
    }));

    const service = interpret(machine, {
      context: 0,
    });

    // #region Hooks
    type SE = Parameters<typeof service.send>[0];

    const useSend = (event: SE, index: number) => {
      const invite = `#${index < 10 ? '0' + index : index} => Send a "${(event as any).type ?? event}" event`;

      return tupleOf(invite, () => service.send(event));
    };

    const useIterator = (num: number, index: number) => {
      const invite = `#${index < 10 ? '0' + index : index} => iterator is "${num}"`;
      return tupleOf(invite, async () => {
        expect(service.state.context).toBe(num);
      });
    };

    const useValue = (value: StateValue, index: number) => {
      const invite = `#${index < 10 ? '0' + index : index} => value match`;
      return tupleOf(invite, () => {
        expect(service.state.value).toEqual(value);
      });
    };

    // #endregion

    describe('TESTS', () => {
      test('#00 => start the machine', service.start);

      test(...useValue('idle', 1));
      test(...useIterator(2, 2));
      test(...useSend('NEXT', 3));

      test(
        ...useValue(
          {
            parallel: {
              atomic: 'idle',
              compound: 'idle',
            },
          },
          4,
        ),
      );

      test(...useIterator(8, 5));

      test(...useSend('NEXT', 6));

      test(
        ...useValue(
          {
            parallel: {
              atomic: 'next',
              compound: 'next',
            },
          },
          7,
        ),
      );

      test(...useIterator(11, 8));

      test(...useSend('NEXT', 9));

      test(
        ...useValue(
          {
            compound: 'idle',
          },
          10,
        ),
      );

      test(...useIterator(18, 11));

      test(...useSend('PREVIOUS', 12));

      test(
        ...useValue(
          {
            compound: 'idle',
          },
          13,
        ),
      );

      test(...useIterator(18, 14));

      test(...useSend('NEXT', 15));

      test(
        ...useValue(
          {
            compound: 'next',
          },
          16,
        ),
      );

      test(...useIterator(20, 17));

      test(...useSend('PREVIOUS', 18));

      test(...useValue({ compound: 'idle' }, 19));

      test(...useIterator(22, 20));

      test(...useSend('NEXT', 21));

      test(
        ...useValue(
          {
            compound: 'next',
          },
          22,
        ),
      );

      test(...useIterator(24, 23));
    });
  });

  describe('#02 => Cover', () => {
    const io = {
      exit: 'inc',
      entry: 'inc',
    } as const;

    const machine = createMachine(
      {
        initial: 'idle',
        states: {
          idle: {
            ...io,
            on: {
              NEXT: '/parallel',
            },
          },
          parallel: {
            ...io,
            type: 'parallel',
            states: {
              atomic: {
                ...io,
                initial: 'idle',

                states: {
                  idle: {
                    ...io,
                    on: {
                      NEXT: {
                        target: '/parallel/atomic/next',
                      },
                    },
                  },
                  next: {
                    ...io,
                    on: {
                      PREVIOUS: '/parallel/atomic/idle',
                      NEXT: '/parallel/atomic/idle',
                    },
                  },
                },
              },
              compound: {
                ...io,
                initial: 'idle',

                states: {
                  idle: {
                    ...io,
                    on: {
                      NEXT: {
                        target: '/parallel/compound/compound',
                      },
                    },
                  },
                  compound: {
                    ...io,
                    initial: 'idle',
                    states: {
                      idle: {
                        ...io,
                        on: {
                          NEXT: '/parallel/compound/compound/next',
                        },
                      },
                      next: {
                        ...io,
                        on: {
                          PREVIOUS: '/parallel/compound/compound/idle',
                          NEXT: '/idle',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      typings({
        eventsMap: {
          NEXT: 'primitive',
          PREVIOUS: 'primitive',
        },
        context: 'number',
      }),
    ).provideOptions(({ assign }) => ({
      actions: {
        inc: assign('context', ({ context }) => context + 1),
      },
    }));

    const service = interpret(machine, {
      context: 0,
    });

    // #region Hooks
    type SE = Parameters<typeof service.send>[0];

    const useSend = (event: SE, index: number) => {
      const invite = `#${index < 10 ? '0' + index : index} => Send a "${(event as any).type ?? event}" event`;

      return tupleOf(invite, () => service.send(event));
    };

    const useIterator = (num: number, index: number) => {
      const invite = `#${index < 10 ? '0' + index : index} => iterator is "${num}"`;
      return tupleOf(invite, async () => {
        expect(service.state.context).toBe(num);
      });
    };

    const useValue = (value: StateValue, index: number) => {
      const invite = `#${index < 10 ? '0' + index : index} => values matchs`;
      return tupleOf(invite, () => {
        expect(service.state.value).toEqual(value);
      });
    };

    // #endregion

    describe('TESTS', () => {
      test('#00 => start the machine', service.start);
      test(...useValue('idle', 1));
      test(...useIterator(1, 2));
      test(...useSend('NEXT', 3));
      test(
        ...useValue(
          {
            parallel: {
              atomic: 'idle',
              compound: 'idle',
            },
          },
          4,
        ),
      );
      test(...useIterator(7, 5));
      test(...useSend('NEXT', 6));
      test(
        ...useValue(
          {
            parallel: {
              atomic: 'next',
              compound: {
                compound: 'idle',
              },
            },
          },
          7,
        ),
      );
      test(...useIterator(12, 8));
      test(...useSend('PREVIOUS', 9));
      test(...useIterator(14, 10));
      test(...useSend('NEXT', 11));
      test(
        ...useValue(
          {
            parallel: {
              atomic: 'next',
              compound: {
                compound: 'next',
              },
            },
          },
          12,
        ),
      );
      test(...useIterator(18, 13));
      test(...useSend('NEXT', 14));
      test(...useValue('idle', 15));
      test(...useIterator(25, 16));

      test('#26 => #Decomposed', () => {
        const expected = {
          initial: 'idle',
          states: {
            idle: {
              exit: 'inc',
              entry: 'inc',
              on: {
                NEXT: '/parallel',
              },
            },
            parallel: {
              exit: 'inc',
              entry: 'inc',
              type: 'parallel',
              states: {
                atomic: {
                  exit: 'inc',
                  entry: 'inc',
                  initial: 'idle',
                  states: {
                    idle: {
                      exit: 'inc',
                      entry: 'inc',
                      on: {
                        NEXT: {
                          target: '/parallel/atomic/next',
                        },
                      },
                    },
                    next: {
                      exit: 'inc',
                      entry: 'inc',
                      on: {
                        PREVIOUS: '/parallel/atomic/idle',
                        NEXT: '/parallel/atomic/idle',
                      },
                    },
                  },
                },
                compound: {
                  exit: 'inc',
                  entry: 'inc',
                  initial: 'idle',
                  states: {
                    idle: {
                      exit: 'inc',
                      entry: 'inc',
                      on: {
                        NEXT: {
                          target: '/parallel/compound/compound',
                        },
                      },
                    },
                    compound: {
                      exit: 'inc',
                      entry: 'inc',
                      initial: 'idle',
                      states: {
                        idle: {
                          exit: 'inc',
                          entry: 'inc',
                          on: {
                            NEXT: '/parallel/compound/compound/next',
                          },
                        },
                        next: {
                          exit: 'inc',
                          entry: 'inc',
                          on: {
                            PREVIOUS: '/parallel/compound/compound/idle',
                            NEXT: '/idle',
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          'states.idle': {
            exit: 'inc',
            entry: 'inc',
            on: {
              NEXT: '/parallel',
            },
          },
          'states.idle.exit': 'inc',
          'states.idle.entry': 'inc',
          'states.idle.on': {
            NEXT: '/parallel',
          },
          'states.idle.on.NEXT': '/parallel',
          'states.parallel': {
            exit: 'inc',
            entry: 'inc',
            type: 'parallel',
            states: {
              atomic: {
                exit: 'inc',
                entry: 'inc',
                initial: 'idle',
                states: {
                  idle: {
                    exit: 'inc',
                    entry: 'inc',
                    on: {
                      NEXT: {
                        target: '/parallel/atomic/next',
                      },
                    },
                  },
                  next: {
                    exit: 'inc',
                    entry: 'inc',
                    on: {
                      PREVIOUS: '/parallel/atomic/idle',
                      NEXT: '/parallel/atomic/idle',
                    },
                  },
                },
              },
              compound: {
                exit: 'inc',
                entry: 'inc',
                initial: 'idle',
                states: {
                  idle: {
                    exit: 'inc',
                    entry: 'inc',
                    on: {
                      NEXT: {
                        target: '/parallel/compound/compound',
                      },
                    },
                  },
                  compound: {
                    exit: 'inc',
                    entry: 'inc',
                    initial: 'idle',
                    states: {
                      idle: {
                        exit: 'inc',
                        entry: 'inc',
                        on: {
                          NEXT: '/parallel/compound/compound/next',
                        },
                      },
                      next: {
                        exit: 'inc',
                        entry: 'inc',
                        on: {
                          PREVIOUS: '/parallel/compound/compound/idle',
                          NEXT: '/idle',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          'states.parallel.exit': 'inc',
          'states.parallel.entry': 'inc',
          'states.parallel.type': 'parallel',
          'states.parallel.states': {
            atomic: {
              exit: 'inc',
              entry: 'inc',
              initial: 'idle',
              states: {
                idle: {
                  exit: 'inc',
                  entry: 'inc',
                  on: {
                    NEXT: {
                      target: '/parallel/atomic/next',
                    },
                  },
                },
                next: {
                  exit: 'inc',
                  entry: 'inc',
                  on: {
                    PREVIOUS: '/parallel/atomic/idle',
                    NEXT: '/parallel/atomic/idle',
                  },
                },
              },
            },
            compound: {
              exit: 'inc',
              entry: 'inc',
              initial: 'idle',
              states: {
                idle: {
                  exit: 'inc',
                  entry: 'inc',
                  on: {
                    NEXT: {
                      target: '/parallel/compound/compound',
                    },
                  },
                },
                compound: {
                  exit: 'inc',
                  entry: 'inc',
                  initial: 'idle',
                  states: {
                    idle: {
                      exit: 'inc',
                      entry: 'inc',
                      on: {
                        NEXT: '/parallel/compound/compound/next',
                      },
                    },
                    next: {
                      exit: 'inc',
                      entry: 'inc',
                      on: {
                        PREVIOUS: '/parallel/compound/compound/idle',
                        NEXT: '/idle',
                      },
                    },
                  },
                },
              },
            },
          },
          'states.parallel.states.atomic': {
            exit: 'inc',
            entry: 'inc',
            initial: 'idle',
            states: {
              idle: {
                exit: 'inc',
                entry: 'inc',
                on: {
                  NEXT: {
                    target: '/parallel/atomic/next',
                  },
                },
              },
              next: {
                exit: 'inc',
                entry: 'inc',
                on: {
                  PREVIOUS: '/parallel/atomic/idle',
                  NEXT: '/parallel/atomic/idle',
                },
              },
            },
          },
          'states.parallel.states.atomic.exit': 'inc',
          'states.parallel.states.atomic.entry': 'inc',
          'states.parallel.states.atomic.initial': 'idle',
          'states.parallel.states.atomic.states': {
            idle: {
              exit: 'inc',
              entry: 'inc',
              on: {
                NEXT: {
                  target: '/parallel/atomic/next',
                },
              },
            },
            next: {
              exit: 'inc',
              entry: 'inc',
              on: {
                PREVIOUS: '/parallel/atomic/idle',
                NEXT: '/parallel/atomic/idle',
              },
            },
          },
          'states.parallel.states.atomic.states.idle': {
            exit: 'inc',
            entry: 'inc',
            on: {
              NEXT: {
                target: '/parallel/atomic/next',
              },
            },
          },
          'states.parallel.states.atomic.states.idle.exit': 'inc',
          'states.parallel.states.atomic.states.idle.entry': 'inc',
          'states.parallel.states.atomic.states.idle.on': {
            NEXT: {
              target: '/parallel/atomic/next',
            },
          },
          'states.parallel.states.atomic.states.idle.on.NEXT': {
            target: '/parallel/atomic/next',
          },
          'states.parallel.states.atomic.states.idle.on.NEXT.target':
            '/parallel/atomic/next',
          'states.parallel.states.atomic.states.next': {
            exit: 'inc',
            entry: 'inc',
            on: {
              PREVIOUS: '/parallel/atomic/idle',
              NEXT: '/parallel/atomic/idle',
            },
          },
          'states.parallel.states.atomic.states.next.exit': 'inc',
          'states.parallel.states.atomic.states.next.entry': 'inc',
          'states.parallel.states.atomic.states.next.on': {
            PREVIOUS: '/parallel/atomic/idle',
            NEXT: '/parallel/atomic/idle',
          },
          'states.parallel.states.atomic.states.next.on.PREVIOUS':
            '/parallel/atomic/idle',
          'states.parallel.states.atomic.states.next.on.NEXT':
            '/parallel/atomic/idle',
          'states.parallel.states.compound': {
            exit: 'inc',
            entry: 'inc',
            initial: 'idle',
            states: {
              idle: {
                exit: 'inc',
                entry: 'inc',
                on: {
                  NEXT: {
                    target: '/parallel/compound/compound',
                  },
                },
              },
              compound: {
                exit: 'inc',
                entry: 'inc',
                initial: 'idle',
                states: {
                  idle: {
                    exit: 'inc',
                    entry: 'inc',
                    on: {
                      NEXT: '/parallel/compound/compound/next',
                    },
                  },
                  next: {
                    exit: 'inc',
                    entry: 'inc',
                    on: {
                      PREVIOUS: '/parallel/compound/compound/idle',
                      NEXT: '/idle',
                    },
                  },
                },
              },
            },
          },
          'states.parallel.states.compound.exit': 'inc',
          'states.parallel.states.compound.entry': 'inc',
          'states.parallel.states.compound.initial': 'idle',
          'states.parallel.states.compound.states': {
            idle: {
              exit: 'inc',
              entry: 'inc',
              on: {
                NEXT: {
                  target: '/parallel/compound/compound',
                },
              },
            },
            compound: {
              exit: 'inc',
              entry: 'inc',
              initial: 'idle',
              states: {
                idle: {
                  exit: 'inc',
                  entry: 'inc',
                  on: {
                    NEXT: '/parallel/compound/compound/next',
                  },
                },
                next: {
                  exit: 'inc',
                  entry: 'inc',
                  on: {
                    PREVIOUS: '/parallel/compound/compound/idle',
                    NEXT: '/idle',
                  },
                },
              },
            },
          },
          'states.parallel.states.compound.states.idle': {
            exit: 'inc',
            entry: 'inc',
            on: {
              NEXT: {
                target: '/parallel/compound/compound',
              },
            },
          },
          'states.parallel.states.compound.states.idle.exit': 'inc',
          'states.parallel.states.compound.states.idle.entry': 'inc',
          'states.parallel.states.compound.states.idle.on': {
            NEXT: {
              target: '/parallel/compound/compound',
            },
          },
          'states.parallel.states.compound.states.idle.on.NEXT': {
            target: '/parallel/compound/compound',
          },
          'states.parallel.states.compound.states.idle.on.NEXT.target':
            '/parallel/compound/compound',
          'states.parallel.states.compound.states.compound': {
            exit: 'inc',
            entry: 'inc',
            initial: 'idle',
            states: {
              idle: {
                exit: 'inc',
                entry: 'inc',
                on: {
                  NEXT: '/parallel/compound/compound/next',
                },
              },
              next: {
                exit: 'inc',
                entry: 'inc',
                on: {
                  PREVIOUS: '/parallel/compound/compound/idle',
                  NEXT: '/idle',
                },
              },
            },
          },
          'states.parallel.states.compound.states.compound.exit': 'inc',
          'states.parallel.states.compound.states.compound.entry': 'inc',
          'states.parallel.states.compound.states.compound.initial':
            'idle',
          'states.parallel.states.compound.states.compound.states': {
            idle: {
              exit: 'inc',
              entry: 'inc',
              on: {
                NEXT: '/parallel/compound/compound/next',
              },
            },
            next: {
              exit: 'inc',
              entry: 'inc',
              on: {
                PREVIOUS: '/parallel/compound/compound/idle',
                NEXT: '/idle',
              },
            },
          },
          'states.parallel.states.compound.states.compound.states.idle': {
            exit: 'inc',
            entry: 'inc',
            on: {
              NEXT: '/parallel/compound/compound/next',
            },
          },
          'states.parallel.states.compound.states.compound.states.idle.exit':
            'inc',
          'states.parallel.states.compound.states.compound.states.idle.entry':
            'inc',
          'states.parallel.states.compound.states.compound.states.idle.on':
            {
              NEXT: '/parallel/compound/compound/next',
            },
          'states.parallel.states.compound.states.compound.states.idle.on.NEXT':
            '/parallel/compound/compound/next',
          'states.parallel.states.compound.states.compound.states.next': {
            exit: 'inc',
            entry: 'inc',
            on: {
              PREVIOUS: '/parallel/compound/compound/idle',
              NEXT: '/idle',
            },
          },
          'states.parallel.states.compound.states.compound.states.next.exit':
            'inc',
          'states.parallel.states.compound.states.compound.states.next.entry':
            'inc',
          'states.parallel.states.compound.states.compound.states.next.on':
            {
              PREVIOUS: '/parallel/compound/compound/idle',
              NEXT: '/idle',
            },
          'states.parallel.states.compound.states.compound.states.next.on.PREVIOUS':
            '/parallel/compound/compound/idle',
          'states.parallel.states.compound.states.compound.states.next.on.NEXT':
            '/idle',
        };

        expect(machine.decomposed).toEqual(expected);
      });
    });
  });

  describe('#03 => Real life testing #2', () => {
    const state = typings.litterals('registration', 'registered', 'idle');
    // type State = 'registration' | 'registered' | 'idle';

    const csvData = typings.record(typings.union('string', 'number'));

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const deep = typings.union(
      'string',
      'number',
      typings.array(typings.union('string', 'number')),
    );

    type CSVDataDeep = inferT<typeof deep> | CsvDataMap;
    interface CsvDataMap {
      [key: Keys]: CSVDataDeep;
    }
    const csvDataDeep = typings.custom<CSVDataDeep>();

    const lang = typings.litterals('en', 'es', 'fr');

    const fieldType = typings.litterals(
      'number',
      'date',
      'conditional',
      'text',
      'select',
      'checkbox',
      'color',
      'email',
      'time',
      'url',
      'tel',
      'datetime-local',
      'image',
      'file',
      'week',
    );

    const field = typings.any({
      label: 'string',
      type: fieldType,
      options: typings.maybe(['string']),
      data: typings.maybe(
        typings.partial({
          data: [csvData],
          headers: ['string'],
          merged: csvDataDeep,
          name: 'string',
        }),
      ),
    });

    const mainMachine = createMachine(
      {
        initial: 'idle',
        states: {
          idle: {
            entry: 'prepare',
            always: '/working',
          },
          working: {
            on: {
              CHANGE_LANG: {
                actions: ['changeLang'],
              },
              REMOVE: {
                actions: ['remove'],
              },
              ADD: {
                actions: ['add'],
              },
              UPDATE: {
                actions: 'update',
              },
              'UPDATE:NOW': {
                actions: 'update:now',
              },
              'FIELDS:REGISTER': {
                actions: ['fields.register', 'fields.register.finish'],
                target: '/working/register',
              },
              'FIELDS:MODIFY': {
                actions: ['fields.modify'],
                target: '/working/idle',
              },
            },

            initial: 'idle',

            states: {
              idle: {},

              register: {
                on: {
                  'VALUES:REGISTER': {
                    actions: [
                      'values.start.register',
                      'values.register',
                      'values.register.finish',
                    ],
                  },
                  'VALUES:MODIFY': {
                    actions: ['values.modify'],
                  },
                },
              },
            },
          },
        },
      },
      typings({
        context: typings.partial({
          lang,
          fields: [field],
          responses: typings.soa('string'),
          states: typings.partial({
            fields: state,
            values: state,
          }),
          values: typings.record('string'),
        }),
        eventsMap: {
          CHANGE_LANG: { lang },
          REMOVE: { index: 'number' },
          ADD: 'primitive',
          UPDATE: {
            index: 'number',
            value: typings.partial(field),
          },
          'UPDATE:NOW': {
            index: 'number',
            value: field,
          },
          'FIELDS:REGISTER': 'primitive',
          'FIELDS:MODIFY': 'primitive',
          'VALUES:REGISTER': typings.record('string'),
          'VALUES:MODIFY': 'primitive',
        },
      }),
    ).provideOptions(({ assign, debounce }) => ({
      actions: {
        changeLang: debounce(
          assign('context.lang', {
            CHANGE_LANG: ({ payload: { lang } }) => {
              return lang;
            },
          }),
          { ms: 500, id: 'change-lang' },
        ),

        add: assign('context.fields', ({ context: { fields } }) => {
          fields?.push({ label: '', type: 'text' });
          return fields;
        }),

        remove: assign('context.fields', {
          REMOVE: ({ context: { fields }, payload: { index } }) => {
            fields?.splice(index, 1);
            return fields;
          },
        }),

        update: debounce(
          assign('context.fields', {
            UPDATE: ({
              context: { fields },
              payload: { index, value },
            }) => {
              if (!fields) return;
              fields[index] = { ...fields[index], ...value };
              return fields;
            },
          }),
          { ms: 500, id: 'update-field' },
        ),

        'update:now': assign('context.fields', {
          'UPDATE:NOW': ({
            context: { fields },
            payload: { index, value },
          }) => {
            if (!fields) return;
            fields[index] = value;
            return fields;
          },
        }),

        // #region Fields
        'fields.register': assign(
          'context.states.fields',
          () => 'registration',
        ),

        'fields.register.finish': debounce(
          assign('context.states.fields', () => 'registered'),
          { ms: 500, id: 'register-fields-finish' },
        ),

        'fields.modify': assign('context.states.fields', () => 'idle'),
        // #endregion

        // #region Values
        'values.start.register': assign(
          'context.states.values',
          () => 'registration',
        ),

        'values.register': assign('context.values', {
          'VALUES:REGISTER': ({ payload }) => payload,
        }),

        'values.register.finish': debounce(
          assign('context.states.values', () => 'registered'),
          { ms: 500, id: 'register-values-finish' },
        ),

        'values.modify': assign('context.states.values', () => 'idle'),
        // #endregion

        /**
         * Prepare at starting point
         * @returns
         */
        prepare: assign('context', () => {
          const current = { label: '', type: 'text' } as inferT<
            typeof field
          >;

          return {
            fields: [structuredClone(current)],
            lang: 'en',
            states: {
              fields: 'idle',
              values: 'idle',
            },
          };
        }),
      },
    }));

    const service = interpret(mainMachine);

    // #region Hooks
    type SE = Parameters<typeof service.send>[0];

    const useSend = (event: SE, index: number) => {
      const invite = `#${index < 10 ? '0' + index : index} => Send a "${(event as any).type ?? event}" event`;

      return tupleOf(invite, () => service.send(event));
    };

    const useWaiter = createFakeWaiter.withDefaultDelay(vi, 500);

    const useLang = (_lang: inferT<typeof lang>, index: number) => {
      const invite = `#${index < 10 ? '0' + index : index} => Language should be ${_lang}`;
      return tupleOf(invite, () => {
        expect(service.select('lang')).toEqual(_lang);
      });
    };

    const useValue = (value: inferT<typeof typings.sv>, index: number) => {
      const invite = `#${index < 10 ? '0' + index : index} => value match`;
      return tupleOf(invite, () => {
        expect(service.state.value).toEqual(value);
      });
    };

    // #endregion

    describe('TESTS', () => {
      test('#00 => start the machine', service.start);
      test(...useValue({ working: 'idle' }, 1));
      test('#02 => Context should be initialized', () => {
        expect(service.state.context).toEqual({
          fields: [{ label: '', type: 'text' }],
          lang: 'en',
          states: {
            fields: 'idle',
            values: 'idle',
          },
        });
      });
      test(
        ...useSend({ type: 'CHANGE_LANG', payload: { lang: 'fr' } }, 3),
      );
      test(...useLang('en', 4));
      test(...useWaiter(5, 1));
      test(...useLang('fr', 6));
      test(...useSend('ADD', 7));
      describe('#08 => Should add a new field', () => {
        test('#08.01 => Should have two fields', () => {
          expect(service.state.context.fields).toHaveLength(2);
        });
        test('#08.01 => These 2 are same', () => {
          expect(service.state.context.fields?.[0]).toEqual({
            label: '',
            type: 'text',
          });
          expect(service.state.context.fields?.[1]).toEqual({
            label: '',
            type: 'text',
          });
          expect(service.state.context.fields?.[0]).toEqual(
            service.state.context.fields?.[1],
          );
        });
      });
      test(
        ...useSend(
          {
            type: 'UPDATE',
            payload: {
              index: 0,
              value: { label: 'Name', type: 'text' },
            },
          },
          9,
        ),
      );
      describe('#10 => Fiels are not changed', () => {
        test('#08.01 => Should have two fields', () => {
          expect(service.state.context.fields).toHaveLength(2);
        });
        test('#08.01 => These 2 are same', () => {
          expect(service.state.context.fields?.[0]).toEqual({
            label: '',
            type: 'text',
          });
          expect(service.state.context.fields?.[1]).toEqual({
            label: '',
            type: 'text',
          });
          expect(service.state.context.fields?.[0]).toEqual(
            service.state.context.fields?.[1],
          );
        });
      });
      test(...useWaiter(11, 1));
      test('#12 => Should update first field', () => {
        expect(service.state.context.fields?.[0]).toEqual({
          label: 'Name',
          type: 'text',
        });
      });
      test(
        ...useSend(
          {
            type: 'UPDATE:NOW',
            payload: {
              index: 1,
              value: { label: 'Email', type: 'email' },
            },
          },
          9,
        ),
      );
      test('#10 => Should immediately update second field', () => {
        expect(service.state.context.fields?.[1]).toEqual({
          label: 'Email',
          type: 'email',
        });
      });
      test(...useSend({ type: 'FIELDS:REGISTER', payload: {} }, 11));
      test(...useValue({ working: 'register' }, 12));
      test('#13 => Fields state should be registration', () => {
        expect(service.state.context.states?.fields).toBe('registration');
      });
      test(
        ...useSend(
          {
            type: 'VALUES:REGISTER',
            payload: {
              name: 'John Doe',
              email: 'john@example.com',
            },
          },
          14,
        ),
      );
      test('#15 => Values should be registered', () => {
        expect(service.state.context.values).toEqual({
          name: 'John Doe',
          email: 'john@example.com',
        });
        expect(service.state.context.states?.values).toBe('registration');
      });
      test(...useSend({ type: 'VALUES:MODIFY', payload: {} }, 16));
      test('#17 => Values state should be idle', () => {
        expect(service.state.context.states?.values).toBe('idle');
      });
      test(...useSend({ type: 'FIELDS:MODIFY', payload: {} }, 18));
      test(...useValue({ working: 'idle' }, 19));
      test('#20 => Fields state should be idle', () => {
        expect(service.state.context.states?.fields).toBe('idle');
      });
      test(...useSend({ type: 'REMOVE', payload: { index: 1 } }, 21));
      test('#22 => Should remove second field', () => {
        expect(service.state.context.fields).toHaveLength(1);
        expect(service.state.context.fields?.[0]).toEqual({
          label: 'Name',
          type: 'text',
        });
      });
      test(...useSend({ type: 'FIELDS:REGISTER', payload: {} }, 23));
      test(...useValue({ working: 'register' }, 24));
      test('#25 => Final state check - should be in register with proper context', () => {
        expect(service.state.context).toEqual({
          fields: [{ label: 'Name', type: 'text' }],
          lang: 'fr',
          states: {
            fields: 'registration',
            values: 'idle',
          },
          values: {
            name: 'John Doe',
            email: 'john@example.com',
          },
        });
      });
    });
  });
});
