import { createMachine } from '#machine';
import { typings } from '#utils';

interface Person {
  name: string;
  age: number;
  active: boolean;
}

const person = typings.custom<Person>();

export default createMachine(
  'src/__tests__/interpreters/filter-erase.2.machine',
  {
    initial: 'idle',
    states: {
      idle: {
        on: {
          ADD_PEOPLE: {
            actions: 'addPeople',
          },
          FILTER_ACTIVE: {
            actions: 'filterActive',
            target: '/filtered',
          },
        },
      },
      filtered: {},
    },
  },
  { context: { people: typings.array(person) } },
);
