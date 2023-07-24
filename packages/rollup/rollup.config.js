// rollup.config.js

import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
// 以下注释是为了能使用 VSCode 的类型提示
/**
 * @type { import('rollup').RollupOptions }
 */
export default {
  input: 'src/index.js',
  // input: ['src/index.js', 'src/util.js'],
  // input: {
  //   index: 'src/index.js',
  //   util: 'src/util.js'
  // },
  // output: {
  //   // 产物输出目录
  //   dir: 'dist/es',
  //   // 产物格式
  //   format: 'esm'
  // }
  output: [
    {
      dir: 'dist/es',
      format: 'esm'
      // plugins: [terser()]
    },
    {
      dir: 'dist/cjs',
      format: 'cjs'
    }
  ],
  plugins: [resolve(), commonjs(), terser()]
};

// /**
//  * @type { import('rollup').RollupOptions }
//  */
// const buildIndexOptions = {
//   input: 'src/index.js',
//   output: {
//     dir: 'build/index',
//     format: 'esm'
//   }
// };

// /**
//  * @type { import('rollup').RollupOptions }
//  */
// const buildUtilOptions = {
//   input: 'src/util.js',
//   output: {
//     dir: 'build/util',
//     format: 'cjs'
//   }
// };

// export default [buildIndexOptions, buildUtilOptions];
