import resolve from 'resolve';
import path from 'path';
import { pathExists } from 'fs-extra';
import { Plugin } from '../plugin';
import { ServerContext } from '../server';
import { normalizePath } from '../utils';
import { DEFAULT_EXTERSIONS } from '../constants';

export function resolvePlugin(): Plugin {
  let serverContext: ServerContext;

  return {
    name: 'm-vite:resolve',
    configureServer(s) {
      // 保存服务端上下文
      serverContext = s;
    },
    async resolveId(id, importer) {
      // 1. 绝对路径
      if (path.isAbsolute(id)) {
        if (await pathExists(id)) {
          return { id };
        }

        // 加上root路径前缀，处理src/main.tsx的情况
        id = path.join(serverContext.root, id);
        if (await pathExists(id)) {
          return { id };
        }
      }
      // 2. 相对路径
      else if (id.startsWith('.')) {
        if (!importer) {
          throw new Error('`importer` should not be undefined');
        }
        const hasExtension = path.extname(id).length > 1;
        let resolvedId: string;
        // 2.1 包含文件名后缀
        // 如 ./App.tsx
        if (hasExtension) {
          resolvedId = normalizePath(resolve.sync(id, { basedir: path.dirname(importer) }));
          if (await pathExists(resolvedId)) {
            return { id: resolvedId };
          }
        }
        // 2.2 不包含文件名后缀
        // 如 ./App
        else {
          // ./App => ./App.tsx
          for (const extname of DEFAULT_EXTERSIONS) {
            try {
              const withExtension = `${id}${extname}`;
              resolvedId = normalizePath(
                resolve.sync(withExtension, { basedir: path.dirname(importer) })
              );
              if (await pathExists(resolvedId)) {
                return { id: resolvedId };
              }
            } catch (error) {
              continue;
            }
          }
        }
      }
      return null;
    }
  };
}
