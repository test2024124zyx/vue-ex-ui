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
    expect(buttonCss).toContain('animation: ex-cyber-glitch 2.4s steps(1, end) infinite');
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
