import { nodeToValue } from './nodeToValue';

test('Coverage', () => {
  const node = nodeToValue({} as any);
  expect(node).toStrictEqual({});
});
