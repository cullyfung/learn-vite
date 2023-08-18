import { defineConfig, normalizePath } from 'vite';
import react from '@vitejs/plugin-react';
import resolve from 'resolve';

const chunkGroups = {
  'react-vender': [
    normalizePath(require.resolve('react')),
    normalizePath(require.resolve('react-dom'))
  ]
};

const cache = new Map();

function isDepInclude(
  id: string,
  depPaths: string[],
  importChain: string[],
  getModuleInfo
): boolean | undefined {
  id = normalizePath(id);
  const key = `${id}-${depPaths.join('|')}`;

  // 出现依赖循环，不考虑
  if (importChain.includes(id)) {
    cache.set(key, false);
    return false;
  }
  if (cache.has(key)) {
    return cache.get(key);
  }
  // 命中依赖列表
  if (depPaths.includes(id)) {
    importChain.forEach((item) =>
      cache.set(`${item}-${depPaths.join('|')}`, true)
    );
    return true;
  }
  const moduleInfo = getModuleInfo(id);
  if (!moduleInfo || !moduleInfo.importers) {
    cache.set(key, false);
    return false;
  }
  // 递归查找上层引用者
  const isInclude = moduleInfo.importers.some((importer) =>
    isDepInclude(importer, depPaths, importChain.concat(id), getModuleInfo)
  );
  // 设置缓存
  cache.set(key, isInclude);
  return isInclude;
}
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    minify: false,
    manifest: false,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        // 1.对象配置
        // manualChunks: {
        //   // 将react相关库打包成单独的chunk中
        //   'react-vender': ['react', 'react-dom'],
        //   // 将lodash库的代码单独打包
        //   lodash: ['lodash-es'],
        //   library: ['antd', '@arco-design/web-react']
        // },
        // 2.函数配置
        // manualChunks(id) {
        //   if (id.includes('antd') || id.includes('arco')) {
        //     return 'library';
        //   }
        //   if (id.includes('lodash-es')) {
        //     return 'lodash';
        //   }
        //   if (id.includes('node_modules/react')) {
        //     return 'vender';
        //   }
        // }
        // 3.函数配置，解决循环依赖问题
        manualChunks(id, { getModuleInfo }) {
          for (const group of Object.keys(chunkGroups)) {
            const deps = chunkGroups[group];
            if (
              id.includes('node_modules') &&
              isDepInclude(id, deps, [], getModuleInfo)
            ) {
              return group;
            }
          }
        }
      }
    }
  }
});
