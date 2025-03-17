import {
  Fn,
  t,
  type DeepPartial,
  type Ra,
  type Rn,
  type Ru,
} from '@bemedev/types';
import { expectTypeOf } from 'vitest';
import { config2, machine2 } from '~fixturesData';
import type { InterpreterFrom } from '~interpreter';
import type {
  AnyMachine,
  Config,
  ConfigFrom,
  createMachine,
} from '~machines';
import { typings } from './typings';

// Test de la fonction principale
const genericValue = typings<string>();
expectTypeOf(genericValue).toEqualTypeOf<string>();

// Test des types primitifs
const numberValue = typings.number();
expectTypeOf(numberValue).toEqualTypeOf<number>();

const stringValue = typings.string();
expectTypeOf(stringValue).toEqualTypeOf<string>();

const booleanValue = typings.boolean();
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

const objectValue = typings.object;
expectTypeOf(objectValue).toEqualTypeOf<{}>();

const partialValue = typings.partial<TestObject>();
expectTypeOf(partialValue).toEqualTypeOf<Partial<TestObject>>();

const deepPartialValue = typings.deepPartial({
  age: 42,
  name: 'test',
});
expectTypeOf(deepPartialValue).toEqualTypeOf<DeepPartial<TestObject>>();

const arrayValue1 = typings.array<number[]>(1, 2, 3);
expectTypeOf(arrayValue1).toEqualTypeOf<number[]>();

const arrayValue2 = typings.array(1, 2, 3);
expectTypeOf(arrayValue2).toEqualTypeOf<(1 | 2 | 3)[]>();

const tupleValue = typings.tuple(1, 'hello', true);
expectTypeOf(tupleValue).toEqualTypeOf<[1, 'hello', true]>();

const functionValue = typings.function('hello', 42, true);
expectTypeOf(functionValue).toEqualTypeOf<Fn<[string, number], boolean>>();

// #region Test des types liés aux machines
const dummyMachine = {} as AnyMachine;
const machineValue = typings.machine(dummyMachine);
expectTypeOf(machineValue).toEqualTypeOf<AnyMachine>();

const interpreterValue1 = typings.interpret(dummyMachine);
expectTypeOf(interpreterValue1).toEqualTypeOf<
  InterpreterFrom<AnyMachine>
>();
type Machine2 = typeof machine2;
const interpreterValue2 = typings.interpret(machine2);
expectTypeOf(interpreterValue2).toEqualTypeOf<InterpreterFrom<Machine2>>();

const createMachineValue = typings.createMachine<ConfigFrom<Machine2>>;
expectTypeOf(createMachineValue).branded.toEqualTypeOf<
  typeof createMachine<ConfigFrom<Machine2>>
>();

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

const numberSpecificType = typings.number<42>();
expectTypeOf(numberSpecificType).toEqualTypeOf<42>();

const stringLiteralType = typings.string<'hello'>();
expectTypeOf(stringLiteralType).toEqualTypeOf<'hello'>();
// #endregion

const complexFnType = typings.function('test', Promise.resolve(42));
expectTypeOf(complexFnType).toEqualTypeOf<Fn<[string], Promise<number>>>();
