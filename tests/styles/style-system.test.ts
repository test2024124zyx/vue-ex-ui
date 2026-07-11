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
});
