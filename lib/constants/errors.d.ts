import type { types } from '@bemedev/types';
/**
 * Contains error messages for various machine components.
 * Each component (action, guard, delay, promise, machine) has three types of errors:
 * - `notDefined`: Indicates that the component is not defined.
 * - `notDescribed`: Indicates that the component is not described.
 * - `notProvided`: Indicates that the component is not provided.
 */
export declare const ERRORS: types.UnionToIntersection<{
    action: {
        notDefined: {
            string: "Action is undefined";
            error: Error;
        };
        notDescribed: {
            string: "Action is not described";
            error: Error;
        };
        notProvided: {
            string: "Action is not provided";
            error: Error;
        };
    };
} | {
    guard: {
        notDefined: {
            string: "Guard is undefined";
            error: Error;
        };
        notDescribed: {
            string: "Guard is not described";
            error: Error;
        };
        notProvided: {
            string: "Guard is not provided";
            error: Error;
        };
    };
} | {
    delay: {
        notDefined: {
            string: "Delay is undefined";
            error: Error;
        };
        notDescribed: {
            string: "Delay is not described";
            error: Error;
        };
        notProvided: {
            string: "Delay is not provided";
            error: Error;
        };
    };
} | {
    promise: {
        notDefined: {
            string: "Promise is undefined";
            error: Error;
        };
        notDescribed: {
            string: "Promise is not described";
            error: Error;
        };
        notProvided: {
            string: "Promise is not provided";
            error: Error;
        };
    };
} | {
    machine: {
        notDefined: {
            string: "Machine is undefined";
            error: Error;
        };
        notDescribed: {
            string: "Machine is not described";
            error: Error;
        };
        notProvided: {
            string: "Machine is not provided";
            error: Error;
        };
    };
}>;
//# sourceMappingURL=errors.d.ts.map