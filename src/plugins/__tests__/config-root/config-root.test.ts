import {
  getDefaultMode,
  hasPlugin,
  applyConfig,
  resetRegistry,
} from '#plugins';
import rootConfig from './app-ts.config';

describe('#01 => root-level app-ts.config', () => {
  describe('#01 => config shape', () => {
    test('#01 => config mode is "strict"', () => {
      expect(rootConfig.mode).toBe('strict');
    });

    test('#02 => config has plugins array', () => {
      expect(rootConfig.plugins).toBeDefined();
    });

    test('#03 => plugins array has length 1', () => {
      expect(rootConfig.plugins).toHaveLength(1);
    });
  });

  describe('#02 => after applying config', () => {
    beforeEach(() => {
      resetRegistry();
      applyConfig(rootConfig);
    });

    test('#01 => default mode is "strict"', () => {
      expect(getDefaultMode()).toBe('strict');
    });

    test('#02 => emitters plugin is registered', () => {
      expect(hasPlugin('emitters')).toBe(true);
    });
  });
});
