# @bemedev/app-ts

A TypeScript library for creating and managing state machines.

<br/>

## Installation

```bash
npm install @bemedev/app-ts
# or
yarn add @bemedev/app-ts
```

<br/>

## Features

- Typed state machine creation
- Public and private context management
- Support for actions, guards and delays
- Transition and event handling
- Support for nested machines
- Support for subscribables (e.g rxjs)
- Comprehensive typings utilities with Valibot-like API

<br/>

## Usage

### Basic Machine

```typescript
import { createMachine } from '@bemedev/app-ts';

const machine = createMachine({
  initial: 'idle',
  states: {
    idle: {
      on: {
        START: 'running',
      },
    },
    running: {
      on: {
        STOP: 'idle',
      },
    },
  },
});
```

### Typings Utilities

The library provides powerful typing utilities inspired by Valibot for
defining complex types:

```typescript
import { typings, inferT } from '@bemedev/app-ts';

// Literals
const status = typings.litterals('idle', 'pending', 'success', 'error');
type Status = inferT<typeof status>; // 'idle' | 'pending' | 'success' | 'error'

// Union types
const value = typings.union('string', 'number', 'boolean');
type Value = inferT<typeof value>; // string | number | boolean

// Arrays
const tags = typings.array('string');
type Tags = inferT<typeof tags>; // string[]

// Tuples
const coordinates = typings.tuple('number', 'number');
type Coordinates = inferT<typeof coordinates>; // [number, number]

// Objects
const user = typings.any({
  name: 'string',
  age: 'number',
  email: typings.maybe('string'), // optional field
});
type User = inferT<typeof user>; // { name: string; age: number; email?: string }

// Records
const config = typings.record('string'); // Record<string, string>
const namedConfig = typings.record('number', 'width', 'height'); // { width: number; height: number }

// Intersection types
const person = typings.intersection(
  { name: 'string', age: 'number' },
  { email: 'string', phone: 'string' },
);
type Person = inferT<typeof person>; // { name: string; age: number; email: string; phone: string }

// Discriminated unions
const shape = typings.discriminatedUnion(
  'type',
  { type: typings.litterals('circle'), radius: 'number' },
  {
    type: typings.litterals('rectangle'),
    width: 'number',
    height: 'number',
  },
);

// Partial objects
const optionalUser = typings.partial({
  name: 'string',
  age: 'number',
});
type OptionalUser = inferT<typeof optionalUser>; // { name?: string; age?: number }

// Custom types
const customType = typings.custom<MyCustomType>();

// Single or Array (SoA)
const singleOrMany = typings.soa('string');
type SingleOrMany = inferT<typeof singleOrMany>; // string | string[]

// StateValue type helper
const stateValue = typings.sv;
type MyStateValue = inferT<typeof stateValue>; // StateValue
```

### Using Typings with Machines

```typescript
import { createMachine, typings } from '@bemedev/app-ts';

const machine = createMachine(
  {
    initial: 'idle',
    states: {
      idle: {
        on: { FETCH: 'loading' },
      },
      loading: {
        on: { SUCCESS: 'success', ERROR: 'error' },
      },
      success: {},
      error: {},
    },
  },
  typings({
    eventsMap: {
      FETCH: 'primitive',
      SUCCESS: { data: typings.array('string') },
      ERROR: { message: 'string' },
    },
    context: {
      items: typings.array('string'),
      error: typings.maybe('string'),
    },
  }),
);
```

### Machine Interpretation

```typescript
import { interpret } from '@bemedev/app-ts';

// Create an interpreter service
const service = interpret(machine, {
  context: { items: [], error: undefined },
  pContext: {}, // private context
});

// Start the service
service.start();

// Send events
service.send('FETCH');
service.send({ type: 'SUCCESS', payload: { data: ['item1', 'item2'] } });

// Get current state
console.log(service.value); // 'success'
console.log(service.context); // { items: ['item1', 'item2'], error: undefined }

// Stop the service
await service[Symbol.asyncDispose]();
```

### Subscribe to State Changes

```typescript
import { interpret } from '@bemedev/app-ts';

const service = interpret(machine, {
  context: { items: [], error: undefined },
});

// Subscribe to all state changes
const subscription = service.subscribe((prevState, currentState) => {
  console.log('State changed:', {
    from: prevState.value,
    to: currentState.value,
  });
});

// Subscribe to specific events
const eventSubscription = service.subscribe({
  SUCCESS: ({ payload }) => console.log('Success:', payload.data),
  ERROR: ({ payload }) => console.log('Error:', payload.message),
  else: () => console.log('Other event'),
});

service.start();

// Later: unsubscribe
subscription.unsubscribe();
eventSubscription.close();
```

### Advanced Machine with Actions, Guards, and Delays

```typescript
import { createMachine, typings } from '@bemedev/app-ts';

const fetchMachine = createMachine(
  {
    initial: 'idle',
    states: {
      idle: {
        on: {
          FETCH: {
            guards: 'canFetch',
            target: 'loading',
            actions: 'setLoading',
          },
        },
      },
      loading: {
        entry: 'logEntry',
        exit: 'logExit',
        promises: {
          src: 'fetchData',
          then: {
            actions: 'handleSuccess',
            target: 'success',
          },
          catch: {
            actions: 'handleError',
            target: 'error',
          },
        },
      },
      success: {
        after: {
          RESET_DELAY: { target: 'idle', actions: 'reset' },
        },
      },
      error: {
        on: {
          RETRY: 'loading',
        },
      },
    },
  },
  typings({
    eventsMap: {
      FETCH: { url: 'string' },
      RETRY: 'primitive',
    },
    context: {
      data: typings.maybe(typings.array('string')),
      error: typings.maybe('string'),
      loading: 'boolean',
    },
    pContext: {
      retryCount: 'number',
    },
    promiseesMap: {
      fetchData: {
        then: typings.array('string'),
        catch: { message: 'string' },
      },
    },
  }),
).provideOptions(({ assign, voidAction, isValue }) => ({
  actions: {
    setLoading: assign('context.loading', () => true),
    handleSuccess: assign('context', {
      'fetchData::then': ({ payload }) => ({
        data: payload,
        error: undefined,
        loading: false,
      }),
    }),
    handleError: assign('context', {
      'fetchData::catch': ({ payload }) => ({
        data: undefined,
        error: payload.message,
        loading: false,
      }),
    }),
    reset: assign('context', () => ({
      data: undefined,
      error: undefined,
      loading: false,
    })),
    logEntry: voidAction(() => console.log('Entering loading state')),
    logExit: voidAction(() => console.log('Exiting loading state')),
  },
  predicates: {
    canFetch: isValue('context.loading', false),
  },
  promises: {
    fetchData: async ({ event }) => {
      if (event.type !== 'FETCH') return [];
      const response = await fetch(event.payload.url);
      return response.json();
    },
  },
  delays: {
    RESET_DELAY: 3000, // 3 seconds
  },
}));
```

### Nested Machines

```typescript
import { createMachine, typings } from '@bemedev/app-ts';

const childMachine = createMachine(
  {
    initial: 'step1',
    states: {
      step1: { on: { NEXT: 'step2' } },
      step2: { on: { NEXT: 'step3' } },
      step3: { type: 'final' },
    },
  },
  typings({
    eventsMap: { NEXT: 'primitive' },
    context: { step: 'number' },
  }),
);

const parentMachine = createMachine(
  {
    machines: { child: 'childProcess' },
    initial: 'idle',
    states: {
      idle: {
        on: { START: 'working' },
      },
      working: {
        on: { COMPLETE: 'done' },
      },
      done: {},
    },
  },
  typings({
    eventsMap: { START: 'primitive', COMPLETE: 'primitive' },
    context: { status: 'string' },
  }),
).provideOptions(({ createChild }) => ({
  machines: {
    childProcess: createChild(
      childMachine,
      { context: { step: 0 } },
      { events: 'FULL' },
    ),
  },
}));
```

### Activities (Recurring Actions)

```typescript
import { createMachine, typings } from '@bemedev/app-ts';

const timerMachine = createMachine(
  {
    initial: 'running',
    states: {
      running: {
        activities: {
          TICK_DELAY: 'incrementCounter',
        },
        on: {
          PAUSE: 'paused',
        },
      },
      paused: {
        on: {
          RESUME: 'running',
        },
      },
    },
  },
  typings({
    eventsMap: { PAUSE: 'primitive', RESUME: 'primitive' },
    context: { counter: 'number' },
  }),
).provideOptions(({ assign }) => ({
  actions: {
    incrementCounter: assign(
      'context.counter',
      ({ context }) => context.counter + 1,
    ),
  },
  delays: {
    TICK_DELAY: 1000, // 1 second
  },
}));
```

<br/>

## API Reference

### Machine Creation

#### `createMachine(config, types)`

Creates a new state machine.

**Parameters:**

- `config`: Machine configuration object
  - `initial`: Initial state name
  - `states`: State definitions
  - `machines?`: Child machine definitions
  - `emitters?`: Observable emitters
- `types`: Type definitions
  - `context`: Public context type
  - `pContext?`: Private context type
  - `eventsMap`: Event definitions
  - `promiseesMap?`: Promise definitions

**Returns:** `Machine` instance

#### `createConfig(config)`

Utility to create a typed configuration object.

### Machine Methods

#### `machine.provideOptions(callback)`

Provides actions, guards, delays, promises, and child machines.

**Parameters:**

- `callback`: Function receiving helper utilities:
  - `assign`: Update context values
  - `voidAction`: Create side-effect actions
  - `isValue`, `isNotValue`: Value comparison guards
  - `createChild`: Create child machine instances
  - `sendTo`: Send events to child machines
  - `debounce`, `throttle`: Rate limiting utilities

**Returns:** `Machine` instance

#### `machine.addOptions(callback)`

Adds or overwrites options dynamically.

### Interpreter

#### `interpret(machine, options)`

Creates an interpreter service for a machine.

**Parameters:**

- `machine`: Machine instance
- `options`:
  - `context`: Initial public context
  - `pContext?`: Initial private context
  - `mode?`: `'strict'` | `'normal'` (default: `'strict'`)
  - `exact?`: Use exact timing intervals (default: `true`)

**Returns:** `Interpreter` service

### Interpreter Properties

- **`service.value`** - Current state value
- **`service.context`** - Current public context
- **`service.status`** - Service status (`'idle'`, `'working'`,
  `'stopped'`, etc.)
- **`service.state`** - Complete state snapshot
- **`service.config`** - Current state configuration
- **`service.mode`** - Current mode (`'strict'` | `'normal'`)

### Interpreter Methods

#### `service.start()`

Starts the service and begins processing.

#### `service.send(event)`

Sends an event to the machine.

**Parameters:**

- `event`: Event name (string) or event object `{ type, payload }`

#### `service.subscribe(subscriber, options?)`

Subscribes to state changes.

**Parameters:**

- `subscriber`: Callback function or event map
- `options?`:
  - `id?`: Unique subscriber ID
  - `equals?`: Custom equality function

**Returns:** Subscription object with `unsubscribe()` or `close()` method

#### `service.pause()`

Pauses the service (stops activities and timers).

#### `service.resume()`

Resumes the service after pausing.

#### `service.stop()`

Stops the service completely.

#### `await service[Symbol.asyncDispose]()`

Cleanly disposes of the service (async).

#### `service.dispose()`

Synchronously disposes of the service.

### State Configuration

#### State Definition

```typescript
states: {
  stateName: {
    type?: 'atomic' | 'compound' | 'parallel' | 'final',
    initial?: string, // For compound states
    entry?: ActionConfig, // Actions on entry
    exit?: ActionConfig, // Actions on exit
    on?: { [event: string]: TransitionConfig }, // Event transitions
    after?: { [delay: string]: TransitionConfig }, // Delayed transitions
    always?: TransitionConfig, // Automatic transitions
    activities?: { [delay: string]: ActionConfig }, // Recurring actions
    promises?: PromiseConfig, // Async operations
    states?: { [state: string]: StateDefinition }, // Nested states
  }
}
```

#### Transition Configuration

```typescript
type TransitionConfig =
  | string // Target state
  | {
      target?: string;
      guards?: GuardConfig; // Conditions
      actions?: ActionConfig; // Actions to execute
    }
  | TransitionConfig[]; // Multiple transitions (first match wins)
```

### Actions

#### `assign(path, updater)`

Updates context values.

```typescript
actions: {
  updateCount: assign('context.count', ({ context }) => context.count + 1),
  updateMultiple: assign('context', () => ({ count: 0, name: 'New' })),
}
```

#### `voidAction(callback)`

Creates side-effect only actions.

```typescript
actions: {
  logState: voidAction(() => console.log('State changed')),
}
```

#### `batch(...actions)`

Groups multiple actions.

```typescript
actions: {
  initialize: batch('resetCount', 'clearError', 'logStart'),
}
```

### Guards (Predicates)

#### `isValue(path, value)`

Checks if a value equals expected value.

```typescript
predicates: {
  isEmpty: isValue('context.items', []),
}
```

#### `isNotValue(path, value)`

Checks if a value differs from expected value.

#### Custom Guards

```typescript
predicates: {
  isAuthenticated: ({ context }) => context.token !== undefined,
}
```

### Delays

```typescript
delays: {
  SHORT: 1000,
  LONG: ({ context }) => context.timeout,
}
```

### Promises

```typescript
promises: {
  fetchUser: async ({ event, context }) => {
    const response = await fetch(`/api/users/${event.payload.id}`);
    return response.json();
  },
}
```

### Typings Utilities

- **`typings.litterals(...values)`** - Create literal types
- **`typings.union(...types)`** - Create union types
- **`typings.array(type)`** - Create array types
- **`typings.tuple(...types)`** - Create tuple types
- **`typings.any(schema)`** - Create object schemas
- **`typings.record(type, ...keys?)`** - Create record types
- **`typings.intersection(...types)`** - Create intersection types
- **`typings.discriminatedUnion(key, ...types)`** - Create discriminated
  unions
- **`typings.maybe(type)`** - Create optional/undefined types
- **`typings.partial(schema)`** - Make all properties optional
- **`typings.custom<T>()`** - Use custom TypeScript types
- **`typings.soa(type)`** - Single or Array type
- **`typings.sv`** - StateValue type helper
- **`inferT<T>`** - Infer TypeScript type from typing schema

<br/>

## CHANGE_LOG

<details>

<summary>
View changelog
</summary>
[CHANGELOG.md](https://github.com/chlbri/app-ts/blob/main/CHANGELOG.md)

<br/>

</details>

<br/>

## NB

**_Don't use version 0.9.17, it doesn't exports anything_**

## Contributing

Contributions are welcome! Please read our contribution guide for details.

<br/>

## License

MIT

<br/>

## Auteur

chlbri (bri_lvi@icloud.com)

[My github](https://github.com/chlbri?tab=repositories)

[<svg width="98" height="96" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z" fill="#24292f"/></svg>](https://github.com/chlbri?tab=repositories)

<br/>

## Liens

- [Documentation](https://github.com/chlbri/app-ts)
