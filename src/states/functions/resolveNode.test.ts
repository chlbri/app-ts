import { resolveNode } from './resolveNode';

test('resolveNode -> coverage', () => {
  const inc = vi.fn();
  const events = {};
  const options = {
    actions: {
      inc,
    },
  };
  const config = {
    entry: 'inc',
    exit: 'inc',
  };

  const node = resolveNode(events, config, options);
  expect(node).toStrictEqual({
    after: [],
    always: [],
    entry: [inc],
    exit: [inc],
    on: [],
    promises: [],
    states: [],
    tags: [],
    type: 'atomic',
  });
});
