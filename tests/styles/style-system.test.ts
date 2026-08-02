import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { compileString } from 'sass-embedded';

const root = process.cwd();
const loadPaths = [root, join(root, 'node_modules')];

const compile = (source: string): string =>
  compileString(source, {
    loadPaths,
    style: 'expanded',
  }).css;

const countOccurrences = (source: string, value: string): number => source.split(value).length - 1;

describe('v2 样式系统边界', () => {
  it('多属性过渡生成独立长属性且保留统一时序', () => {
    const css = compile(`
      @use 'src/styles/mixins' as mixins;
      @use 'src/styles/performance' as performance;
      .normal { @include mixins.transition((color, transform)); }
      .safe { @include performance.safe-transition((opacity, transform), 300ms); }
    `);

    expect(css).toContain('transition-property: color, transform;');
    expect(css).toContain('transition-property: opacity, transform;');
    expect(css).toContain('transition-duration: 300ms;');
    expect(css).not.toContain('transition: opacity transform');
  });

  it('纯 mixin 模块不输出工具类，全局入口只输出一次性能工具类', () => {
    const mixinCss = compile(`
      @use 'src/styles/component-mixins' as component;
      .probe { @include component.card-base; }
    `);
    const globalCss = compile("@use 'src/styles/index';");

    expect(mixinCss).not.toContain('.ex-performance-container');
    expect(countOccurrences(globalCss, '.ex-performance-container')).toBe(1);
    expect(countOccurrences(globalCss, '.ex-no-animation')).toBe(1);
  });

  it('组件样式不会重复输出全局变量', () => {
    const emptyCss = compile("@use 'src/components/empty/ExEmpty';");
    const anchorLinkCss = compile("@use 'src/components/anchor/ExAnchorLink';");

    expect(emptyCss).not.toContain(':root');
    expect(anchorLinkCss).not.toContain(':root');
  });

  it('父子组件各自加载自己的样式文件', () => {
    const anchorLink = readFileSync(join(root, 'src/components/anchor/ExAnchorLink.vue'), 'utf8');
    const step = readFileSync(join(root, 'src/components/steps/ExStep.vue'), 'utf8');

    expect(anchorLink).toContain('src="./ExAnchorLink.scss"');
    expect(step).toContain('src="./ExStep.scss"');
  });

  it('基础样式不强制内联品牌字体，字体入口可独立加载', () => {
    const baseCss = compile("@use 'src/styles/index';");
    const fontCss = compile("@use 'src/styles/font';");

    expect(baseCss).not.toContain('@font-face');
    expect(fontCss).toContain('@font-face');
    expect(fontCss).toContain('font-family: "Audiowide"');
    expect(fontCss).toContain('font-family: "Noto Sans SC"');
    expect(fontCss).toContain('noto-sans-sc-chinese-simplified-400-normal.woff2?no-inline');
    expect(fontCss).toContain('noto-sans-sc-chinese-simplified-500-normal.woff2?no-inline');
    expect(fontCss).toContain('noto-sans-sc-chinese-simplified-700-normal.woff2?no-inline');
    expect(fontCss).not.toContain('.woff)');
  });

  it('整包入口默认加载完整赛博字体，按需入口保留独立字体资源', () => {
    const indexSource = readFileSync(join(root, 'src/index.ts'), 'utf8');
    const fontEntrySource = readFileSync(join(root, 'src/style-font.ts'), 'utf8');
    const variablesCss = compile("@use 'src/styles/variables';");

    expect(indexSource).toContain('@fontsource/orbitron/latin-700.css');
    expect(indexSource).toContain('@fontsource/jetbrains-mono/latin-400.css');
    expect(indexSource).toContain('@fontsource/share-tech-mono/latin-400.css');
    expect(indexSource).toContain("import './styles/font.scss';");
    expect(fontEntrySource).toContain('@fontsource/orbitron/latin-700.css');
    expect(fontEntrySource).toContain('@fontsource/jetbrains-mono/latin-400.css');
    expect(fontEntrySource).toContain('@fontsource/share-tech-mono/latin-400.css');
    expect(fontEntrySource).toContain("import './styles/font.scss';");
    expect(variablesCss).toContain(
      '--ex-font-primary: Orbitron, Audiowide, Rajdhani, Noto Sans SC, sans-serif;'
    );
    expect(variablesCss).toContain(
      '--ex-font-secondary: JetBrains Mono, Fira Code, Consolas, Noto Sans SC, monospace;'
    );
  });

  it('Button 声明的每一种类型都生成实际样式选择器', () => {
    const css = compile("@use 'src/components/button/ExButton';");

    for (const type of ['default', 'error', 'ghost']) {
      expect(css).toContain(`.ex-button--${type}`);
    }
  });

  it('Divider 的颜色、粗细和响应式间距始终由同一组变量驱动', () => {
    const css = compile("@use 'src/components/divider/ExDivider';");

    expect(css).toContain('.ex-divider--dashed.ex-divider--horizontal .ex-divider__line');
    expect(css).toContain('border-top: var(--ex-divider-size, 1px) dashed');
    expect(css).toContain('var(--ex-divider-color, var(--ex-color-border-primary))');
    expect(css).toContain('margin: var(--ex-divider-margin, 16px 0)');
    expect(css).not.toContain("[style*='--ex-divider-color']");
    expect(css).not.toContain('transition-property: all');
  });

  it('Empty 的图片尺寸由组件变量驱动且不执行无休止装饰动画', () => {
    const css = compile("@use 'src/components/empty/ExEmpty';");

    expect(css).toContain('inline-size: var(--ex-empty-image-size');
    expect(css).toContain('.ex-empty--custom');
    expect(css).not.toContain('animation:');
    expect(css).not.toContain('@keyframes');
  });

  it('FileDownload 只过渡确定进度且未知总量不依赖循环动画', () => {
    const css = compile("@use 'src/components/file-download/ExFileDownload';");

    expect(css).toContain('inline-size: var(--ex-file-download-progress)');
    expect(css).toContain('transition-property: inline-size');
    expect(css).toContain('.is-indeterminate');
    expect(css).not.toContain('animation:');
    expect(css).not.toContain('@keyframes');
  });
  it('赛博朋克视觉 token 和全局纹理保持可复用且支持无障碍回退', () => {
    const css = compile("@use 'src/styles/index';");

    expect(css).toContain('--ex-color-cyber-green: #00ff88');
    expect(css).toContain('--ex-color-terminal-text: #14fdce');
    expect(css).toContain('--ex-color-terminal-bg: #031e11');
    expect(css).toContain('--ex-cyber-grid-size: 48px');
    expect(css).toContain('.ex-app::after');
    expect(css).toContain('@keyframes ex-cyber-scanline');
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
  });

  it('基础样式只在 ExUI 作用域内修改宿主页面', () => {
    const resetCss = compile("@use 'src/styles/base/reset';");
    const accessibilityCss = compile("@use 'src/styles/base/accessibility';");
    const printCss = compile("@use 'src/styles/base/print';");

    expect(resetCss).toContain('.ex-app');
    expect(resetCss).not.toMatch(/(^|\n)html\s*\{/);
    expect(resetCss).not.toMatch(/(^|\n)\*\s*,/);
    expect(accessibilityCss).toContain('.ex-sr-only');
    expect(accessibilityCss).toContain('.ex-app .sr-only');
    expect(accessibilityCss).not.toMatch(/(^|\n)\.sr-only\s*\{/);
    expect(printCss).toContain('@media print');
    expect(printCss).toContain('.ex-app');
    expect(printCss).not.toMatch(/@media print\s*\{\s*\*/);
  });

  it('可选颜色工具由双主题状态驱动且不读取系统暗色偏好', () => {
    const css = compile("@use 'src/styles/utilities/colors';");

    expect(css).toContain('[data-theme=neon-blue] .dark\\:bg-primary');
    expect(css).toContain('[data-theme=light] .high-contrast\\:text-primary');
    expect(css).not.toContain('prefers-color-scheme');
  });

  it('两个主题都覆盖组件实际依赖的语义变量', () => {
    const css = compile("@use 'src/styles/index';");

    expect(css).toContain('--ex-color-accent-alpha-10: rgba(255, 59, 209, 0.1)');
    expect(css).toContain('--ex-color-neon-blue-alpha-08: rgba(41, 171, 226, 0.08)');
    expect(css).toContain('--ex-color-primary-alpha-80: rgba(41, 171, 226, 0.8)');
    expect(css).toContain('--ex-color-primary-alpha-08: rgba(41, 171, 226, 0.08)');
    expect(css).toContain('--ex-color-secondary-alpha-50: rgba(168, 107, 255, 0.5)');
    expect(css).toContain('--ex-color-border: var(--ex-color-border-primary)');
    expect(css).toContain('--ex-color-neon-blue-300: #72c8ef');
    expect(css).toContain('--ex-color-neon-blue-300: #5a9be7');
  });

  it('Typography 响应式规则集中在组件内并保留尺寸覆盖契约', () => {
    const typographyCss = compile("@use 'src/components/typography/ExTypography';");

    expect(typographyCss).toContain('@media (max-width: 479px)');
    expect(typographyCss).toContain('@media (max-width: 374px)');
    expect(typographyCss).toContain('@media (min-width: 480px) and (max-width: 1023px)');
    expect(typographyCss).toContain('@media (min-width: 1024px)');
    expect(typographyCss).toContain('@media (min-width: 1400px)');
    expect(typographyCss).toContain('--ex-typography-size: var(--ex-text-4xl)');
    expect(typographyCss).toContain(
      'font-size: var(--ex-typography-size, var(--ex-typography-variant-size))'
    );
    expect(typographyCss).toContain('background: none');
    expect(typographyCss).toContain('text-rendering: optimizeLegibility');
    expect(typographyCss).toContain('letter-spacing: var(--ex-tracking-wide)');
    expect(typographyCss).toContain('letter-spacing: var(--ex-tracking-widest)');
    expect(typographyCss).toContain('font-variant-ligatures: contextual');
    expect(typographyCss).toContain('--ex-typography-chromatic-opacity: 0.18');
    expect(typographyCss).toContain('.ex-typography--glitch::before');
    expect(typographyCss).toContain('.ex-typography--glitch::after');
    expect(typographyCss).toContain('content: attr(data-ex-typography-text)');
    expect(typographyCss).toContain('clip-path: inset(');
    expect(typographyCss).toContain('@keyframes ex-typography-glitch-before');
    expect(typographyCss).toContain('@keyframes ex-typography-glitch-after');
    expect(typographyCss).toContain('animation: ex-cyber-glitch 4s steps(1, end) infinite');
    expect(typographyCss).toContain('font-family: var(--ex-font-label)');
    expect(typographyCss).toContain('text-wrap: balance');
    expect(typographyCss).toContain(
      '@supports not ((background-clip: text) or (-webkit-background-clip: text))'
    );
    expect(typographyCss).toContain('background-size: 100% 100%');
    expect(typographyCss).toContain('display: inline-block');
    expect(typographyCss).toContain('inline-size: fit-content');
    expect(typographyCss).toContain('max-inline-size: 100%');
    expect(typographyCss).toContain('.ex-typography--gradient.ex-typography--center');
    expect(typographyCss).toContain('.ex-typography--gradient.ex-typography--truncate-multiline');
    expect(typographyCss).toContain('background-clip: text');
    expect(typographyCss).toContain('-webkit-background-clip: text');
    expect(typographyCss).toContain('background-size: 220% 100%');
    expect(typographyCss).toContain('.ex-typography--cyberpunk');
    expect(typographyCss).toContain('--ex-typography-chromatic-left');
    expect(typographyCss).toContain('--ex-color-cyber-magenta');
    expect(typographyCss).toContain('.ex-typography--terminal');
    expect(typographyCss).toContain('.ex-typography__terminal-output');
    expect(typographyCss).toContain('.ex-typography__terminal-scanlines');
    expect(typographyCss).toContain('.ex-typography__terminal-overlay');
    expect(typographyCss).toContain('.ex-typography__terminal-frame');
    expect(typographyCss).toContain('var(--ex-color-cyber-green, #14fdce)');
    expect(typographyCss).toContain('var(--ex-color-cyber-green-rgb, 20, 253, 206)');
    expect(typographyCss).toContain('var(--ex-color-bg-primary, #031e11)');
    expect(typographyCss).toContain('--ex-typography-terminal-font-family');
    expect(typographyCss).toContain('--ex-typography-terminal-glow-rgb');
    expect(typographyCss).toContain('min-block-size: 12rem');
    expect(typographyCss).toContain('padding: clamp(2rem, 5vw, 3rem) clamp(1rem, 4vw, 2rem)');
    expect(typographyCss).toContain('border: 1rem solid');
    expect(typographyCss).toContain('background-size: 100% 0.3rem');
    expect(typographyCss).toContain('@keyframes ex-typography-terminal-flicker');
    expect(typographyCss).toContain('@keyframes ex-typography-terminal-glow');
    expect(typographyCss).toContain('.ex-typography--gradient-animated');
    expect(typographyCss).toContain(
      'animation: ex-typography-gradient-shift 3s ease-in-out infinite'
    );
    expect(typographyCss).toContain('white-space: normal');
    expect(typographyCss).not.toContain('.ex-typography--h1');
    expect(typographyCss).not.toContain('.ex-typography--body1');
    expect(typographyCss).not.toContain('.ex-typography--link');
  });

  it('首屏初始化脚本与组件样式只识别两个主题', () => {
    const themeInit = readFileSync(join(root, 'public/theme-init.js'), 'utf8');
    const virtualListStyles = readFileSync(
      join(root, 'src/components/virtual-list/ExVirtualList.scss'),
      'utf8'
    );

    expect(themeInit).toContain("var VALID_THEMES = ['neon-blue', 'light'];");
    expect(themeInit).toContain("theme === 'neon-blue' ? 'dark' : 'light'");
    expect(themeInit).not.toContain('neon-pink');
    expect(themeInit).not.toContain('high-contrast');
    expect(virtualListStyles).not.toContain('prefers-color-scheme');
  });

  it('核心组件使用切角、终端提示符和低频 CTA 色差效果', () => {
    const buttonCss = compile("@use 'src/components/button/ExButton';");
    const cardCss = compile("@use 'src/components/card/ExCard';");
    const inputCss = compile("@use 'src/components/input/ExInput';");

    expect(buttonCss).toContain('border: 2px solid var(--ex-button-border)');
    expect(buttonCss).toContain('content: attr(data-ex-button-glitch-text)');
    expect(buttonCss).toContain('clip-path: var(--ex-button-glitch-slice-1)');
    expect(buttonCss).toContain('animation: ex-button-glitch-slices 1s steps(2, end) forwards');
    expect(buttonCss).toContain('.ex-button--shape-slice');
    expect(buttonCss).toContain('.ex-button--shape-notched');
    expect(cardCss).toContain('clip-path: polygon(');
    expect(cardCss).toContain('.ex-card.ex-terminal');
    expect(inputCss).toContain('content: ">"');
    expect(inputCss).toContain('clip-path: polygon(');
  });

  it('共享切角控件使用形状发光而不是会被 clip-path 裁掉的阴影', () => {
    const css = compile(`
      @use 'src/styles/component-mixins' as component;
      .control {
        @include component.form-control-base;
      }
    `);

    expect(css).toContain('filter: drop-shadow(0 0 8px var(--ex-color-neon-pink-alpha-30))');
    expect(css).not.toContain('box-shadow: 0 0 10px var(--ex-color-neon-pink-alpha-30)');
  });
});
