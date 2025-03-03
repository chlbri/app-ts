import { resolveNode } from './resolveNode';

test('resolveNode -> coverage', () => {
  const inc = vi.fn();
  const events = {};
  const promisees = {};
  const options = {
    actions: {
      inc,
    },
  };
  const config = {
    entry: 'inc',
    exit: 'inc',
  };

  const node = resolveNode(events, promisees, config, options);
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
