import { interpret } from '#interpreter';
import { createMachine } from '#machine';
import { typings } from '#utils';

describe('Machine batch action', () => {
  const machine = createMachine(
    {
      initial: 'idle',
      states: {
        idle: {
          on: {
            INC1: {
              actions: 'inc1',
            },
            INC2: {
              actions: 'inc2',
            },
            INC5: {
              actions: 'inc5',
            },
          },
        },
      },
    },
    typings({
      eventsMap: {
        INC1: 'primitive',
        INC2: 'primitive',
        INC5: 'primitive',
      },
      context: 'number',
    }),
  ).provideOptions(({ batch, assign, voidAction }) => ({
    actions: {
      inc1: assign('context', ({ context }) => context + 1),
      inc2: batch(
        assign('context', ({ context }) => context + 1),
        assign('context', ({ context }) => context + 1),
        voidAction(() => console.warn('Increment by 2')),
      ),
      inc5: batch(
        assign('context', ({ context }) => context + 1),
        assign('context', ({ context }) => context + 1),
        assign('context', ({ context }) => context + 1),
        assign('context', ({ context }) => context + 1),
        assign('context', ({ context }) => context + 3),
        voidAction(() =>
          console.warn('Tricky, last action increment by 3'),
        ),
      ),
    },
  }));

  const service = interpret(machine, { context: 0 });

  test('#00 => start the machine', service.start);

  test('#01 => context is at 0', () => {
    expect(service.state.context).toBe(0);
  });

  test('#02 => send INC1 event, context should be at 1', () => {
    service.send('INC1');
    expect(service.state.context).toBe(1);
  });

  test('#03 => send INC2 event, context should be at 3', () => {
    service.send('INC2');
    expect(service.state.context).toBe(3);
  });

  test('#04 => send INC5 event, context should be at 8', () => {
    service.send('INC5');
    expect(service.state.context).toBe(10);
  });
});
