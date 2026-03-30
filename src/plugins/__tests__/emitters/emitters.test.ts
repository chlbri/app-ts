import { getPlugin, hasPlugin, resetRegistry } from '#plugins';
import { emittersPlugin } from './plugin';
import { registerPlugin } from '../../registry';

describe('#01 => emitters plugin', () => {
  beforeEach(resetRegistry);

  describe('#01 => properties', () => {
    test('#01 => name is "emitters"', () => {
      expect(emittersPlugin.name).toBe('emitters');
    });

    test('#02 => description is defined', () => {
      expect(emittersPlugin.description).toBeDefined();
    });

    test('#03 => options.pausable is true', () => {
      expect(emittersPlugin.options?.pausable).toBe(true);
    });

    test('#04 => setup is defined', () => {
      expect(emittersPlugin.setup).toBeDefined();
    });
  });

  describe('#02 => registration', () => {
    test('#01 => register emitters plugin', () => {
      registerPlugin(emittersPlugin);
    });

    test('#02 => hasPlugin returns true', () => {
      registerPlugin(emittersPlugin);
      expect(hasPlugin('emitters')).toBe(true);
    });

    test('#03 => getPlugin returns the plugin', () => {
      registerPlugin(emittersPlugin);
      expect(getPlugin('emitters')).toBe(emittersPlugin);
    });
  });
});
