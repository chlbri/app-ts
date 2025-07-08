/* eslint-disable @typescript-eslint/no-unused-vars */
import { castings, typings } from '@bemedev/types';
import type {
  PrimitiveObject,
  SoRa,
} from '@bemedev/types/lib/types/commons.types';
import type { ActionConfig } from '~actions';
import type { EventsMap, PromiseeDef, PromiseeMap } from '~events';
import type {
  AnyMachine,
  Config,
  EventsMapFrom,
  PromiseesMapFrom,
} from '~machines';
import {
  DESCRIBER_KEYS,
  isDescriber,
  type Describer,
  type FnMap,
  type FnMapR,
} from '~types';
import { checkKeys } from './objects';

const isConfig = (
  value: unknown,
  mainAncestor = true,
): value is Config => {
  if (value === null || typeof value !== 'object') return false;

  const config = value as Record<string, unknown>;

  // #region Vérifier les propriétés optionnelles du config principal
  if ('machines' in config && config.machines !== undefined) {
    if (mainAncestor === false) return false;
    const machines = config.machines;
    if (Array.isArray(machines)) {
      if (
        !machines.every(
          machine =>
            typeof machine === 'string' ||
            (typeof machine === 'object' &&
              machine !== null &&
              checkKeys(machine, ...DESCRIBER_KEYS)),
        )
      ) {
        return false;
      }
    } else {
      if (
        !(
          typeof machines === 'string' ||
          (typeof machines === 'object' &&
            machines !== null &&
            checkKeys(machines, ...DESCRIBER_KEYS))
        )
      ) {
        return false;
      }
    }
  }

  if ('strict' in config && config.strict !== undefined) {
    if (mainAncestor === false) return false;
    if (typeof config.strict !== 'boolean') return false;
  }
  // #endregion

  // Vérifier le type de nœud
  if ('type' in config && config.type !== undefined) {
    const type = config.type;
    if (type !== 'compound' && type !== 'parallel') return false;

    // Si type est 'parallel', initial ne doit pas être défini
    if (
      type === 'parallel' &&
      'initial' in config &&
      config.initial !== undefined
    ) {
      return false;
    }
  }

  // Vérifier les propriétés de transition du config principal
  const transitionKeys = ['on', 'always', 'after', 'promises'] as const;
  for (const key of transitionKeys) {
    //TODO: Betterify
    //TODO: Add nested tests like TransitionConfig and actions, and guards
    if (key in config && config[key] !== undefined) {
      const val = config[key];
      if (key === 'on' || key === 'after') {
        if (typeof val !== 'object' || val === null) return false;
      } else if (key === 'promises') {
        if (Array.isArray(val)) {
          if (!val.every(p => typeof p === 'object' && p !== null))
            return false;
        } else if (typeof val !== 'object' || val === null) {
          return false;
        }
      }
    }
  }

  // #region Vérifier les propriétés communes du config principal
  const commonKeys = [
    'description',
    'entry',
    'exit',
    'tags',
    'activities',
  ] as const;
  for (const key of commonKeys) {
    if (key in config && config[key] !== undefined) {
      const val = config[key];
      if (key === 'description') {
        if (typeof val !== 'string') return false;
      } else if (key === 'entry' || key === 'exit') {
        if (Array.isArray(val)) {
          if (
            !val.every(
              action =>
                typeof action === 'string' ||
                (typeof action === 'object' &&
                  action !== null &&
                  checkKeys(action, ...DESCRIBER_KEYS)),
            )
          ) {
            return false;
          }
        } else {
          if (
            !(
              typeof val === 'string' ||
              (typeof val === 'object' && val !== null && isDescriber(val))
            )
          ) {
            return false;
          }
        }
      } else if (key === 'tags') {
        if (Array.isArray(val)) {
          if (!val.every(tag => typeof tag === 'string')) return false;
        } else if (typeof val !== 'string') {
          return false;
        }
      } else if (key === 'activities') {
        if (typeof val !== 'object' || val === null) return false;
      }
    }
  }
  // #endregion

  // #region Vérifier la propriété states
  const check =
    mainAncestor &&
    (!('states' in config) ||
      config.states === null ||
      typeof config.states !== 'object');

  if (check) return false;

  const states = config.states as Record<string, unknown>;

  // #region Vérifier que chaque état est valide (récursion)
  for (const stateValue of Object.values(states)) {
    if (stateValue === null || typeof stateValue !== 'object') {
      return false;
    }

    const state = stateValue as Record<string, unknown>;

    // Si l'état a des sous-états, vérifier récursivement
    if ('states' in state && state.states !== undefined) {
      if (isConfig(state, false)) continue;
      return false;
    }
  }
  // #endregion
  // #endregion

  return true;
};

const fnR = {
  cast: castings.castFnBasic(
    <
      E extends EventsMap = EventsMap,
      P extends PromiseeMap = PromiseeMap,
      Pc = any,
      Tc extends PrimitiveObject = PrimitiveObject,
      R = any,
    >(
      events?: E,
      promisees?: P,
      pContext?: Pc,
      context?: Tc,
      _return?: R,
    ) =>
      castings.commons.function(
        castings.commons.required(events),
        castings.commons.required(promisees),
        castings.commons.required(pContext),
        castings.commons.required(context),
        _return as R,
      ),
    {
      machine: <R = any, M extends AnyMachine = AnyMachine>(
        _return?: R,
        machine?: M,
      ) => {
        const _machine = castings.commons.required(machine);
        return castings.commons.function(
          _machine.eventsMap,
          _machine.promiseesMap,
          _machine.pContext,
          _machine.context,
          _return as R,
        );
      },
    },
  ),
  type: typings.typeFnBasic(
    <
      E extends EventsMap = EventsMap,
      P extends PromiseeMap = PromiseeMap,
      Pc = any,
      Tc extends PrimitiveObject = PrimitiveObject,
      R = any,
    >(
      events?: E,
      promisees?: P,
      pContext?: Pc,
      context?: Tc,
      _return?: R,
    ) =>
      typings.commons.function(
        typings.commons.required(events),
        typings.commons.required(promisees),
        typings.commons.required(
          typings.commons.extract(pContext, typings.objects.type),
        ),
        typings.commons.required(
          typings.commons.extract(context, typings.objects.primitive.type),
        ),
        _return as R,
      ),
    {
      machine: <R = any, M extends AnyMachine = AnyMachine>(
        machine?: M,
        _return?: R,
      ) => {
        const _machine = typings.commons.required(machine);
        return typings.commons.function(
          _machine.eventsMap,
          _machine.promiseesMap,
          _machine.context,
          _return as R,
        );
      },
    },
  ),
};

const fnReduced = {
  cast: <
    E extends EventsMap = EventsMap,
    P extends PromiseeMap = PromiseeMap,
    Tc extends PrimitiveObject = PrimitiveObject,
    R = any,
  >() => castings.commons.function.dynamic<[E, P, Tc], R>,

  type: <
    E extends EventsMap = EventsMap,
    P extends PromiseeMap = PromiseeMap,
    Tc extends PrimitiveObject = PrimitiveObject,
    R = any,
  >() => typings.commons.function.dynamic<[E, P, Tc], R>,
};

const isSoRa = (value: unknown): value is SoRa<PrimitiveObject> => {
  const checkArray = castings.arrays.is(value);
  if (checkArray) return value.every(isSoRa);

  return castings.commons.primitiveObject.is(value);
};

const promiseDef = {
  cast: castings.castFn<PromiseeDef>()({
    is: castings.commons.function.checker.byType.forceCast<PromiseeDef>(
      value => {
        return (
          !(
            castings.commons.isNull(value) ||
            castings.commons.isUndefined(value)
          ) &&
          castings.objects.hasKeys.all.typings(value, {
            then: isSoRa,
            catch: isSoRa,
          })
        );
      },
    ),
  }),
  type: typings.typeFn<PromiseeDef>()(),
};

const fnMap = {
  cast: castings.castFnBasic(
    <
      E extends EventsMap = EventsMap,
      P extends PromiseeMap = PromiseeMap,
      Pc = any,
      Tc extends PrimitiveObject = PrimitiveObject,
      R = any,
    >(
      _?: E,
      __?: P,
      ___?: Pc,
      ____?: Tc,
      ______?: R,
    ) => castings.objects.dynamic<FnMap<E, P, Pc, Tc, R>>,
    {
      machine: <R = any, M extends AnyMachine = AnyMachine>(
        _?: R,
        __?: M,
      ) => {
        return castings.objects.dynamic<
          FnMap<
            EventsMapFrom<M>,
            PromiseesMapFrom<M>,
            M['pContext'],
            M['context'],
            R
          >
        >;
      },
    },
  ),

  type: typings.typeFnBasic(
    <
      E extends EventsMap = EventsMap,
      P extends PromiseeMap = PromiseeMap,
      Pc = any,
      Tc extends PrimitiveObject = PrimitiveObject,
      R = any,
    >(
      _?: E,
      __?: P,
      ___?: Pc,
      ____?: Tc,
      ______?: R,
    ) => typings.objects.dynamic<FnMap<E, P, Pc, Tc, R>>,

    {
      machine: <R = any, M extends AnyMachine = AnyMachine>(
        _?: R,
        __?: M,
      ) => {
        return typings.objects.dynamic<
          FnMap<
            EventsMapFrom<M>,
            PromiseesMapFrom<M>,
            M['pContext'],
            M['context'],
            R
          >
        >;
      },
    },
  ),
};

const fnMapR = {
  cast: castings.castFnBasic(
    <
      E extends EventsMap = EventsMap,
      P extends PromiseeMap = PromiseeMap,
      Tc extends PrimitiveObject = PrimitiveObject,
      R = any,
    >(
      _?: E,
      __?: P,
      ____?: Tc,
      ______?: R,
    ) => castings.objects.dynamic<FnMapR<E, P, Tc, R>>,
    {
      machine: <R = any, M extends AnyMachine = AnyMachine>(
        _?: R,
        __?: M,
      ) => {
        return castings.objects.dynamic<
          FnMapR<EventsMapFrom<M>, PromiseesMapFrom<M>, M['context'], R>
        >;
      },
    },
  ),

  type: typings.typeFnBasic(
    <
      E extends EventsMap = EventsMap,
      P extends PromiseeMap = PromiseeMap,
      Tc extends PrimitiveObject = PrimitiveObject,
      R = any,
    >(
      _?: E,
      __?: P,
      ____?: Tc,
      ______?: R,
    ) => typings.objects.dynamic<FnMapR<E, P, Tc, R>>,
    {
      machine: <R = any, M extends AnyMachine = AnyMachine>(
        _?: R,
        __?: M,
      ) => {
        return typings.objects.dynamic<
          FnMapR<EventsMapFrom<M>, PromiseesMapFrom<M>, M['context'], R>
        >;
      },
    },
  ),
};

const _anyMachine = {
  cast: castings.castFnBasic(
    <
      E extends EventsMap = EventsMap,
      P extends PromiseeMap = PromiseeMap,
      Pc = any,
      Tc extends PrimitiveObject = PrimitiveObject,
    >(
      _?: E,
      __?: P,
      ___?: Pc,
      ____?: Tc,
    ) => castings.objects.dynamic<AnyMachine<E, P, Pc, Tc>>,
  ),

  type: typings.typeFnBasic(
    <
      E extends EventsMap = EventsMap,
      P extends PromiseeMap = PromiseeMap,
      Pc = any,
      Tc extends PrimitiveObject = PrimitiveObject,
    >(
      _?: E,
      __?: P,
      ___?: Pc,
      ____?: Tc,
    ) => typings.objects.dynamic<AnyMachine<E, P, Pc, Tc>>,
  ),
};

const typeMachine = {
  castings: {
    strings: castings.strings,

    numbers: castings.numbers,

    booleans: castings.booleans,

    config: castings.castFn<Config>()({
      is: castings.commons.function.checker.byType.forceCast<Config>(
        isConfig,
      ),
    }),

    events: {
      map: castings.castFn<EventsMap>()({
        is: castings.commons.function.checker.byType.forceCast<EventsMap>(
          value => {
            if (value === null) return false;
            return (
              typeof value === 'object' &&
              Object.values(value).every(
                castings.commons.primitiveObject.is,
              )
            );
          },
        ),
      }),
    },

    promisees: {
      map: castings.castFn<PromiseeMap>()({
        is: castings.commons.function.checker.byType.forceCast<PromiseeMap>(
          value => {
            if (value === null) return false;
            return (
              typeof value === 'object' &&
              Object.values(value).every(promiseDef.cast.is)
            );
          },
        ),
      }),

      def: promiseDef.cast,
    },

    functions: {
      fnR: fnR.cast,
      fnReduced: fnReduced.cast,
      map: {
        fnMap: fnMap.cast,
        fnMapR: fnMapR.cast,
      },
    },

    actions: castings.castFn<ActionConfig>()({
      is: castings.commons.function.checker.byType.forceCast<ActionConfig>(
        value => {
          if (value === null) return false;
          return (
            typeof value === 'string' ||
            (typeof value === 'object' &&
              checkKeys(value, ...DESCRIBER_KEYS))
          );
        },
      ),
      describer: castings.castFn<Describer>()({
        is: castings.commons.function.checker.byType.forceCast<Describer>(
          value => {
            if (value === null) return false;
            return (
              typeof value === 'object' &&
              checkKeys(value, ...DESCRIBER_KEYS)
            );
          },
        ),
      }),
    }),

    any: _anyMachine.cast,
  },
  typings: {
    strings: typings.strings,
    numbers: typings.numbers,
    booleans: typings.booleans,

    config: typings.typeFn<Config>()(),

    events: {
      map: typings.typeFn<EventsMap>()(),
    },

    promisees: {
      map: typings.typeFn<PromiseeMap>()(),
      def: promiseDef.type,
    },

    functions: {
      fnR: fnR.type,
      fnReduced: fnReduced.type,
      map: {
        fnMap: fnMap.type,
        fnMapR: fnMapR.type,
      },
    },

    actions: typings.typeFn<ActionConfig>()({
      describer: typings.typeFn<Describer>()(),
    }),

    any: _anyMachine.type,
  },
};

export default typeMachine;
