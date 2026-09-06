import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import ExSelect from '../../../src/components/select/ExSelect.vue';
import type { SelectOptions } from '../../../src/components/select/types';

describe('ExSelect 虚拟滚动', () => {
  const bigOptions: SelectOptions = Array.from({ length: 1000 }, (_, i) => ({
    value: i,
    label: `选项 ${i}`,
  }));

  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('virtual=false 时全量渲染所有选项', async () => {
    const wrapper = mount(ExSelect, { props: { options: bigOptions } });
    await wrapper.find('.ex-select__trigger').trigger('click');
    await nextTick();
    expect(document.querySelector('.ex-select__options--virtual')).toBeNull();
    expect(document.querySelectorAll('.ex-select__option').length).toBe(1000);
    wrapper.unmount();
  });

  it('virtual=true 时仅渲染可视窗口内的选项（远少于总数）', async () => {
    const wrapper = mount(ExSelect, { props: { options: bigOptions, virtual: true } });
    await wrapper.find('.ex-select__trigger').trigger('click');
    await nextTick();
    expect(document.querySelector('.ex-select__options--virtual')).not.toBeNull();
    const rendered = document.querySelectorAll('.ex-select__option').length;
    expect(rendered).toBeGreaterThan(0);
    expect(rendered).toBeLessThan(100);
    wrapper.unmount();
  });

  it('分组选项参与虚拟滚动，标题不参与键盘选择', async () => {
    const grouped: SelectOptions = [
      { label: '分组A', options: [{ value: 'a1', label: 'A1' }] },
      { label: '分组B', options: [{ value: 'b1', label: 'B1' }] },
    ];
    const wrapper = mount(ExSelect, { props: { options: grouped, virtual: true } });
    await wrapper.find('.ex-select__trigger').trigger('click');
    await nextTick();
    expect(document.querySelector('.ex-select__options--virtual')).not.toBeNull();
    expect(document.querySelectorAll('.ex-select__group')).toHaveLength(2);
    document.querySelector<HTMLElement>('.ex-virtual-list__wrapper')!.scrollTo = vi.fn();
    await wrapper.find('.ex-select__trigger').trigger('keydown', { key: 'ArrowDown' });
    await wrapper.find('.ex-select__trigger').trigger('keydown', { key: 'Enter' });
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['a1']);
    wrapper.unmount();
  });

  it('虚拟滚动下仍可选中选项', async () => {
    const wrapper = mount(ExSelect, { props: { options: bigOptions, virtual: true } });
    await wrapper.find('.ex-select__trigger').trigger('click');
    await nextTick();
    const first = document.querySelector('.ex-select__option') as HTMLElement;
    first.click();
    await nextTick();
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    wrapper.unmount();
  });
});
