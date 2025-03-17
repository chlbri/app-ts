export type ToFunction_F = <T = any>(value: T) => () => T;
export const toFunction: ToFunction_F = value => () => value;
