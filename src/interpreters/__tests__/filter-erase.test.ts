import { interpret } from '#interpreter';
import { createMachine } from '#machine';
import { constructSend, constructValue } from './fixtures';

describe('Filter and Erase actions', () => {
  describe('Filter action', () => {
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
        {
          context: {
            numbers: [] as number[],
          },
          eventsMap: {
            ADD: { payload: { values: [] as number[] } },
            FILTER: {},
            RESET: {},
          },
          promiseesMap: {},
        },
      );

      const service = interpret(machine, {
        context: { numbers: [] },
      });

      const useValue = constructValue(service);
      const useSend = (
        type: 'ADD' | 'FILTER' | 'RESET',
        payload?: any,
        index?: number,
      ) => constructSend(service)(type, index ?? 1, payload);

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
              'numbers',
              () => (num: number) => num % 2 === 0,
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

      test(...useSend('FILTER', undefined, 6));

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
        {
          context: {
            people: [] as Person[],
          },
          eventsMap: {
            ADD_PEOPLE: { payload: { people: [] as Person[] } },
            FILTER_ACTIVE: {},
          },
          promiseesMap: {},
        },
      );

      const service = interpret(machine, {
        context: { people: [] },
      });

      test('#01 => Start service', () => {
        service.start();
      });

      test('#02 => Add actions', () => {
        service.addOptions(({ assign, filter }) => ({
          actions: {
            addPeople: assign('context.people', {
              ADD_PEOPLE: ({ payload }) => payload.people,
            }),
            filterActive: filter(
              'people',
              () => (person: Person) => person.active,
            ),
          },
        }));
      });

      test('#03 => Add people', () => {
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

      test('#04 => Check people', () => {
        expect(service.select('people')).toHaveLength(5);
      });

      test('#05 => Filter active people', () => {
        service.send('FILTER_ACTIVE');
      });

      test('#06 => Check filtered people (only active)', () => {
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
      interface UserScores {
        [userId: string]: number;
      }

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
        {
          context: {
            scores: {} as UserScores,
          },
          eventsMap: {
            SET_SCORES: { payload: { scores: {} as UserScores } },
            FILTER_HIGH_SCORES: {},
          },
          promiseesMap: {},
        },
      );

      const service = interpret(machine, {
        context: { scores: {} },
      });

      test('#01 => Start service', () => {
        service.start();
      });

      test('#02 => Add actions', () => {
        service.addOptions(({ assign, filter }) => ({
          actions: {
            setScores: assign('context.scores', {
              SET_SCORES: ({ payload }) => payload.scores,
            }),
            filterHighScores: filter(
              'scores',
              () => (score: number) => score >= 80,
            ),
          },
        }));
      });

      test('#03 => Set scores', () => {
        service.send({
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
        });
      });

      test('#04 => Check scores', () => {
        expect(Object.keys(service.select('scores') ?? {}).length).toBe(5);
      });

      test('#05 => Filter high scores', () => {
        service.send('FILTER_HIGH_SCORES');
      });

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

  describe('Erase action', () => {
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
        {
          context: {
            name: undefined as string | undefined,
          },
          eventsMap: {
            SET_NAME: { payload: { name: '' } },
            CLEAR_NAME: {},
          },
          promiseesMap: {},
        },
      );

      const service = interpret(machine, {
        context: {},
      });

      test('#01 => Start service', () => {
        service.start();
      });

      test('#02 => Add actions', () => {
        service.addOptions(({ assign, erase }) => ({
          actions: {
            setName: assign('context.name', {
              SET_NAME: ({ payload }) => payload.name,
            }),
            clearName: erase('context.name'),
          },
        }));
      });

      test('#03 => Set name', () => {
        service.send({ type: 'SET_NAME', payload: { name: 'John Doe' } });
      });

      test('#04 => Check name', () => {
        expect(service.select('name')).toBe('John Doe');
      });

      test('#05 => Clear name', () => {
        service.send('CLEAR_NAME');
      });

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
        {
          context: {
            user: {
              name: '',
              email: undefined as string | undefined,
            },
          },
          eventsMap: {
            SET_USER: {
              payload: { name: '', email: '' },
            },
            CLEAR_EMAIL: {},
          },
          promiseesMap: {},
        },
      );

      const service = interpret(machine, {
        context: {
          user: {
            name: '',
          },
        },
      });

      test('#01 => Start service', () => {
        service.start();
      });

      test('#02 => Add actions', () => {
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

      test('#03 => Set user', () => {
        service.send({
          type: 'SET_USER',
          payload: {
            name: 'Jane Doe',
            email: 'jane@example.com',
          },
        });
      });

      test('#04 => Check user', () => {
        const user = service.select('user');
        expect(user?.name).toBe('Jane Doe');
        expect(user?.email).toBe('jane@example.com');
      });

      test('#05 => Clear email', () => {
        service.send('CLEAR_EMAIL');
      });

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
        {
          context: {
            name: undefined as string | undefined,
            email: undefined as string | undefined,
            age: undefined as number | undefined,
          },
          eventsMap: {
            SET_DATA: {
              payload: { name: '', email: '', age: 0 },
            },
            CLEAR_ALL: {},
          },
          promiseesMap: {},
        },
      );

      const service = interpret(machine, {
        context: {},
      });

      test('#01 => Start service', () => {
        service.start();
      });

      test('#02 => Add actions', () => {
        service.addOptions(({ assign, erase, batch }) => ({
          actions: {
            setData: assign('context', {
              SET_DATA: ({ payload }) => ({
                name: payload.name,
                email: payload.email,
                age: payload.age,
              }),
            }),
            clearAll: batch(
              erase('context.name'),
              erase('context.email'),
              erase('context.age'),
            ),
          },
        }));
      });

      test('#03 => Set data', () => {
        service.send({
          type: 'SET_DATA',
          payload: {
            name: 'Alice',
            email: 'alice@example.com',
            age: 30,
          },
        });
      });

      test('#04 => Check data', () => {
        expect(service.select('name')).toBe('Alice');
        expect(service.select('email')).toBe('alice@example.com');
        expect(service.select('age')).toBe(30);
      });

      test('#05 => Clear all', () => {
        service.send('CLEAR_ALL');
      });

      test('#06 => Check all properties are undefined', () => {
        expect(service.select('name')).toBeUndefined();
        expect(service.select('email')).toBeUndefined();
        expect(service.select('age')).toBeUndefined();
      });
    });
  });
});
