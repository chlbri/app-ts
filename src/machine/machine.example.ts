import { decomposeKeys } from '@bemedev/decompose';
import { machine1 } from 'src/interpreters/__tests__/test.data';

const keys1 = decomposeKeys.strict(machine1.postConfig);

console.log(keys1);
