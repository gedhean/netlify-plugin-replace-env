const { onPreBuild } = require ('../index.js');

const originalEnv = process.env;

describe('netlify-plugin-dynamic-replace-env plugin', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });

  it('disabled by default', async () => {
    const enabled = await onPreBuild();

    expect(enabled).toBe(false);
  });

  it('enabled when env var ENABLE_NETLIFY_PLUGIN_DYNAMIC_REPLACE_ENV is true', async () => {
    process.env.ENABLE_NETLIFY_PLUGIN_DYNAMIC_REPLACE_ENV = 'true';

    const enabled = await onPreBuild();

    expect(enabled).toBe(true);
  });

  it('should replace $FOO env var value at $BAR env', async () => {
    process.env.ENABLE_NETLIFY_PLUGIN_DYNAMIC_REPLACE_ENV = 'true';
    process.env.FOO = 'foO';
    process.env.BOO = 'brazil!';
    process.env.BAR = 'someValue_$FOO/$BOO';

    await onPreBuild();

    expect(process.env.BAR).toBe('someValue_foO/brazil!');
    expect(process.env.FOO).toBe('foO');
    expect(process.env.BOO).toBe('brazil!');
  });

  it('should not replace undefined vars defined', async () => {
    process.env.ENABLE_NETLIFY_PLUGIN_DYNAMIC_REPLACE_ENV = 'true';
    process.env.BAR = 'someValue_$FOO/$BOO';
    delete process.env.FOO;
    delete process.env.BOO;

    await onPreBuild();

    expect(process.env.BAR).toBe('someValue_$FOO/$BOO');
  });

  it('can be enable by build context', async () => {
    // disable globaly
    delete process.env.ENABLE_NETLIFY_PLUGIN_DYNAMIC_REPLACE_ENV;

    // enable for deploy-preview context
    process.env.ENABLE_NETLIFY_PLUGIN_DYNAMIC_REPLACE_ENV_DEPLOY_PREVIEW = 'true';

    process.env.CONTEXT = 'produciton';
    process.env.FOO = 'fo';
    process.env.BAR = 'bla/$FOO';
    await onPreBuild();
    expect(process.env.BAR).toBe('bla/$FOO');

    process.env.CONTEXT = 'deploy-preview';
    process.env.FOO2 = 'foo';
    process.env.BAR2 = 'bla/$FOO2';
    await onPreBuild();
    expect(process.env.BAR2).toBe('bla/foo');
  });
});
