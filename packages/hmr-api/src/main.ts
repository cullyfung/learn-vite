import { render } from './render';
import { initState } from './state';

render();
initState();

// if (import.meta.hot) {
//   import.meta.hot.accept('./render.ts', (newModule) => {
//     newModule.render();
//   });
// }

if (import.meta.hot) {
  import.meta.hot.accept(['./render.ts', './state.ts'], (modules) => {
    // custom update
    const [renderModule, stateModule] = modules;
    if (renderModule) {
      renderModule.render();
    }
    if (stateModule) {
      stateModule.initState();
    }
  });
}
