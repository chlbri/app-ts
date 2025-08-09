/**
 * Resolves a relative path against a base path, similar to path.resolve but without dependencies
 * @param basePath - The base path to resolve from
 * @param relativePath - The relative path to resolve
 * @returns The resolved absolute path
 *
 * @example
 * resolve('/parent/child/grandchild/grantchild', '../grandchild')
 * // returns '/parent/child/grandchild'
 *
 * resolve('/parent/child/grandchild/grantchild', '../../grandchild')
 * // returns '/parent/child/grandchild'
 */
export declare function resolve(basePath: string, relativePath: string): string;
//# sourceMappingURL=resolve.d.ts.map