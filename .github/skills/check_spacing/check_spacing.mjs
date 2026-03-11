import { readFileSync } from 'fs';

const [, , filePath] = process.argv;
const lines = readFileSync(filePath, 'utf8').split('\n');

const tests = [];
let i = 0;
while (i < lines.length) {
  const line = lines[i];
  if (/^\s+test\(/.test(line)) {
    const isSingle = /^\s+test\(.*\);$/.test(line);
    if (isSingle) {
      tests.push({ lineNum: i + 1, type: 'single', endLine: i + 1 });
      i++;
    } else {
      let braceDepth = 0;
      let end = i;
      for (let k = i; k < lines.length; k++) {
        for (const ch of lines[k]) {
          if (ch === '{') braceDepth++;
          if (ch === '}') braceDepth--;
        }
        if (k > i && braceDepth === 0 && lines[k].includes(');')) {
          end = k;
          break;
        }
      }
      tests.push({ lineNum: i + 1, type: 'multi', endLine: end + 1 });
      i = end + 1;
    }
  } else {
    i++;
  }
}

let violations = 0;
for (let x = 0; x < tests.length - 1; x++) {
  const t1 = tests[x];
  const t2 = tests[x + 1];
  const gap = t2.lineNum - t1.endLine - 1;
  const bothSingle = t1.type === 'single' && t2.type === 'single';
  const expected = bothSingle ? 0 : 1;
  if (gap !== expected) {
    violations++;
    console.log(
      `VIOLATION L${t1.endLine}→L${t2.lineNum}: ` +
        `gap=${gap} expected=${expected} ` +
        `(${t1.type} → ${t2.type})`,
    );
    console.log(`  line ${t1.lineNum}: ${lines[t1.lineNum - 1].trim()}`);
    console.log(`  line ${t2.lineNum}: ${lines[t2.lineNum - 1].trim()}`);
  }
}
if (violations === 0) console.log('No spacing violations found.');
else console.log(`\n${violations} violation(s) total.`);
