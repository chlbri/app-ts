import type { EventStrings } from '../types';
/**
 * Checks if the provided event is a {@linkcode EventStrings}.
 * @param event of type any, the event to check
 * @returns true if the event is a {@linkcode EventStrings}
 * @satisfies typechecker
 *
 * @see {@linkcode INIT_EVENT} for the initial event.
 * @see {@linkcode ALWAYS_EVENT} for the always event.
 * @see {@linkcode AFTER_EVENT} for the after event.
 * @see {@linkcode MAX_EXCEEDED_EVENT_TYPE} for the max exceeded event.
 */
export declare const isStringEvent: (event: any) => event is EventStrings;
//# sourceMappingURL=isStringEvent.d.ts.map