import { defaultT } from '#fixtures';
import { interpret } from '#interpreter';
import { createMachine } from '#machine';

const DELAY = 500;

const machine = createMachine(
  {
    initial: 'idle',
    states: {
      idle: {
        after: {
          DELAY1: '/result1',
          DELAY2: '/result2',
        },
      },
      result1: {},
      result2: {},
    },
  },
  defaultT,
).provideOptions(() => ({
  delays: {
    DELAY1: DELAY * 3,
    DELAY2: DELAY * 2,
  },
}));

const service = interpret(machine);
service.subscribe(state => {
  console.log(state.value);
});

service.start();

setTimeout(() => {
  console.log('stopped', service.value);
  service.stop();
}, DELAY * 10);
