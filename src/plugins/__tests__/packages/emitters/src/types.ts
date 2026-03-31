import type {
  Describer,
  PrimitiveObject,
  RecordS,
  ChildConfigMap,
  Config,
  EventObject,
  EventsMap,
  FlatMapN,
  FnMap,
  FnR,
  GetActionsFromFlat,
  GetChildrenSrcFromFlat,
  GetDelaysFromFlat,
  GetGuardsFromFlat,
  GetPromisesFromFlat,
  NotUndefined,
  Observable,
  PromiseeMap,
  ToEventObject,
  ToEvents,
  TransitionsConfig,
  Unionize,
} from './rexport';

declare module '@bemedev/app-ts' {
  type Subscriber = {
    unsubscribe: () => void;
  };

  type Subscribable = {
    subscribe: Subscriber;
  };
  /**
   * Type representing a describer for a emitter.
   *
   * @see {@linkcode Describer} for more details.
   */
  type EmitterSrcConfig = Describer | string | number;

  type EmitterDef = {
    next: PrimitiveObject;
    error: PrimitiveObject;
  };

  type EmitterConfigMap = RecordS<EmitterDef>;

  type _EmitterConfigR<T extends EmitterConfigMap> =
    Unionize<T> extends infer U extends EmitterConfigMap
      ? U extends any
        ?
            | {
                type: `${keyof U & string}::next`;
                payload: U[keyof U]['next'];
              }
            | {
                type: `${keyof U & string}::error`;
                payload: U[keyof U]['error'];
              }
        : never
      : never;

  interface ActorsConfigMap {
    children?: ChildConfigMap;
    emitters?: EmitterConfigMap;
    promisees?: PromiseeMap;
  }

  type EmitterReturn<
    K extends string,
    A extends ActorsConfigMap = ActorsConfigMap,
  > = NotUndefined<A['emitters']>[K]['next'] extends infer P
    ? unknown extends P
      ? never
      : P
    : never;

  type EmitterFunction<
    E extends EventObject = EventObject,
    Pc = any,
    Tc extends PrimitiveObject = PrimitiveObject,
    T extends string = string,
    R = any,
  > = FnMap<E, Pc, Tc, T, Observable<R>, `${string}::${'next' | 'error'}`>;

  type EmitterFunction2<
    E extends EventObject = EventObject,
    Pc = any,
    Tc extends PrimitiveObject = PrimitiveObject,
    T extends string = string,
    R = any,
  > = FnR<E, Pc, Tc, T, Observable<R>>;

  type EmittersMap<
    E extends EventObject = EventObject,
    Pc = any,
    Tc extends PrimitiveObject = PrimitiveObject,
    T extends string = string,
  > = RecordS<EmitterFunction2<E, Pc, Tc, T>>;

  type ExtractSrcKeyFromTransitions<
    T extends TransitionsConfig,
    Filter extends object = object,
    A extends NotUndefined<T['actors']> = NotUndefined<T['actors']>,
  > = {
    [K in keyof A]: A[K] extends Filter ? K : never;
  }[keyof A];

  type ExtractEmitterSrcKeyFromTransitions<T extends TransitionsConfig> =
    ExtractSrcKeyFromTransitions<T, { next: any }>;

  type _GetEmitterSrcKeyFromFlat<Flat extends FlatMapN> = {
    [key in keyof Flat]: ExtractEmitterSrcKeyFromTransitions<
      Extract<Flat[key], TransitionsConfig>
    > extends infer V
      ? unknown extends V
        ? never
        : V
      : never;
  }[keyof Flat];

  // @ts-expect-error - overwrite
  type GetEmittersSrcFromFlat<
    Flat extends FlatMapN,
    E extends EventObject = EventObject,
    A extends ActorsConfigMap = ActorsConfigMap,
    Pc = any,
    Tc extends PrimitiveObject = PrimitiveObject,
    T extends string = string,
  > = {
    [key in _GetEmitterSrcKeyFromFlat<Flat>]: EmitterFunction2<
      E,
      Pc,
      Tc,
      T,
      EmitterReturn<key, A>
    >;
  };

  // @ts-expect-error - overwrite
  type GetActorsFromFlat<
    Flat extends FlatMapN,
    E extends EventObject = EventObject,
    A extends ActorsConfigMap = ActorsConfigMap,
    Pc = any,
    Tc extends PrimitiveObject = PrimitiveObject,
    T extends string = string,
  > = {
    children: Partial<GetChildrenSrcFromFlat<Flat, E, A, Pc, Tc, T>>;
    emitters: Partial<GetEmittersSrcFromFlat<Flat, E, A, Pc, Tc, T>>;
    promises: Partial<GetPromisesFromFlat<Flat, E, A, Pc, Tc, T>>;
  };

  // @ts-expect-error - overwrite
  interface MachineOptions<
    C extends Config = Config,
    E extends EventsMap = EventsMap,
    A extends ActorsConfigMap = ActorsConfigMap,
    Pc = any,
    Tc extends PrimitiveObject = PrimitiveObject,
    T extends string = string,
    Flat extends FlatMapN<C, false> = FlatMapN<C, false>,
    Eo extends ToEventObject<ToEvents<E, A>> = ToEventObject<
      ToEvents<E, A>
    >,
  > {
    actions?: Partial<GetActionsFromFlat<Flat, Eo, Pc, Tc, T>>;
    predicates?: Partial<GetGuardsFromFlat<Flat, Eo, Pc, Tc, T>>;
    delays?: Partial<GetDelaysFromFlat<Flat, Eo, Pc, Tc, T>>;
    actors?: Partial<GetActorsFromFlat<Flat, Eo, A, Pc, Tc, T>>;
  }
}
