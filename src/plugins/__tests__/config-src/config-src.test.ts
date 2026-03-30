import {
  getDefaultMode,
  hasPlugin,
  applyConfig,
  resetRegistry,
} from '#plugins';
import srcConfig from './app-ts.config';

describe('#01 => src-level app-ts.config', () => {
  describe('#01 => config shape', () => {
    test('#01 => config mode is "normal"', () => {
      expect(srcConfig.mode).toBe('normal');
    });

    test('#02 => config has plugins array', () => {
      expect(srcConfig.plugins).toBeDefined();
    });

    test('#03 => plugins array has length 1', () => {
      expect(srcConfig.plugins).toHaveLength(1);
    });
  });

  describe('#02 => after applying config', () => {
    beforeEach(() => {
      resetRegistry();
      applyConfig(srcConfig);
    });

    test('#01 => default mode is "normal"', () => {
      expect(getDefaultMode()).toBe('normal');
    });

    test('#02 => emitters plugin is registered', () => {
      expect(hasPlugin('emitters')).toBe(true);
    });
  });
});
