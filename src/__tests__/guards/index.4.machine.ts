import { createMachine } from '#machine';
import { defaultT } from '#fixtures';
import numberT from '#bemedev/features/numbers/typings';
import stringT from '#bemedev/features/strings/typings';

export default createMachine(
  'src/__tests__/guards/index.4.machine',
  {
    initial: 'state1',
    states: {
      state1: {
        always: {
          guards: [
            'returnTrue',
            {
              or: [
                'returnFalse',
                {
                  and: [
                    {
                      name: 'returnTrue',
                      description: 'Just return TRUE',
                    },
                    'returnTrue2',
                  ],
                },
                {
                  name: 'returnFalse2',
                  description: 'Just a guard',
                },
              ],
            },
          ],
          target: '/state2',
        },
      },
      state2: {},
    },
  },
  {
    ...defaultT,
    context: {
      data: numberT.type,
    },
    pContext: {
      data: stringT.type,
    },
  },
);
