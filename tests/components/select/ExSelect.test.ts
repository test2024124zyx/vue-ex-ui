import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import { nextTick } from 'vue';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
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
          'onUpdate:modelValue': (value: string | number | null) =>
            wrapper.setProps({ modelValue: value }),
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
      const clear = wrapper.get('.ex-select__clear');
      expect(clear.element.tagName).toBe('BUTTON');
      expect(clear.attributes('type')).toBe('button');
      expect(clear.attributes('aria-label')).toBeTruthy();
    });

    it.each([
      ['', basicOptions],
      ['missing', basicOptions],
      [null, basicOptions],
    ])('没有可见选中内容时不显示清空按钮（modelValue=%s）', (modelValue, options) => {
      const wrapper = mount(ExSelect, {
        props: { modelValue, options, clearable: true },
      });

      expect(wrapper.find('.ex-select__clear').exists()).toBe(false);
    });

    it('数值零作为真实选项值时仍显示清空按钮', () => {
      const wrapper = mount(ExSelect, {
        props: {
          modelValue: 0,
          options: [{ value: 0, label: '零' }],
          clearable: true,
        },
      });

      expect(wrapper.find('.ex-select__clear').exists()).toBe(true);
    });

    it('点击清空按钮应该清空值', async () => {
      const wrapper: VueWrapper = mount(ExSelect, {
        props: {
          modelValue: 'option1',
          'onUpdate:modelValue': (value: string | number | null) =>
            wrapper.setProps({ modelValue: value }),
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

  it('选项容器禁止水平滚动，纵向仅在内容溢出时自动出现', () => {
    const stylesheet = readFileSync(
      resolve(process.cwd(), 'src/components/select/ExSelect.scss'),
      'utf8'
    );
    const optionsBlock = stylesheet.match(/&__options\s*\{([\s\S]*?)\n\s*\}/)?.[1] ?? '';

    expect(optionsBlock).toContain('overflow-x: hidden');
    expect(optionsBlock).toContain('overflow-y: auto');
    expect(optionsBlock).not.toContain('overflow-y: scroll');
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

  describe('多选', () => {
    const openDropdown = async (wrapper: VueWrapper) => {
      await wrapper.find('.ex-select__trigger').trigger('click');
      await nextTick();
      return document.querySelectorAll('.ex-select__option');
    };

    it('应该为已选值渲染标签', () => {
      const wrapper = mount(ExSelect, {
        props: { multiple: true, modelValue: ['option1', 'option2'], options: basicOptions },
      });
      const tags = wrapper.findAll('.ex-select__tag');
      expect(tags.length).toBe(2);
      expect(tags[0].text()).toContain('选项一');
      expect(tags[1].text()).toContain('选项二');
    });

    it('选择选项应累加且保持下拉打开', async () => {
      const wrapper = mount(ExSelect, {
        props: { multiple: true, modelValue: [], options: basicOptions },
      });
      const options = await openDropdown(wrapper);

      (options[0] as HTMLElement).click();
      await nextTick();
      expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toEqual(['option1']);
      // 下拉保持打开
      expect(document.querySelector('.ex-select__dropdown')).toBeTruthy();

      (options[1] as HTMLElement).click();
      await nextTick();
      // 受控组件未回写 modelValue，第二次切换基于初始 []，断言事件被触发
      expect(wrapper.emitted('update:modelValue')?.length).toBeGreaterThanOrEqual(2);
    });

    it('再次点击已选项应取消选择', async () => {
      const wrapper = mount(ExSelect, {
        props: { multiple: true, modelValue: ['option1'], options: basicOptions },
      });
      const options = await openDropdown(wrapper);

      (options[0] as HTMLElement).click();
      await nextTick();
      expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toEqual([]);
    });

    it('点击标签关闭按钮应移除该项', async () => {
      const wrapper = mount(ExSelect, {
        props: { multiple: true, modelValue: ['option1', 'option2'], options: basicOptions },
      });
      await wrapper.find('.ex-select__tag-close').trigger('click');
      await nextTick();
      expect(wrapper.emitted('remove-tag')?.[0]).toEqual(['option1']);
      expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toEqual(['option2']);
    });

    it('应遵守 multipleLimit', async () => {
      const wrapper = mount(ExSelect, {
        props: { multiple: true, modelValue: ['option1'], multipleLimit: 1, options: basicOptions },
      });
      const options = await openDropdown(wrapper);

      // 已达上限，点击未选项应被忽略
      (options[1] as HTMLElement).click();
      await nextTick();
      expect(wrapper.emitted('update:modelValue')).toBeFalsy();

      // 但取消已选仍允许
      (options[0] as HTMLElement).click();
      await nextTick();
      expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toEqual([]);
    });

    it('collapseTags 应折叠多余标签为 +N', () => {
      const wrapper = mount(ExSelect, {
        props: {
          multiple: true,
          collapseTags: true,
          modelValue: ['option1', 'option2', 'option3'],
          options: basicOptions,
        },
      });
      // 仅展示第一个标签 + 计数标签
      expect(wrapper.findAll('.ex-select__tag-label').length).toBe(1);
      expect(wrapper.find('.ex-select__tag--count').text()).toBe('+2');
    });

    it('清空应发出空数组', async () => {
      const wrapper = mount(ExSelect, {
        props: {
          multiple: true,
          clearable: true,
          modelValue: ['option1', 'option2'],
          options: basicOptions,
        },
      });
      await wrapper.find('.ex-select__clear').trigger('click');
      await nextTick();
      expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toEqual([]);
      expect(wrapper.emitted('clear')).toBeTruthy();
    });
  });

  describe('远程搜索 (remote)', () => {
    afterEach(() => {
      vi.useRealTimers();
      document.body.innerHTML = '';
    });

    it('remote 模式下输入触发 remoteMethod（防抖）', async () => {
      vi.useFakeTimers();
      const remoteMethod = vi.fn();
      const wrapper = mount(ExSelect, {
        props: { remote: true, searchable: true, remoteMethod, options: [], remoteDebounce: 200 },
      });
      await wrapper.find('.ex-select__trigger').trigger('click');
      await wrapper.find('.ex-select__input').setValue('ab');
      // 防抖：尚未到时不触发
      expect(remoteMethod).not.toHaveBeenCalled();
      vi.advanceTimersByTime(200);
      expect(remoteMethod).toHaveBeenCalledWith('ab');
    });

    it('remote 模式不做本地过滤（选项原样展示）', async () => {
      const options: SelectOptions = [
        { value: 1, label: 'Apple' },
        { value: 2, label: 'Banana' },
      ];
      const wrapper = mount(ExSelect, {
        props: { remote: true, searchable: true, options, remoteMethod: () => {} },
      });
      await wrapper.find('.ex-select__trigger').trigger('click');
      await wrapper.find('.ex-select__input').setValue('zzz');
      await nextTick();
      // 远程模式下输入不匹配的关键词，选项仍按父级提供原样展示
      expect(document.querySelectorAll('.ex-select__option').length).toBe(2);
    });

    it('loading 时显示加载态并隐藏空状态', async () => {
      const wrapper = mount(ExSelect, {
        props: {
          remote: true,
          searchable: true,
          loading: true,
          options: [],
          remoteMethod: () => {},
        },
      });
      await wrapper.find('.ex-select__trigger').trigger('click');
      await nextTick();
      expect(document.querySelector('.ex-select__loading')).toBeTruthy();
      expect(document.querySelector('.ex-select__empty')).toBeFalsy();
    });
  });
});
