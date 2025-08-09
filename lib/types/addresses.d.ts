import type { types } from '@bemedev/types';
type GetParentsA<Parts extends types.AnyArray<string>, Remaining extends string = ''> = Parts extends [
    ...infer Rest extends types.AnyArray<string>,
    infer Last extends string
] ? (Remaining extends '' ? '..' | '../' : `${Remaining}${Last}` | `${Remaining}`) | GetParentsA<Rest, `../${Remaining}`> : never;
export type GetParents<T extends string> = T extends `/${infer S}` ? GetParentsA<types.SplitStringBy<S, '/'>> : never;
export type GetChildren<P extends string, T extends P> = P extends `${T}/${infer U}` ? U : never;
export {};
//# sourceMappingURL=addresses.d.ts.map