import { valueToNodeConfig } from './valueToNodeConfig';

describe('valueToNode - coverage', () => {
  test('#01 from not inside keys of body', () => {
    const out = valueToNodeConfig({}, 'state1');
    expect(out).toStrictEqual({});
  });
});
