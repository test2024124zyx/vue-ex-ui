import assert from 'node:assert/strict';
import { createRequire, register } from 'node:module';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { JSDOM } from 'jsdom';

// 本检查消费实际 tarball 的两类产物；JSDOM 只验证运行时契约，不承担样式和帧率验收。
const consumerDirectory = process.argv[2];
if (!consumerDirectory) throw new Error('缺少包消费目录');
const requireConsumer = createRequire(join(consumerDirectory, 'runtime.cjs'));
const packageRoot = dirname(requireConsumer.resolve('vue-ex-ui/package.json'));
const load = path => import(pathToFileURL(join(packageRoot, path)).href);

// 按需模块的 CSS 由前面的 Vite 消费构建验证，此处仅跳过 Node 不认识的样式扩展名。
register(
  `data:text/javascript,${encodeURIComponent(
    "export async function load(url, context, nextLoad) { if (url.endsWith('.css')) return { format: 'module', source: '', shortCircuit: true }; return nextLoad(url, context); }"
  )}`,
  import.meta.url
);
const dom = new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>', {
  url: 'https://component-test.invalid',
  pretendToBeVisual: true,
});
for (const key of [
  'window',
  'document',
  'Node',
  'Element',
  'HTMLElement',
  'SVGElement',
  'Event',
  'CustomEvent',
  'KeyboardEvent',
  'MouseEvent',
]) {
  globalThis[key] = dom.window[key];
}
globalThis.getComputedStyle = dom.window.getComputedStyle.bind(dom.window);
globalThis.requestAnimationFrame = dom.window.requestAnimationFrame.bind(dom.window);
globalThis.cancelAnimationFrame = dom.window.cancelAnimationFrame.bind(dom.window);

const { createApp, h, ref, nextTick } = await import(
  pathToFileURL(requireConsumer.resolve('vue')).href
);
const full = await load('dist/ex-ui.js');
const partialTheme = await load('dist/es/composables/useTheme.js');
const partialLocale = await load('dist/es/locale/index.js');
const { ExSelect } = await load('dist/es/components/select/index.js');
full.setTheme('light');
assert.equal(partialTheme.getTheme(), 'light', '混合入口必须共享全局主题');
const commonjs = requireConsumer('vue-ex-ui');
commonjs.setTheme('neon-blue');
assert.equal(full.getTheme(), 'neon-blue', 'CommonJS 与 ESM 必须共享浏览器主题');
assert.equal(partialTheme.getTheme(), 'neon-blue');
full.setTheme('light');
full.setLocale('zh-CN');
assert.equal(partialLocale.getCurrentLocale(), 'zh-CN', '混合入口必须共享全局语言');

const disabled = ref(false);
const open = ref(true);
const brand = ref('#123456');
const MODAL_Z_INDEX = 3000;
const TRANSITION_SETTLE_MS = 80;
const app = createApp({
  setup: () => () =>
    h(
      full.ExConfigProvider,
      {
        theme: 'light',
        animation: false,
        themeOverrides: { '--ex-color-primary': brand.value },
      },
      {
        default: () =>
          h(
            full.ExModal,
            {
              modelValue: open.value,
              zIndex: MODAL_Z_INDEX,
              'onUpdate:modelValue': value => {
                open.value = value;
              },
            },
            {
              default: () =>
                h(
                  full.ExForm,
                  { disabled: disabled.value },
                  {
                    default: () =>
                      h(
                        full.ExFormItem,
                        { label: '混合入口字段', error: '字段错误' },
                        {
                          default: () =>
                            h(ExSelect, { options: [{ label: '选项', value: 'option' }] }),
                        }
                      ),
                  }
                ),
            }
          ),
      }
    ),
});
const flush = async () => {
  await nextTick();
  await new Promise(resolve => setTimeout(resolve, TRANSITION_SETTLE_MS));
};

try {
  app.mount(document.getElementById('app'));
  await flush();
  const trigger = document.querySelector('[role="combobox"]');
  assert.ok(trigger, '实际产物应渲染选择器');
  const label = document.querySelector('.ex-form-item__label');
  assert.equal(trigger.getAttribute('aria-labelledby'), label.id, '跨入口应继承字段标签');
  assert.equal(trigger.getAttribute('aria-invalid'), 'true', '跨入口应继承字段错误');
  trigger.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  await flush();
  const panel = document.querySelector('.ex-select__dropdown');
  assert.ok(panel, '选择器应打开');
  assert.ok(Number(panel.style.zIndex) > MODAL_Z_INDEX, '跨入口子浮层必须位于父弹窗上方');
  assert.equal(panel.getAttribute('data-theme'), 'light');
  assert.equal(panel.style.getPropertyValue('--ex-color-primary'), brand.value);
  brand.value = '#654321';
  await flush();
  assert.equal(panel.style.getPropertyValue('--ex-color-primary'), brand.value);
  trigger.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
  );
  await flush();
  assert.equal(document.querySelector('.ex-select__dropdown'), null);
  assert.equal(open.value, true, '同一次 Escape 不能关闭父弹窗');
  disabled.value = true;
  await flush();
  assert.equal(trigger.getAttribute('aria-disabled'), 'true');
  trigger.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  await flush();
  assert.equal(document.querySelector('.ex-select__dropdown'), null);
} finally {
  app.unmount();
  assert.notEqual(document.body.style.overflow, 'hidden', '最后一个浮层卸载应释放滚动锁');
  dom.window.close();
}

process.stdout.write('真实发布包的混合入口、主题、表单与浮层契约验证通过\n');
