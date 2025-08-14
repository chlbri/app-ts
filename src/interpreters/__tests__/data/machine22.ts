import { createMachine } from '#machine';
import { toFunction } from '#utils';
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
);

machine22.addOptions(toFunction<any>(machine2.options));
// #endregion
