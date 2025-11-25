import { interpret } from '#interpreter';
import { createMachine } from '#machine';
import { typings } from '#utils';
import { constructSend, constructValue } from './fixtures';

describe('Filter and Erase actions', () => {
  describe('#01 => Filter action', () => {
    describe('#01 => Filter array of numbers', () => {
      const machine = createMachine(
        {
          initial: 'state1',
          states: {
            state1: {
              on: {
                ADD: {
                  actions: 'addNumbers',
                },
                FILTER: {
                  actions: 'filterEven',
                  target: '/state2',
                },
              },
            },
            state2: {
              on: {
                RESET: '/state1',
              },
            },
          },
        },
        typings({
          context: {
            numbers: typings.array('number'),
          },
          eventsMap: {
            ADD: {
              values: typings.array('number'),
            },
            FILTER: 'primitive',
            RESET: 'primitive',
          },
        }),
      );

      const service = interpret(machine, {
        context: { numbers: [] },
      });

      const useValue = constructValue(service);
      type SE = Parameters<typeof service.send>[0];
      const useSend = (event: SE, index?: number) =>
        constructSend(service)(event, index ?? 1);

      test('#01 => Start service', () => {
        service.start();
      });

      test(...useValue('state1', 2));

      test('#03 => Add actions', () => {
        service.addOptions(({ assign, filter }) => ({
          actions: {
            addNumbers: assign('context.numbers', {
              ADD: ({ payload }) => payload.values,
            }),
            filterEven: filter(
              'context.numbers',
              (num: number) => num % 2 === 0,
            ),
          },
        }));
      });

      test('#04 => Add numbers', () => {
        service.send({
          type: 'ADD',
          payload: { values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
        });
      });

      test('#05 => Check numbers', () => {
        expect(service.select('numbers')).toEqual([
          1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
        ]);
      });

      test(...useSend('FILTER', 6));

      test(...useValue('state2', 7));

      test('#08 => Check filtered numbers (only even)', () => {
        expect(service.select('numbers')).toEqual([2, 4, 6, 8, 10]);
      });
    });

    describe('#02 => Filter array of objects', () => {
      interface Person {
        name: string;
        age: number;
        active: boolean;
      }

      const person = typings.any({
        name: 'string',
        age: 'number',
        active: 'boolean',
      });

      const machine = createMachine(
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
        typings({
          context: {
            people: typings.array(person),
          },
          eventsMap: {
            ADD_PEOPLE: {
              people: typings.array(person),
            },
            FILTER_ACTIVE: 'primitive',
          },
        }),
      );

      const service = interpret(machine, {
        context: { people: [] },
      });

      const useValue = constructValue(service);
      type SE = Parameters<typeof service.send>[0];
      const useSend = (event: SE, index?: number) =>
        constructSend(service)(event, index ?? 1);

      test('#01 => Start service', () => {
        service.start();
      });

      test(...useValue('idle', 2));

      test('#03 => Add actions', () => {
        service.addOptions(({ assign, filter }) => ({
          actions: {
            addPeople: assign('context.people', {
              ADD_PEOPLE: ({ payload }) => payload.people,
            }),
            filterActive: filter('context.people', ({ active }) => active),
          },
        }));
      });

      test('#04 => Add people', () => {
        service.send({
          type: 'ADD_PEOPLE',
          payload: {
            people: [
              { name: 'Alice', age: 30, active: true },
              { name: 'Bob', age: 25, active: false },
              { name: 'Charlie', age: 35, active: true },
              { name: 'David', age: 28, active: false },
              { name: 'Eve', age: 32, active: true },
            ],
          },
        });
      });

      test('#05 => Check people', () => {
        expect(service.select('people')).toHaveLength(5);
      });

      test(...useSend('FILTER_ACTIVE', 6));

      test(...useValue('filtered', 7));

      test('#08 => Check filtered people (only active)', () => {
        const people = service.select('people');
        expect(people).toHaveLength(3);
        expect(people?.every((p: Person) => p.active)).toBe(true);
        expect(people?.map((p: Person) => p.name)).toEqual([
          'Alice',
          'Charlie',
          'Eve',
        ]);
      });
    });

    describe('#03 => Filter object properties', () => {
      const scores = typings.record('number');

      const machine = createMachine(
        {
          initial: 'idle',
          states: {
            idle: {
              on: {
                SET_SCORES: {
                  actions: 'setScores',
                },
                FILTER_HIGH_SCORES: {
                  actions: 'filterHighScores',
                  target: '/filtered',
                },
              },
            },
            filtered: {},
          },
        },
        typings({
          context: {
            scores,
          },
          eventsMap: {
            SET_SCORES: { scores },
            FILTER_HIGH_SCORES: 'primitive',
          },
          promiseesMap: {},
        }),
      );

      const service = interpret(machine, {
        context: { scores: {} },
      });

      const useValue = constructValue(service);
      type SE = Parameters<typeof service.send>[0];
      const useSend = (event: SE, index?: number) =>
        constructSend(service)(event, index ?? 1);

      test('#01 => Start service', () => {
        service.start();
      });

      test(...useValue('idle', 2));

      test('#03 => Add actions', () => {
        service.addOptions(({ assign, filter }) => ({
          actions: {
            setScores: assign('context.scores', {
              SET_SCORES: ({ payload }) => {
                return payload.scores;
              },
            }),
            filterHighScores: filter(
              'context.scores',
              score => score >= 80,
            ),
          },
        }));
      });

      test(
        ...useSend({
          type: 'SET_SCORES',
          payload: {
            scores: {
              user1: 95,
              user2: 60,
              user3: 85,
              user4: 45,
              user5: 90,
            },
          },
        }),
      );

      test('#04 => Check scores', () => {
        expect(Object.keys(service.select('scores') ?? {}).length).toBe(5);
      });

      test(...useSend('FILTER_HIGH_SCORES', 5));

      test('#06 => Check filtered scores (>= 80)', () => {
        const scores = service.select('scores');
        expect(Object.keys(scores ?? {}).length).toBe(3);
        expect(scores).toEqual({
          user1: 95,
          user3: 85,
          user5: 90,
        });
      });
    });
  });

  describe('#02 => Erase action', () => {
    describe('#01 => Erase single context property', () => {
      const machine = createMachine(
        {
          initial: 'idle',
          states: {
            idle: {
              on: {
                SET_NAME: {
                  actions: 'setName',
                },
                CLEAR_NAME: {
                  actions: 'clearName',
                  target: '/cleared',
                },
              },
            },
            cleared: {},
          },
        },
        typings({
          context: {
            name: typings.maybe('string'),
            data: 'number',
          },
          eventsMap: {
            SET_NAME: { name: 'string' },
            CLEAR_NAME: 'primitive',
          },
        }),
      );

      const service = interpret(machine, {
        context: {
          data: 42,
        },
      });

      const useValue = constructValue(service);
      type SE = Parameters<typeof service.send>[0];
      const useSend = (event: SE, index?: number) =>
        constructSend(service)(event, index ?? 1);

      test('#01 => Start service', () => {
        service.start();
      });

      test(...useValue('idle', 2));

      test('#03 => Add actions', () => {
        service.addOptions(({ assign, erase }) => ({
          actions: {
            setName: assign('context.name', {
              SET_NAME: ({ payload }) => payload.name,
            }),
            clearName: erase('context.name'),
          },
        }));
      });

      test(
        ...useSend(
          {
            type: 'SET_NAME',
            payload: { name: 'John Doe' },
          },
          3,
        ),
      );

      test('#04 => Check name', () => {
        expect(service.select('name')).toBe('John Doe');
      });

      test(...useSend('CLEAR_NAME', 5));

      test('#06 => Check name is undefined', () => {
        expect(service.select('name')).toBeUndefined();
      });
    });

    describe('#02 => Erase nested property', () => {
      const machine = createMachine(
        {
          initial: 'idle',
          states: {
            idle: {
              on: {
                SET_USER: {
                  actions: 'setUser',
                },
                CLEAR_EMAIL: {
                  actions: 'clearEmail',
                },
              },
            },
          },
        },
        typings({
          context: {
            user: {
              name: 'string',
              email: typings.maybe('string'),
            },
          },
          eventsMap: {
            SET_USER: { name: 'string', email: 'string' },
            CLEAR_EMAIL: 'primitive',
          },
          promiseesMap: {},
        }),
      );

      const service = interpret(machine, {
        context: {
          user: {
            name: '',
          },
        },
      });

      const useValue = constructValue(service);
      type SE = Parameters<typeof service.send>[0];
      const useSend = (event: SE, index?: number) =>
        constructSend(service)(event, index ?? 1);

      test('#01 => Start service', () => {
        service.start();
      });

      test(...useValue('idle', 2));

      test('#03 => Add actions', () => {
        service.addOptions(({ assign, erase }) => ({
          actions: {
            setUser: assign('context.user', {
              SET_USER: ({ payload }) => ({
                name: payload.name,
                email: payload.email,
              }),
            }),
            clearEmail: erase('context.user.email'),
          },
        }));
      });

      test(
        ...useSend(
          {
            type: 'SET_USER',
            payload: {
              name: 'Jane Doe',
              email: 'jane@example.com',
            },
          },
          3,
        ),
      );

      test('#04 => Check user', () => {
        const user = service.select('user');
        expect(user?.name).toBe('Jane Doe');
        expect(user?.email).toBe('jane@example.com');
      });

      test(...useSend('CLEAR_EMAIL', 5));

      test('#06 => Check email is undefined, name still exists', () => {
        const user = service.select('user');
        expect(user?.name).toBe('Jane Doe');
        expect(user?.email).toBeUndefined();
      });
    });

    describe('#03 => Erase multiple properties with batch', () => {
      const machine = createMachine(
        {
          initial: 'idle',
          states: {
            idle: {
              on: {
                SET_DATA: {
                  actions: 'setData',
                },
                CLEAR_ALL: {
                  actions: 'clearAll',
                  target: '/cleared',
                },
              },
            },
            cleared: {},
          },
        },
        typings({
          context: typings.partial({
            name: 'string',
            email: 'string',
            age: 'number',
          }),
          eventsMap: {
            SET_DATA: {
              name: 'string',
              email: 'string',
              age: 'number',
            },
            CLEAR_ALL: 'primitive',
          },
          promiseesMap: {},
        }),
      );

      const service = interpret(machine, {
        context: {},
      });

      const useValue = constructValue(service);
      type SE = Parameters<typeof service.send>[0];
      const useSend = (event: SE, index?: number) =>
        constructSend(service)(event, index ?? 1);

      test('#01 => Start service', () => {
        service.start();
      });

      test(...useValue('idle', 2));

      test('#03 => Add actions', () => {
        service.addOptions(({ assign, erase, batch }) => ({
          actions: {
            setData: assign('context', {
              SET_DATA: ({ payload }) => payload,
            }),
            clearAll: batch(
              erase('context.name'),
              erase('context.email'),
              erase('context.age'),
            ),
          },
        }));
      });

      test(
        ...useSend(
          {
            type: 'SET_DATA',
            payload: {
              name: 'Alice',
              email: 'alice@example.com',
              age: 30,
            },
          },
          3,
        ),
      );

      test('#04 => Check data', () => {
        expect(service.select('name')).toBe('Alice');
        expect(service.select('email')).toBe('alice@example.com');
        expect(service.select('age')).toBe(30);
      });

      test(...useSend('CLEAR_ALL', 6));

      test(...useValue('cleared', 7));

      test('#08 => Check all properties are undefined', () => {
        expect(service.select('name')).toBeUndefined();
        expect(service.select('email')).toBeUndefined();
        expect(service.select('age')).toBeUndefined();
      });
    });
  });
});
