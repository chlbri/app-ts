import { decomposeSV } from '@bemedev/decompose';
import type { StateValue } from '~states';

const sv = { data: 'ert' } satisfies StateValue;
const dec = decomposeSV(sv);

console.log(dec);
console.log('/state'.substring(1));
