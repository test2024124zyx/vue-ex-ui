import { describe, expect, it } from 'vitest';
import { compileString } from 'sass';

describe('组件主题变量继承', () => {
  const compile = (source: string) => compileString(source, { loadPaths: [process.cwd()] }).css;

  it('默认主题别名在使用处解析，并保留用户设置的同名 CSS 变量', () => {
    const variables = compile("@use 'src/styles/variables';");
    const components = [
      ['modal/ExModal', 'modal-background', 'color-bg-elevated'],
      ['modal/ExModal', 'modal-mask-background', 'color-black-alpha-70'],
      ['modal/ExModal', 'modal-shadow', 'shadow-2xl'],
      ['avatar/ExAvatar', 'avatar-bg-text', 'color-accent-alpha-10'],
      ['avatar/ExAvatar', 'avatar-text-color', 'color-text-primary'],
      ['avatar/ExAvatarGroup', 'avatar-group-border-color', 'color-bg-primary'],
      ['image/ExImage', 'image-error-text-color', 'color-text-secondary'],
      ['divider/ExDivider', 'divider-color', 'color-border-primary'],
      ['divider/ExDivider', 'divider-text-color', 'color-text-primary'],
    ];
    for (const [component, name, fallback] of components) {
      expect(variables, name).not.toContain(`--ex-${name}:`);
      expect(compile(`@use 'src/components/${component}';`), name).toContain(
        `var(--ex-${name}, var(--ex-${fallback}))`
      );
    }
  });

  it('卡片阴影在局部覆盖颜色后仍使用当前作用域的颜色', () => {
    const variables = compile("@use 'src/styles/variables';");
    const card = compile("@use 'src/components/card/ExCard';");
    expect(variables).not.toContain('--ex-card-shadow:');
    expect(variables).not.toContain('--ex-card-filter-shadow-md:');
    expect(card).toContain(
      'var(--ex-card-filter-shadow-md, drop-shadow(0 4px 6px var(--ex-color-black-alpha-30)))'
    );
  });
});
