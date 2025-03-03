import { nodeToValue } from './nodeToValue';

describe('nodeToValue - coverage', () => {
  test('#01 => Atomic', () => {
    const out = nodeToValue({});
    expect(out).toStrictEqual({});
  });
});
