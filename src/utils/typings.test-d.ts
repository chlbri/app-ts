import {
  Fn,
  t,
  type DeepPartial,
  type Ra,
  type Rn,
  type Ru,
} from '@bemedev/types';
import { expectTypeOf } from 'vitest';
import type { EventsMap, PromiseeMap } from '~events';
import { config2 } from '~fixturesData';
import type { Config } from '~machines';
import type { PrimitiveObject } from '~types';
import { typings } from './typings';

// Test de la fonction principale
const genericValue = typings<string>();
expectTypeOf(genericValue).toEqualTypeOf<string>();

// Test des types primitifs
const numberValue = typings.number.type;
expectTypeOf(numberValue).toEqualTypeOf<number>();

const stringValue = typings.string.type;
expectTypeOf(stringValue).toEqualTypeOf<string>();

const booleanValue = typings.boolean.type;
expectTypeOf(booleanValue).toEqualTypeOf<boolean>();

const symbolValue = typings.symbol;
expectTypeOf(symbolValue).toEqualTypeOf<symbol>();

const bigintValue = typings.bigint;
expectTypeOf(bigintValue).toEqualTypeOf<bigint>();

// Test des types complexes
interface TestObject {
  name: string;
  age: number;
}

const objectValue = typings.emptyO.type;
expectTypeOf(objectValue).toEqualTypeOf<{}>();

const partialValue = typings.partial<TestObject>();
expectTypeOf(partialValue).toEqualTypeOf<Partial<TestObject>>();

const deepPartialValue = typings.deepPartial({
  age: 42,
  name: 'test',
});
expectTypeOf(deepPartialValue).toEqualTypeOf<DeepPartial<TestObject>>();

const arrayValue1 = typings.array(1, 2, 3);
expectTypeOf(arrayValue1).toEqualTypeOf<number[]>();

const arrayValue2 = typings.array.const(1, 2, 3);
expectTypeOf(arrayValue2).toEqualTypeOf<(1 | 2 | 3)[]>();

const tupleValue = typings.tuple(1, 'hello', true);
expectTypeOf(tupleValue).toEqualTypeOf<[1, 'hello', true]>();

const functionValue = typings.function('hello', 42, true);
expectTypeOf(functionValue).toEqualTypeOf<Fn<[string, number], boolean>>();

const functionValue2 = typings.function.const('hello', 42, true);
expectTypeOf(functionValue2).toEqualTypeOf<Fn<['hello', 42], true>>();

// #region Test des types liés aux machines

const configValue1 = typings.config();
expectTypeOf(configValue1).toEqualTypeOf<Config>();

const configValue2 = typings.config(config2);
expectTypeOf(configValue2).toEqualTypeOf<typeof config2>();
// #endregion

// #region Test des types spéciaux
expectTypeOf(typings.date).toEqualTypeOf<Date>();

expectTypeOf(typings.null).toEqualTypeOf<null>();

const undefinedValue = typings.undefined;
expectTypeOf(undefinedValue).toEqualTypeOf<undefined>();

expectTypeOf(typings.never).toEqualTypeOf<never>();
const notUndefinedAny = typings.notUndefined();
expectTypeOf(notUndefinedAny).toEqualTypeOf<any>();
const notUndefinedString = typings.notUndefined(
  'hello' as string | undefined,
);
expectTypeOf(notUndefinedString).toEqualTypeOf<string>();
const notUndefinedStrict = typings.notUndefined('strict');
expectTypeOf(notUndefinedStrict).toEqualTypeOf<'strict'>();

const undefinyValue = t.identity(typings.undefiny('strict'));
expectTypeOf(undefinyValue).branded.toEqualTypeOf<'strict' | undefined>();
// #endregion

// Test des types utilitaires de @bemedev/types
expectTypeOf(typings.rn).toEqualTypeOf<Rn>();

expectTypeOf(typings.ru).toEqualTypeOf<Ru>();

expectTypeOf(typings.ra).toEqualTypeOf<Ra>();

// #region Test avec des types génériques spécifiques
interface User {
  id: number;
  name: string;
  isAdmin: boolean;
}

const userType = typings<User>();
expectTypeOf(userType).toEqualTypeOf<User>();

const numberSpecificType = typings.number.typings(42);
expectTypeOf(numberSpecificType).toEqualTypeOf<42>();

const stringLiteralType = typings.string.typings('hello');
expectTypeOf(stringLiteralType).toEqualTypeOf<'hello'>();
// #endregion

const complexFnType = typings.function('test', Promise.resolve(42));
expectTypeOf(complexFnType).toEqualTypeOf<Fn<[string], Promise<number>>>();

// #region recordS et recordAll
const recordSValue = typings.recordS(42);
expectTypeOf(recordSValue).toEqualTypeOf<Record<string, number>>();

const recordAllValue = typings.recordAll('test', 'id', 'name', 'value');
expectTypeOf(recordAllValue).toEqualTypeOf<
  Record<'id' | 'name' | 'value', string>
>();
// #endregion

// #region forceCast et cast
const originalValue = { name: 'test' };
const forceCastValue = typings.forceCast<string>(originalValue);
expectTypeOf(forceCastValue).toEqualTypeOf<string>();

const castValue = typings.cast.const('hello');
expectTypeOf(castValue).toEqualTypeOf<'hello'>();

const castValue2 = typings.cast('hello');
expectTypeOf(castValue2).toEqualTypeOf<string>();
// #endregion

// #region context
type TestContext = {
  count: number;
  items: string[];
};
const contextValue1 = typings.context<TestContext>();
expectTypeOf(contextValue1).toEqualTypeOf<TestContext>();

const contextValue2 = typings.context({
  count: 0,
  age: 42,
  name: 'Levi',
});
expectTypeOf(contextValue2).toEqualTypeOf<{
  count: number;
  age: number;
  name: string;
}>();

// Test avec un contexte primitif
const primitiveContextValue = typings.context();
expectTypeOf(primitiveContextValue).toEqualTypeOf<PrimitiveObject>();
// #endregion

// #region promiseDef, toEventsR, toEvents
interface FetchResult {
  data: string[];
}
interface FetchError {
  message: string;
}

const promiseDefValue = typings.promiseDef<FetchResult, FetchError>(
  { data: [] },
  { message: 'Error' },
);
expectTypeOf(promiseDefValue).toEqualTypeOf<{
  then: FetchResult;
  catch: FetchError;
}>();

// Définition d'événements et promesses pour les tests
interface TestEventsMap extends EventsMap {
  FETCH: { id: string };
  UPDATE: { data: number };
}

interface TestPromiseeMap extends PromiseeMap {
  fetch: {
    then: string[];
    catch: Error;
  };
}

const testEvents: TestEventsMap = {
  FETCH: { id: '' },
  UPDATE: { data: 0 },
};

const testPromisees: TestPromiseeMap = {
  fetch: {
    then: [],
    catch: new Error(),
  },
};

const toEventsRValue = typings.toEventsR(testEvents, testPromisees);
// Vérifier que le type est correct
expectTypeOf(toEventsRValue).not.toBeNever();

const toEventsValue = typings.toEvents(testEvents, testPromisees);
expectTypeOf(toEventsValue).not.toBeNever();
// #endregion

// #region Utilités restantes
// Test pour any
const anyValue = typings.any;
expectTypeOf(anyValue).toEqualTypeOf<any>();
// #endregion
