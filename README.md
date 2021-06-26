# netlify-plugin-replace-env

This plugin replaces ENV vars interpolations inside other ENV vars.

So if you have an ENV var like `MY_VAR=$MY_OTHER_VAR/foo`, this plugin is going to replace 
the value of `MY_VAR` by substituing `MY_OTHER_VAR` value. 

```sh
MY_OTHER_VAR=bar
MY_VAR=$MY_OTHER_VAR/foo
# After the plugin execution
MY_OTHER_VAR=bar
MY_VAR=bar/foo
```
### Enabling the plugin

This plugin is **disabled** by default for all [Netlify deploy contexts](https://docs.netlify.com/site-deploys/overview).

To enbable it for **all** *deploy contexts*, set the env var `ENABLE_NETLIFY_PLUGIN_DYNAMIC_REPLACE_ENV` to `true` (must be that value).

To enbalbe for a scpecific *deploy context*, suffix the above env with the uppercase context name:

- `ENABLE_NETLIFY_PLUGIN_DYNAMIC_REPLACE_ENV_PRODUCTION=true` enable for **production** only *deploy context*. 
- `ENABLE_NETLIFY_PLUGIN_DYNAMIC_REPLACE_ENV_DEPLOY_PREVIEW=true` enable for **deploy-preview** only *deploy context*. 
- `ENABLE_NETLIFY_PLUGIN_DYNAMIC_REPLACE_ENV_BRANCH_DEPLOY=true` enable for **branch-deploy** only *deploy context*. 

## Usage
#### Add the plugin
Add a `[[plugins]]` entry to your `netlify.toml` file:

```toml
[[plugins]]
package = 'netlify-plugin-replace-env'
```