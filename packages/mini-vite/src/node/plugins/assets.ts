import { Plugin } from '../plugin';
import { ServerContext } from '../server';
import { cleanUrl, getShortName, normalizePath, removeImportQuery } from '../utils';

export function assetsPlugin(): Plugin {
  let serverContext: ServerContext;
  return {
    name: 'm-vite:asset',
    configureServer(server) {
      serverContext = server;
    },
    load(id) {
      const cleanedId = removeImportQuery(cleanUrl(id));
      const resolvedId = `/${getShortName(normalizePath(id), serverContext.root)}`;

      // 这里仅处理svg
      if (cleanedId.endsWith('.svg')) {
        return {
          code: `export default '${resolvedId}'`
        };
      }
    }
  };
}
