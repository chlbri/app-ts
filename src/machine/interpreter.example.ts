import { machine1 } from './__tests__/activities.test.data';
import { interpretTest } from './interpreterTest';

{
  using service = interpretTest(machine1, {
    pContext: {},
    context: { iterator: 0 },
  });

  console.log('service', service.status);
}

// service.resume();

// await sleep(1000).then(() => {
//   console.log('service.context.iterator', service.context.iterator);
// });
