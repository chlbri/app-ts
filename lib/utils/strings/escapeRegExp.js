import '../../constants/errors.js';
import { ESCAPE_REGEXP } from '../../constants/strings.js';

/**
 * Escapes special characters in a string to be used in a regular expression.
 * @param arg The string to escape.
 * @returns The escaped string, where special characters are prefixed with a `'\\$&'`.
 *
 * @see {@linkcode EscapeRexExp_F} for the type definition
 * @see {@linkcode ESCAPE_REGEXP} for the regular expression used to identify special characters.
 */
const escapeRegExp = arg => {
    const replacer = '\\$&';
    return arg.replace(ESCAPE_REGEXP, replacer);
};

export { escapeRegExp };
//# sourceMappingURL=escapeRegExp.js.map
