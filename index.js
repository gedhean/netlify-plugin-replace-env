const ENABLE_NETLIFY_PLUGIN_DYNAMIC_REPLACE_ENV =
  'ENABLE_NETLIFY_PLUGIN_DYNAMIC_REPLACE_ENV';

/**
 * Plugin to dynamically replace environment variable strings.
 *
 * Use case: set deploy preview dynamically
 * 1. Enable plugin by defining ENABLE_NETLIFY_PLUGIN_DYNAMIC_REPLACE_ENV=true
 * 2.For example, define an env var on Netlify UI like:
 *   2.1 AUTH0_REDIRECT_DOMAIN=$DEPLOY_PRIME_URL/callback
 *   2.2 Let's suppose DEPLOY_PRIME_URL=https://deploy-preview-0.netlify.app
 *   2.3 So AUTH0_REDIRECT_DOMAIN=https://deploy-preview-0.netlify.app/callback after replacement.
 *
 * You can enable this plugin by context by suffixing the Netlify build context, e.g:
 * - ENABLE_NETLIFY_PLUGIN_DYNAMIC_REPLACE_ENV_DEPLOY_PREVIEW=true
 */

module.exports = {
  onPreBuild: async (pluginOptions) => {
    // PRODUCTION, DEPLOY_PREVIEW OR BRANCH_DEPLOY.
    const context = `${process.env.CONTEXT}`.toUpperCase().replace(/-/g, '_');

    if (!isPluginEnabled(context)) {
      logger(
        `Skip dynamic replace env plugin. Set env ${ENABLE_NETLIFY_PLUGIN_DYNAMIC_REPLACE_ENV} to enable it.`
      );

      return false;
    }

    const envKeys = Object.keys(process.env).sort(sortByLength);

    const replacedEnvs = Object.keys(process.env).map((envKey) => {
      const envsToReplace = envKeys.filter((key) =>
        process.env[envKey].includes(`$${key}`)
      );

      if (envsToReplace.length) {
        logger(`Found ${envsToReplace.join(', ')} for ${envKey}. Replacing values.`);

        envsToReplace.forEach((key) => {
          process.env[envKey] = process.env[envKey].replaceAll(
            `$${key}`,
            process.env[key]
          );
        });

        return `${envKey} - ${envsToReplace.join(', ')}`;
      } else {
        return null;
      }
    });

    const replaced = [].concat(...replacedEnvs).filter(Boolean);
    if (replaced.length) {
      logger(`Replaced ${replaced.length} ENVs`);
      logger(`${replaced.join('\n')}`);
    } else {
      logger(`Nothing found... keeping default ENVs`);
    }

    return true;
  }
};

/**
 * Get an env value for a give context
 *
 * @param context Netlify build context. One of: PRODUCTION, DEPLOY_PREVIEW OR BRANCH_DEPLOY.
 * @param envKey Evironment variable name
 * @returns Value for evironment variable name suffixed by Netlify context
 */
function getEnvByContext(context, envKey) {
  const key = `${envKey}_${context}`;

  return process.env[key];
}

/**
 * Whether the plugin is enabled or not (can be for a given context).
 *
 * @param context Netlify build context. One of: PRODUCTION, DEPLOY_PREVIEW OR BRANCH_DEPLOY.
 * @returns True if plugin is enabled
 */
function isPluginEnabled(context) {
  return (
    process.env[ENABLE_NETLIFY_PLUGIN_DYNAMIC_REPLACE_ENV] === 'true' ||
    getEnvByContext(context, ENABLE_NETLIFY_PLUGIN_DYNAMIC_REPLACE_ENV) === 'true'
  );
}

function sortByLength(a, b) {
  // ASC  -> a.length - b.length
  // DESC -> b.length - a.length
  return b.length - a.length;
}

function logger(text) {
  if (process.env.APP_ENV !== 'test') {
    console.log(text);
  }
}
