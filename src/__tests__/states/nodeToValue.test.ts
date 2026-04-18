import { nodeToValue } from '../../states/functions/nodeToValue';

test('Coverage', () => {
  const node = nodeToValue({} as any);
  expect(node).toStrictEqual({});
});
