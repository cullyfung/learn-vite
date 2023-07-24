import type { ResolvedConfig, Plugin } from 'vite';

// virtual module name
const virtualFibModuleId = 'virtual:fib';
// It is convention in Vite that for virtual modules, the parsed path needs to be prefixed with `0`.
const resolvedFibVirtualModuleId = '\0' + virtualFibModuleId;

const virtualEnvModuleId = 'virtual:env';
const resolvedEnvVirtualModuleId = '\0' + virtualEnvModuleId;

export default function virtualFibModulePlugin(): Plugin {
  let config: ResolvedConfig | null = null;

  return {
    name: 'vite-plugin-virtual-module',
    configResolved(c: ResolvedConfig) {
      config = c;
    },

    resolveId(id) {
      if (id === virtualFibModuleId) {
        return resolvedFibVirtualModuleId;
      }

      if (id === virtualEnvModuleId) {
        return resolvedEnvVirtualModuleId;
      }
    },
    load(id) {
      if (id === resolvedFibVirtualModuleId) {
        return 'export default function fib(n) { return n <= 1 ? n : fib(n - 1) + fib(n -2); }';
      }

      if (id === resolvedEnvVirtualModuleId) {
        return `export default ${JSON.stringify(config!.env)}`;
      }
    }
  };
}
