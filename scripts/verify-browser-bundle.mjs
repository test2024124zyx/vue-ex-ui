import { resolve } from 'node:path';
import { build } from 'vite';

// 以已发布产物的单组件消费体积为基线，预算包含基础主题但不包含外置 Vue。
const SINGLE_BUTTON_BUDGET = { javascript: 60_000, css: 90_000 };

export async function verifyBrowserBundle(consumerDirectory) {
  const entry = resolve(consumerDirectory, 'single-button.mjs');
  const result = await build({
    root: consumerDirectory,
    configFile: false,
    logLevel: 'error',
    plugins: [
      {
        name: 'published-button-consumer',
        load(id) {
          if (id !== entry.replaceAll('\\', '/')) return null;
          return [
            "import { h } from 'vue';",
            "import { ExButton } from 'vue-ex-ui';",
            "import 'vue-ex-ui/base.css';",
            "export const render = () => h(ExButton, {}, () => '发布包测试');",
          ].join('\n');
        },
        resolveId(id) {
          if (id === entry || id === entry.replaceAll('\\', '/')) {
            return entry.replaceAll('\\', '/');
          }
          return null;
        },
      },
    ],
    build: {
      write: false,
      minify: true,
      target: 'es2020',
      lib: { entry, formats: ['es'], cssFileName: 'single-button' },
      rollupOptions: {
        external: ['vue', 'vue-i18n', 'echarts', 'qrcode', 'jsbarcode', 'lunar-javascript'],
      },
    },
  });
  const outputs = (Array.isArray(result) ? result : [result]).flatMap(item => item.output);
  const code = outputs
    .filter(item => item.type === 'chunk')
    .map(item => item.code)
    .join('\n');
  const css = outputs
    .filter(item => item.type === 'asset' && item.fileName.endsWith('.css'))
    .map(item => String(item.source))
    .join('\n');
  const javascriptBytes = Buffer.byteLength(code);
  const cssBytes = Buffer.byteLength(css);
  if (!code.includes('ExButton') || !css.includes('.ex-button')) {
    throw new Error('发行包根入口没有保留 Button 或其组件样式');
  }
  if (['ExTable', 'ExChart', 'ExSelect'].some(marker => code.includes(marker))) {
    throw new Error('发行包根入口的单 Button 消费保留了无关组件');
  }
  if (css.includes('@font-face') || css.includes('.ex-table') || css.includes('.ex-select')) {
    throw new Error('发行包按需入口带入了无关组件样式或可选字体');
  }
  if (javascriptBytes > SINGLE_BUTTON_BUDGET.javascript || cssBytes > SINGLE_BUTTON_BUDGET.css) {
    throw new Error(`发行包单组件体积超出预算：${javascriptBytes} JS bytes，${cssBytes} CSS bytes`);
  }
  process.stdout.write(`published Button: ${javascriptBytes} JS bytes, ${cssBytes} CSS bytes\n`);
}
