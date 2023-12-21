console.log('[vite] connecting...');

interface Update {
  type: 'js-update' | 'css-update';
  path: string;
  acceptedPath: string;
  timestamp: number;
}

// 1. 创建客户端websocket实例
// 其中 __HMR_PORT__ 之后会被no-bundle 服务编译成具体的端口号
const socket = new WebSocket(`ws://localhost:__HMR_PORT__`, 'vite-hmr');

// 2. 接收服务器端的更新消息
socket.addEventListener('message', async ({ data }) => {
  handleMessage(JSON.parse(data)).catch(console.error);
});

// 3. 根据不同的更新类型进行更新
async function handleMessage(payload: any) {
  switch (payload.type) {
    case 'connected':
      console.log('[vite] connected.');
      // 心跳检测
      setInterval(() => socket.send('ping'), 1000);
      break;
    case 'update':
      // 进行具体的模块更新
      payload.updates.forEach((update: Update) => {
        if (update.type === 'js-update') {
          //
        }
      });
      break;
  }
}

interface HotModule {
  id: string;
  callbacks: HotCallback[];
}

interface HotCallback {
  deps: string[];
  fn: (modules: object[]) => void;
}

// HMR模块表
const hotModuleMap = new Map<string, HotModule>();
// 不在生效的模块表
const pruneMap = new Map<string, (data: any) => void | Promise<void>>();

export const createHotContext = (ownerPath: string) => {
  const mod = hotModuleMap.get(ownerPath);
  if (mod) {
    mod.callbacks = [];
  }

  function acceptDeps(deps: string[], callback: any) {
    const mod: HotModule = hotModuleMap.get(ownerPath) || {
      id: ownerPath,
      callbacks: []
    };
    // callbacks 属性存放 accept的依赖、依赖改动后对应的回调逻辑
    mod.callbacks.push({
      deps,
      fn: callback
    });
    hotModuleMap.set(ownerPath, mod);
  }

  return {
    accept(deps: any, callback?: any) {
      // 这里仅考虑接受自身模块更新的情况
      // import.meta.hot.accept()
      if (typeof deps === 'function' || !deps) {
        acceptDeps([ownerPath], ([mod]) => deps && deps(mod));
      }
    },
    // 模块不再生效的回调
    // import.meta.hot.prune(() => {})
    prune(cb: (data: any) => void) {
      pruneMap.set(ownerPath, cb);
    }
  };
};

async function fetchUpdate({ path, timestamp }: Update) {
  const mod = hotModuleMap.get(path);
  if (!mod) return;

  const moduleMap = new Map();
  const modulesToUpdate = new Set<string>();
  modulesToUpdate.add(path);

  await Promise.all(
    Array.from(modulesToUpdate).map(async (dep) => {
      const [path, query] = dep.split(`?`);
      try {
        // 通过动态import拉取最新模块
        const newMod = await import(path + `?t=${timestamp}${query ? `&${query}` : ''}`);
        moduleMap.set(dep, newMod);
      } catch (error) {
        console.log(error);
      }
    })
  );

  return () => {
    // 拉取最新模块后执行更新回调
    for (const { deps, fn } of mod.callbacks) {
      fn(deps.map((dep: any) => moduleMap.get(dep)));
    }
    console.log(`[vite] hot updated: ${path}`);
  };
}

const sheetsMap = new Map();

export function updateStyle(id: string, content: string) {
  let style = sheetsMap.get(id);
  if (!style) {
    // 添加style标签
    style = document.createElement('style');
    style.setAttribute('type', 'text/css');
    style.innerHtml = content;
    document.head.appendChild(style);
  } else {
    // 更新style标签内容
    style.innerHTML = content;
  }
  sheetsMap.set(id, style);
}

export function removeStyle(id: string): void {
  const style = sheetsMap.get(id);
  if (style) {
    document.head.removeChild(style);
  }
  sheetsMap.delete(id);
}
