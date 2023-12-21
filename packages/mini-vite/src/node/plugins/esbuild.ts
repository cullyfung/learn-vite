import { readFile } from 'fs-extra';
import path from 'path';
import esbuild from 'esbuild';
import { Plugin } from '../plugin';
import { isJSRequest } from '../utils';

export function esbuildTransformPlugin(): Plugin {
  return {
    name: 'm-vite:esbuild-transform',
    // 加载模块
    async load(id) {
      if (isJSRequest(id)) {
        try {
          const code = await readFile(id, 'utf-8');
          return code;
        } catch (error) {
          return null;
        }
      }
    },
    async transform(code, id) {
      if (isJSRequest(id)) {
        const extname = path.extname(id).slice(1);
        const { code: transformedCode, map } = await esbuild.transform(code, {
          target: 'esnext',
          format: 'esm',
          sourcemap: true,
          loader: extname as 'js' | 'jsx' | 'ts' | 'tsx'
        });

        return {
          code: transformedCode,
          map
        };
      }
      return null;
    }
  };
}
