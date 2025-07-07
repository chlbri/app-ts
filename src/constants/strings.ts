/**
 * Default delimiter used in paths.
 * This is used to separate keys in nested objects when converting them to paths.
 */
export const DEFAULT_DELIMITER = '/' as const;

/**
 * Default key used for targetless actions.
 */
export const TARGETLESS_KEY = '' as const;

/**
 * Default value for "nothing" actions.
 * For test purposes, this is used to represent a no-operation or a placeholder.
 */
export const DEFAULT_NOTHING = 'nothing' as const;

/**
 * Regular expression used to escape special characters in strings.
 */
export const ESCAPE_REGEXP = /[.*+?^${}()|[\]\\]/g;
