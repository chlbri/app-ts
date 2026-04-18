import { glob } from 'glob';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, relative, basename } from 'node:path';
import { DEFAULT_EXCLUDES, DEFAULT_OUTPUT } from '../constants';

type StateNode = {
  name: string;
  path: string;
  initial?: string;
  children: StateNode[];
  tags?: string[];
  eventKeys: string[];
  actionKeys: string[];
  guardKeys: string[];
  delayKeys: string[];
  emitterKeys: string[];
  childrenKeys: string[];
};

type MachineInfo = {
  name: string;
  relativePath: string;
  sourceFile: string;
  allPaths: string[];
  stateTree: StateNode;
  actionKeys: string[];
  guardKeys: string[];
  delayKeys: string[];
  eventKeys: string[];
  tagKeys: string[];
  emitterKeys: string[];
  childrenKeys: string[];
};

function sanitizeName(relativePath: string): string {
  const base = basename(relativePath).replace(/\.(machine|fsm)\.ts$/, '');
  return base
    .replace(/[^a-zA-Z0-9]/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_');
}

function capitalizeFirst(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function toPrefix(name: string): string {
  return name.split('_').map(capitalizeFirst).join('');
}

function parseStateTree(config: any, parentPath: string = ''): StateNode {
  const node: StateNode = {
    name: parentPath === '' ? 'root' : parentPath.split('/').pop()!,
    path: parentPath === '' ? '/' : parentPath,
    children: [],
    eventKeys: [],
    actionKeys: [],
    guardKeys: [],
    delayKeys: [],
    emitterKeys: [],
    childrenKeys: [],
  };

  if (config.initial) {
    node.initial = config.initial;
  }

  if (config.tags) {
    node.tags = config.tags;
  }

  // Extract event keys from 'on'
  if (config.on && typeof config.on === 'object') {
    node.eventKeys.push(...Object.keys(config.on));
  }

  // Extract action keys
  extractActionsFromNode(config, node.actionKeys);

  // Extract guard keys
  extractGuardsFromNode(config, node.guardKeys);

  // Extract delay keys from 'after'
  if (config.after && typeof config.after === 'object') {
    node.delayKeys.push(...Object.keys(config.after));
  }

  // Parse nested states
  if (config.states && typeof config.states === 'object') {
    for (const [stateName, stateConfig] of Object.entries(config.states)) {
      const childPath = `${parentPath}/${stateName}`;
      const child = parseStateTree(stateConfig as any, childPath);
      node.children.push(child);
    }
  }

  return node;
}

function extractActionsFromNode(config: any, keys: string[]): void {
  if (config.entry) {
    collectActionKeys(config.entry, keys);
  }
  if (config.exit) {
    collectActionKeys(config.exit, keys);
  }
  if (config.on && typeof config.on === 'object') {
    for (const transitions of Object.values(config.on) as any[]) {
      const transArray = Array.isArray(transitions)
        ? transitions
        : [transitions];
      for (const t of transArray) {
        if (typeof t === 'object' && t !== null && t.actions) {
          collectActionKeys(t.actions, keys);
        }
      }
    }
  }
  if (config.after && typeof config.after === 'object') {
    for (const transitions of Object.values(config.after) as any[]) {
      const transArray = Array.isArray(transitions)
        ? transitions
        : [transitions];
      for (const t of transArray) {
        if (typeof t === 'object' && t !== null && t.actions) {
          collectActionKeys(t.actions, keys);
        }
      }
    }
  }
}

function collectActionKeys(actions: any, keys: string[]): void {
  if (typeof actions === 'string') {
    keys.push(actions);
  } else if (Array.isArray(actions)) {
    for (const a of actions) {
      if (typeof a === 'string') {
        keys.push(a);
      } else if (typeof a === 'object' && a !== null && a.name) {
        keys.push(a.name);
      }
    }
  } else if (
    typeof actions === 'object' &&
    actions !== null &&
    actions.name
  ) {
    keys.push(actions.name);
  }
}

function extractGuardsFromNode(config: any, keys: string[]): void {
  if (config.on && typeof config.on === 'object') {
    for (const transitions of Object.values(config.on) as any[]) {
      const transArray = Array.isArray(transitions)
        ? transitions
        : [transitions];
      for (const t of transArray) {
        if (typeof t === 'object' && t !== null && t.guards) {
          collectGuardKeys(t.guards, keys);
        }
      }
    }
  }
}

function collectGuardKeys(guards: any, keys: string[]): void {
  if (typeof guards === 'string') {
    keys.push(guards);
  } else if (typeof guards === 'object' && guards !== null) {
    if (guards.and) {
      for (const g of guards.and) {
        collectGuardKeys(g, keys);
      }
    }
    if (guards.or) {
      for (const g of guards.or) {
        collectGuardKeys(g, keys);
      }
    }
    if (guards.not) {
      collectGuardKeys(guards.not, keys);
    }
    if (guards.name) {
      keys.push(guards.name);
    }
  }
}

function collectAllPaths(node: StateNode): string[] {
  const paths: string[] = [node.path];
  for (const child of node.children) {
    paths.push(...collectAllPaths(child));
  }
  return paths;
}

function collectAllKeys<K extends keyof StateNode>(
  node: StateNode,
  key: K,
): string[] {
  const values = [...(node[key] as string[])];
  for (const child of node.children) {
    values.push(...collectAllKeys(child, key));
  }
  return [...new Set(values)];
}

function collectAllTags(node: StateNode): string[] {
  const tags: string[] = [...(node.tags ?? [])];
  for (const child of node.children) {
    tags.push(...collectAllTags(child));
  }
  return [...new Set(tags)];
}

/**
 * Parse a machine file to extract the config object.
 * This uses a simplified AST-free approach by evaluating patterns.
 */
function parseMachineFile(
  filePath: string,
  projectRoot: string,
): MachineInfo | null {
  const content = readFileSync(filePath, 'utf-8');

  // Detect createMachine call
  const createMachineMatch = content.match(
    /(?:export\s+default\s+|export\s+const\s+\w+\s*=\s*)createMachine\s*\(/,
  );
  if (!createMachineMatch) return null;

  // Extract the relative path from the project root
  const relPath = relative(projectRoot, filePath)
    .replace(/\.(machine|fsm)\.ts$/, '')
    .replace(/\\/g, '/');

  // Try to extract the config object using regex-based parsing
  const configObj = extractConfigFromSource(content);
  if (!configObj) return null;

  const stateTree = parseStateTree(configObj);
  const allPaths = collectAllPaths(stateTree);

  const name = sanitizeName(filePath);

  return {
    name,
    relativePath: relPath,
    sourceFile: relative(projectRoot, filePath).replace(/\\/g, '/'),
    allPaths,
    stateTree,
    actionKeys: collectAllKeys(stateTree, 'actionKeys'),
    guardKeys: collectAllKeys(stateTree, 'guardKeys'),
    delayKeys: collectAllKeys(stateTree, 'delayKeys'),
    eventKeys: collectAllKeys(stateTree, 'eventKeys'),
    tagKeys: collectAllTags(stateTree),
    emitterKeys: collectAllKeys(stateTree, 'emitterKeys'),
    childrenKeys: collectAllKeys(stateTree, 'childrenKeys'),
  };
}

/**
 * Extract the config object from source code by parsing the first argument
 * to createMachine. Uses a bracket-matching approach.
 */
function extractConfigFromSource(source: string): any | null {
  // Find createMachine( and then the config object
  const idx = source.indexOf('createMachine(');
  if (idx === -1) return null;

  let start = source.indexOf('{', idx);
  if (start === -1) {
    // Check for 3-arg form: createMachine('name', {
    const afterParen = source.substring(idx + 'createMachine('.length);
    const stringMatch = afterParen.match(/^\s*['"][^'"]*['"]\s*,\s*/);
    if (stringMatch) {
      start = source.indexOf(
        '{',
        idx + 'createMachine('.length + stringMatch[0].length,
      );
    }
    if (start === -1) return null;
  }

  // Check if first arg is a string (3-arg form)
  const afterParen = source
    .substring(idx + 'createMachine('.length, start)
    .trim();
  if (afterParen.match(/^['"][^'"]*['"]\s*,/)) {
    // 3-arg form, skip the name
  }

  // Bracket-match to find the end of the config object
  let depth = 0;
  let end = start;
  let inString: string | null = null;
  let escaped = false;

  for (let i = start; i < source.length; i++) {
    const char = source[i];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === '\\') {
      escaped = true;
      continue;
    }

    if (inString) {
      if (char === inString) {
        inString = null;
      }
      continue;
    }

    if (char === "'" || char === '"' || char === '`') {
      inString = char;
      continue;
    }

    if (char === '{') depth++;
    if (char === '}') {
      depth--;
      if (depth === 0) {
        end = i + 1;
        break;
      }
    }
  }

  const configStr = source.substring(start, end);

  // Convert to parseable JSON-like format
  try {
    return parseConfigString(configStr);
  } catch {
    return null;
  }
}

/**
 * Simple config string parser that extracts structure without evaluating code.
 * Extracts: initial, states (recursively), on (event names), after (delay names),
 * tags, entry/exit actions, guards.
 */
function parseConfigString(configStr: string): any {
  const result: any = {};

  // Extract initial
  const initialMatch = configStr.match(/initial\s*:\s*['"]([^'"]+)['"]/);
  if (initialMatch) {
    result.initial = initialMatch[1];
  }

  // Extract tags
  const tagsMatch = configStr.match(/tags\s*:\s*\[([^\]]*)\]/);
  if (tagsMatch) {
    const tagStr = tagsMatch[1];
    result.tags = [...tagStr.matchAll(/['"]([^'"]+)['"]/g)].map(m => m[1]);
  }

  // Extract entry/exit
  const entryMatch = configStr.match(/entry\s*:\s*['"]([^'"]+)['"]/);
  if (entryMatch) {
    result.entry = entryMatch[1];
  }

  const exitMatch = configStr.match(/exit\s*:\s*['"]([^'"]+)['"]/);
  if (exitMatch) {
    result.exit = exitMatch[1];
  }

  // Extract 'on' events - find the on block
  const onBlock = extractBlock(configStr, 'on');
  if (onBlock) {
    result.on = {};
    const eventNames = [...onBlock.matchAll(/(\w+)\s*:/g)].map(m => m[1]);
    for (const name of eventNames) {
      result.on[name] = extractTransitions(onBlock, name);
    }
  }

  // Extract 'after' delays
  const afterBlock = extractBlock(configStr, 'after');
  if (afterBlock) {
    result.after = {};
    const delayNames = [...afterBlock.matchAll(/(\w+)\s*:/g)].map(
      m => m[1],
    );
    for (const name of delayNames) {
      result.after[name] = extractTransitions(afterBlock, name);
    }
  }

  // Extract nested states
  const statesBlock = extractBlock(configStr, 'states');
  if (statesBlock) {
    result.states = {};
    // Find top-level state names
    const stateNames = extractTopLevelKeys(statesBlock);
    for (const stateName of stateNames) {
      const stateBlock = extractBlock(statesBlock, stateName);
      if (stateBlock) {
        result.states[stateName] = parseConfigString(`{${stateBlock}}`);
      } else {
        result.states[stateName] = {};
      }
    }
  }

  return result;
}

function extractBlock(source: string, key: string): string | null {
  const regex = new RegExp(`(?:^|[,{\\s])${key}\\s*:\\s*\\{`, 'm');
  const match = regex.exec(source);
  if (!match) return null;

  const start = source.indexOf('{', match.index + match[0].indexOf(key));
  if (start === -1) return null;

  let depth = 0;
  let end = start;

  for (let i = start; i < source.length; i++) {
    if (source[i] === '{') depth++;
    if (source[i] === '}') {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }

  return source.substring(start + 1, end);
}

function extractTopLevelKeys(block: string): string[] {
  const keys: string[] = [];
  let depth = 0;
  let current = '';
  let inString: string | null = null;

  for (let i = 0; i < block.length; i++) {
    const char = block[i];

    if (inString) {
      if (char === inString) inString = null;
      continue;
    }

    if (char === "'" || char === '"') {
      inString = char;
      continue;
    }

    if (char === '{' || char === '[' || char === '(') depth++;
    if (char === '}' || char === ']' || char === ')') depth--;

    if (depth === 0 && char === ':') {
      const trimmed = current.trim();
      if (trimmed && /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(trimmed)) {
        keys.push(trimmed);
      }
      current = '';
    } else if (depth === 0 && (char === ',' || char === '\n')) {
      current = '';
    } else if (depth === 0) {
      current += char;
    } else {
      current = '';
    }
  }

  return keys;
}

function extractTransitions(block: string, eventName: string): any[] {
  const transitions: any[] = [];
  // Find transitions for this event
  const transBlock = extractBlock(block, eventName);
  if (transBlock) {
    // Array of transitions
    const actionMatches = [
      ...transBlock.matchAll(
        /actions\s*:\s*(?:\[([^\]]*)\]|['"]([^'"]+)['"])/g,
      ),
    ];
    for (const m of actionMatches) {
      const acts = m[1]
        ? [...m[1].matchAll(/['"]([^'"]+)['"]/g)].map(a => a[1])
        : [m[2]];
      transitions.push({ actions: acts });
    }

    const guardMatches = [
      ...transBlock.matchAll(/guards\s*:\s*['"]([^'"]+)['"]/g),
    ];
    for (const m of guardMatches) {
      transitions.push({ guards: m[1] });
    }

    // Complex guards
    const andMatches = [
      ...transBlock.matchAll(/guards\s*:\s*\{\s*and\s*:\s*\[([^\]]*)\]/g),
    ];
    for (const m of andMatches) {
      const guards = [...m[1].matchAll(/['"]([^'"]+)['"]/g)].map(
        g => g[1],
      );
      transitions.push({ guards: { and: guards } });
    }
  }

  return transitions.length > 0 ? transitions : [{}];
}

function generateStateTargets(
  _allPaths: string[],
  currentPath: string,
  prefix: string,
): string {
  const excluded = ["'/'", `'${currentPath}'`];
  const excludeStr = excluded.join(' | ');
  return `Exclude<${prefix}_AllPaths, ${excludeStr}>`;
}

function generateStateConfigType(
  node: StateNode,
  allPaths: string[],
  prefix: string,
  indent: string = '    ',
): string {
  const lines: string[] = [];

  for (const child of node.children) {
    lines.push(`${indent}readonly ${child.name}: {`);
    lines.push(
      `${indent}  readonly __targets: ${generateStateTargets(allPaths, child.path, prefix)};`,
    );

    if (child.initial) {
      const childStateNames = child.children
        .map(c => `'${c.name}'`)
        .join(' | ');
      lines.push(`${indent}  readonly initial: ${childStateNames};`);
    }

    if (child.children.length > 0) {
      lines.push(`${indent}  readonly states: {`);
      lines.push(
        generateStateConfigType(child, allPaths, prefix, indent + '    '),
      );
      lines.push(`${indent}  };`);
    }

    lines.push(`${indent}};`);
  }

  return lines.join('\n');
}

function generateMachineSection(info: MachineInfo): string {
  const prefix = toPrefix(info.name);
  const lines: string[] = [];

  lines.push(
    `// ============================================================`,
  );
  lines.push(`// Machine: ${info.relativePath}`);
  lines.push(`// Source:   ${info.sourceFile}`);
  lines.push(
    `// ============================================================`,
  );
  lines.push('');

  // AllPaths type
  lines.push(`type ${prefix}_AllPaths =`);
  for (let i = 0; i < info.allPaths.length; i++) {
    const sep = i === 0 ? '  ' : '  | ';
    lines.push(
      `${sep}'${info.allPaths[i]}'${i === info.allPaths.length - 1 ? ';' : ''}`,
    );
  }
  lines.push('');

  // Config type
  const initialNames = info.stateTree.children
    .map(c => `'${c.name}'`)
    .join(' | ');
  lines.push(`type ${prefix}_Config = {`);
  lines.push(`  readonly initial: ${initialNames || 'never'};`);
  lines.push(`  readonly states: {`);
  lines.push(
    generateStateConfigType(info.stateTree, info.allPaths, prefix),
  );
  lines.push(`  };`);
  lines.push(`};`);
  lines.push('');

  // Key types
  const formatKeys = (keys: string[]) =>
    keys.length > 0 ? keys.map(k => `'${k}'`).join(' | ') : 'never';

  lines.push(
    `type ${prefix}_ActionKeys = ${formatKeys(info.actionKeys)};`,
  );
  lines.push(`type ${prefix}_GuardKeys = ${formatKeys(info.guardKeys)};`);
  lines.push(`type ${prefix}_DelayKeys = ${formatKeys(info.delayKeys)};`);
  lines.push(`type ${prefix}_EventKeys = ${formatKeys(info.eventKeys)};`);
  lines.push(`type ${prefix}_TagKeys = ${formatKeys(info.tagKeys)};`);
  lines.push(
    `type ${prefix}_EmitterKeys = ${formatKeys(info.emitterKeys)};`,
  );
  lines.push(
    `type ${prefix}_ChildrenKeys = ${formatKeys(info.childrenKeys)};`,
  );
  lines.push('');

  return lines.join('\n');
}

function generateRegisterEntry(info: MachineInfo): string {
  const prefix = toPrefix(info.name);
  return `      '${info.relativePath}': MachineTypeDef<
        ${prefix}_Config,
        ${prefix}_AllPaths,
        ${prefix}_ActionKeys,
        ${prefix}_GuardKeys,
        ${prefix}_DelayKeys,
        ${prefix}_EventKeys,
        ${prefix}_TagKeys,
        ${prefix}_EmitterKeys,
        ${prefix}_ChildrenKeys
      >;`;
}

export function generateAppGen(options: {
  output?: string;
  excludes?: string[];
  cwd?: string;
  dryRun?: boolean;
}): string {
  const {
    output = DEFAULT_OUTPUT,
    excludes = DEFAULT_EXCLUDES,
    cwd = process.cwd(),
  } = options;

  const projectRoot = resolve(cwd);
  const outputPath = resolve(projectRoot, output);

  // Find all machine files
  const machineFiles = glob.sync('**/*.{machine,fsm}.ts', {
    cwd: projectRoot,
    ignore: excludes.map(e => `${e}/**`),
    absolute: true,
  });

  if (machineFiles.length === 0) {
    console.log('No machine files found.');
    return '';
  }

  // Parse all machines
  const machines: MachineInfo[] = [];
  for (const file of machineFiles) {
    const info = parseMachineFile(file, projectRoot);
    if (info) {
      machines.push(info);
    } else {
      console.warn(
        `Warning: Could not parse machine file: ${relative(projectRoot, file)}`,
      );
    }
  }

  if (machines.length === 0) {
    console.log('No valid machine configurations found.');
    return '';
  }

  // Generate the output
  const sections: string[] = [];

  sections.push(`/**
 * This file is auto-generated by the @bemedev/app-ts CLI.
 * Do not edit manually.
 *
 * @see https://www.npmjs.com/package/@bemedev/app-ts
 */`);
  sections.push('');

  // Machine sections
  for (const info of machines) {
    sections.push(generateMachineSection(info));
  }

  // MachineTypeDef interface
  sections.push(
    `// ============================================================`,
  );
  sections.push(`// Global Register Interface`);
  sections.push(
    `// ============================================================`,
  );
  sections.push('');
  sections.push(`interface MachineTypeDef<
  TConfig = unknown,
  AllPaths extends string = string,
  ActionKeys extends string = string,
  GuardKeys extends string = string,
  DelayKeys extends string = string,
  EventKeys extends string = string,
  TagKeys extends string = string,
  EmitterKeys extends string = string,
  ChildrenKeys extends string = string,
> {
  config: TConfig;
  allPaths: AllPaths;
  actionKeys: ActionKeys;
  guardKeys: GuardKeys;
  delayKeys: DelayKeys;
  eventKeys: EventKeys;
  tagKeys: TagKeys;
  emitterKeys: EmitterKeys;
  childrenKeys: ChildrenKeys;
}`);
  sections.push('');

  // Register interface
  sections.push(`declare module '@bemedev/app-ts' {`);
  sections.push(`  interface Register {`);
  sections.push(`    machines: {`);
  for (const info of machines) {
    sections.push(generateRegisterEntry(info));
  }
  sections.push(`    };`);
  sections.push(`  }`);
  sections.push(`}`);
  sections.push('');
  sections.push(`export {};`);

  const content = sections.join('\n');

  if (!options.dryRun) {
    writeFileSync(outputPath, content, 'utf-8');
    console.log(
      `Generated ${relative(projectRoot, outputPath)} with ${machines.length} machine(s).`,
    );
  }

  return content;
}
