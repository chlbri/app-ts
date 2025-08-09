/**
 * Default delimiter used in paths.
 * This is used to separate keys in nested objects when converting them to paths.
 */
const DEFAULT_DELIMITER = '/';
/**
 * Default key used for targetless actions.
 */
const TARGETLESS_KEY = '';
/**
 * Default value for "nothing" actions.
 * For test purposes, this is used to represent a no-operation or a placeholder.
 */
const DEFAULT_NOTHING = 'nothing';
/**
 * Regular expression used to escape special characters in strings.
 */
const ESCAPE_REGEXP = /[.*+?^${}()|[\]\\]/g;

export { DEFAULT_DELIMITER, DEFAULT_NOTHING, ESCAPE_REGEXP, TARGETLESS_KEY };
//# sourceMappingURL=strings.js.map
