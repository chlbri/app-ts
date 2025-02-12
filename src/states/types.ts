import type { SingleOrArrayR } from 'src/types/primitives';
import type { ActionConfig } from '~actions';
import type { TransitionsConfig } from '~transitions';

export type StateType = 'atomic' | 'compound' | 'parallel';

export type StateNodesConfig = Record<string, StateNodeConfig>;

export type StateNodeConfig =
  | StateNodeConfigAtomic
  | StateNodeConfigCompound
  | StateNodeConfigParallel;

export type SNC = StateNodeConfig;

export type StateNodeConfigAtomic = TransitionsConfig & {
  readonly type?: 'atomic';
  readonly id?: string;
  readonly description?: string;
  readonly entry?: SingleOrArrayR<ActionConfig>;
  readonly exit?: SingleOrArrayR<ActionConfig>;
  readonly tags?: SingleOrArrayR<string>;
  readonly states?: never;
  readonly initial?: never;
};

export type StateNodeConfigCompound = TransitionsConfig & {
  readonly type?: 'compound';
  readonly id?: string;
  readonly description?: string;
  readonly initial: string;
  readonly states: StateNodesConfig;
  readonly entry?: SingleOrArrayR<ActionConfig>;
  readonly exit?: SingleOrArrayR<ActionConfig>;
  readonly tags?: SingleOrArrayR<string>;
};

export type StateNodeConfigParallel = TransitionsConfig & {
  readonly type: 'parallel';
  readonly id?: string;
  readonly description?: string;
  readonly states: StateNodesConfig;
  readonly entry?: SingleOrArrayR<ActionConfig>;
  readonly exit?: SingleOrArrayR<ActionConfig>;
  readonly tags?: SingleOrArrayR<string>;
  readonly initial?: never;
};

export type GetStateType_F = (node: StateNodeConfig) => StateType;

export type StateValue = string | StateValueMap;

export interface StateValueMap {
  [key: string]: StateValue;
}

export type NextStateValue_F = <T extends StateValue>(
  from: T,
  target?: string | undefined,
) => StateValue;
