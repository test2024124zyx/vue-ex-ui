import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, effectScope, h, ref } from 'vue';
import ExSelect from '../../../src/components/select/ExSelect.vue';
import type { SelectOption } from '../../../src/components/select/types';
import { useSelectOptions } from '../../../src/components/select/use-select-options';

describe('选择器的内容扩展和大数据查询', () => {
  let wrapper: ReturnType<typeof mount> | undefined;

  afterEach(() => {
    wrapper?.unmount();
    document.body.innerHTML = '';
  });

  it.each([false, true])('virtual=%s 的选项和分组插槽共享同一选择契约', async virtual => {
    wrapper = mount(ExSelect, {
      props: {
        virtual,
        options: [
          { label: '研发', options: [{ value: 'user', label: '张三', department: '平台' }] },
        ],
      },
      slots: {
        option: ({ option, index, selected }) =>
          h('span', { class: 'person-option' }, `${index}:${option.department}:${selected}`),
        group: ({ group }) => h('strong', group.label),
      },
      attachTo: document.body,
    });
    await wrapper.find('.ex-select__trigger').trigger('click');
    const option = document.querySelector<HTMLElement>('.ex-select__option')!;
    expect(option.textContent).toContain('0:平台:false');
    expect(document.querySelector('.ex-select__group strong')?.textContent).toBe('研发');
    option.click();
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['user']);
  });

  it('多选标签插槽保留组件的移除操作', async () => {
    wrapper = mount(ExSelect, {
      props: { multiple: true, modelValue: ['user'], options: [{ value: 'user', label: '张三' }] },
      slots: { tag: ({ option }) => h('strong', `用户：${option.label}`) },
    });
    expect(wrapper.find('.ex-select__tag-label').text()).toBe('用户：张三');
    await wrapper.find('.ex-select__tag-close').trigger('click');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([[]]);
  });

  it.each([false, true])('virtual=%s 重排同名分组时保留有稳定标识的插槽实例', async virtual => {
    let created = 0;
    const Marker = defineComponent({
      setup() {
        const identity = ++created;
        return () => h('span', { class: 'option-marker' }, String(identity));
      },
    });
    const first = { key: 'a', label: '同名部门', options: [{ value: 'a', label: '甲' }] };
    const second = { key: 'b', label: '同名部门', options: [{ value: 'b', label: '乙' }] };
    wrapper = mount(ExSelect, {
      props: { virtual, options: [first, second] },
      slots: { option: () => h(Marker) },
    });
    await wrapper.find('.ex-select__trigger').trigger('click');
    expect(created).toBe(2);
    await wrapper.setProps({ options: [second, first] });
    expect(created).toBe(2);
    expect(
      Array.from(document.querySelectorAll('.option-marker'), node => node.textContent)
    ).toEqual(['2', '1']);
  });

  it('千级分组数据保持窗口渲染，End 导航使用包含标题的展示行索引', async () => {
    const groups = Array.from({ length: 20 }, (_, group) => ({
      label: `分组${group}`,
      options: Array.from({ length: 100 }, (_, index) => ({
        value: group * 100 + index,
        label: `选项${group * 100 + index}`,
      })),
    }));
    wrapper = mount(ExSelect, { props: { virtual: true, options: groups } });
    await wrapper.find('.ex-select__trigger').trigger('click');
    expect(document.querySelectorAll('.ex-select__option').length).toBeLessThan(100);
    const scrollTo = vi.fn();
    document.querySelector<HTMLElement>('.ex-virtual-list__wrapper')!.scrollTo = scrollTo;
    await wrapper.find('.ex-select__trigger').trigger('keydown', { key: 'End' });
    expect(scrollTo).toHaveBeenCalledWith({ top: (2020 - 1) * 44, behavior: 'auto' });
    await wrapper.find('.ex-select__trigger').trigger('keydown', { key: 'Enter' });
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([1999]);
  });

  it('连续查询全部选项的索引与选中项时，读取次数随选项数线性增长', () => {
    let reads = 0;
    const count = 2000;
    const options: SelectOption[] = Array.from({ length: count }, (_, index) => ({
      get value() {
        reads += 1;
        return index;
      },
      label: String(index),
    }));
    const scope = effectScope();
    try {
      scope.run(() => {
        const data = useSelectOptions({ options, multiple: true }, ref(''));
        data.getOptionIndex(options[0]!);
        reads = 0;
        options.forEach((option, index) => {
          expect(data.getOptionIndex(option)).toBe(index);
          expect(data.getOptionByValue(index)).toBe(option);
          expect(data.isSelected(option)).toBe(false);
        });
        expect(reads).toBeLessThanOrEqual(count * 2);
      });
    } finally {
      scope.stop();
    }
  });
});
