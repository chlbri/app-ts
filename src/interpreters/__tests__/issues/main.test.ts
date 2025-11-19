import { buildService } from './main';
import tupleOf from '#bemedev/features/arrays/castings/tuple';
import type { StateValue } from '#states';

type Node = {
  id: string;
  position: { x: number; y: number };
  label: string;
  content: string;
  input: boolean;
  selected: boolean;
};

describe('Testing parallel states', () => {
  describe('#01 => ', () => {
    const service = buildService();

    const useValue = (value: StateValue, index: number) => {
      const invite = `#${index < 10 ? '0' + index : index} => value is "${JSON.stringify(value, null, 2)}"`;
      return tupleOf(invite, () => {
        expect(service.value).toStrictEqual(value);
      });
    };

    const useNodes = (index: number, ...nodes: Node[]) => {
      const invite = `#${index < 10 ? '0' + index : index} => Check strict nodes`;

      return tupleOf(invite, () => {
        expect(service.select('nodes')).toStrictEqual(nodes);
      });
    };

    test('#00 => Start the machine', service.start);
    test(...useValue('idle', 1));
    test(...useNodes(2));

    test('#03 => Configure', () => {
      service.send({ type: 'CONFIGURE', payload: {} });
    });

    test(...useValue('preparation', 4));

    test(
      ...useNodes(5, {
        id: 'node-0',
        position: {
          x: 350,
          y: 100,
        },
        label: 'Root node',
        content: 'This is the root node.',
        input: false,
        selected: false,
      }),
    );

    test('#06 => Mount', () => {
      service.send({
        type: 'MOUNT',
        payload: {
          id: 'node-1',
          width: 100,
          height: 100,
          input: {
            x: 0,
            y: 0,
          },
          output: { x: 100, y: 0 },
        },
      });
    });

    test(
      ...useValue(
        {
          working: {
            mounting: 'idle',
            base: {},
          },
        },
        7,
      ),
    );

    test(
      ...useNodes(8, {
        id: 'node-0',
        position: {
          x: 350,
          y: 100,
        },
        label: 'Root node',
        content: 'This is the root node.',
        input: false,
        selected: false,
      }),
    );
  });
});
