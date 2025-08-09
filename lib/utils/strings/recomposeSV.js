import '../../constants/errors.js';
import { DEFAULT_DELIMITER } from '../../constants/strings.js';

/**
 * Recombines a string into a state value object.
 * The string is expected to be delimited by the default delimiter.
 * The first part of the string becomes the key, and the rest becomes the value.
 * If the string starts with the delimiter, it is removed before processing.
 * @param arg The string to recompose.
 * @param delimiter The delimiter used to split the string. Defaults to {@linkcode DEFAULT_DELIMITER}.
 * @returns An object with the first part as the key and the recomposed value as the value.
 *
 * @see {@linkcode RecomposeSV_F} for the type definition
 */
const recomposeSV = (arg, delimiter = DEFAULT_DELIMITER) => {
    const arg1 = arg.startsWith(delimiter) ? arg.substring(1) : arg;
    const splits = arg1.split(delimiter);
    const check2 = splits.length === 1;
    if (check2)
        return arg1;
    const first = splits.shift();
    const rest = splits.join(delimiter);
    return { [first]: recomposeSV(rest) };
};

export { recomposeSV };
//# sourceMappingURL=recomposeSV.js.map
