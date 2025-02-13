import type { Fn } from '@bemedev/types';
import type { ActionConfig } from '~actions';
import type { EventsMap, ToEvents } from '~events';
import type { AnyMachine } from '~machine';
import {
  isDescriber,
  isFunction,
  MAP_CONCATENER,
  type PrimitiveObject,
} from '~types';
import type { Child, MachineMap } from './types';

export type ToMachine_F = <
  E extends EventsMap,
  Tc extends PrimitiveObject = PrimitiveObject,
>(
  events: E,
  machine?: ActionConfig,
  machines?: MachineMap<E, Tc>,
) => ((context: Tc, event1: ToEvents<E>) => Tc | undefined) | undefined;

export type ReducerMachine_F = <
  E extends EventsMap,
  Tc extends PrimitiveObject = PrimitiveObject,
  T extends AnyMachine = AnyMachine,
>({
  subscriber,
  service,
  eventsMap,
}: Child<E, Tc, T> & {
  eventsMap: E;
}) => (context: Tc, event1: ToEvents<E>) => Tc | undefined;

export const reducerMachine: ReducerMachine_F = ({
  subscriber,
  service,
  eventsMap,
}) => {
  const check1 = isFunction(subscriber);

  if (check1) {
    return (context, event) => {
      const _context = (subscriber as Fn)(
        [service.context, context],
        [service.event, event],
      );

      return _context;
    };
  }

  const keys1 = Object.keys(service.eventsMap);
  const keys2 = Object.keys(eventsMap);

  const keys: string[] = [];
  for (const key1 of keys1) {
    for (const key2 of keys2) {
      keys.push(`${key1}${MAP_CONCATENER}${key2}`);
    }
  }

  return (context, event1) => {
    const check5 = typeof event1 === 'string';
    if (check5) return;

    const event2 = service.event;
    const check6 = typeof event2 === 'string';
    if (check6) return;

    const { payload, type } = event1;
    const _else = subscriber.else!;

    for (const key of keys) {
      const check2 =
        type === key.substring(0, key.indexOf(MAP_CONCATENER));
      const func = (subscriber as any)[key];
      const check3 = !!func;

      const check4 = check2 && check3;
      if (check4)
        return func([service.context, context], [payload, event2.payload]);
    }

    return (_else as Fn)(
      [service.context, context],
      [payload, event2.payload],
    );
  };
};

export const toMachine: ToMachine_F = (eventsMap, machine, machines) => {
  if (!machine) return undefined;

  if (isDescriber(machine)) {
    const child = machines?.[machine.name];
    if (!child) return;

    const { service, subscriber } = child;
    const func = subscriber
      ? reducerMachine({ service, subscriber, eventsMap })
      : undefined;

    return func;
  }

  const child = machines?.[machine];
  if (!child) return;

  const { service, subscriber } = child;
  const func = subscriber
    ? reducerMachine({ service, subscriber, eventsMap })
    : undefined;

  return func;
};
