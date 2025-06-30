import { t } from '@bemedev/types';
import {
  INIT_EVENT,
  MAX_EXCEEDED_EVENT_TYPE,
  type EventsMap,
  type PromiseeMap,
} from '~events';
import type { FnMap, FnMapReduced } from '~types';
import { reduceFnMap, reduceFnMap2, toEventsMap } from './reduceFnMap';

describe('toEventsMap', () => {
  test('combine correctement les événements et les promisees', () => {
    // #region Arrange
    const events: EventsMap = {
      EVENT1: t.string,
      EVENT2: { data: t.number },
    };

    const promisees: PromiseeMap = {
      promise1: {
        then: t.string,
        catch: t.boolean,
      },
      promise2: {
        then: { success: t.boolean },
        catch: { error: t.string },
      },
    };
    // #endregion

    // #region Act
    const result = toEventsMap(events, promisees);
    // #endregion

    // #region Assert
    expect(result).toEqual({
      EVENT1: t.string,
      EVENT2: { data: t.number },
      'promise1::then': t.string,
      'promise1::catch': t.boolean,
      'promise2::then': { success: t.boolean },
      'promise2::catch': { error: t.string },
    });
    // #endregion
  });

  test('fonctionne avec un objet promisees vide', () => {
    // Arrange
    const events: EventsMap = {
      EVENT1: t.string,
    };
    const promisees: PromiseeMap = {};

    // Act
    const result = toEventsMap(events, promisees);

    // Assert
    expect(result).toEqual(events);
  });
});

describe('reduceFnMap', () => {
  test('renvoie directement la fonction si elle est déjà une fonction', () => {
    // Arrange
    const events: EventsMap = {};
    const promisees: PromiseeMap = {};
    const directFn = () => 'result';

    // Act
    const result = reduceFnMap(events, promisees, directFn);

    // Assert
    expect(result).toBe(directFn);
    expect(result({}, {}, INIT_EVENT)).toBe('result');
  });

  test('gère correctement un événement de type chaîne', () => {
    // Arrange
    const events: EventsMap = {
      EVENT1: t.string,
    };
    const promisees: PromiseeMap = {};
    const elseSpy = vi.fn().mockReturnValue('else result');

    const fnMap: FnMap<typeof events, typeof promisees, any, any, string> =
      {
        EVENT1: () => 'event1 result',
        else: elseSpy,
      };

    // Act
    const reducedFn = reduceFnMap(events, promisees, fnMap);
    const result = reducedFn({}, {}, INIT_EVENT);

    // Assert
    expect(elseSpy).toHaveBeenCalledWith({}, {}, INIT_EVENT);
    expect(result).toBe('else result');
  });

  test("utilise la fonction appropriée en fonction du type d'événement", () => {
    // Arrange
    const events: EventsMap = {
      EVENT1: t.string,
      EVENT2: { data: t.number },
    };
    const promisees: PromiseeMap = {};

    const event1Fn = vi.fn().mockReturnValue('event1 result');
    const event2Fn = vi.fn().mockReturnValue('event2 result');
    const elseFn = vi.fn().mockReturnValue('else result');

    const fnMap: FnMap<typeof events, typeof promisees, any, any, string> =
      {
        EVENT1: event1Fn,
        EVENT2: event2Fn,
        else: elseFn,
      };

    // Act
    const reducedFn = reduceFnMap(events, promisees, fnMap);
    const result1 = reducedFn({}, {}, { type: 'EVENT1', payload: 'test' });
    const result2 = reducedFn(
      {},
      {},
      { type: 'EVENT2', payload: { data: 42 } },
    );
    const result3 = reducedFn({}, {}, { type: 'UNKNOWN', payload: null });

    // Assert
    expect(event1Fn).toHaveBeenCalledWith({}, {}, 'test');
    expect(event2Fn).toHaveBeenCalledWith({}, {}, { data: 42 });
    expect(elseFn).toHaveBeenCalledWith(
      {},
      {},
      { type: 'UNKNOWN', payload: null },
    );
    expect(result1).toBe('event1 result');
    expect(result2).toBe('event2 result');
    expect(result3).toBe('else result');
  });

  test('utilise nothing comme fonction else par défaut', () => {
    // Arrange
    const events: EventsMap = {
      EVENT1: t.string,
    };
    const promisees: PromiseeMap = {};

    const fnMap: FnMap<typeof events, typeof promisees, any, any, any> = {
      EVENT1: () => 'event1 result',
    };

    // Act
    const reducedFn = reduceFnMap(events, promisees, fnMap);
    const result = reducedFn({}, {}, { type: 'UNKNOWN', payload: null });

    // Assert
    expect(result).toBe('nothing');
  });

  test('gère correctement les promisees', () => {
    // Arrange
    const events: EventsMap = {};
    const promisees: PromiseeMap = {
      promise1: {
        then: t.string,
        catch: t.boolean,
      },
    };

    const thenFn = vi.fn().mockReturnValue('then result');
    const catchFn = vi.fn().mockReturnValue('catch result');

    const fnMap: FnMap<typeof events, typeof promisees, any, any, string> =
      {
        'promise1::then': thenFn,
        'promise1::catch': catchFn,
      };

    // Act
    const reducedFn = reduceFnMap(events, promisees, fnMap);
    const result1 = reducedFn(
      {},
      {},
      { type: 'promise1::then', payload: 'success' },
    );
    const result2 = reducedFn(
      {},
      {},
      { type: 'promise1::catch', payload: true },
    );

    // Assert
    expect(thenFn).toHaveBeenCalledWith({}, {}, 'success');
    expect(catchFn).toHaveBeenCalledWith({}, {}, true);
    expect(result1).toBe('then result');
    expect(result2).toBe('catch result');
  });
});

describe('reduceFnMap2', () => {
  test('renvoie directement la fonction si elle est déjà une fonction', () => {
    // Arrange
    const events: EventsMap = {};
    const promisees: PromiseeMap = {};
    const directFn = () => 'result';

    // Act
    const result = reduceFnMap2(events, promisees, directFn);

    // Assert
    expect(result).toBe(directFn);
    expect(result({}, MAX_EXCEEDED_EVENT_TYPE)).toBe('result');
  });

  test('gère correctement un événement de type chaîne', () => {
    // Arrange
    const events: EventsMap = {
      EVENT1: t.string,
    };
    const promisees: PromiseeMap = {};
    const elseSpy = vi.fn().mockReturnValue('else result');

    const fnMap: FnMapReduced<
      typeof events,
      typeof promisees,
      any,
      string
    > = {
      EVENT1: () => 'event1 result',
      else: elseSpy,
    };

    // Act
    const reducedFn = reduceFnMap2(events, promisees, fnMap);
    const result = reducedFn({}, INIT_EVENT);

    // Assert
    expect(elseSpy).toHaveBeenCalledWith({}, INIT_EVENT);
    expect(result).toBe('else result');
  });

  test("utilise la fonction appropriée en fonction du type d'événement", () => {
    // Arrange
    const events: EventsMap = {
      EVENT1: t.string,
      EVENT2: { data: t.number },
    };
    const promisees: PromiseeMap = {};

    const event1Fn = vi.fn().mockReturnValue('event1 result');
    const event2Fn = vi.fn().mockReturnValue('event2 result');
    const elseFn = vi.fn().mockReturnValue('else result');

    const fnMap: FnMapReduced<
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
    const reducedFn = reduceFnMap2(events, promisees, fnMap);
    const result1 = reducedFn({}, { type: 'EVENT1', payload: 'test' });
    const result2 = reducedFn(
      {},
      { type: 'EVENT2', payload: { data: 42 } },
    );
    const result3 = reducedFn({}, { type: 'UNKNOWN', payload: null });

    // Assert
    expect(event1Fn).toHaveBeenCalledWith({}, 'test');
    expect(event2Fn).toHaveBeenCalledWith({}, { data: 42 });
    expect(elseFn).toHaveBeenCalledWith(
      {},
      { type: 'UNKNOWN', payload: null },
    );
    expect(result1).toBe('event1 result');
    expect(result2).toBe('event2 result');
    expect(result3).toBe('else result');
  });

  test('utilise nothing comme fonction else par défaut', () => {
    // Arrange
    const events: EventsMap = {
      EVENT1: t.string,
    };
    const promisees: PromiseeMap = {};

    const fnMap: FnMapReduced<typeof events, typeof promisees, any, any> =
      {
        EVENT1: () => 'event1 result',
      };

    // Act
    const reducedFn = reduceFnMap2(events, promisees, fnMap);
    const result = reducedFn({}, { type: 'UNKNOWN', payload: null });

    // Assert
    expect(result).toBe('nothing');
  });

  test('gère correctement les promisees', () => {
    // Arrange
    const events: EventsMap = {};
    const promisees: PromiseeMap = {
      promise1: {
        then: t.string,
        catch: t.boolean,
      },
    };

    const thenFn = vi.fn().mockReturnValue('then result');
    const catchFn = vi.fn().mockReturnValue('catch result');

    const fnMap: FnMapReduced<
      typeof events,
      typeof promisees,
      any,
      string
    > = {
      'promise1::then': thenFn,
      'promise1::catch': catchFn,
    };

    // Act
    const reducedFn = reduceFnMap2(events, promisees, fnMap);
    const result1 = reducedFn(
      {},
      { type: 'promise1::then', payload: 'success' },
    );
    const result2 = reducedFn(
      {},
      { type: 'promise1::catch', payload: true },
    );

    // Assert
    expect(thenFn).toHaveBeenCalledWith({}, 'success');
    expect(catchFn).toHaveBeenCalledWith({}, true);
    expect(result1).toBe('then result');
    expect(result2).toBe('catch result');
  });
});
