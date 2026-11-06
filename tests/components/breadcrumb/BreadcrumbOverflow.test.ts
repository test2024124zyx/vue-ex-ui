import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { h } from 'vue';
import ExBreadcrumb from '../../../src/components/breadcrumb/ExBreadcrumb.vue';

describe('面包屑折叠与导航边界', () => {
  it('折叠导航保留原始索引并将图标与分隔符传给首尾项目', async () => {
    const items = Array.from({ length: 5 }, (_, index) => ({
      label: `第${index}级`,
      path: `#level-${index}`,
    }));
    const wrapper = mount(ExBreadcrumb, {
      props: { items, maxItems: 3 },
      slots: {
        icon: ({ index }: { index: number }) => h('i', { class: 'path-icon' }, String(index)),
        separator: () => h('span', { class: 'path-divider' }, '→'),
      },
    });
    expect(wrapper.findAll('.path-icon').map(icon => icon.text())).toEqual(['0', '3', '4']);
    expect(wrapper.findAll('.path-divider')).toHaveLength(3);
    await wrapper.findAll('a')[1]!.trigger('click');
    expect(wrapper.emitted('click')?.at(-1)).toEqual([items[3], 3]);
    await wrapper.setProps({ maxItems: 10 });
    expect(wrapper.find('.ex-breadcrumb__ellipsis').exists()).toBe(false);
    expect(wrapper.findAll('.path-icon')).toHaveLength(5);
    await wrapper.setProps({ clickable: false });
    expect(wrapper.find('a').exists()).toBe(false);
    wrapper.unmount();
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY, 2.9])(
    '异常数量 %s 不丢失首尾导航且空数据可恢复',
    async maxItems => {
      const wrapper = mount(ExBreadcrumb, {
        props: {
          maxItems,
          separator: '',
          items: [{ label: '根', path: '#root' }, { label: '中间' }, { label: '当前' }],
        },
      });
      expect(wrapper.findAll('.ex-breadcrumb-item')).toHaveLength(2);
      expect(wrapper.get('[aria-current="page"]').text()).toBe('当前');
      await wrapper.setProps({ items: [] });
      expect(wrapper.find('.ex-breadcrumb__ellipsis').exists()).toBe(false);
      wrapper.unmount();
    }
  );
});
