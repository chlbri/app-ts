import sleep from '@bemedev/sleep';
import { t } from '@bemedev/types';
import { createMachine } from '~machine';
import { interpret } from '../interpreter';

const sleep2 = async (ms = 0, times = 1) => {
  for (let i = 0; i < times; i++) await sleep(ms);
};

describe('#1 => First state has activity', () => {
  const DELAY = 170;
  const machine1 = createMachine(
    {
      states: {
        idle: {
          activities: {
            DELAY: 'inc',
          },
        },
      },
    },
    {
      eventsMap: {},
      context: t.buildObject({ iterator: t.number }),
      pContext: t.object,
    },
    { '/': 'idle' },
    {
      actions: {
        inc: (pContext, context) => {
          context.iterator++;
          return { context, pContext };
        },
      },
      delays: {
        DELAY,
      },
    },
  );

  const service1 = interpret(machine1, {
    pContext: {},
    context: { iterator: 0 },
  });

  test('#0 => start the service', () => {
    service1.start();
    expect(service1.context.iterator).toBe(0);
  });

  test('#1 => Await one delay -> iterator = 1', async () => {
    await sleep2(DELAY);
    expect(service1.context.iterator).toBe(1);
  });

  test('#2 => Await one delay -> iterator = 2', async () => {
    await sleep2(DELAY);
    expect(service1.context.iterator).toBe(2);
  });

  test('#3 => Await twice delay -> iterator = 4', async () => {
    await sleep2(DELAY, 2);
    expect(service1.context.iterator).toBe(4);
  });

  test('#4 => Await six times delay -> iterator = 10', async () => {
    await sleep2(DELAY, 6);
    expect(service1.context.iterator).toBe(10);
  });
});
