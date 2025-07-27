import { castings } from '@bemedev/types';
import { interpret } from '~interpreter';
import { createMachine } from '~machine';
import type { StateValue } from '~states';
import type { SingleOrArrayL } from '~types';
import { typings } from '~utils';

type State = 'registration' | 'registered' | 'idle';

type Lang = 'en' | 'es' | 'fr';

type Field = {
  label: string;
  options?: string[];
  name: string;
};

export const mainMachine = createMachine(
  {
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
          'FIELDS.REGISTER': {
            actions: ['fields.register', 'fields.register.finish'],
            target: '/working/register',
          },
          'FIELDS.MODIFY': {
            actions: ['fields.modify'],
            target: '/working/idle',
          },
        },

        states: {
          idle: {},

          register: {
            on: {
              'VALUES.REGISTER': {
                actions: [
                  'values.start.register',
                  'values.register',
                  'values.register.finish',
                ],
              },
              'VALUES.MODIFY': {
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
      lang: typings.custom<Lang>(),
      fields: [typings.custom<Field>()],
      responses: [typings.custom<SingleOrArrayL<string>>()],
      states: typings.partial({
        fields: typings.custom<State>(),
        values: typings.custom<State>(),
      }),
      values: typings.custom<Record<string, string>>(),
    }),
    eventsMap: {
      CHANGE_LANG: { lang: typings.custom<Lang>() },
      REMOVE: { index: 'number' },
      ADD: 'primitive',
      UPDATE: {
        index: 'number',
        value: typings.partial(typings.custom<Field>()),
      },
      'FIELDS.REGISTER': 'primitive',
      'FIELDS.MODIFY': 'primitive',
      'VALUES.REGISTER': typings.custom<Record<string, string>>(),
      'VALUES.MODIFY': 'primitive',
    },
    // promiseesMap: 'primitive',
  }),
  { '/': 'idle', '/working': 'idle' },
).provideOptions(({ assign, debounce }) => ({
  actions: {
    changeLang: assign('context.lang', {
      CHANGE_LANG: ({ payload: { lang } }) => {
        return lang;
      },
    }),

    add: assign('context.fields', ({ context: { fields } }) => {
      fields?.push({ label: '', name: '' });
      return fields;
    }),

    remove: assign('context.fields', {
      REMOVE: ({ context: { fields }, payload: { index } }) => {
        fields?.splice(index, 1);
        return fields;
      },
    }),

    update: assign('context.fields', {
      UPDATE: ({ context: { fields }, payload: { index, value } }) => {
        if (!fields) return;
        fields[index] = { ...fields[index], ...value };
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
      'VALUES.REGISTER': ({ payload }) => payload,
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
      const current = { label: '', name: 'text' } as Field;

      return {
        fields: [structuredClone(current)],
        lang: 'en',
        options: ['Option 1', 'Option 2', 'Option 3'],
      };
    }),
  },
}));

describe('Real Life Machine', () => {
  const service = interpret(mainMachine);

  // type SE = Parameters<typeof service.send>[0];

  // const useSend = (event: SE, index: number) => {
  //   const invite = `#${index < 10 ? '0' + index : index} => Send a "${(event as any).type ?? event}" event`;

  //   return castings.arrays.tupleOf(invite, () => service.send(event));
  // };

  const useValue = (value: StateValue, index: number) => {
    const invite = `#${index < 10 ? '0' + index : index} => value is right`;
    return castings.arrays.tupleOf(invite, async () => {
      expect(service.value).toEqual(value);
    });
  };

  // const useLang = (lang: Lang, index: number) => {
  //   const invite = `#${index < 10 ? '0' + index : index} => iterator is "${lang}"`;
  //   return castings.arrays.tupleOf(invite, async () => {
  //     expect(service.select).toBeUndefined();
  //     expect(service.state.context.lang).toBe(lang);
  //   });
  // };

  describe('TESTS', () => {
    it('#01 => starts the machine', () => {
      service.start();
    });

    it(...useValue({ working: 'idle' }, 1));
  });
});
