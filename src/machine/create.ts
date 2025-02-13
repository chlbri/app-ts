import type { Config } from '~machines';

export type CreateConfig_F = <const T extends Config>(config: T) => T;

export const createConfig: CreateConfig_F = config => config;
