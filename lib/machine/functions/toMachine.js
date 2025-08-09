import { isDescriber } from '../../types/primitives.js';

/**
 * Converts a machine configuration to a machine object with an id.
 * * If the machine is a describer, it looks up the machine configuration by name.
 * * If the machine is a string, it looks up the machine configuration by that string.
 * * If the machine is not found in the provided machines map, it returns undefined.
 * @param machine of type {@linkcode ActionConfig}, the machine configuration to convert.
 * @param machines of type {@linkcode MachineMap}, the map of machines to look up the machine configuration.
 * @returns a machine object with an id, or undefined if the machine is not found.
 *
 * @see {@linkcode ChildS} for the structure of the machine object.
 * @see {@linkcode isDescriber} to check if the machine is a describer
 * @see {@linkcode types.PrimitiveObject} for the type of the context
 * @see {@linkcode EventsMap} for the events map
 * @see {@linkcode PromiseeMap} for the promisees map
 */
const toMachine = (machine, machines) => {
    if (isDescriber(machine)) {
        const out = machines?.[machine.name];
        if (!out)
            return undefined;
        return { ...out, id: machine.name };
    }
    const out = machines?.[machine];
    if (!out)
        return undefined;
    return { ...out, id: machine };
};

export { toMachine };
//# sourceMappingURL=toMachine.js.map
