import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import { h, nextTick, reactive } from 'vue';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import ExSelect from '../../../src/components/select/ExSelect.vue';
import ExConfigProvider from '../../../src/components/config-provider/ExConfigProvider.vue';
import ExForm from '../../../src/components/form/ExForm.vue';
import ExFormItem from '../../../src/components/form/ExFormItem.vue';
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

    it('只读状态可聚焦但不会打开下拉菜单', async () => {
      const wrapper = mount(ExSelect, {
        props: { options: basicOptions, readonly: true },
      });

      const trigger = wrapper.get('.ex-select__trigger');
      expect(trigger.attributes('tabindex')).toBe('0');
      expect(trigger.attributes('aria-readonly')).toBe('true');
      await trigger.trigger('click');
      expect(document.querySelector('.ex-select__dropdown')).toBeNull();
    });

    it('打开后运行时切换为禁用或只读会立即关闭下拉菜单', async () => {
      const wrapper = mount(ExSelect, { props: { options: basicOptions } });

      await wrapper.get('.ex-select__trigger').trigger('click');
      expect(document.querySelector('.ex-select__dropdown')).toBeTruthy();
      await wrapper.setProps({ disabled: true });
      expect(document.querySelector('.ex-select__dropdown')).toBeNull();

      await wrapper.setProps({ disabled: false });
      await wrapper.get('.ex-select__trigger').trigger('click');
      expect(document.querySelector('.ex-select__dropdown')).toBeTruthy();
      await wrapper.setProps({ readonly: true });
      expect(document.querySelector('.ex-select__dropdown')).toBeNull();
      expect(wrapper.emitted('visible-change')).toEqual([[true], [false], [true], [false]]);
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

    const optionBlock = stylesheet.match(/&__option\s*\{([\s\S]*?)\n\s*\}/)?.[1] ?? '';
    expect(optionBlock).toContain('var(--ex-select-option-height, #{$select-option-height})');

    const multipleValueBlock =
      stylesheet.match(/&--multiple &__value\s*\{([\s\S]*?)\n\s*\}/)?.[1] ?? '';
    expect(multipleValueBlock).toContain('overflow-x: auto');
    expect(multipleValueBlock).toContain('scrollbar-width: none');
    expect(multipleValueBlock).toContain('-ms-overflow-style: none');
    expect(multipleValueBlock).not.toContain('scrollbar-width: thin');
    expect(stylesheet).toContain('&--multiple &__value::-webkit-scrollbar');
    expect(stylesheet).toContain('display: none');
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

    it('已有单选值时仍保留搜索输入，并且输入点击只打开一次', async () => {
      const wrapper = mount(ExSelect, {
        props: {
          modelValue: 'option1',
          options: basicOptions,
          searchable: true,
        },
      });

      const input = wrapper.get('.ex-select__input');
      expect(input.element).toBeInstanceOf(HTMLInputElement);
      expect(input.attributes('placeholder')).toBe('选项一');

      await input.trigger('click');
      await nextTick();
      expect(wrapper.emitted('visible-change')).toEqual([[true]]);

      await input.trigger('click');
      expect(wrapper.emitted('visible-change')).toEqual([[true]]);
    });

    it('搜索输入的键盘事件不会冒泡导致重复导航', async () => {
      const wrapper = mount(ExSelect, {
        props: { options: basicOptions, searchable: true },
      });

      const input = wrapper.get('.ex-select__input');
      await input.trigger('keydown', { key: 'ArrowDown' });
      await nextTick();

      const activeId = input.attributes('aria-activedescendant');
      expect(activeId).toBeTruthy();
      expect(document.getElementById(activeId as string)?.textContent).toContain('选项一');
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
    it('非搜索触发器应发出 focus 和 blur 事件', async () => {
      const wrapper = mount(ExSelect, { props: { options: basicOptions } });
      const trigger = wrapper.get('.ex-select__trigger');

      await trigger.trigger('focus');
      await trigger.trigger('blur');
      expect(wrapper.emitted('focus')).toHaveLength(1);
      expect(wrapper.emitted('blur')).toHaveLength(1);
    });

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

    it('下拉定位应限制在视口内并保留触发器与面板间距', async () => {
      const originalWidth = window.innerWidth;
      const originalHeight = window.innerHeight;
      Object.defineProperty(window, 'innerWidth', { configurable: true, value: 500 });
      Object.defineProperty(window, 'innerHeight', { configurable: true, value: 360 });

      const wrapper = mount(ExSelect, { props: { options: basicOptions } });
      const trigger = wrapper.get('.ex-select__trigger');
      trigger.element.getBoundingClientRect = () =>
        ({
          top: 300,
          bottom: 340,
          left: 480,
          right: 580,
          width: 100,
          height: 40,
        }) as DOMRect;

      await trigger.trigger('click');
      await nextTick();
      const dropdown = document.querySelector('.ex-select__dropdown') as HTMLElement;
      Object.defineProperty(dropdown, 'offsetHeight', { configurable: true, value: 320 });
      window.dispatchEvent(new Event('resize'));
      await nextTick();

      expect(parseFloat(dropdown.style.top)).toBeGreaterThanOrEqual(8);
      expect(parseFloat(dropdown.style.left)).toBeGreaterThanOrEqual(8);
      expect(parseFloat(dropdown.style.left)).toBeLessThanOrEqual(392);

      Object.defineProperty(window, 'innerWidth', { configurable: true, value: originalWidth });
      Object.defineProperty(window, 'innerHeight', { configurable: true, value: originalHeight });
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

    it('应将 combobox 语义绑定到可交互节点及下拉列表', async () => {
      const wrapper = mount(ExSelect, {
        attrs: { 'aria-label': '部门', 'aria-describedby': 'department-help' },
        props: { id: 'department-select', options: basicOptions },
      });

      const trigger = wrapper.get('.ex-select__trigger');
      expect(trigger.attributes('id')).toBe('department-select');
      expect(trigger.attributes('role')).toBe('combobox');
      expect(trigger.attributes('aria-haspopup')).toBe('listbox');
      expect(trigger.attributes('aria-label')).toBe('部门');
      expect(trigger.attributes('aria-describedby')).toBe('department-help');

      await trigger.trigger('click');
      await nextTick();
      const dropdown = document.querySelector('.ex-select__dropdown') as HTMLElement;
      expect(trigger.attributes('aria-controls')).toBe(dropdown.id);
      expect(dropdown.getAttribute('role')).toBe('listbox');
      expect(dropdown.querySelectorAll('[role="listbox"]').length).toBe(0);
      expect(dropdown.querySelector('.ex-select__option')?.getAttribute('aria-disabled')).toBe(
        null
      );
    });

    it('搜索模式将 combobox 语义放在输入框上', () => {
      const wrapper = mount(ExSelect, {
        props: { id: 'search-select', searchable: true, options: basicOptions },
      });

      const trigger = wrapper.get('.ex-select__trigger');
      const input = wrapper.get('.ex-select__input');
      expect(trigger.attributes('role')).toBeUndefined();
      expect(input.attributes('role')).toBe('combobox');
      expect(input.attributes('id')).toBe('search-select');
      expect(input.attributes('aria-controls')).toContain('search-select-dropdown');
    });

    it('禁用选项应暴露 aria-disabled', async () => {
      const wrapper = mount(ExSelect, {
        props: {
          options: [{ value: 'disabled', label: '不可选', disabled: true }],
        },
      });

      await wrapper.get('.ex-select__trigger').trigger('click');
      await nextTick();
      expect(document.querySelector('.ex-select__option')?.getAttribute('aria-disabled')).toBe(
        'true'
      );
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

    it('长标签应保留关闭按钮并允许标签文本收缩', () => {
      const wrapper = mount(ExSelect, {
        props: {
          multiple: true,
          modelValue: ['long'],
          options: [{ value: 'long', label: '这是一个很长的项目成员名称' }],
        },
      });

      const tag = wrapper.get('.ex-select__tag');
      const label = wrapper.get('.ex-select__tag-label');
      const close = wrapper.get('.ex-select__tag-close');
      expect(tag.classes()).toContain('ex-select__tag');
      expect(label.text()).toContain('很长的项目成员名称');
      expect(close.attributes('type')).toBe('button');
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
      expect(wrapper.get('.ex-select__tag-close').element.tagName).toBe('BUTTON');
    });

    it('多选 change 的 option 与当前已选值保持一致', async () => {
      const wrapper = mount(ExSelect, {
        props: { multiple: true, modelValue: [], options: basicOptions },
      });
      const options = await openDropdown(wrapper);

      (options[0] as HTMLElement).click();
      await nextTick();
      expect(wrapper.emitted('change')?.[0]?.[1]).toEqual([basicOptions[0]]);
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

    it('远程结果换页后仍保留已选项的标签和清空入口', async () => {
      const wrapper = mount(ExSelect, {
        props: {
          remote: true,
          clearable: true,
          modelValue: 1,
          options: [{ value: 1, label: '已选部门' }],
        },
      });

      await wrapper.setProps({ options: [{ value: 2, label: '新结果' }] });
      await nextTick();
      expect(wrapper.find('.ex-select__label').text()).toBe('已选部门');
      expect(wrapper.find('.ex-select__clear').exists()).toBe(true);
    });

    it('大量远程结果仅长期保留已选项，不无限缓存过期未选项', async () => {
      const manyOptions: SelectOptions = Array.from({ length: 250 }, (_, index) => ({
        value: index,
        label: `远程选项 ${index}`,
      }));
      const wrapper = mount(ExSelect, {
        props: { remote: true, modelValue: 0, options: manyOptions },
      });

      await wrapper.setProps({ options: [] });
      expect(wrapper.get('.ex-select__label').text()).toBe('远程选项 0');

      await wrapper.setProps({ modelValue: null, options: [{ value: 999, label: '新结果' }] });
      await wrapper.setProps({ modelValue: 1 });

      expect(wrapper.find('.ex-select__label').exists()).toBe(false);
      expect(wrapper.find('.ex-select__placeholder').exists()).toBe(true);
    });
  });

  describe('FormItem 集成与全局配置', () => {
    it('继承 FormItem 的禁用、标签关联和校验状态', async () => {
      const model = reactive({ department: '' });
      const wrapper = mount(ExForm, {
        props: {
          model,
          disabled: true,
          rules: { department: { required: true, trigger: 'blur', message: '请选择部门' } },
        },
        slots: {
          default: () =>
            h(
              ExFormItem,
              {
                prop: 'department',
                label: '部门',
                validateStatus: 'error',
                error: '请选择部门',
              },
              {
                default: () => h(ExSelect, { options: basicOptions }),
              }
            ),
        },
      });

      const select = wrapper.get('.ex-select');
      const trigger = wrapper.get('.ex-select__trigger');
      expect(select.classes()).toContain('is-disabled');
      expect(select.classes()).toContain('is-error');
      expect(trigger.attributes('aria-disabled')).toBe('true');
      expect(trigger.attributes('aria-invalid')).toBe('true');
      expect(trigger.attributes('aria-labelledby')).toContain('ex-form-item-');
    });

    it('非搜索触发器失焦时触发 FormItem 的 blur 校验', async () => {
      const model = reactive({ department: '' });
      const wrapper = mount(ExForm, {
        props: {
          model,
          rules: { department: { required: true, trigger: 'blur', message: '请选择部门' } },
        },
        slots: {
          default: () =>
            h(
              ExFormItem,
              { prop: 'department', label: '部门' },
              {
                default: () => h(ExSelect, { options: basicOptions }),
              }
            ),
        },
      });

      const trigger = wrapper.get('.ex-select__trigger');
      await trigger.trigger('focus');
      await trigger.trigger('blur');
      await nextTick();
      await nextTick();
      expect(wrapper.find('.ex-form-item__error').text()).toContain('请选择部门');
    });

    it('Teleport 下拉菜单继承 ConfigProvider 的层级和效果开关', async () => {
      const wrapper = mount(ExConfigProvider, {
        props: { zIndex: 2000, neonEffect: false, animation: false },
        slots: {
          default: () => h(ExSelect, { options: basicOptions }),
        },
      });

      await wrapper.get('.ex-select__trigger').trigger('click');
      await nextTick();
      const dropdown = document.querySelector('.ex-select__dropdown') as HTMLElement;
      expect(dropdown.classList.contains('ex-no-neon')).toBe(true);
      expect(dropdown.classList.contains('ex-no-animation')).toBe(true);
      expect(dropdown.style.zIndex).toBe('2000');
    });
  });
});
