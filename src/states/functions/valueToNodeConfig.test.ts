import { valueToNodeConfig } from './valueToNodeConfig';

describe('valueToNode - coverage', () => {
  test('#01 from not inside keys of body', () => {
    const out = valueToNodeConfig({}, 'state1');
    expect(out).toStrictEqual({});
  });

  test('#02 cannotContinue=true: skips redundant initial child when deeper path already in flatFrom', () => {
    // decomposeSV({ a: 'b' }) = ['a', 'a.b'] → flatFrom = ['/a', '/a/b']
    // For key1='/a': initial='b', cannotContinue=true because '/a/b' starts with '/a/'
    // Line 81: the `if (cannotContinue) return` branch is taken
    const body = {
      initial: 'a',
      states: {
        a: {
          initial: 'b',
          states: { b: {} },
        },
      },
    };

    const out = valueToNodeConfig(body as any, { a: 'b' });

    expect(out).toStrictEqual({
      states: {
        a: {
          initial: 'b',
          states: { b: {} },
        },
      },
    });
  });

  test('#03 cannotContinue=false: adds initial child when no deeper path exists in flatFrom', () => {
    // decomposeSV({ a: {} }) = ['a'] → flatFrom = ['/a']
    // For key1='/a': initial='b', cannotContinue=false (no key starts with '/a/')
    // Lines 82-83: out1['/a/b'] is set
    const body = {
      initial: 'a',
      states: {
        a: {
          initial: 'b',
          states: { b: {} },
        },
      },
    };

    const out = valueToNodeConfig(body as any, { a: {} } as any);

    expect(out).toStrictEqual({
      states: {
        a: {
          initial: 'b',
          states: { b: {} },
        },
      },
    });
  });
});
