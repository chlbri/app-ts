import { createMachine } from '#machine';
import { typings } from '#utils';
import type { Keys } from '#bemedev/globals/types';
import type { inferT } from '../../utils/typings';

const state = typings.litterals('registration', 'registered', 'idle');

const csvData = typings.record(typings.union('string', 'number'));

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
  options: typings.optional(typings.array('string')),
  data: typings.optional(
    typings.partial({
      data: [csvData],
      headers: ['string'],
      merged: csvDataDeep,
      name: 'string',
    }),
  ),
});

export default createMachine(
  'src/__tests__/machine/real.3.machine',
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
      fields: typings.array(field),
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
);
