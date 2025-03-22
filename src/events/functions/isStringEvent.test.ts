import { createTests } from '@bemedev/vitest-extended';
import {
  AFTER_EVENT,
  ALWAYS_EVENT,
  INIT_EVENT,
  MAX_EXCEEDED_EVENT_TYPE,
} from '../constants';
import { isStringEvent } from './isStringEvent';

describe('isStringEvent', () => {
  const { acceptation, success } = createTests(isStringEvent);

  describe('#00 => Acceptation', acceptation);

  describe(
    '#01 => Success',
    success(
      {
        invite: 'should return true for INIT_EVENT',
        parameters: INIT_EVENT,
        expected: true,
      },
      {
        invite: 'should return true for MAX_EXCEEDED_EVENT_TYPE',
        parameters: MAX_EXCEEDED_EVENT_TYPE,
        expected: true,
      },
      {
        invite: 'should return true for strings ending with ALWAYS_EVENT',
        parameters: `test.${ALWAYS_EVENT}`,
        expected: true,
      },
      {
        invite: 'should return true for strings ending with AFTER_EVENT',
        parameters: `test.${AFTER_EVENT}`,
        expected: true,
      },
      {
        invite: 'should return false for other strings',
        parameters: 'EVENT',
        expected: false,
      },
      {
        invite: 'should return false for numbers',
        parameters: 42,
        expected: false,
      },
      {
        invite: 'should return false for null',
        parameters: null,
        expected: false,
      },
      {
        invite: 'should return false for undefined',
        parameters: undefined,
        expected: false,
      },
      {
        invite: 'should return false for objects',
        parameters: {},
        expected: false,
      },
      {
        invite: 'should return false for arrays',
        parameters: [],
        expected: false,
      },
      {
        invite: 'should return false for boolean values',
        parameters: true,
        expected: false,
      },
      {
        invite:
          'should correctly handle strings that contain but do not end with special suffixes #1',
        parameters: `${ALWAYS_EVENT}.test`,
        expected: false,
      },
      {
        invite:
          'should correctly handle strings that contain but do not end with special suffixes #1',
        parameters: `${AFTER_EVENT}.test`,
        expected: false,
      },
    ),
  );
});
