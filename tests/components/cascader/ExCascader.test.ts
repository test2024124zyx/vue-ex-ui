import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import ExCascader from '../../../src/components/cascader/ExCascader.vue';
import type { CascaderOption } from '../../../src/components/cascader/types';

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
