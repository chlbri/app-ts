import { createFakeWaiter } from '@bemedev/vitest-extended';
import { DELAY, machine2 } from './__tests__/data/test.data';
import { interpretTest } from './interpreterTest';

{
  const startTime = Date.now();
  using service = interpretTest(machine2, {
    pContext: { iterator: 0 },
    context: { iterator: 0, input: '', data: [] },
  });

  service.start();

  const sleepU = createFakeWaiter(vi);

  await sleepU(DELAY, 6).then(() => {
    console.log('service.context.iterator', service.context.iterator);
    console.log('state', '=>', service.value);
  });

  service.send({ type: 'NEXT', payload: {} });

  await sleepU(DELAY, 6).then(() => {
    console.log('service.context.iterator', service.context.iterator);
    console.log('state', '=>', service.value);
  });

  service.pause();
  console.log('pause');

  await sleepU(DELAY, 6).then(() => {
    console.log('service.context.iterator', service.context.iterator);
    console.log('state', '=>', service.value);
  });

  service.resume();
  console.log('resume');

  await sleepU(DELAY, 12).then(() => {
    console.log('service.context.iterator', service.context.iterator);
    console.log('state', '=>', service.value);
  });

  service.send({ type: 'WRITE', payload: { value: '' } });
  console.log('state', '=>', service.value);

  await sleepU(DELAY, 12).then(() => {
    console.log('service.context.iterator', service.context.iterator);
    console.log('state', '=>', service.value);
    console.log('service.context.input', '=>', service.context.input);
  });

  service.send({ type: 'WRITE', payload: { value: '' } });

  await sleepU(DELAY, 6).then(() => {
    console.log('service.context.iterator', service.context.iterator);
    console.log('service.context.input', '=>', service.context.input);
    console.log('state', '=>', service.value);
  });

  service.send({ type: 'WRITE', payload: { value: 'a' } });
  console.log('state', '=>', service.value);

  await sleepU(DELAY, 12).then(() => {
    console.log('service.context.iterator', service.context.iterator);
    console.log('state', '=>', service.value);
    console.log('service.context.input', '=>', service.context.input);
  });

  service.send('FETCH');
  console.log('state', '=>', service.value);

  await sleepU().then(() => {
    console.log('service.context.data', '=>', service.context.data.length);
    console.log('state', '=>', service.value);
    console.log('service.context.iterator', service.context.iterator);
  });

  await sleepU(DELAY, 12).then(() => {
    console.log('service.context.data', '=>', service.context.data.length);
    console.log('state', '=>', service.value);
    console.log('service.context.iterator', service.context.iterator);
  });

  await sleepU(DELAY, 12).then(() => {
    console.log('service.context.data', '=>', service.context.data.length);
    console.log('state', '=>', service.value);
    console.log('service.context.iterator', service.context.iterator);
  });

  service.send({ type: 'WRITE', payload: { value: 'a' } });
  console.log('state', '=>', service.value);

  await sleepU(DELAY, 12).then(() => {
    console.log('service.context.data', '=>', service.context.data.length);
    console.log('state', '=>', service.value);
    console.log('service.context.iterator', service.context.iterator);
  });

  service.send({ type: 'WRITE', payload: { value: '' } });
  console.log('state', '=>', service.value);

  await sleepU(DELAY, 12).then(() => {
    console.log('service.context.data', '=>', service.context.data.length);
    console.log('state', '=>', service.value);
    console.log('service.context.iterator', service.context.iterator);
  });

  service.pause();
  console.log('pause', service.intervalsArePaused);

  const workingTime = DELAY * 60;
  const endTime = Date.now();
  console.log('full-time', endTime - startTime);
  console.log('remain', endTime - startTime - workingTime);
}
