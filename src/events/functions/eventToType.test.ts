import { createTests } from '@bemedev/vitest-extended';
import { INIT_EVENT } from '../constants';
import { eventToType } from './eventToType';

describe('eventToType', () => {
  const { acceptation, success } = createTests(eventToType);

  describe('#00 => Acceptation', acceptation);

  describe(
    '#01 => success',
    success(
      {
        invite: 'string',
        parameters: INIT_EVENT,
        expected: INIT_EVENT,
      },
      {
        invite: 'undefined payload',
        // @ts-expect-error for test
        parameters: { type: 'NEXT' },
        expected: 'NEXT',
      },
      {
        invite: 'empty payload',
        parameters: { type: 'NEXT', payload: {} },
        expected: 'NEXT',
      },
      {
        invite: 'number payload',
        parameters: { type: 'NEXT2', payload: 67 },
        expected: 'NEXT2',
      },
      {
        invite: 'empty object payload',
        parameters: { type: 'NEXT2', payload: {} },
        expected: 'NEXT2',
      },
      {
        invite: 'object payload',
        parameters: { type: 'DATA', payload: { data: 23 } },
        expected: 'DATA',
      },
    ),
  );
});
