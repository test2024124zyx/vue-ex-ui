import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import ExCascader from '../../../src/components/cascader/ExCascader.vue';
import type { CascaderOption } from '../../../src/components/cascader/types';

enableAutoUnmount(afterEach);

describe('ExCascader', () => {
  const options: CascaderOption[] = [
    {
      value: 'zhejiang',
      label: '浙江',
      children: [
        {
          value: 'hangzhou',
          label: '杭州',
          children: [
            { value: 'xihu', label: '西湖' },
            { value: 'yuhang', label: '余杭' },
          ],
        },
      ],
    },
    {
      value: 'jiangsu',
      label: '江苏',
      children: [
        { value: 'nanjing', label: '南京', children: [{ value: 'zhonghua', label: '中华门' }] },
      ],
    },
  ];

  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('默认保持行内控件宽度，同时允许外部样式扩展为块级宽度', () => {
    const stylesheet = readFileSync(
      resolve(process.cwd(), 'src/components/cascader/ExCascader.scss'),
      'utf8',
    );

    const rootDeclaration = stylesheet.match(/\.ex-cascader\s*\{([\s\S]*?)font-family:/)?.[1];
    expect(rootDeclaration).toMatch(/display:\s*inline-block/);
    expect(rootDeclaration).toMatch(/width:\s*240px/);
    expect(rootDeclaration).toMatch(/max-width:\s*100%/);
    expect(rootDeclaration).not.toMatch(/\n\s*width:\s*100%/);
  });

  describe('基础渲染与无障碍', () => {
    it('应该正确渲染', () => {
      const wrapper = mount(ExCascader, { props: { options } });
      expect(wrapper.find('.ex-cascader').exists()).toBe(true);
      expect(wrapper.find('.ex-cascader__input').exists()).toBe(true);
    });

    it('输入框应带有 combobox 角色与 aria-expanded', async () => {
      const wrapper = mount(ExCascader, { props: { options } });
      const input = wrapper.find('.ex-cascader__input');
      expect(input.attributes('role')).toBe('combobox');
      expect(input.attributes('aria-expanded')).toBe('false');
      await wrapper.find('.ex-cascader__input-wrapper').trigger('click');
      expect(wrapper.find('.ex-cascader__input').attributes('aria-expanded')).toBe('true');
    });
  });

  describe('选择行为', () => {
    it('点击叶子节点应触发 change 并带出完整路径', async () => {
      // teleported:false 让下拉面板就地渲染，便于在 wrapper 内查询
      const wrapper = mount(ExCascader, { props: { options, teleported: false } });
      await wrapper.find('.ex-cascader__input-wrapper').trigger('click');
      await nextTick();
      // 第一列：点击"浙江"
      const firstColumn = wrapper.findAll('.ex-cascader__menu')[0];
      await firstColumn.findAll('.ex-cascader__option')[0].trigger('click');
      await nextTick();
      // 第二列：点击"杭州"
      const secondColumn = wrapper.findAll('.ex-cascader__menu')[1];
      await secondColumn.findAll('.ex-cascader__option')[0].trigger('click');
      await nextTick();
      // 第三列：点击"西湖"（叶子）
      const thirdColumn = wrapper.findAll('.ex-cascader__menu')[2];
      await thirdColumn.findAll('.ex-cascader__option')[0].trigger('click');
      const changed = wrapper.emitted('change');
      expect(changed).toBeTruthy();
      expect(changed![changed!.length - 1][0]).toEqual(['zhejiang', 'hangzhou', 'xihu']);
    });

    it('悬停展开时保留祖先路径并在叶子选择后提交完整值', async () => {
      const wrapper = mount(ExCascader, {
        props: { options, trigger: 'hover', teleported: false },
      });
      await wrapper.find('.ex-cascader__input-wrapper').trigger('click');

      await wrapper
        .findAll('.ex-cascader__menu')[0]
        .findAll('.ex-cascader__option')[0]
        .trigger('mouseenter');
      await nextTick();
      await wrapper
        .findAll('.ex-cascader__menu')[1]
        .findAll('.ex-cascader__option')[0]
        .trigger('mouseenter');
      await nextTick();
      await wrapper
        .findAll('.ex-cascader__menu')[2]
        .findAll('.ex-cascader__option')[0]
        .trigger('click');

      expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([
        ['zhejiang', 'hangzhou', 'xihu'],
      ]);
    });

    it('禁用的搜索结果使用原生禁用控件且不能提交值', async () => {
      const disabledOptions: CascaderOption[] = [
        {
          value: 'disabled-parent',
          label: '禁用区域',
          disabled: true,
          children: [{ value: 'leaf', label: '目标节点' }],
        },
      ];
      const wrapper = mount(ExCascader, {
        props: { options: disabledOptions, filterable: true, teleported: false },
      });
      const input = wrapper.find('.ex-cascader__input');
      await input.setValue('目标');

      const result = wrapper.find('.ex-cascader__search-results .ex-cascader__option');
      expect(result.element.tagName).toBe('BUTTON');
      expect(result.attributes()).toHaveProperty('disabled');
      await result.trigger('click');
      expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    });
  });

  describe('动态属性', () => {
    it('options 变化后立即重建菜单而不保留旧选项引用', async () => {
      const wrapper = mount(ExCascader, { props: { options, teleported: false } });
      await wrapper.find('.ex-cascader__input-wrapper').trigger('click');

      await wrapper.setProps({
        options: [{ value: 'guangdong', label: '广东' }],
      });

      expect(wrapper.find('.ex-cascader__menu').text()).toContain('广东');
      expect(wrapper.find('.ex-cascader__menu').text()).not.toContain('浙江');
    });

    it('打开状态下切换为 disabled 会立即关闭面板', async () => {
      const wrapper = mount(ExCascader, { props: { options, teleported: false } });
      await wrapper.find('.ex-cascader__input-wrapper').trigger('click');
      await wrapper.setProps({ disabled: true });

      expect(wrapper.find('.ex-cascader__input').attributes('aria-expanded')).toBe('false');
      expect(wrapper.emitted('visible-change')?.at(-1)).toEqual([false]);
    });

    it('面板未打开时外部点击不会产生虚假的关闭事件', async () => {
      const wrapper = mount(ExCascader, { props: { options } });

      document.body.click();
      await nextTick();

      expect(wrapper.emitted('visible-change')).toBeUndefined();
    });
  });

  describe('键盘导航', () => {
    it('ArrowDown 应打开面板', async () => {
      const wrapper = mount(ExCascader, { props: { options } });
      await wrapper.find('.ex-cascader__input').trigger('keydown', { key: 'ArrowDown' });
      expect(wrapper.emitted('visible-change')).toBeTruthy();
      expect(wrapper.find('.ex-cascader__input').attributes('aria-expanded')).toBe('true');
    });

    it('ArrowRight 应展开高亮项的子级', async () => {
      const wrapper = mount(ExCascader, { props: { options, teleported: false } });
      const input = wrapper.find('.ex-cascader__input');
      await input.trigger('keydown', { key: 'ArrowDown' }); // 打开，高亮第一列首项
      await input.trigger('keydown', { key: 'ArrowRight' }); // 展开"浙江"的子级
      await nextTick();
      // 现在应有两列
      expect(wrapper.findAll('.ex-cascader__menu').length).toBe(2);
    });

    it('Escape 应关闭面板', async () => {
      const wrapper = mount(ExCascader, { props: { options } });
      const input = wrapper.find('.ex-cascader__input');
      await input.trigger('keydown', { key: 'ArrowDown' });
      await input.trigger('keydown', { key: 'Escape' });
      const events = wrapper.emitted('visible-change');
      expect(events![events!.length - 1][0]).toBe(false);
    });
  });
});
