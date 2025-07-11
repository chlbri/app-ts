import { typings } from '@bemedev/types';
import {
  INIT_EVENT,
  MAX_EXCEEDED_EVENT_TYPE,
  type EventsMap,
  type PromiseeMap,
} from '~events';
import type { FnMap, FnMapR } from '~types';
import {
  reduceFnMap,
  reduceFnMapReduced,
  toEventsMap,
} from './reduceFnMap';

describe('#01 => reducers', () => {
  describe('#01.01 => toEventsMap', () => {
    test('#01.01.01 => correctly combines events and promisees', () => {
      // #region Arrange
      const events: EventsMap = {
        EVENT1: typings.strings.type,
        EVENT2: { data: typings.numbers.type },
      };

      const promisees: PromiseeMap = {
        promise1: {
          then: typings.strings.type,
          catch: typings.strings.type,
        },
        promise2: {
          then: { success: typings.booleans.type },
          catch: { error: typings.strings.type },
        },
      };
      // #endregion

      // #region Act
      const result = toEventsMap(events, promisees);
      // #endregion

      // #region Assert
      expect(result).toEqual({
        EVENT1: typings.strings.type,
        EVENT2: { data: typings.numbers.type },
        'promise1::then': typings.strings.type,
        'promise1::catch': typings.booleans.type,
        'promise2::then': { success: typings.booleans.type },
        'promise2::catch': { error: typings.strings.type },
      });
      // #endregion
    });

    test('#01.01.02 => works with empty promisees object', () => {
      // Arrange
      const events: EventsMap = {
        EVENT1: typings.strings.type,
      };
      const promisees: PromiseeMap = {};

      // Act
      const result = toEventsMap(events, promisees);

      // Assert
      expect(result).toEqual(events);
    });
  });

  describe('#01.02 => reduceFnMap', () => {
    describe('#01.02 => reduceFnMap', () => {
      test('#01.02.01 => returns function directly if it is already a function', () => {
        // Arrange
        const events: EventsMap = {};
        const promisees: PromiseeMap = {};
        const directFn = () => 'result';

        // Act
        const result = reduceFnMap(events, promisees, directFn);

        // Assert
        expect(result).toBe(directFn);
        expect(
          result({
            event: INIT_EVENT,
            context: {},
            pContext: {},
            status: 'active' as any,
            value: 'test',
            tags: [],
          }),
        ).toBe('result');
      });

      test('#01.02.02 => correctly handles string type event', () => {
        // Arrange
        const events: EventsMap = {
          EVENT1: typings.strings.type,
        };
        const promisees: PromiseeMap = {};
        const elseSpy = vi.fn().mockReturnValue('else result');

        const fnMap: FnMap<
          typeof events,
          typeof promisees,
          any,
          any,
          string
        > = {
          EVENT1: () => 'event1 result',
          else: elseSpy,
        };

        // Act
        const reducedFn = reduceFnMap(events, promisees, fnMap);
        const result = reducedFn({
          event: INIT_EVENT,
          context: {},
          pContext: {},
          status: 'active' as any,
          value: 'test',
          tags: [],
        });

        // Assert
        expect(elseSpy).toHaveBeenCalledWith({
          event: INIT_EVENT,
          context: {},
          pContext: {},
          status: 'active' as any,
          value: 'test',
          tags: [],
        });
        expect(result).toBe('else result');
      });

      test('#01.02.03 => uses appropriate function based on event type', () => {
        // Arrange
        const events: EventsMap = {
          EVENT1: typings.strings.type,
          EVENT2: { data: typings.numbers.type },
        };
        const promisees: PromiseeMap = {};

        const event1Fn = vi.fn().mockReturnValue('event1 result');
        const event2Fn = vi.fn().mockReturnValue('event2 result');
        const elseFn = vi.fn().mockReturnValue('else result');

        const fnMap: FnMap<
          typeof events,
          typeof promisees,
          any,
          any,
          string
        > = {
          EVENT1: event1Fn,
          EVENT2: event2Fn,
          else: elseFn,
        };

        // Act
        const reducedFn = reduceFnMap(events, promisees, fnMap);
        const result1 = reducedFn({
          event: { type: 'EVENT1', payload: 'test' },
          context: {},
          pContext: {},
          status: 'active' as any,
          value: 'test',
          tags: [],
        });
        const result2 = reducedFn({
          event: { type: 'EVENT2', payload: { data: 42 } },
          context: {},
          pContext: {},
          status: 'active' as any,
          value: 'test',
          tags: [],
        });
        const result3 = reducedFn({
          event: { type: 'UNKNOWN', payload: null },
          context: {},
          pContext: {},
          status: 'active' as any,
          value: 'test',
          tags: [],
        });

        // Assert
        expect(event1Fn).toHaveBeenCalledWith({
          payload: 'test',
          context: {},
          pContext: {},
          status: 'active' as any,
          value: 'test',
          tags: [],
        });
        expect(event2Fn).toHaveBeenCalledWith({
          payload: { data: 42 },
          context: {},
          pContext: {},
          status: 'active' as any,
          value: 'test',
          tags: [],
        });
        expect(elseFn).toHaveBeenCalledWith({
          event: { type: 'UNKNOWN', payload: null },
          context: {},
          pContext: {},
          status: 'active' as any,
          value: 'test',
          tags: [],
        });
        expect(result1).toBe('event1 result');
        expect(result2).toBe('event2 result');
        expect(result3).toBe('else result');
      });

      test('#01.02.04 => uses nothing as default else function', () => {
        // Arrange
        const events: EventsMap = {
          EVENT1: typings.strings.type,
        };
        const promisees: PromiseeMap = {};

        const fnMap: FnMap<
          typeof events,
          typeof promisees,
          any,
          any,
          any
        > = {
          EVENT1: () => 'event1 result',
        };

        // Act
        const reducedFn = reduceFnMap(events, promisees, fnMap);
        const result = reducedFn({
          event: { type: 'UNKNOWN', payload: null },
          context: {},
          pContext: {},
          status: 'active' as any,
          value: 'test',
          tags: [],
        });

        // Assert
        expect(result).toBe('nothing');
      });

      test('#01.02.05 => correctly handles promisees', () => {
        // Arrange
        const events: EventsMap = {};
        const promisees: PromiseeMap = {
          promise1: {
            then: typings.strings.type,
            catch: typings.booleans.type,
          },
        };

        const thenFn = vi.fn().mockReturnValue('then result');
        const catchFn = vi.fn().mockReturnValue('catch result');

        const fnMap: FnMap<
          typeof events,
          typeof promisees,
          any,
          any,
          string
        > = {
          'promise1::then': thenFn,
          'promise1::catch': catchFn,
        };

        // Act
        const reducedFn = reduceFnMap(events, promisees, fnMap);
        const result1 = reducedFn({
          event: { type: 'promise1::then', payload: 'success' },
          context: {},
          pContext: {},
          status: 'active' as any,
          value: 'test',
          tags: [],
        });
        const result2 = reducedFn({
          event: { type: 'promise1::catch', payload: true },
          context: {},
          pContext: {},
          status: 'active' as any,
          value: 'test',
          tags: [],
        });

        // Assert
        expect(thenFn).toHaveBeenCalledWith({
          payload: 'success',
          context: {},
          pContext: {},
          status: 'active' as any,
          value: 'test',
          tags: [],
        });
        expect(catchFn).toHaveBeenCalledWith({
          payload: true,
          context: {},
          pContext: {},
          status: 'active' as any,
          value: 'test',
          tags: [],
        });
        expect(result1).toBe('then result');
        expect(result2).toBe('catch result');
      });
    });

    describe('#01.03 => reduceFnMapReduced', () => {
      describe('#01.03 => reduceFnMapReduced', () => {
        test('#01.03.01 => returns function directly if it is already a function', () => {
          // Arrange
          const events: EventsMap = {};
          const promisees: PromiseeMap = {};
          const directFn = () => 'result';

          // Act
          const result = reduceFnMapReduced(events, promisees, directFn);

          // Assert
          expect(result).toBe(directFn);
          expect(
            result({
              context: {},
              event: MAX_EXCEEDED_EVENT_TYPE,
              status: 'active' as any,
              value: 'test',
              tags: [],
            }),
          ).toBe('result');
        });

        test('#01.03.02 => correctly handles string type event', () => {
          // Arrange
          const events: EventsMap = {
            EVENT1: typings.strings.type,
          };
          const promisees: PromiseeMap = {};
          const elseSpy = vi.fn().mockReturnValue('else result');

          const fnMap: FnMapR<
            typeof events,
            typeof promisees,
            any,
            string
          > = {
            EVENT1: () => 'event1 result',
            else: elseSpy,
          };

          // Act
          const reducedFn = reduceFnMapReduced(events, promisees, fnMap);
          const result = reducedFn({
            context: {},
            event: INIT_EVENT,
            status: 'active' as any,
            value: 'test',
            tags: [],
          });

          // Assert
          expect(elseSpy).toHaveBeenCalledWith({
            context: {},
            event: INIT_EVENT,
            status: 'active' as any,
            value: 'test',
            tags: [],
          });
          expect(result).toBe('else result');
        });

        test('#01.03.03 => uses appropriate function based on event type', () => {
          // Arrange
          const events: EventsMap = {
            EVENT1: typings.strings.type,
            EVENT2: { data: typings.numbers.type },
          };
          const promisees: PromiseeMap = {};

          const event1Fn = vi.fn().mockReturnValue('event1 result');
          const event2Fn = vi.fn().mockReturnValue('event2 result');
          const elseFn = vi.fn().mockReturnValue('else result');

          const fnMap: FnMapR<
            typeof events,
            typeof promisees,
            any,
            string
          > = {
            EVENT1: event1Fn,
            EVENT2: event2Fn,
            else: elseFn,
          };

          // Act
          const reducedFn = reduceFnMapReduced(events, promisees, fnMap);
          const result1 = reducedFn({
            context: {},
            event: { type: 'EVENT1', payload: 'test' },
            status: 'active' as any,
            value: 'test',
            tags: [],
          });
          const result2 = reducedFn({
            context: {},
            event: { type: 'EVENT2', payload: { data: 42 } },
            status: 'active' as any,
            value: 'test',
            tags: [],
          });
          const result3 = reducedFn({
            context: {},
            event: { type: 'UNKNOWN', payload: null },
            status: 'active' as any,
            value: 'test',
            tags: [],
          });

          // Assert
          expect(event1Fn).toHaveBeenCalledWith({
            context: {},
            payload: 'test',
            status: 'active' as any,
            value: 'test',
            tags: [],
          });
          expect(event2Fn).toHaveBeenCalledWith({
            context: {},
            payload: { data: 42 },
            status: 'active' as any,
            value: 'test',
            tags: [],
          });
          expect(elseFn).toHaveBeenCalledWith({
            context: {},
            event: { type: 'UNKNOWN', payload: null },
            status: 'active' as any,
            value: 'test',
            tags: [],
          });
          expect(result1).toBe('event1 result');
          expect(result2).toBe('event2 result');
          expect(result3).toBe('else result');
        });

        test('#01.03.04 => uses nothing as default else function', () => {
          // Arrange
          const events: EventsMap = {
            EVENT1: typings.strings.type,
          };
          const promisees: PromiseeMap = {};

          const fnMap: FnMapR<typeof events, typeof promisees, any, any> =
            {
              EVENT1: () => 'event1 result',
            };

          // Act
          const reducedFn = reduceFnMapReduced(events, promisees, fnMap);
          const result = reducedFn({
            context: {},
            event: { type: 'UNKNOWN', payload: null },
            status: 'active' as any,
            value: 'test',
            tags: [],
          });

          // Assert
          expect(result).toBe('nothing');
        });

        test('#01.03.05 => correctly handles promisees', () => {
          // Arrange
          const events: EventsMap = {};
          const promisees: PromiseeMap = {
            promise1: {
              then: typings.strings.type,
              catch: typings.booleans.type,
            },
          };

          const thenFn = vi.fn().mockReturnValue('then result');
          const catchFn = vi.fn().mockReturnValue('catch result');

          const fnMap: FnMapR<
            typeof events,
            typeof promisees,
            any,
            string
          > = {
            'promise1::then': thenFn,
            'promise1::catch': catchFn,
          };

          // Act
          const reducedFn = reduceFnMapReduced(events, promisees, fnMap);
          const result1 = reducedFn({
            context: {},
            event: { type: 'promise1::then', payload: 'success' },
            status: 'active' as any,
            value: 'test',
            tags: [],
          });
          const result2 = reducedFn({
            context: {},
            event: { type: 'promise1::catch', payload: true },
            status: 'active' as any,
            value: 'test',
            tags: [],
          });

          // Assert
          expect(thenFn).toHaveBeenCalledWith({
            context: {},
            payload: 'success',
            status: 'active' as any,
            value: 'test',
            tags: [],
          });
          expect(catchFn).toHaveBeenCalledWith({
            context: {},
            payload: true,
            status: 'active' as any,
            value: 'test',
            tags: [],
          });
          expect(result1).toBe('then result');
          expect(result2).toBe('catch result');
        });
      });
    });
  });
});
