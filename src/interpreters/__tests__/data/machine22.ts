import { createMachine } from '~machine';
import { EVENTS_FULL } from '~machines';
import { machine1 } from './machine1';
import { config2, machine2 } from './machine2';

// #region machine2
export const machine22 = createMachine(
  {
    machines: { name: 'machine1', description: 'A beautiful machine' },
    ...config2,
  },
  {
    eventsMap: machine2.eventsMap,
    context: machine2.context,
    pContext: machine2.pContext,
    promiseesMap: machine2.promiseesMap,
  },
  machine2.initials,
);

machine22.addOptions(({ isNotValue, isValue, createChild }) => ({
  actions: machine2.actions,
  predicates: {
    isInputEmpty: isValue('context.input', ''),
    isInputNotEmpty: isNotValue('context.input', ''),
  },
  promises: machine2.promises,
  delays: machine2.delays,
  machines: {
    machine1: createChild(
      machine1,
      {
        pContext: {},
        context: { iterator: 0 },
      },
      {
        events: EVENTS_FULL,
        contexts: { iterator: 'iterator' },
      },
    ),
  },
}));
// #endregion
