/**
 * Converts an event to its type.
 * If the event is a string, it returns the string.
 * If the event is an object, it returns the type property of the object.
 * @param event of type {@linkcode EventObject} or string
 * @returns string representing the type of the event
 */
const eventToType = event => {
    const check = typeof event === 'string';
    if (check)
        return event;
    return event.type;
};

export { eventToType };
//# sourceMappingURL=eventToType.js.map
