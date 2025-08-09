export type CheckKeys_F = <T extends object>(arg: T, ...keys: string[]) => boolean;
/**
 * Checks if all specified keys are present in the given object.
 * @param arg Object to check keys against
 * @param keys Keys to check for presence in the object
 * @returns `true` if all keys are present, `false` otherwise
 *
 * @see {@linkcode CheckKeys_F} for the type definition
 */
export declare const checkKeys: CheckKeys_F;
//# sourceMappingURL=checkKeys.d.ts.map