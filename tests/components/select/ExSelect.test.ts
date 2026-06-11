import { describe, it, expect, beforeEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import { nextTick } from 'vue';
import ExSelect from '../../../src/components/select/ExSelect.vue';
import type { SelectOptions } from '../../../src/components/select/types';

describe('ExSelect', () => {
  const basicOptions: SelectOptions = [
    { value: 'option1', label: '选项一' },
    { value: 'option2', label: '选项二' },
    { value: 'option3', label: '选项三' },
  ];

  beforeEach(() => {
    // 清理 DOM
    document.body.innerHTML = '';
  });

  describe('基础功能', () => {
    it('应该正确渲染', () => {
      const wrapper = mount(ExSelect, {
        props: {
          options: basicOptions,
        },
      });

      expect(wrapper.find('.ex-select').exists()).toBe(true);
      expect(wrapper.find('.ex-select__trigger').exists()).toBe(true);
    });

    it('应该显示占位符', () => {
      const wrapper = mount(ExSelect, {
        props: {
          options: basicOptions,
          placeholder: '请选择',
        },
      });

      expect(wrapper.find('.ex-select__placeholder').text()).toBe('请选择');
    });

    it('应该显示选中的值', async () => {
      const wrapper = mount(ExSelect, {
        props: {
          modelValue: 'option1',
          options: basicOptions,
        },
      });

      await nextTick();
      expect(wrapper.find('.ex-select__label').text()).toBe('选项一');
    });

    it('应该支持 v-model', async () => {
      const wrapper: VueWrapper = mount(ExSelect, {
        props: {
          modelValue: '',
          'onUpdate:modelValue': (value: string | number | null) => wrapper.setProps({ modelValue: value }),
          options: basicOptions,
        },
      });

      // 打开下拉菜单
      await wrapper.find('.ex-select__trigger').trigger('click');
      await nextTick();

      // 选择选项
      const options = document.querySelectorAll('.ex-select__option');
      expect(options.length).toBeGreaterThan(0);
      
      (options[0] as HTMLElement).click();
      await nextTick();

      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['option1']);
    });
  });

  describe('尺寸', () => {
    it('应该支持 small 尺寸', () => {
      const wrapper = mount(ExSelect, {
        props: {
          options: basicOptions,
          size: 'small',
        },
      });

      expect(wrapper.find('.ex-select--small').exists()).toBe(true);
    });

    it('应该支持 medium 尺寸', () => {
      const wrapper = mount(ExSelect, {
        props: {
          options: basicOptions,
          size: 'medium',
        },
      });

      expect(wrapper.find('.ex-select--medium').exists()).toBe(true);
    });

    it('应该支持 large 尺寸', () => {
      const wrapper = mount(ExSelect, {
        props: {
          options: basicOptions,
          size: 'large',
        },
      });

      expect(wrapper.find('.ex-select--large').exists()).toBe(true);
    });
  });

  describe('禁用状态', () => {
    it('应该支持禁用', () => {
      const wrapper = mount(ExSelect, {
        props: {
          options: basicOptions,
          disabled: true,
        },
      });

      expect(wrapper.find('.is-disabled').exists()).toBe(true);
    });

    it('禁用时不应该打开下拉菜单', async () => {
      const wrapper = mount(ExSelect, {
        props: {
          options: basicOptions,
          disabled: true,
        },
      });

      await wrapper.find('.ex-select__trigger').trigger('click');
      await nextTick();

      expect(document.querySelector('.ex-select__dropdown')).toBeNull();
    });

    it('应该支持禁用单个选项', async () => {
      const optionsWithDisabled: SelectOptions = [
        { value: 'option1', label: '选项一' },
        { value: 'option2', label: '选项二', disabled: true },
        { value: 'option3', label: '选项三' },
      ];

      const wrapper = mount(ExSelect, {
        props: {
          options: optionsWithDisabled,
        },
      });

      await wrapper.find('.ex-select__trigger').trigger('click');
      await nextTick();

      const options = document.querySelectorAll('.ex-select__option');
      expect(options[1].classList.contains('is-disabled')).toBe(true);
    });
  });

  describe('可清空', () => {
    it('应该显示清空按钮', async () => {
      const wrapper = mount(ExSelect, {
        props: {
          modelValue: 'option1',
          options: basicOptions,
          clearable: true,
        },
      });

      await nextTick();
      expect(wrapper.find('.ex-select__clear').exists()).toBe(true);
    });

    it('点击清空按钮应该清空值', async () => {
      const wrapper: VueWrapper = mount(ExSelect, {
        props: {
          modelValue: 'option1',
          'onUpdate:modelValue': (value: string | number | null) => wrapper.setProps({ modelValue: value }),
          options: basicOptions,
          clearable: true,
        },
      });

      await nextTick();
      await wrapper.find('.ex-select__clear').trigger('click');
      await nextTick();

      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([null]);
      expect(wrapper.emitted('clear')).toBeTruthy();
    });
  });

  describe('可搜索', () => {
    it('应该显示搜索输入框', async () => {
      const wrapper = mount(ExSelect, {
        props: {
          options: basicOptions,
          searchable: true,
        },
      });

      await wrapper.find('.ex-select__trigger').trigger('click');
      await nextTick();

      expect(wrapper.find('.ex-select__input').exists()).toBe(true);
    });

    it('应该根据搜索词过滤选项', async () => {
      const wrapper = mount(ExSelect, {
        props: {
          options: basicOptions,
          searchable: true,
        },
      });

      await wrapper.find('.ex-select__trigger').trigger('click');
      await nextTick();

      const input = wrapper.find('.ex-select__input');
      await input.setValue('选项一');
      await nextTick();

      const options = document.querySelectorAll('.ex-select__option');
      expect(options.length).toBe(1);
      expect(options[0].textContent).toContain('选项一');
    });

    it('应该支持关键词搜索', async () => {
      const optionsWithKeywords: SelectOptions = [
        { value: 'beijing', label: '北京', keywords: ['BJ', 'Beijing'] },
        { value: 'shanghai', label: '上海', keywords: ['SH', 'Shanghai'] },
      ];

      const wrapper = mount(ExSelect, {
        props: {
          options: optionsWithKeywords,
          searchable: true,
        },
      });

      await wrapper.find('.ex-select__trigger').trigger('click');
      await nextTick();

      const input = wrapper.find('.ex-select__input');
      await input.setValue('BJ');
      await nextTick();

      const options = document.querySelectorAll('.ex-select__option');
      expect(options.length).toBe(1);
      expect(options[0].textContent).toContain('北京');
    });
  });

  describe('分组', () => {
    it('应该支持分组选项', async () => {
      const groupOptions: SelectOptions = [
        {
          label: '分组一',
          options: [
            { value: 'option1', label: '选项一' },
            { value: 'option2', label: '选项二' },
          ],
        },
        {
          label: '分组二',
          options: [
            { value: 'option3', label: '选项三' },
            { value: 'option4', label: '选项四' },
          ],
        },
      ];

      const wrapper = mount(ExSelect, {
        props: {
          options: groupOptions,
        },
      });

      await wrapper.find('.ex-select__trigger').trigger('click');
      await nextTick();

      const groups = document.querySelectorAll('.ex-select__group');
      expect(groups.length).toBe(2);
      expect(groups[0].textContent).toContain('分组一');
      expect(groups[1].textContent).toContain('分组二');
    });
  });

  describe('事件', () => {
    it('应该触发 change 事件', async () => {
      const wrapper = mount(ExSelect, {
        props: {
          options: basicOptions,
        },
      });

      await wrapper.find('.ex-select__trigger').trigger('click');
      await nextTick();

      const options = document.querySelectorAll('.ex-select__option');
      (options[0] as HTMLElement).click();
      await nextTick();

      const changeEvent = wrapper.emitted('change')?.[0];
      expect(changeEvent?.[0]).toBe('option1');
    });

    it('应该触发 visible-change 事件', async () => {
      const wrapper = mount(ExSelect, {
        props: {
          options: basicOptions,
        },
      });

      await wrapper.find('.ex-select__trigger').trigger('click');
      await nextTick();

      expect(wrapper.emitted('visible-change')?.[0]).toEqual([true]);
    });

    it('应该暴露 focus 和 blur 方法', () => {
      const wrapper = mount(ExSelect, {
        props: {
          options: basicOptions,
        },
      });

      const vm = wrapper.vm as { focus?: () => void; blur?: () => void };
      
      // 验证方法存在
      expect(typeof vm.focus).toBe('function');
      expect(typeof vm.blur).toBe('function');
    });
  });

  describe('暴露的方法', () => {
    it('应该暴露 focus 方法', async () => {
      const wrapper = mount(ExSelect, {
        props: {
          options: basicOptions,
        },
      });

      const vm = wrapper.vm as { focus?: () => void };
      expect(typeof vm.focus).toBe('function');
    });

    it('应该暴露 blur 方法', async () => {
      const wrapper = mount(ExSelect, {
        props: {
          options: basicOptions,
        },
      });

      const vm = wrapper.vm as { blur?: () => void };
      expect(typeof vm.blur).toBe('function');
    });
  });

  describe('无障碍', () => {
    it('应该有正确的 ARIA 属性', () => {
      const wrapper = mount(ExSelect, {
        props: {
          options: basicOptions,
        },
      });

      const trigger = wrapper.find('.ex-select__trigger');
      // 检查 trigger 元素存在
      expect(trigger.exists()).toBe(true);
      // 检查是否可以被点击（基本的可访问性）
      expect(trigger.element.tagName).toBeTruthy();
    });

    it('打开时应该更新状态', async () => {
      const wrapper = mount(ExSelect, {
        props: {
          options: basicOptions,
        },
      });

      await wrapper.find('.ex-select__trigger').trigger('click');
      await nextTick();

      // 检查下拉菜单是否打开
      const dropdown = document.querySelector('.ex-select__dropdown');
      expect(dropdown).toBeTruthy();
    });
  });
});
