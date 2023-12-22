import { BundleOptions } from 'magic-string';

export class Bundle {
  graph: Graph;
  constructor(options: BundleOptions) {
    // 初始化模块依赖图对象
    this.graph = new Graph({
      entry: options.entry,
      bundle: this
    });
  }
  async build() {
    // 模块打包逻辑，完成所有AST相关操作
    return this.graph.build();
  }

  render() {
    // 代码生成逻辑，拼接模块AST节点，产出代码
  }

  getModuleById(id: string) {
    return this.graph.getModuleById(id);
  }

  addModule(module: Module) {
    this.graph.addModule(module);
  }
}
