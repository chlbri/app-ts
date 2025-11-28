import tupleOf from '#bemedev/features/arrays/castings/tuple';
import type { SoA } from '#bemedev/globals/types';
import { interpret } from '#interpreter';
import type { StateValue } from '#states';
import { toArray } from '@bemedev/basifun';
import { buildInvite } from '../fixtures/inivte';
import { machine } from './machine.machine';

describe('Machine Tag Interpreter', () => {
  const service = interpret(machine);

  // #region HOOKS
  const useNext = (index = 1) => {
    const invite = buildInvite('Send "NEXT" event', index);
    return tupleOf(invite, () => service.send('NEXT'));
  };

  const usePrev = (index = 1) => {
    const invite = buildInvite('Send "PREV" event', index);
    return tupleOf(invite, () => service.send('PREV'));
  };

  const useValue = (value: StateValue, index = 1) => {
    const invite = buildInvite(
      `State value should be "${JSON.stringify(value)}"`,
      index,
    );
    return tupleOf(invite, () => {
      expect(service.state.value).toEqual(value);
    });
  };

  const useTags = (tags: SoA<string> | undefined, index = 1) => {
    const invite = buildInvite(
      `State tags should be [${toArray
        .typed(tags)
        .map(t => `"${t}"`)
        .join(', ')}]`,
      index,
    );
    return tupleOf(invite, () => {
      expect(service.state.tags).toEqual(tags);
    });
  };
  // #endregion

  it('#00 => Start the service', service.start);
  it(...useValue('idle', 1));
  it(...useTags(['idle'], 2));
  it(...useNext(3));
  it(...useValue('working', 4));
  it(...useTags(['working', 'busy'], 5));
  it(...usePrev(6));
  it(...useValue('idle', 7));
  it(...useTags(['idle'], 8));
  it(...useNext(9));
  it(...useValue('working', 10));
  it(...useTags(['working', 'busy'], 11));
  it(...useNext(12));
  it(...useValue('final', 13));
  it(...useTags(undefined, 14));
});
