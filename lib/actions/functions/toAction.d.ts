import type { ActionConfig, ActionMap, ActionResult } from '../index.js';
import type { EventsMap, PromiseeMap } from '../../events/index.js';
import { type FnR } from '#types';
import type { types } from '@bemedev/types';
export type ToAction_F = <E extends EventsMap, P extends PromiseeMap = PromiseeMap, Pc = any, Tc extends types.PrimitiveObject = types.PrimitiveObject>(events: E, promisees: P, action: ActionConfig, actions?: ActionMap<E, P, Pc, Tc>) => FnR<E, P, Pc, Tc, ActionResult<Pc, Tc>> | undefined;
/**
 * Converts an ActionConfig to a function that can be executed with the provided eventsMap and promisees.
 * @param events of type {@linkcode EventsMap}, events map to use for resolving the action.
 * @param promisees of type {@linkcode PromiseeMap}, the promisees map to use for resolving the action.
 * @param action of type {@linkcode ActionConfig}, action configuration to convert.
 * @param actions of type {@linkcode ActionMap}, The actions map containing functions to execute.
 *
 * @see {@linkcode types.PrimitiveObject}
 * @see {@linkcode ActionResult}
 * @see {@linkcode reduceFnMap}
 * @see {@linkcode isDescriber}
 */
export declare const toAction: ToAction_F;
//# sourceMappingURL=toAction.d.ts.map