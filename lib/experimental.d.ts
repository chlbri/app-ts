import type { Contexts } from './interpreters/index.js';
import type { Describer, Describer2 } from '#types';
import type { types } from '@bemedev/types';
export declare const reduceRemainings: <Pc = any, Tc extends types.PrimitiveObject = types.PrimitiveObject>(...remains: (() => {
    result: Contexts<Pc, Tc>;
    target?: string;
})[]) => () => {
    target?: string;
    result: Contexts<Pc, Tc>;
};
export type ToDescriber_F = (arg: string | Describer) => Describer2;
export declare const toDescriber: ToDescriber_F;
//# sourceMappingURL=experimental.d.ts.map