/**
 *
 * All paths of the concerned files
 *
 * ### Author
 *
 * chlbri (bri_lvi@icloud.com)
 *
 * [My GitHub](https://github.com/chlbri?tab=repositories)
 *
 * <br/>
 *
 * ### Documentation
 *
 * Link to machine lib [here](https://www.npmjs.com/package/@bemedev/app-ts).
 *
 * Link to this lib [here](https://www.npmjs.com/package/@bemedev/app-cli)
 *
 *
 * This file is auto-generated. Do not edit manually.
 */
export type _AllPaths = {
  machine:
    | '/'
    | '/idle'
    | '/checking'
    | '/working'
    | '/working/idle'
    | '/working/adding';
};
/**
 *
 * Constants as type helpers for the concerned file.
 * Don't use it as values, just for typings
 *
 * ### Author
 *
 * chlbri (bri_lvi@icloud.com)
 *
 * [My GitHub](https://github.com/chlbri?tab=repositories)
 *
 * <br/>
 *
 * ### Documentation
 *
 * Link to machine lib [here](https://www.npmjs.com/package/@bemedev/app-ts).
 *
 * Link to this lib [here](https://www.npmjs.com/package/@bemedev/app-cli)
 *
 * NB: This file is auto-generated. Do not edit manually.
 */
export const SCHEMAS = {
  machine: {
    __tsSchema: undefined as unknown as {
      readonly targets: Exclude<_AllPaths['machine'], '/'>;
      readonly states: {
        readonly idle: {
          readonly targets: Exclude<_AllPaths['machine'], '/idle'>;
        };
        readonly checking: {
          readonly targets: Exclude<_AllPaths['machine'], '/checking'>;
        };
        readonly working: {
          readonly targets: Exclude<_AllPaths['machine'], '/working'>;
          readonly states: {
            readonly idle: {
              readonly targets: Exclude<
                _AllPaths['machine'],
                '/working/idle'
              >;
            };
            readonly adding: {
              readonly targets: Exclude<
                _AllPaths['machine'],
                '/working/adding'
              >;
            };
          };
          readonly initial: 'idle' | 'adding';
        };
      };
      readonly initial: 'idle' | 'checking' | 'working';
    },
  },
};
