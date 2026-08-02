import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const readDocument = (name: string): string =>
  readFileSync(resolve(process.cwd(), `docs/components/${name}.md`), 'utf8');

// 只统计代码围栏之外的标签，避免把“仅有源码”误判为可操作演示。
const readLiveMarkup = (name: string): string => readDocument(name).replace(/```[\s\S]*?```/g, '');

const countLiveComponent = (name: string, component: string): number =>
  readLiveMarkup(name).match(new RegExp(`<${component}\\b`, 'gi'))?.length ?? 0;

const readBlocks = (document: string, marker: RegExp): string[] =>
  [...document.matchAll(marker)].map(match => match[1] ?? '');

// 折叠代码中的换行和对象尾逗号只用于排版，比较时统一后验证示例内容本身。
const normalizeTypographyExample = (example: string): string =>
  example.replace(/\s+/g, ' ').replace(/,\s*}/g, ' }').trim();

const extractTypographyExamples = (block: string): string[] =>
  (block.match(/<ex-typography\b[\s\S]*?(?:<\/ex-typography>|\/>)/gi) ?? []).map(
    normalizeTypographyExample
  );

describe('组件文档实时演示', () => {
  it.each([
    ['typography', 'ex-typography', 32],
    ['icon', 'ex-icon', 4],
    ['button', 'ex-button', 8],
    ['image', 'ex-image', 3],
    ['link', 'ex-link', 4],
    ['avatar', 'ex-avatar', 4],
    ['space', 'ex-space', 4],
    ['card', 'ex-card', 4],
    ['ellipsis', 'ex-ellipsis', 3],
    ['input', 'ex-input', 4],
    ['select', 'ex-select', 4],
    ['cascader', 'ex-cascader', 2],
    ['form', 'ex-form', 2],
    ['form-examples', 'ex-form', 2],
    ['list', 'ex-list', 3],
    ['virtual-list', 'ex-virtual-list', 1],
    ['heatmap', 'ex-heatmap', 3],
    ['menu', 'ex-menu', 3],
    ['dropdown', 'ex-dropdown', 4],
  ])('%s 在代码围栏之外挂载足量的 %s', (name, component, minimum) => {
    expect(countLiveComponent(name, component)).toBeGreaterThanOrEqual(minimum as number);
  });

  it('Typography 每个实时示例都有默认折叠且内容一致的代码', () => {
    const document = readDocument('typography');
    const liveBlocks = readBlocks(document, /::: raw\s*\n([\s\S]*?)\n:::/g);
    const codeBlocks = readBlocks(
      document,
      /::: details 查看示例代码\s*\n```vue\s*\n([\s\S]*?)\n```\s*\n:::/g
    );

    expect(liveBlocks).toHaveLength(7);
    expect(codeBlocks).toHaveLength(liveBlocks.length);

    liveBlocks.forEach((liveBlock, index) => {
      expect(extractTypographyExamples(liveBlock)).toEqual(
        extractTypographyExamples(codeBlocks[index] ?? '')
      );
    });
  });

  it('Typography 将渐变作为正文也可用的独立文本效果演示', () => {
    const markup = readLiveMarkup('typography');
    expect(markup).toMatch(
      /<ex-typography\b(?=[^>]*\bgradient\b)(?=[^>]*variant="(?:body|caption)")/i
    );
  });

  it('Typography 文档默认展示赛博朋克基线并提供可控增强模式', () => {
    const markup = readLiveMarkup('typography');
    expect(markup).toMatch(
      /<ex-typography\b(?=[^>]*variant="display")(?=[^>]*\bgradient\b)(?![^>]*\bcyberpunk\b)/i
    );
    expect(markup).toMatch(/<ex-typography\b(?=[^>]*variant="heading")(?![^>]*\bcyberpunk\b)/i);
    expect(markup).toMatch(/<ex-typography\b(?=[^>]*variant="body")(?=[^>]*\bcyberpunk\b)/i);
  });

  it('Button 演示可关闭的光效和只展示一个字形的圆形按钮', () => {
    const markup = readLiveMarkup('button');
    expect(markup).toMatch(/<ex-button\b[^>]*:glow="false"/i);
    expect(markup).toMatch(/<ex-button\b[^>]*shape="circle"[^>]*>\s*发\s*<\/ex-button>/i);
  });

  it('Ellipsis 同时提供底部按钮和行尾动态图标两种展开方式', () => {
    const markup = readLiveMarkup('ellipsis');
    expect(markup).toMatch(/expand-control="button"/i);
    expect(markup).toMatch(/expand-control="inline"/i);
  });

  it('Cascader 同时演示默认行内宽度与显式块级宽度', () => {
    const markup = readLiveMarkup('cascader');
    expect(markup).toMatch(/<ex-cascader\b(?![^>]*style=)/i);
    expect(markup).toMatch(/<ex-cascader\b[^>]*style="[^"]*width:\s*100%/i);
  });

  it.each(['form', 'form-examples'])('%s 不使用原生表单控件冒充组件库控件', name => {
    expect(readDocument(name)).not.toMatch(/<(?:input|textarea|select|button)\b/i);
  });

  it('Menu 文档包含可折叠菜单的实际挂载演示', () => {
    expect(readLiveMarkup('menu')).toMatch(/<ex-menu\b[^>]*:collapsed=/i);
  });

  it('Dropdown 的十二个方位均由实际组件展示', () => {
    const document = readDocument('dropdown');
    const markup = readLiveMarkup('dropdown');
    const expectedPlacements = [
      'top',
      'top-start',
      'top-end',
      'bottom',
      'bottom-start',
      'bottom-end',
      'left',
      'left-start',
      'left-end',
      'right',
      'right-start',
      'right-end',
    ];

    expect(markup).toMatch(
      /<ex-dropdown\b(?=[^>]*v-for="placement in placements")(?=[^>]*:placement="placement")/i
    );
    expectedPlacements.forEach(placement => expect(document).toContain(`'${placement}'`));
  });
});
