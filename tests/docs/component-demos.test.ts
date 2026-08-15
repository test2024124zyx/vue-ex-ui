import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const readDocument = (name: string): string =>
  readFileSync(resolve(process.cwd(), `docs/components/${name}.md`), 'utf8');

// 只统计代码围栏之外的标签，避免把“仅有源码”误判为可操作演示。
const readLiveMarkup = (name: string): string => readDocument(name).replace(/```[\s\S]*?```/g, '');

const countLiveComponent = (name: string, component: string): number =>
  readLiveMarkup(name).match(new RegExp(`<${component}\\b`, 'gi'))?.length ?? 0;

const componentDocumentNames = readdirSync(resolve(process.cwd(), 'docs/components'))
  .filter(file => file.endsWith('.md'))
  .map(file => file.slice(0, -3))
  .filter(name => /<(?:ex-|Ex)[a-z0-9-]+\b/i.test(readLiveMarkup(name)))
  .sort();

const interactiveComponentDocumentNames = [
  'affix',
  'anchor',
  'back-top',
  'breadcrumb',
  'cascader',
  'collapse',
  'color-picker',
  'datetime-picker',
  'dialog',
  'drawer',
  'dropdown',
  'menu',
  'modal',
  'number-input',
  'pagination',
  'popconfirm',
  'popover',
  'radio',
  'rate',
  'slider',
  'switch',
  'tabs',
  'time-picker',
  'tooltip',
  'tree',
  'tree-select',
] as const;

const displayDataComponentDocumentNames = [
  'barcode',
  'calendar',
  'card',
  'carousel',
  'chart',
  'code',
  'descriptions',
  'divider',
  'empty',
  'file-download',
  'file-list',
  'file-preview',
  'file-upload',
  'flex',
  'grid',
  'heatmap',
  'image',
  'image-compress',
  'image-crop',
  'list',
  'progress',
  'qrcode',
  'skeleton',
  'steps',
  'table',
  'timeline',
  'verification-code',
] as const;

const readBlocks = (document: string, marker: RegExp): string[] =>
  [...document.matchAll(marker)].map(match => match[1] ?? '');

// 折叠代码中的换行、尾逗号和单参数括号只用于排版，比较时统一后验证示例内容本身。
const normalizeTypographyExample = (example: string): string =>
  example
    .replace(/\s+/g, ' ')
    .replace(/\(\s*([A-Za-z_$][\w$]*)\s*\)\s*=>/g, '$1 =>')
    .replace(/\[\s+/g, '[')
    .replace(/,\s*]/g, ']')
    .replace(/\s+>/g, '>')
    .replace(/>\s+/g, '>')
    .replace(/\s+</g, '<')
    .replace(/,\s*}/g, ' }')
    .trim();

// 文档演示容器只承担样式隔离和排版，不属于组件业务示例。
const unwrapDocumentationContainer = (block: string): string => {
  const wrapper = block.match(
    /^\s*<div\b(?=[^>]*\bclass\s*=\s*"[^"]*(?:vp-raw|demo-container|demo-block)[^"]*")[^>]*>\s*([\s\S]*)\s*<\/div>\s*$/
  );
  return wrapper?.[1] ?? block;
};

// 可复制示例允许携带脚本和样式，但模板标记必须与实时演示完全一致。
const extractCopyableExampleMarkup = (block: string): string => {
  const templateStart = block.search(/<template>\s*/i);
  const templateEnd = block.toLowerCase().lastIndexOf('</template>');
  const template =
    templateStart >= 0 && templateEnd > templateStart
      ? block.slice(block.indexOf('>', templateStart) + 1, templateEnd)
      : null;
  const markup =
    template ??
    block.replace(/<script\b[\s\S]*?<\/script>/gi, '').replace(/<style\b[\s\S]*?<\/style>/gi, '');

  return normalizeTypographyExample(unwrapDocumentationContainer(markup));
};

// raw 与源码统一忽略文档专用容器后，再比较完整业务标记。
const normalizeLiveExampleMarkup = (block: string): string => {
  return normalizeTypographyExample(unwrapDocumentationContainer(block));
};

const extractTypographyExamples = (block: string): string[] =>
  (block.match(/<ex-typography\b[\s\S]*?(?:<\/ex-typography>|\/>)/gi) ?? []).map(
    normalizeTypographyExample
  );

const extractButtonExamples = (block: string): string[] =>
  (block.match(/<ex-button\b[\s\S]*?(?:<\/ex-button>|\/>)/gi) ?? []).map(
    normalizeTypographyExample
  );

const extractLinkExamples = (block: string): string[] =>
  (block.match(/<ex-link\b[\s\S]*?<\/ex-link>/gi) ?? []).map(normalizeTypographyExample);

const extractSpaceExamples = (block: string): string[] =>
  (block.match(/<ex-space\b[\s\S]*?<\/ex-space>/gi) ?? []).map(normalizeTypographyExample);

const extractIconExamples = (block: string): string[] =>
  (block.match(/<ex-icon\b[^>]*\/>|<ex-icon\b[\s\S]*?<\/ex-icon>/gi) ?? []).map(
    normalizeTypographyExample
  );

// 头像组先整体提取，避免组内头像被误判为独立示例。
const extractAvatarExamples = (block: string): string[] => {
  const groupPattern = /<ex-avatar-group\b[\s\S]*?<\/ex-avatar-group>/gi;
  const groups = block.match(groupPattern) ?? [];
  const avatars =
    block.replace(groupPattern, '').match(/<ex-avatar\b[\s\S]*?(?:<\/ex-avatar>|\/>)/gi) ?? [];

  return [...groups, ...avatars].map(normalizeTypographyExample);
};

// Ellipsis 的示例文本本身就是溢出测量依据，实时内容和代码内容必须保持一致。
const extractEllipsisExamples = (block: string): string[] =>
  (block.match(/<ex-ellipsis\b[\s\S]*?<\/ex-ellipsis>/gi) ?? []).map(normalizeTypographyExample);

const extractInputExamples = (block: string): string[] =>
  (block.match(/<ex-input\b[^>]*\/>|<ex-input\b[\s\S]*?<\/ex-input>/gi) ?? []).map(
    normalizeTypographyExample
  );

const extractSelectExamples = (block: string): string[] =>
  (block.match(/<ex-select\b[\s\S]*?\/>/gi) ?? []).map(normalizeTypographyExample);

const extractCascaderExamples = (block: string): string[] =>
  (block.match(/<ex-cascader\b[\s\S]*?\/>/gi) ?? []).map(normalizeTypographyExample);

// Watermark 的布局容器会直接影响演示效果，因此除 script 外必须完整比较实时标记。
const extractWatermarkExampleMarkup = (block: string): string => {
  const template = block.match(/<template>\s*([\s\S]*?)\s*<\/template>/i);
  return normalizeTypographyExample(template?.[1] ?? block);
};

const extractCheckboxExamples = (block: string): string[] =>
  [
    ...(block.match(/<ex-checkbox-group\b[\s\S]*?<\/ex-checkbox-group>/gi) ?? []),
    ...(block.match(/<ex-checkbox\b[\s\S]*?(?:<\/ex-checkbox>|\/>)/gi) ?? []),
  ].map(normalizeTypographyExample);

const extractTagExamples = (block: string): string[] =>
  [
    ...(block.match(/<ex-tag\b[\s\S]*?<\/ex-tag>/gi) ?? []),
    ...(block.match(/<ex-tag-input\b[^>]*\/>/gi) ?? []),
  ].map(normalizeTypographyExample);

// 表单示例的外层 vp-raw 容器只负责文档挂载，代码块应完整保留其内部标记。
const extractFormExampleMarkup = (block: string): string => {
  const wrapper = block.match(/^\s*<div class="vp-raw[^"]*">\s*([\s\S]*)\s*<\/div>\s*$/);
  return normalizeTypographyExample(wrapper?.[1] ?? block);
};

describe('组件文档实时演示', () => {
  it.each(componentDocumentNames)('%s 的每个实时演示都有隔离且默认折叠的 Vue 源码', name => {
    const document = readDocument(name);
    const documentWithoutCodeFences = document
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`[^`\n]*`/g, '');
    const rawBlocks = readBlocks(document, /::: raw\s*\n([\s\S]*?)\n:::/g);
    const pairedBlocks = document.match(
      /::: raw\s*\n[\s\S]*?\n:::\s*\n+::: details 查看示例代码\s*\n```vue\s*\n[\s\S]*?\n```\s*\n:::/g
    );
    const markupOutsideRaw = documentWithoutCodeFences.replace(/::: raw\s*\n[\s\S]*?\n:::/g, '');

    expect(rawBlocks.length).toBeGreaterThan(0);
    expect(pairedBlocks ?? []).toHaveLength(rawBlocks.length);
    expect(document).not.toMatch(/::: details 查看示例代码\s+open/);
    expect(markupOutsideRaw).not.toMatch(/<(?:ex-|Ex)[a-z0-9-]+\b/i);
  });

  it.each(interactiveComponentDocumentNames)('%s 的实时演示与可复制源码保持一致', name => {
    const document = readDocument(name);
    const liveBlocks = readBlocks(document, /::: raw\s*\n([\s\S]*?)\n:::/g);
    const codeBlocks = readBlocks(
      document,
      /::: details 查看示例代码\s*\n```vue\s*\n([\s\S]*?)\n```\s*\n:::/g
    );

    expect(codeBlocks).toHaveLength(liveBlocks.length);
    liveBlocks.forEach((liveBlock, index) => {
      expect(normalizeLiveExampleMarkup(liveBlock)).toBe(
        extractCopyableExampleMarkup(codeBlocks[index] ?? '')
      );
    });
  });

  it.each(displayDataComponentDocumentNames)('%s 的实时演示与可复制源码保持一致', name => {
    const document = readDocument(name);
    const liveBlocks = readBlocks(document, /::: raw\s*\n([\s\S]*?)\n:::/g);
    const codeBlocks = readBlocks(
      document,
      /::: details 查看示例代码\s*\n```vue\s*\n([\s\S]*?)\n```\s*\n:::/g
    );

    expect(codeBlocks).toHaveLength(liveBlocks.length);
    liveBlocks.forEach((liveBlock, index) => {
      expect(normalizeLiveExampleMarkup(liveBlock)).toBe(
        extractCopyableExampleMarkup(codeBlocks[index] ?? '')
      );
    });
  });

  it.each([
    ['typography', 'ex-typography', 32],
    ['icon', 'ex-icon', 4],
    ['button', 'ex-button', 8],
    ['image', 'ex-image', 3],
    ['link', 'ex-link', 4],
    ['avatar', 'ex-avatar', 4],
    ['space', 'ex-space', 5],
    ['card', 'ex-card', 4],
    ['ellipsis', 'ex-ellipsis', 3],
    ['input', 'ex-input', 4],
    ['select', 'ex-select', 4],
    ['cascader', 'ex-cascader', 5],
    ['watermark', 'ex-watermark', 9],
    ['form', 'ex-form', 2],
    ['form-examples', 'ex-form', 2],
    ['list', 'ex-list', 3],
    ['virtual-list', 'ex-virtual-list', 1],
    ['heatmap', 'ex-heatmap', 3],
    ['menu', 'ex-menu', 3],
    ['dropdown', 'ex-dropdown', 4],
    ['tag', 'ex-tag', 20],
  ])('%s 在代码围栏之外挂载足量的 %s', (name, component, minimum) => {
    expect(countLiveComponent(name, component)).toBeGreaterThanOrEqual(minimum as number);
  });

  it('Image 文档同步公开资源优化、恢复和预览事件契约', () => {
    const imageDocument = readDocument('image');
    const guideDocument = readDocument('basic-components-guide');

    expect(imageDocument).toContain('`srcset`');
    expect(imageDocument).toContain('`aspectRatio`');
    expect(imageDocument).toContain('`previewLoad`');
    expect(imageDocument).toContain('`previewError`');
    expect(imageDocument).toContain('`reload`');
    expect(guideDocument).not.toContain('霓虹边框渐变');
  });

  it('Avatar 文档示例与当前交互、间距和属性契约一致', () => {
    const document = readDocument('avatar');
    const guideDocument = readDocument('basic-components-guide');
    const avatarGuide = guideDocument.slice(
      guideDocument.indexOf('### 8. ExAvatar'),
      guideDocument.indexOf('### 9. ExDivider')
    );

    expect(document).toContain(':src="avatarImage"');
    expect(document).not.toContain(':src="avatarUrl"');
    expect(document).toContain('spacing="-10px"');
    expect(document).toContain('负值表示头像重叠');
    expect(document).toContain('`clickable`');
    expect(avatarGuide).not.toContain('| gap ');
    expect(avatarGuide).toContain('| clickable');
  });

  it('Avatar 每个实时示例都有默认折叠且内容一致的代码', () => {
    const document = readDocument('avatar');
    const liveBlocks = readBlocks(document, /::: raw\s*\n([\s\S]*?)\n:::/g);
    const codeBlocks = readBlocks(
      document,
      /::: details 查看示例代码\s*\n```vue\s*\n([\s\S]*?)\n```\s*\n:::/g
    );

    expect(liveBlocks).toHaveLength(4);
    expect(codeBlocks).toHaveLength(liveBlocks.length);

    liveBlocks.forEach((liveBlock, index) => {
      expect(extractAvatarExamples(liveBlock)).toEqual(
        extractAvatarExamples(codeBlocks[index] ?? '')
      );
    });
  });

  it('Link 每个实时示例都有默认折叠且内容一致的代码', () => {
    const document = readDocument('link');
    const liveBlocks = readBlocks(document, /::: raw\s*\n([\s\S]*?)\n:::/g);
    const codeBlocks = readBlocks(
      document,
      /::: details 查看示例代码\s*\n```vue\s*\n([\s\S]*?)\n```\s*\n:::/g
    );

    expect(liveBlocks).toHaveLength(6);
    expect(codeBlocks).toHaveLength(liveBlocks.length);
    expect(document).not.toMatch(/::: details 查看示例代码\s+open/);

    liveBlocks.forEach((liveBlock, index) => {
      expect(extractLinkExamples(liveBlock)).toEqual(extractLinkExamples(codeBlocks[index] ?? ''));
    });
  });

  it('Typography 每个实时示例都有默认折叠且内容一致的代码', () => {
    const document = readDocument('typography');
    const liveBlocks = readBlocks(document, /::: raw\s*\n([\s\S]*?)\n:::/g);
    const codeBlocks = readBlocks(
      document,
      /::: details 查看示例代码\s*\n```vue\s*\n([\s\S]*?)\n```\s*\n:::/g
    );

    expect(liveBlocks).toHaveLength(8);
    expect(codeBlocks).toHaveLength(liveBlocks.length);

    liveBlocks.forEach((liveBlock, index) => {
      expect(extractTypographyExamples(liveBlock)).toEqual(
        extractTypographyExamples(codeBlocks[index] ?? '')
      );
    });
  });

  it('Tag 每个实时示例都有默认折叠且内容一致的代码', () => {
    const document = readDocument('tag');
    const liveBlocks = readBlocks(document, /::: raw\s*\n([\s\S]*?)\n:::/g);
    const codeBlocks = readBlocks(
      document,
      /::: details 查看示例代码\s*\n```vue\s*\n([\s\S]*?)\n```\s*\n:::/g
    );
    const codeFenceCount = document.match(/```vue/g)?.length ?? 0;

    expect(liveBlocks).toHaveLength(8);
    expect(codeBlocks).toHaveLength(codeFenceCount);
    expect(document).not.toMatch(/::: details 查看示例代码\s+open/);

    liveBlocks.forEach((liveBlock, index) => {
      expect(extractTagExamples(liveBlock)).toEqual(extractTagExamples(codeBlocks[index] ?? ''));
    });
  });

  it('Input 每个实时示例都有默认折叠且内容一致的代码', () => {
    const document = readDocument('input');
    const liveBlocks = readBlocks(document, /::: raw\s*\n([\s\S]*?)\n:::/g);
    const codeBlocks = readBlocks(
      document,
      /::: details 查看示例代码\s*\n```vue\s*\n([\s\S]*?)\n```\s*\n:::/g
    );

    expect(liveBlocks).toHaveLength(8);
    expect(codeBlocks).toHaveLength(liveBlocks.length);

    liveBlocks.forEach((liveBlock, index) => {
      expect(extractInputExamples(liveBlock)).toEqual(
        extractInputExamples(codeBlocks[index] ?? '')
      );
    });
  });

  it('Select 每个实时示例都有默认折叠且内容一致的代码', () => {
    const document = readDocument('select');
    const liveBlocks = readBlocks(document, /::: raw\s*\n([\s\S]*?)\n:::/g);
    const codeBlocks = readBlocks(
      document,
      /::: details 查看示例代码\s*\n```vue\s*\n([\s\S]*?)\n```\s*\n:::/g
    );

    expect(liveBlocks).toHaveLength(6);
    expect(codeBlocks).toHaveLength(liveBlocks.length);

    liveBlocks.forEach((liveBlock, index) => {
      expect(extractSelectExamples(liveBlock)).toEqual(
        extractSelectExamples(codeBlocks[index] ?? '')
      );
    });
  });

  it('Checkbox 每个实时示例都有默认折叠且内容一致的代码', () => {
    const document = readDocument('checkbox');
    const liveBlocks = readBlocks(document, /::: raw\s*\n([\s\S]*?)\n:::/g);
    const codeBlocks = readBlocks(
      document,
      /::: details 查看示例代码\s*\n```vue\s*\n([\s\S]*?)\n```\s*\n:::/g
    );

    expect(liveBlocks).toHaveLength(11);
    expect(codeBlocks).toHaveLength(liveBlocks.length);
    expect(document).not.toMatch(/::: details 查看示例代码\s+open/);

    liveBlocks.forEach((liveBlock, index) => {
      expect(extractCheckboxExamples(liveBlock)).toEqual(
        extractCheckboxExamples(codeBlocks[index] ?? '')
      );
    });
  });

  it('Typography 将渐变作为正文也可用的独立文本效果演示', () => {
    const markup = readLiveMarkup('typography');
    expect(markup).toMatch(
      /<ex-typography\b(?=[^>]*\bgradient\b)(?=[^>]*variant="(?:body|caption)")/i
    );
  });

  it('Icon 每个实时示例都有默认折叠且内容一致的代码', () => {
    const document = readDocument('icon');
    const liveBlocks = readBlocks(document, /::: raw\s*\n([\s\S]*?)\n:::/g);
    const codeBlocks = readBlocks(
      document,
      /::: details 查看示例代码\s*\n```vue\s*\n([\s\S]*?)\n```\s*\n:::/g
    );

    expect(liveBlocks).toHaveLength(5);
    expect(codeBlocks).toHaveLength(liveBlocks.length);

    liveBlocks.forEach((liveBlock, index) => {
      expect(extractIconExamples(liveBlock)).toEqual(extractIconExamples(codeBlocks[index] ?? ''));
    });
  });

  it('Icon 内置目录直接由 ICONS 注册表驱动，避免手写清单遗漏', () => {
    const document = readDocument('icon');
    const liveMarkup = readLiveMarkup('icon');

    expect(document).toContain("import { ICONS } from '../../src/components/icon'");
    expect(document).toContain('const builtinIcons = Object.keys(ICONS)');
    expect(liveMarkup).toMatch(
      /<span\b(?=[^>]*v-for="icon in builtinIcons")(?=[^>]*class="icon-item")[\s\S]*?<ex-icon\b(?=[^>]*:icon="icon")/i
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

  it('Button 每个实时示例都有默认折叠且内容一致的代码', () => {
    const document = readDocument('button');
    const liveBlocks = readBlocks(document, /::: raw\s*\n([\s\S]*?)\n:::/g);
    const codeBlocks = readBlocks(
      document,
      /::: details 查看示例代码\s*\n```vue\s*\n([\s\S]*?)\n```\s*\n:::/g
    );

    expect(codeBlocks).toHaveLength(liveBlocks.length);

    liveBlocks.forEach((liveBlock, index) => {
      expect(extractButtonExamples(liveBlock)).toEqual(
        extractButtonExamples(codeBlocks[index] ?? '')
      );
    });
  });

  it('Space 每个实时示例都有默认折叠且内容一致的代码', () => {
    const document = readDocument('space');
    const liveBlocks = readBlocks(document, /::: raw\s*\n([\s\S]*?)\n:::/g);
    const codeBlocks = readBlocks(
      document,
      /::: details 查看示例代码\s*\n```vue\s*\n([\s\S]*?)\n```\s*\n:::/g
    );

    expect(liveBlocks).toHaveLength(5);
    expect(codeBlocks).toHaveLength(liveBlocks.length);

    liveBlocks.forEach((liveBlock, index) => {
      expect(extractSpaceExamples(liveBlock)).toEqual(
        extractSpaceExamples(codeBlocks[index] ?? '')
      );
    });
  });

  it('Ellipsis 同时提供底部按钮和行尾动态图标两种展开方式', () => {
    const markup = readLiveMarkup('ellipsis');
    expect(markup).toMatch(/expand-control="button"/i);
    expect(markup).toMatch(/expand-control="inline"/i);
  });

  it('Ellipsis 每个实时示例都有默认折叠且内容一致的代码', () => {
    const document = readDocument('ellipsis');
    const liveBlocks = readBlocks(document, /::: raw\s*\n([\s\S]*?)\n:::/g);
    const codeBlocks = readBlocks(
      document,
      /::: details 查看示例代码\s*\n```vue\s*\n([\s\S]*?)\n```\s*\n:::/g
    );

    expect(liveBlocks).toHaveLength(3);
    expect(codeBlocks).toHaveLength(liveBlocks.length);

    liveBlocks.forEach((liveBlock, index) => {
      expect(extractEllipsisExamples(liveBlock)).toEqual(
        extractEllipsisExamples(codeBlocks[index] ?? '')
      );
    });
  });

  it('Cascader 同时演示默认行内宽度与显式块级宽度', () => {
    const markup = readLiveMarkup('cascader');
    expect(markup).toMatch(/<ex-cascader\b(?![^>]*style=)/i);
    expect(markup).toMatch(/<ex-cascader\b[^>]*style="[^"]*width:\s*100%/i);
  });

  it('Cascader 每个实时示例都有默认折叠且内容一致的代码', () => {
    const document = readDocument('cascader');
    const liveBlocks = readBlocks(document, /::: raw\s*\n([\s\S]*?)\n:::/g);
    const codeBlocks = readBlocks(
      document,
      /::: details 查看示例代码\s*\n```vue\s*\n([\s\S]*?)\n```\s*\n:::/g
    );

    expect(liveBlocks).toHaveLength(3);
    expect(codeBlocks).toHaveLength(liveBlocks.length);
    expect(document).not.toMatch(/::: details 查看示例代码\s+open/);

    liveBlocks.forEach((liveBlock, index) => {
      expect(extractCascaderExamples(liveBlock)).toEqual(
        extractCascaderExamples(codeBlocks[index] ?? '')
      );
    });
  });

  it('Watermark 每个实时示例都有默认折叠且内容一致的代码', () => {
    const document = readDocument('watermark');
    const liveBlocks = readBlocks(document, /::: raw\s*\n([\s\S]*?)\n:::/g);
    const codeBlocks = readBlocks(
      document,
      /::: details 查看示例代码\s*\n```vue\s*\n([\s\S]*?)\n```\s*\n:::/g
    );

    expect(liveBlocks).toHaveLength(7);
    expect(codeBlocks).toHaveLength(liveBlocks.length);
    expect(document).not.toMatch(/::: details 查看示例代码\s+open/);
    expect(document).not.toMatch(/<(?:ExWatermark|ExButton)\b/);
    expect(codeBlocks[3]).toContain('const logoWatermark =');
    expect(codeBlocks[3]).not.toContain('data:image/svg+xml,...');
    expect(codeBlocks[4]).toContain('const updateDynamicText =');
    expect(codeBlocks[4]).toContain('const exportDynamicWatermark =');

    liveBlocks.forEach((liveBlock, index) => {
      expect(extractWatermarkExampleMarkup(liveBlock)).toBe(
        extractWatermarkExampleMarkup(codeBlocks[index] ?? '')
      );
    });
  });

  it.each(['form', 'form-examples'])('%s 不使用原生表单控件冒充组件库控件', name => {
    expect(readDocument(name)).not.toMatch(/<(?:input|textarea|select|button)\b/i);
  });

  it.each(['form', 'form-examples'])('%s 每个实时示例都有默认折叠且代码保持一致', name => {
    const document = readDocument(name);
    const liveBlocks = readBlocks(document, /::: raw\s*\n([\s\S]*?)\n:::/g);
    const codeBlocks = readBlocks(
      document,
      /::: details 查看示例代码\s*\n```vue\s*\n([\s\S]*?)\n```\s*\n:::/g
    );

    expect(codeBlocks).toHaveLength(liveBlocks.length);
    expect(document).not.toMatch(/::: details 查看示例代码\s+open/);

    liveBlocks.forEach((liveBlock, index) => {
      expect(extractFormExampleMarkup(liveBlock)).toBe(
        normalizeTypographyExample(codeBlocks[index] ?? '')
      );
    });
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
