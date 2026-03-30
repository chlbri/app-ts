import {
  applyConfig,
  defineConfig,
  definePlugin,
  getDefaultMode,
  getPlugin,
  getPlugins,
  hasPlugin,
  registerPlugin,
  resetRegistry,
  setDefaultMode,
} from '#plugins';

describe('#01 => definePlugin', () => {
  const plugin = definePlugin({
    name: 'test-plugin',
    description: 'A test plugin',
    options: { key: 'value' },
  });

  test('#01 => name is "test-plugin"', () => {
    expect(plugin.name).toBe('test-plugin');
  });

  test('#02 => description is defined', () => {
    expect(plugin.description).toBeDefined();
  });

  test('#03 => options.key is "value"', () => {
    expect(plugin.options?.key).toBe('value');
  });
});

describe('#02 => registry', () => {
  beforeEach(resetRegistry);

  const plugin = definePlugin({
    name: 'reg-plugin',
    description: 'A plugin for registry tests',
  });

  describe('#01 => registerPlugin', () => {
    test('#01 => hasPlugin returns true', () => {
      registerPlugin(plugin);
      expect(hasPlugin('reg-plugin')).toBe(true);
    });

    test('#02 => getPlugin returns the plugin', () => {
      registerPlugin(plugin);
      expect(getPlugin('reg-plugin')).toBe(plugin);
    });

    test('#03 => getPlugins has length 1', () => {
      registerPlugin(plugin);
      expect(getPlugins()).toHaveLength(1);
    });

    test('#04 => duplicate is ignored', () => {
      registerPlugin(plugin);
      registerPlugin(plugin);
      expect(getPlugins()).toHaveLength(1);
    });
  });

  describe('#02 => hasPlugin', () => {
    test('#01 => false for unregistered', () => {
      expect(hasPlugin('unknown')).toBe(false);
    });

    test('#02 => true after registering', () => {
      registerPlugin(plugin);
      expect(hasPlugin('reg-plugin')).toBe(true);
    });
  });

  describe('#03 => getPlugin', () => {
    test('#01 => undefined for unregistered', () => {
      expect(getPlugin('unknown')).toBeUndefined();
    });

    test('#02 => returns plugin after registering', () => {
      registerPlugin(plugin);
      expect(getPlugin('reg-plugin')).toBe(plugin);
    });
  });

  describe('#04 => setDefaultMode / getDefaultMode', () => {
    test('#01 => default mode is "strict"', () => {
      expect(getDefaultMode()).toBe('strict');
    });

    test('#02 => set mode to "normal"', () => {
      setDefaultMode('normal');
      expect(getDefaultMode()).toBe('normal');
    });

    test('#03 => reset restores "strict"', () => {
      setDefaultMode('normal');
      resetRegistry();
      expect(getDefaultMode()).toBe('strict');
    });
  });

  describe('#05 => resetRegistry', () => {
    test('#01 => clears all plugins', () => {
      registerPlugin(plugin);
      resetRegistry();
      expect(getPlugins()).toHaveLength(0);
    });

    test('#02 => resets mode to "strict"', () => {
      setDefaultMode('normal');
      resetRegistry();
      expect(getDefaultMode()).toBe('strict');
    });
  });
});

describe('#03 => applyConfig', () => {
  beforeEach(resetRegistry);

  const plugin1 = definePlugin({
    name: 'plugin-1',
  });

  const plugin2 = definePlugin({
    name: 'plugin-2',
  });

  test('#01 => applies mode', () => {
    applyConfig({ mode: 'normal' });
    expect(getDefaultMode()).toBe('normal');
  });

  test('#02 => registers plugins', () => {
    applyConfig({ plugins: [plugin1, plugin2] });
    expect(getPlugins()).toHaveLength(2);
  });

  test('#03 => applies mode and plugins', () => {
    applyConfig({
      mode: 'normal',
      plugins: [plugin1],
    });
    expect(getDefaultMode()).toBe('normal');
  });

  test('#04 => plugin-1 is registered', () => {
    applyConfig({ plugins: [plugin1] });
    expect(hasPlugin('plugin-1')).toBe(true);
  });
});

describe('#04 => defineConfig', () => {
  beforeEach(resetRegistry);

  const plugin = definePlugin({
    name: 'config-plugin',
  });

  test('#01 => returns the config object', () => {
    const config = defineConfig({
      mode: 'strict',
      plugins: [plugin],
    });
    expect(config.mode).toBe('strict');
  });

  test('#02 => applies mode to registry', () => {
    defineConfig({
      mode: 'normal',
      plugins: [plugin],
    });
    expect(getDefaultMode()).toBe('normal');
  });

  test('#03 => registers plugins', () => {
    defineConfig({
      mode: 'normal',
      plugins: [plugin],
    });
    expect(hasPlugin('config-plugin')).toBe(true);
  });
});

describe('#05 => plugin setup', () => {
  beforeEach(resetRegistry);

  test('#01 => setup is called on register', () => {
    let called = false;
    const plugin = definePlugin({
      name: 'setup-plugin',
      setup() {
        called = true;
      },
    });
    registerPlugin(plugin);
    expect(called).toBe(true);
  });

  test('#02 => setup receives options', () => {
    let received: any;
    const plugin = definePlugin({
      name: 'opts-plugin',
      options: { val: 42 },
      setup(options) {
        received = options;
      },
    });
    registerPlugin(plugin);
    expect(received).toEqual({ val: 42 });
  });
});
