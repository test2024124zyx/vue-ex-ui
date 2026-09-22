import { createApp, h, nextTick, onMounted, ref } from 'vue';
import { ExConfigProvider } from '../../dist/es/components/config-provider/index.js';
import '../../dist/es/assets/style-base.css';
import { denseControls, virtualTable, groupedSelect } from './scenarios/data-scenes.mjs';
import { virtualTree, formWorkflow } from './scenarios/workflow-scenes.mjs';
import { themeInheritance } from './scenarios/theme-scene.mjs';
import './style.css';
import './extended.css';

const factories = {
  controls: denseControls,
  controlsVirtual: () => denseControls(true),
  table: virtualTable,
  tableImmutable: () => virtualTable(true),
  select: groupedSelect,
  tree: virtualTree,
  workflow: formWorkflow,
  themes: themeInheritance,
};
const scene = new URLSearchParams(location.search).get('scene') || 'controls';
const frame = () => new Promise(resolve => requestAnimationFrame(resolve));

createApp({
  setup() {
    const current = factories[scene]();
    const active = ref(true);
    const measurements = [];
    window.__extended = {
      state: current.state,
      measurements,
      async run(action) {
        const started = performance.now();
        const result = await current.actions[action]();
        await nextTick();
        const commitMs = performance.now() - started;
        await frame();
        await frame();
        measurements.push({ action, commitMs, paintMs: performance.now() - started });
        return result;
      },
      async unmount() {
        active.value = false;
        await nextTick();
        await frame();
        await frame();
      },
    };
    onMounted(async () => {
      await nextTick();
      await frame();
      await frame();
      window.__extendedReady = performance.now();
    });
    return () =>
      h(
        ExConfigProvider,
        { theme: 'light', locale: 'zh-CN' },
        {
          default: () =>
            h('main', [h('h1', `扩展场景：${scene}`), active.value ? current.render() : null]),
        }
      );
  },
}).mount('#app');
