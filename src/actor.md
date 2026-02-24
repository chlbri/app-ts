# Actor Unification - Code Generation Prompt

## Contexte

Ce projet implémente un système de machines à états avec support pour des
**promesses**, des **émetteurs** (emitters) et des **sous-machines** (child
machines). Actuellement, ces trois concepts sont gérés séparément avec des
types distincts et des emplacements différents dans la configuration.

## Objectif

Unifier la gestion des **promises**, **emitters** et **machines** sous un
seul type `Actor` qui servira d'abstraction commune. Cela simplifiera l'API
et permettra une gestion cohérente de ces trois types d'acteurs au sein des
machines à états.

## Structure Actuelle

### 1. Promises (PromiseeConfig)

**Localisation** : Dans `TransitionsConfig` (fichier:
`src/transitions/types.ts`)

```typescript
export type PromiseeConfig<Paths extends string = string> = {
  readonly src: string;
  readonly max?: string;
  readonly description?: string;
  readonly then: SingleOrArrayT<Paths>;
  readonly catch: SingleOrArrayT<Paths>;
  readonly finally?: FinallyConfig<Paths>;
};

// Utilisé dans :
export type TransitionsConfig<Paths extends string = string> = {
  readonly on?: DelayedTransitions<Paths>;
  readonly always?: AlwaysConfig<Paths>;
  readonly after?: DelayedTransitions<Paths>;
  readonly promises?: SingleOrArrayL<PromiseeConfig<Paths>>;
};
```

### 2. Emitters (EmitterConfig)

**Localisation** : Dans `BaseConfig` (fichier: `src/states/types.ts`)

```typescript
export type EmitterConfig = Describer | string;

// Utilisé dans :
export type BaseConfig = {
  readonly description?: string;
  readonly entry?: SingleOrArrayL<ActionConfig>;
  readonly exit?: SingleOrArrayL<ActionConfig>;
  readonly tags?: SingleOrArrayL<string>;
  readonly activities?: ActivityConfig;
  readonly emitters?: RecordS<EmitterConfig>;
  readonly machines?: RecordS<MachineConfig>;
};
```

**Note** : Actuellement `EmitterConfig` est juste `Describer | string`,
mais devrait suivre la nouvelle structure dans `actor.ts`.

### 3. Machines (MachineConfig)

**Localisation** : Dans `BaseConfig` (fichier: `src/states/types.ts`)

```typescript
export type MachineConfig = Describer | string;

// Même localisation que emitters dans BaseConfig
```

**Note** : Actuellement `MachineConfig` est juste `Describer | string`,
mais devrait suivre la nouvelle structure dans `actor.ts`.

## Structure Cible (actor.ts)

```typescript
import type { SoA } from '#bemedev/globals/types';
import type { FinallyConfig } from '#promises';
import type { SingleOrArrayT } from '#transitions';

type CommonActor = {
  readonly src: string;
  readonly description?: string;
};

type EmitterConfig<Paths extends string = string> = CommonActor & {
  readonly next: SingleOrArrayT<Paths>;
  readonly error?: SingleOrArrayT<Paths>;
  readonly complete?: FinallyConfig<Paths>;
};

type PromiseeConfig<Paths extends string = string> = CommonActor & {
  // Max wait time to perform the promise
  readonly max?: string;
  readonly then: SingleOrArrayT<Paths>;
  readonly catch: SingleOrArrayT<Paths>;
  readonly finally?: FinallyConfig<Paths>;
};

type MachineConfig<Paths extends string = string> = CommonActor &
  (
    | {
        readonly on: Record<string, SingleOrArrayT<Paths>>;
        readonly contexts?: Record<string, string>;
      }
    | {
        readonly on?: Record<string, SingleOrArrayT<Paths>>;
        readonly contexts: Record<string, string>;
      }
  );

export type Actor<Paths extends string = string> =
  | EmitterConfig<Paths>
  | SoA<PromiseeConfig<Paths>>
  | MachineConfig<Paths>;
```

### Point clé : `SoA<PromiseeConfig<Paths>>`

`SoA<T>` est un alias pour `SingleOrArray<T>` défini comme :

```typescript
export type SingleOrArray<T> = T | T[] | ReadonlyArray<T>;
export type SoA<T> = SingleOrArray<T>;
```

Cela signifie que le bras **promise** du type `Actor` accepte :

- Une seule `PromiseeConfig` — pour une promise unique sur un état
- Un tableau `PromiseeConfig[]` — pour plusieurs promises sur un même état
- Un tableau readonly `ReadonlyArray<PromiseeConfig>` — idem, immuable

Les bras **emitter** et **machine** restent des configs simples (non
wrappées dans `SoA`).

## Discriminer les membres de l'union Actor

| Type d'acteur           | Propriété discriminante            | Signature                              |
| ----------------------- | ---------------------------------- | -------------------------------------- |
| `EmitterConfig`         | `next` obligatoire                 | `{ src, next, error?, complete? }`     |
| `PromiseeConfig` simple | `then` + `catch` obligatoires      | `{ src, then, catch, max?, finally? }` |
| `PromiseeConfig[]`      | tableau de configs avec then/catch | `Array<{ src, then, catch, ... }>`     |
| `MachineConfig`         | `on` ou `contexts` (au moins un)   | `{ src, on?, contexts? }`              |

### Fonction de discrimination runtime

```typescript
function getActorType(actor: Actor): 'promise' | 'emitter' | 'machine' {
  // Les promises sont soit un objet avec then/catch, soit un tableau
  if (Array.isArray(actor)) return 'promise';
  if ('then' in actor && 'catch' in actor) return 'promise';
  if ('next' in actor) return 'emitter';
  if ('on' in actor || 'contexts' in actor) return 'machine';
  throw new Error('Unknown actor type');
}
```

## Transformations Nécessaires

### Phase 1 : Exporter les types depuis actor.ts

Rendre les types internes publics et ajouter un helper de discrimination :

```typescript
// src/actor.ts
export type { EmitterConfig, PromiseeConfig, MachineConfig, CommonActor };

// Helper de type pour discriminer statiquement
export type ActorType<A extends Actor> =
  A extends SoA<PromiseeConfig>
    ? 'promise'
    : A extends EmitterConfig
      ? 'emitter'
      : A extends MachineConfig
        ? 'machine'
        : never;
```

### Phase 2 : Modification de BaseConfig

**Fichier** : `src/states/types.ts`

**Avant** :

```typescript
export type BaseConfig = {
  readonly description?: string;
  readonly entry?: SingleOrArrayL<ActionConfig>;
  readonly exit?: SingleOrArrayL<ActionConfig>;
  readonly tags?: SingleOrArrayL<string>;
  readonly activities?: ActivityConfig;
  readonly emitters?: RecordS<EmitterConfig>;
  readonly machines?: RecordS<MachineConfig>;
};
```

**Après** :

```typescript
import type { Actor } from '#actor';

export type BaseConfig = {
  readonly description?: string;
  readonly entry?: SingleOrArrayL<ActionConfig>;
  readonly exit?: SingleOrArrayL<ActionConfig>;
  readonly tags?: SingleOrArrayL<string>;
  readonly activities?: ActivityConfig;
};
```

**Note** : `emitters` et `machines` sont unifiés en un seul champ `actors`.

### Phase 3 : Modification de TransitionsConfig

**Fichier** : `src/transitions/types.ts`

**Avant** :

```typescript
export type TransitionsConfig<Paths extends string = string> = {
  readonly on?: DelayedTransitions<Paths>;
  readonly always?: AlwaysConfig<Paths>;
  readonly after?: DelayedTransitions<Paths>;
  readonly promises?: SingleOrArrayL<PromiseeConfig<Paths>>;
};
```

**Après** :

```typescript
import type { Actor } from '#actor';

export type TransitionsConfig<Paths extends string = string> = {
  readonly on?: DelayedTransitions<Paths>;
  readonly always?: AlwaysConfig<Paths>;
  readonly after?: DelayedTransitions<Paths>;
  readonly actors?: SoA<Actor<Paths>>;
};
```

**Note** : On remplace `promises` par `actors` (dictionnaire) pour
s'aligner sur `BaseConfig`. Le champ `src` de chaque config sert de clé
d'implémentation pour les promises.

### Phase 4 : Modification de MachineOptions

**Fichier** : `src/machine/types.ts`

**Avant** :

```typescript
export type MachineOptions<...> = Partial<{
  actions: Partial<GetActionsFromFlat<Flat, E, P, Pc, Tc>>;
  predicates: Partial<GetGuardsFromFlat<Flat, E, P, Pc, Tc>>;
  promises: Partial<GetSrcFromFlat<Flat, E, P, Pc, Tc>>;
  delays: Partial<GetDelaysFromFlat<Flat, E, P, Pc, Tc>>;
  machines: Partial<Record<GetMachineKeysFromFlat<Flat>, ChildS<E, P, Pc>>>;
  emitters: Partial<Record<GetEmitterKeysFromFlat<Flat>, Emitter<E, P, Pc, Tc>>>;
}>;
```

**Après** :

```typescript
export type ActorImplementation<
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
> =
  | PromiseFunction<E, P, Pc, Tc>
  | Emitter<E, P, Pc, Tc>
  | ChildS<E, P, Pc>;

export type MachineOptions<
  C extends Config = Config,
  E extends EventsMap = EventsMap,
  P extends PromiseeMap = PromiseeMap,
  Pc = any,
  Tc extends PrimitiveObject = PrimitiveObject,
  Flat extends FlatMapN<C> = FlatMapN<C>,
> = Partial<{
  actions: Partial<GetActionsFromFlat<Flat, E, P, Pc, Tc>>;
  predicates: Partial<GetGuardsFromFlat<Flat, E, P, Pc, Tc>>;
  delays: Partial<GetDelaysFromFlat<Flat, E, P, Pc, Tc>>;
  actors: Partial<
    Record<GetActorKeysFromFlat<Flat>, ActorImplementation<E, P, Pc, Tc>>
  >;
}>;
```

### Phase 5 : Utilitaires d'extraction (src/machine/types.ts)

`actors` étant désormais un `SoA<Actor<Paths>>` (tableau plat), tous les
acteurs partagent le champ `src` de `CommonActor`. La clé d'implémentation
est donc toujours `src`, quel que soit le type d'acteur.

```typescript
/**
 * Normalise un SoA<Actor> en tableau plat puis extrait tous les `src`.
 */
type _ActorSrcFromSoA<A> =
  A extends ReadonlyArray<infer Item extends { src: string }>
    ? Item['src']
    : A extends { src: infer S extends string }
      ? S
      : never;

/**
 * Extrait la clé `src` de tous les acteurs depuis la flat map.
 * Fonctionne avec actors: SoA<Actor<Paths>> (tableau ou acteur unique).
 */
export type GetActorKeysFromFlat<Flat extends FlatMapN> = {
  [key in keyof Flat]: Flat[key] extends { actors: infer A }
    ? _ActorSrcFromSoA<A>
    : never;
}[keyof Flat];
```

### Phase 6 : Traitement unifié des acteurs dans le runtime

**Fichiers** : `src/interpreters/*.ts`, `src/machine/*.ts`

`actors` est maintenant un `SoA<Actor>` (tableau plat ou acteur unique).
Chaque acteur possède un `src` qui sert de clé de lookup dans
`options.actors`, quel que soit son type.

```typescript
function processActors(actors: SoA<Actor>, options: MachineOptions) {
  // Normaliser en tableau plat
  const actorsArray = Array.isArray(actors) ? actors : [actors];

  return actorsArray.map((config: Actor) => {
    const type = getActorType(config);
    // La clé d'implémentation est toujours `src` pour tous les types
    const impl = options.actors?.[config.src];

    if (type === 'promise') {
      return createPromiseActor(
        config as PromiseeConfig,
        impl as PromiseFunction | undefined,
      );
    }

    if (type === 'emitter') {
      return createEmitterActor(
        config as EmitterConfig,
        impl as Emitter | undefined,
      );
    }

    // type === 'machine'
    return createMachineActor(
      config as MachineConfig,
      impl as ChildS | undefined,
    );
  });
}
```

**Point clé** : La clé de lookup dans `options.actors` est toujours le
champ `src` de l'acteur — pour les promises, emitters et machines. Il n'y a
plus de distinction entre clé de dictionnaire et clé `src`.

## Notes d'implémentation

### Compatibilité descendante

```typescript
// src/promises/types.ts
/** @deprecated Use Actor from '#actor' instead */
export type PromiseeConfig<T extends string = string> = Extract<
  SoA<import('#actor').Actor<T>>,
  { then: any }
>;

// src/emitters/types.ts
/** @deprecated Use Actor from '#actor' instead */
export type EmitterConfig<T extends string = string> = Extract<
  import('#actor').Actor<T>,
  { next: any }
>;

// src/states/types.ts
/** @deprecated Use Actor from '#actor' instead */
export type MachineConfig<T extends string = string> = Extract<
  import('#actor').Actor<T>,
  { on?: any } | { contexts: any }
>;
```

### Avantages de cette approche

1. **Unification** : Un seul type `Actor` pour les trois catégories
2. **Tableau plat** : `actors` est un `SoA<Actor>` — ordonné, sans clé
   intermédiaire, plusieurs acteurs du même type possibles
3. **Type-safety** : Discrimination statique via les propriétés
   discriminantes
4. **Cohérence** : `CommonActor` (`src` + `description`) partagé par tous
5. **Lookup uniforme** : La clé d'implémentation est toujours `src` pour
   tous les types d'acteurs
6. **API simplifiée** : Un seul champ `actors` dans la config et les
   options

### Risques et considérations

1. **Breaking change** : `actors` passe d'un record à un tableau — les
   migrations doivent convertir les objets en tableaux
2. **Ordre d'exécution** : L'ordre des acteurs dans le tableau est
   significatif (les acteurs sont traités séquentiellement)
3. **Migration progressive** : Garder `promises`, `emitters`, `machines`
   dépréciés dans `MachineOptions` le temps de la migration

## Checklist d'implémentation

- [ ] Phase 1 : Exporter les types internes de `actor.ts`
- [ ] Phase 2 : Modifier `BaseConfig` — remplacer `emitters` + `machines`
      par `actors`
- [ ] Phase 3 : Modifier `TransitionsConfig` — remplacer `promises` par
      `actors`
- [ ] Phase 4 : Créer `ActorImplementation`, modifier `MachineOptions`
- [ ] Phase 5 : Implémenter `GetActorKeysFromFlat` en tenant compte de
      `SoA`
- [ ] Phase 6 : Migrer le runtime (`processActors`, handlers
      promises/emitters/machines)
- [ ] Phase 7 : Mettre à jour tous les tests
- [ ] Phase 8 : Déprécier les anciens types (`PromiseeConfig`,
      `EmitterConfig`, `MachineConfig`)
- [ ] Phase 9 : Mettre à jour la documentation et créer un guide de
      migration

## Exemple d'utilisation finale

```typescript
const machineConfig: Config = {
  initial: 'idle',
  states: {
    idle: {
      // actors est un tableau plat de SoA<Actor>
      actors: [
        // Promise actor
        {
          src: 'fetchUserService',
          description: 'Fetch user data',
          then: 'success',
          catch: 'error',
          max: 'FIVE_SECONDS',
        },
       
        { src: 'fetchPermissions', then: 'permLoaded', catch: 'error' },
        // Emitter actor
        {
          src: 'clockEmitter',
          description: 'Clock tick every second',
          id: 'clock1',
          next: {
            actions: 'tick',
          },
          error: '/clockError',
        },
        // Machine actor
        {
          src: 'childStateMachine',
          description: 'Child state management',
          id: 'child1',
          on: {
            DONE: 'parentSuccess',
            ERROR: 'parentError',
          },
          contexts: {
            userId: 'context.userId',
          },
        },
      ],
      on: {
        START: 'running',
      },
    },
    running: {},
    success: {},
    error: {},
  },
};

const options: MachineOptions = {
  // Toutes les implémentations sont indexées par le champ `src` de l'acteur
  actors: {
    fetchUserService: async ({ context }) =>
      fetch(`/api/users/${context.userId}`),
    fetchConfig: async () => fetch('/api/config'),
    fetchPermissions: async ({ context }) =>
      fetch(`/api/permissions/${context.userId}`),
    clockEmitter: ({ send }) => {
      const interval = setInterval(() => send({ type: 'TICK' }), 1000);
      return {
        start: () => {},
        pause: () => clearInterval(interval),
        resume: () => {},
        stop: () => clearInterval(interval),
      };
    },
    childStateMachine: {
      machine: childMachine,
      initials: { context: {}, pContext: {} },
      subscribers: [],
    },
  },
};
```
