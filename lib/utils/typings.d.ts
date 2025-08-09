import { type types } from '@bemedev/types';
type PrimitiveS = 'string' | 'number' | 'boolean' | 'null' | 'undefined';
type TransformPrimitiveS<T extends PrimitiveS> = T extends 'string' ? string : T extends 'number' ? number : T extends 'boolean' ? boolean : T extends 'null' ? null : T extends 'undefined' ? undefined : T;
type Types = PrimitiveS | 'primitive';
type TransformTypes<T extends Types> = T extends PrimitiveS ? TransformPrimitiveS<T> : {};
export declare const CUSTOM: "$$app-ts => custom$$";
export declare const PARTIAL: "$$app-ts => partial$$";
export type Custom<T = any> = {
    [CUSTOM]: T;
};
export type PartialCustom = {
    [PARTIAL]: undefined;
};
type PrimitiveObjectMap = {
    [key: types.Keys]: types.SoRa<_PrimitiveObject>;
};
type _PrimitiveObject = Types | PrimitiveObjectMap | Custom | PartialCustom;
/**
 * A type that represents a primitive object, which can be a primitive value or an object
 *
 * @remark
 */
type PrimitiveObject = _PrimitiveObject;
export type Args<E extends PrimitiveObject = PrimitiveObject, P extends PrimitiveObject = PrimitiveObject> = {
    eventsMap: E;
    pContext: PrimitiveObject;
    context: PrimitiveObject;
    promiseesMap: P;
};
export type TransformPrimitiveObject<T> = T extends Types ? TransformTypes<T> : T extends Custom<infer TCustom> ? TCustom : T extends PartialCustom ? Partial<TransformPrimitiveObject<types.NOmit<T, typeof PARTIAL>>> : T extends types.AnyArray<any> ? T[number] extends infer TKN extends types.PrimitiveObject ? TransformPrimitiveObject<TKN>[] : never : {
    [K in keyof T]: TransformPrimitiveObject<T[K]>;
};
export type TransformArgs<T extends Partial<Args>> = {
    eventsMap: TransformPrimitiveObject<T['eventsMap']>;
    pContext: TransformPrimitiveObject<T['pContext']>;
    context: TransformPrimitiveObject<T['context']>;
    promiseesMap: TransformPrimitiveObject<T['promiseesMap']>;
};
export declare const typings: {
    <T extends Partial<Args>>(args: T): TransformArgs<T>;
    custom<T = any>(value?: T): Custom<T>;
    partial<T extends PrimitiveObject>(value: T): T & PartialCustom;
};
export {};
//# sourceMappingURL=typings.d.ts.map