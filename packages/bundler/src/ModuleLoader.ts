import { readFile } from 'fs/promises';
import { Bundle } from './Bundle';

export class ModuleLoader {
  bundle: Bundle;
  resolveIdsMap: Map<string, string | false> = new Map();
  constructor(bundle: Bundle) {
    this.bundle = bundle;
  }

  // 解析模块逻辑
  resolveId(id: string, importer: string | null) {
    const cacheKeys = id + importer;
    if (this.resolveIdsMap.has(cacheKeys)) {
      return this.resolveIdsMap.get(cacheKeys);
    }
    const resolved = defaultResolver(id, importer);
    this.resolveIdsMap.set(cacheKeys, resolved);
    return resolved;
  }

  // 加载模块内容并解析
  async fetchModule(
    id: string,
    importer: null | string,
    isEntry = false,
    bundle: Bundle = this.bundle,
    loader: ModuleLoader = this
  ) {
    const path = this.resolveId(id, importer);
    // 查找缓存
    const existModule = this.bundle.getModuleById(path);
    if (existModule) {
      return existModule;
    }

    const code = await readFile(path, { encoding: 'utf-8' });
    // 初始化模块，解析AST
    const module = new Module({
      path,
      code,
      bundle,
      loader,
      isEntry
    });
    this.bundle.addModule(module);
    // 拉取所有依赖模块
    await this.fetchAllDependencies(module);
    return module;
  }

  async fetchAllDependencies(module: Module) {
    await Promise.all(
      module.dependencies.map((dep) => {
        return this.fetchModule(dep, module.path);
      })
    );
  }
}
