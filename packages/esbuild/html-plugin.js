const fs = require('fs/promises');
const path = require('path');
const { createScript, createLink, generateHTML } = require('./util');

module.exports = () => ({
  name: 'esbuild:html',
  setup(build) {
    build.onEnd(async (buildResult) => {
      if (buildResult.errors.length) {
        return;
      }
      const { metafile } = buildResult;
      const scripts = [];
      const links = [];
      if (metafile) {
        const { outputs } = metafile;
        const assets = Object.keys(outputs);

        assets.forEach((asset) => {
          if (asset.endsWith('.js')) {
            scripts.push(createScript(asset));
          } else if (asset.endsWith('.css')) {
            links.push(createLink(asset));
          }
        });

        const templateContent = generateHTML(scripts, links);

        const templatePath = path.join(process.cwd(), 'index.html');
        await fs.writeFile(templatePath, templateContent);
      }
    });
  }
});
