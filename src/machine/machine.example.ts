import { decomposeKeys } from '@bemedev/decompose';
import { machine1 } from 'src/interpreters/__tests__/test.data';

//@ts-expect-error for test
const keys1 = decomposeKeys(machine1.postConfig);

console.log(keys1);
