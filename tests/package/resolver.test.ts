import { access } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import * as components from '../../src/index';
import { ExUIResolver } from '../../src/resolver';

describe('组件自动导入契约', () => {
  it('每个真实公开组件均可解析到存在且导出同名组件的模块', async () => {
    const resolver = ExUIResolver();
    const modules = import.meta.glob('../../src/components/*/index.ts');
    const publicNames = Object.entries(components)
      .filter(([, value]) => value && typeof value === 'object' && 'install' in value)
      .map(([name]) => name)
      .filter(name => name.startsWith('Ex'));

    expect(publicNames.length).toBeGreaterThan(0);
    for (const name of publicNames) {
      const result = resolver.resolve(name);
      expect(result, name).toBeDefined();
      const directory = result!.from.split('/').at(-1)!;
      await access(resolve('src/components', directory, 'index.ts'));
      const module = (await modules[`../../src/components/${directory}/index.ts`]!()) as Record<
        string,
        unknown
      >;
      expect(module[name], name).toBe(components[name as keyof typeof components]);
      expect(result?.sideEffects).toEqual(['vue-ex-ui/base.css']);
    }
  });

  it('拒绝业务自己的 Ex 前缀组件和无效名称', () => {
    const resolver = ExUIResolver();
    expect(resolver.resolve('ExCustomerEditor')).toBeUndefined();
    expect(resolver.resolve('Button')).toBeUndefined();
    expect(resolver.resolve('__proto__')).toBeUndefined();
  });

  it('字体必须显式启用，基础样式可交由宿主统一加载', () => {
    expect(ExUIResolver({ includeFonts: true }).resolve('ExButton')?.sideEffects).toEqual([
      'vue-ex-ui/base.css',
      'vue-ex-ui/font.css',
    ]);
    expect(ExUIResolver({ includeBaseStyles: false }).resolve('ExDateTimePicker')).toMatchObject({
      name: 'ExDateTimePicker',
      from: 'vue-ex-ui/es/components/datetime-picker',
      sideEffects: [],
    });
  });
});
