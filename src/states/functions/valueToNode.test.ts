import { valueToNode } from './valueToNode';

describe('valueToNode - coverage', () => {
  test('#01 from not inside keys of body', () => {
    const out = valueToNode({}, 'state1');
    expect(out).toStrictEqual({});
  });
});
