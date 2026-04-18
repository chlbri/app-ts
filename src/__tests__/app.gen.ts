/**
 * Helper type for a machine Register entry.
 *
 * @template Events - Union of event name strings from eventsMap keys.
 * @template Children - Union of children actor key strings.
 * @template Emitters - Union of emitter actor key strings.
 * @template PContext - The pContext ObjectT shape (or undefined).
 * @template Tags - Union of tag strings from state nodes.
 */
type Entry<
  Events extends string = never,
  Children extends string = never,
  Emitters extends string = never,
  PContext = undefined,
  Tags extends string = never,
> = {
  paths: { map: any; all: string };
  events: Events;
  actors: {
    children: Children;
    emitters: Emitters;
  };
  pContext: PContext;
  tags: Tags;
};

declare module '../index' {
  interface Register {
    // ── actions ────────────────────────────────────────────────────────────
    'src/__tests__/actions/action.batch.cov.machine': Entry<
      'INC1' | 'INC2' | 'INC5'
    >;
    'src/__tests__/actions/actions.1.machine': Entry<'NEXT'>;
    'src/__tests__/actions/actions.2.machine': Entry<'NEXT'>;
    'src/__tests__/actions/async-actions.1.machine': Entry<'LOAD'>;
    'src/__tests__/actions/async-actions.2.machine': Entry<'LOAD'>;
    'src/__tests__/actions/async-actions.3.machine': Entry<'LOAD'>;
    'src/__tests__/actions/async-actions.4.machine': Entry<'PING'>;
    'src/__tests__/actions/async-actions.5.machine': Entry<'PING'>;
    'src/__tests__/actions/async-actions.6.machine': Entry<'FILTER'>;
    'src/__tests__/actions/async-actions.7.machine': Entry<'DISPATCH'>;
    'src/__tests__/actions/async-actions.8.machine': Entry<'INC'>;
    'src/__tests__/actions/sendToActions/sendToActions1.machine': Entry<
      | 'DECREMENT'
      | 'REDECREMENT'
      | 'INCREMENT'
      | 'INCREMENT.FORCE'
      | 'NEXT'
    >;
    'src/__tests__/actions/sendToActions/sendToActions2.machine': Entry<
      | 'DECREMENT'
      | 'REDECREMENT'
      | 'INCREMENT'
      | 'INCREMENT.FORCE'
      | 'NEXT'
    >;

    // ── delays ─────────────────────────────────────────────────────────────
    'src/__tests__/delays/delay.notDefined.machine': Entry;
    'src/__tests__/delays/fixtures': Entry<'NEXT'>;

    // ── emitters ───────────────────────────────────────────────────────────
    'src/__tests__/emitters/data': Entry<'NEXT', never, 'interval'>;
    'src/__tests__/emitters/data._2': Entry<'NEXT', never, 'interval1'>;
    'src/__tests__/emitters/error.machine': Entry<
      string,
      never,
      'interval'
    >;

    // ── guards ─────────────────────────────────────────────────────────────
    'src/__tests__/guards/index.1.machine': Entry;
    'src/__tests__/guards/index.2.machine': Entry<'NEXT'>;
    'src/__tests__/guards/index.3.machine': Entry<'NEXT'>;
    'src/__tests__/guards/index.4.machine': Entry<
      string,
      never,
      never,
      { data: 'string' }
    >;

    // ── interpreters / activities ───────────────────────────────────────────
    'src/__tests__/interpreters/activities/constants': Entry<'NEXT'>;
    'src/__tests__/interpreters/activities/pause.machine': Entry<
      'PAUSE' | 'RESUME' | 'STOP' | 'NEXT'
    >;
    'src/__tests__/interpreters/activities/perform.bis.machine': Entry<
      | 'DECREMENT'
      | 'REDECREMENT'
      | 'INCREMENT'
      | 'INCREMENT.FORCE'
      | 'NEXT'
    >;
    'src/__tests__/interpreters/activities/perform.machine': Entry<
      'PAUSE' | 'RESUME' | 'STOP'
    >;

    // ── interpreters / children ─────────────────────────────────────────────
    'src/__tests__/interpreters/children.1.machine': Entry;
    'src/__tests__/interpreters/children.2.machine': Entry<
      string,
      'child',
      never,
      'number'
    >;
    'src/__tests__/interpreters/children.3.machine': Entry<
      'NEXT',
      'child',
      never,
      { iterator: 'number' }
    >;
    'src/__tests__/interpreters/children.4.machine': Entry<'NEXT'>;
    'src/__tests__/interpreters/children.5.machine': Entry<
      'NEXT',
      'child'
    >;

    // ── interpreters / complex ──────────────────────────────────────────────
    'src/__tests__/interpreters/complex/machine1.machine': Entry<
      'START' | 'ADD_INTERMEDIARY' | 'RESET',
      never,
      never,
      undefined,
      'un' | 'deux'
    >;

    // ── interpreters / composition ──────────────────────────────────────────
    'src/__tests__/interpreters/composition.1.machine': Entry<
      'ADD_CONDITION' | 'REMOVE_CONDITION'
    >;
    'src/__tests__/interpreters/composition.2.machine': Entry<'NEXT'>;
    'src/__tests__/interpreters/composition.3.machine': Entry;
    'src/__tests__/interpreters/composition.4.machine': Entry;

    // ── interpreters / coverage / actors ───────────────────────────────────
    'src/__tests__/interpreters/coverage/actors/2ids.1.machine': Entry;
    'src/__tests__/interpreters/coverage/actors/2ids.2.machine': Entry<
      'NEXT',
      'child1' | 'child2',
      never,
      {
        iter1: 'number';
        iter2: 'number';
        all: { iter1: 'number'; iter2: 'number' };
      }
    >;
    'src/__tests__/interpreters/coverage/actors/child.1.machine': Entry;
    'src/__tests__/interpreters/coverage/actors/child.2.machine': Entry<
      'NEXT',
      'child',
      never,
      {
        iter1: 'number';
        iter2: 'number';
        all: { iter1: 'number'; iter2: 'number' };
      }
    >;
    'src/__tests__/interpreters/coverage/actors/emitter.machine': Entry<
      'NEXT',
      never,
      'interval'
    >;

    // ── interpreters / coverage ─────────────────────────────────────────────
    'src/__tests__/interpreters/coverage/addOptions-return.1.machine': Entry<'INCREMENT'>;
    'src/__tests__/interpreters/coverage/addOptions-return.2.machine': Entry;
    'src/__tests__/interpreters/coverage/addOptions-return.3.machine': Entry<'CHECK'>;
    'src/__tests__/interpreters/coverage/addOptions-return.4.machine': Entry<'INCREMENT'>;
    'src/__tests__/interpreters/coverage/addOptions-return.5.machine': Entry<
      'FIRST' | 'SECOND'
    >;
    'src/__tests__/interpreters/coverage/index.machine': Entry<
      'INC' | 'INC.PRIVATE' | 'NEXT',
      never,
      never,
      'number'
    >;

    // ── interpreters / data ─────────────────────────────────────────────────
    'src/__tests__/interpreters/data/machine1': Entry<'NEXT'>;
    'src/__tests__/interpreters/data/machine2': Entry<
      'NEXT' | 'FETCH' | 'WRITE' | 'FINISH',
      'machine1',
      never,
      { iterator: 'number' }
    >;
    'src/__tests__/interpreters/data/machine2._2': Entry<
      'NEXT' | 'FETCH' | 'WRITE' | 'FINISH',
      'machine1',
      never,
      { iterator: 'number' }
    >;
    'src/__tests__/interpreters/data/machine21': Entry<
      'NEXT' | 'FETCH' | 'WRITE' | 'SEND',
      'machine1',
      never,
      { iterator: 'number' }
    >;
    'src/__tests__/interpreters/data/machine23': Entry<
      'NEXT' | 'FETCH' | 'WRITE' | 'FINISH',
      'machine1',
      never,
      { iterator: 'number' }
    >;
    'src/__tests__/interpreters/data/machine3': Entry<
      'EVENT' | 'EVENT2' | 'EVENT3',
      'machine1',
      never,
      { data: 'string' }
    >;

    // ── interpreters / filter-erase ─────────────────────────────────────────
    'src/__tests__/interpreters/filter-erase.1.machine': Entry<
      'ADD' | 'FILTER' | 'RESET'
    >;
    'src/__tests__/interpreters/filter-erase.2.machine': Entry<
      'ADD_PEOPLE' | 'FILTER_ACTIVE'
    >;
    'src/__tests__/interpreters/filter-erase.3.machine': Entry<
      'SET_SCORES' | 'FILTER_HIGH_SCORES'
    >;
    'src/__tests__/interpreters/filter-erase.4.machine': Entry<
      'SET_NAME' | 'CLEAR_NAME'
    >;
    'src/__tests__/interpreters/filter-erase.5.machine': Entry<
      'SET_USER' | 'CLEAR_EMAIL'
    >;
    'src/__tests__/interpreters/filter-erase.6.machine': Entry<
      'SET_DATA' | 'CLEAR_ALL'
    >;

    // ── interpreters / legacy-options ───────────────────────────────────────
    'src/__tests__/interpreters/legacy-options.1.machine': Entry<
      'NEXT' | 'DOUBLE'
    >;
    'src/__tests__/interpreters/legacy-options.2.machine': Entry<'NEXT'>;
    'src/__tests__/interpreters/legacy-options.3.machine': Entry<'CHECK'>;
    'src/__tests__/interpreters/legacy-options.4.machine': Entry<
      'ADD' | 'MULTIPLY'
    >;
    'src/__tests__/interpreters/legacy-options.5.machine': Entry;
    'src/__tests__/interpreters/legacy-options.6.machine': Entry<
      'FIRST' | 'SECOND' | 'THIRD'
    >;
    'src/__tests__/interpreters/legacy-options.7.machine': Entry<
      'NEXT' | 'TRIPLE'
    >;
    'src/__tests__/interpreters/legacy-options.8.machine': Entry<'NEXT'>;
    'src/__tests__/interpreters/legacy-options.9.machine': Entry<'CHECK'>;
    'src/__tests__/interpreters/legacy-options.10.machine': Entry<
      'FIRST' | 'SECOND'
    >;
    'src/__tests__/interpreters/legacy-options.11.machine': Entry<
      'ADD' | 'MULTIPLY'
    >;
    'src/__tests__/interpreters/legacy-options.12.machine': Entry<'INCREMENT'>;
    'src/__tests__/interpreters/legacy-options.13.machine': Entry<
      'OP1' | 'OP2' | 'OP3'
    >;
    'src/__tests__/interpreters/legacy-options.14.machine': Entry<'INCREMENT'>;

    // ── interpreters / selftransitions ──────────────────────────────────────
    'src/__tests__/interpreters/selftransitions/after.1.machine': Entry;
    'src/__tests__/interpreters/selftransitions/after.2.machine': Entry;
    'src/__tests__/interpreters/selftransitions/after.3.machine': Entry;
    'src/__tests__/interpreters/selftransitions/after.4.machine': Entry<'NEXT'>;
    'src/__tests__/interpreters/selftransitions/after.5.machine': Entry;
    'src/__tests__/interpreters/selftransitions/always.1.machine': Entry;
    'src/__tests__/interpreters/selftransitions/always.2.machine': Entry;
    'src/__tests__/interpreters/selftransitions/always.3.machine': Entry;
    'src/__tests__/interpreters/selftransitions/index.1.machine': Entry;
    'src/__tests__/interpreters/selftransitions/index.2.machine': Entry;

    // ── interpreters / tags ─────────────────────────────────────────────────
    'src/__tests__/interpreters/tags/tags.machine': Entry<
      'NEXT' | 'PREV',
      never,
      never,
      undefined,
      'idle' | 'working' | 'busy'
    >;

    // ── machine ─────────────────────────────────────────────────────────────
    'src/__tests__/machine/addOptions-return.1.machine': Entry<'INCREMENT'>;
    'src/__tests__/machine/addOptions-return.2.machine': Entry;
    'src/__tests__/machine/addOptions-return.3.machine': Entry<'CHECK'>;
    'src/__tests__/machine/addOptions-return.4.machine': Entry<'INCREMENT'>;
    'src/__tests__/machine/asyncActions.1.machine': Entry<'TEST'>;
    'src/__tests__/machine/asyncActions.2.machine': Entry<'TEST'>;
    'src/__tests__/machine/asyncActions.3.machine': Entry<'TEST'>;
    'src/__tests__/machine/asyncActions.4.machine': Entry<'TEST'>;
    'src/__tests__/machine/asyncActions.5.machine': Entry<'TEST'>;
    'src/__tests__/machine/asyncActions.6.machine': Entry<'TEST'>;
    'src/__tests__/machine/asyncActions.7.machine': Entry<'TEST'>;
    'src/__tests__/machine/asyncActions.8.machine': Entry<'TEST'>;
    'src/__tests__/machine/asyncActions.9.machine': Entry<'TEST'>;
    'src/__tests__/machine/asyncActions.10.machine': Entry<'TEST'>;
    'src/__tests__/machine/cov.1.machine': Entry<'NEXT'>;
    'src/__tests__/machine/cov.2.machine': Entry<
      string,
      'machineNotDefined'
    >;
    'src/__tests__/machine/cov.3.machine': Entry<
      string,
      'machineNotDefined'
    >;
    'src/__tests__/machine/longRuns.cov.1.machine': Entry;
    'src/__tests__/machine/longRuns.cov.2.machine': Entry;
    'src/__tests__/machine/longRuns.cov.3.machine': Entry<'TEST'>;
    'src/__tests__/machine/longRuns.cov.4.machine': Entry<'TEST'>;
    'src/__tests__/machine/longRuns.cov.5.machine': Entry;
    'src/__tests__/machine/real.1.machine': Entry<'NEXT' | 'PREVIOUS'>;
    'src/__tests__/machine/real.2.machine': Entry<'NEXT' | 'PREVIOUS'>;
    'src/__tests__/machine/real.3.machine': Entry<
      | 'CHANGE_LANG'
      | 'REMOVE'
      | 'ADD'
      | 'UPDATE'
      | 'UPDATE:NOW'
      | 'FIELDS:REGISTER'
      | 'FIELDS:MODIFY'
      | 'VALUES:REGISTER'
      | 'VALUES:MODIFY'
    >;
  }
}

export {};
