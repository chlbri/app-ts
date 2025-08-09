'use strict';

var types = require('@bemedev/types');

/**
 * Creates a machine configuration.
 * This function takes a configuration object and returns it as is.
 * It is a utility function to ensure that the configuration is of the correct type.
 *
 * @param value - The configuration object of type {@linkcode Config}.
 *
 * @returns The same configuration object of type {@linkcode Config}.
 *
 */
const createConfig = types.castings.commons.any;
/**
 * Creates a child service for a machine.
 * @param machine of type {@linkcode KeyU}<'preConfig' | 'context' | 'pContext'> the machine to use for creating a child service.
 * @param initials - The initials for the child service, containing `pContext` and `context`.
 * @param subscribers - The subscribers to the child service to build.
 * @returns A {@linkcode ChildS} object representing the produced child service.
 */
const createChildS = (machine, initials, subscribers) => ({
    machine,
    initials,
    subscribers,
});

exports.createChildS = createChildS;
exports.createConfig = createConfig;
//# sourceMappingURL=create.cjs.map
