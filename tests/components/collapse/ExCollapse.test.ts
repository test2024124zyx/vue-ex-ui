import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { h } from 'vue';
import ExCollapse from '../../../src/components/collapse/ExCollapse.vue';
import ExCollapseItem from '../../../src/components/collapse/ExCollapseItem.vue';
import type { ExCollapseExposed } from '../../../src/components/collapse/types';

const items = () => [
  h(ExCollapseItem, { name: 'a', title: 'Title A' }, () => 'Content A'),
  h(ExCollapseItem, { name: 'b', title: 'Title B' }, () => 'Content B'),
];

const toArray = (v: unknown) => (Array.isArray(v) ? v : [v]);

describe('ExCollapse', () => {
  it('使用原生按钮渲染标题，并以分组语义组织面板', () => {
    const wrapper = mount(ExCollapse, {
      props: { modelValue: [] },
      slots: { default: items },
    });
    const headers = wrapper.findAll('.ex-collapse-item__header');
    expect(headers.length).toBe(2);
    expect(headers.every(header => header.element.tagName === 'BUTTON')).toBe(true);
    expect(wrapper.attributes('role')).toBe('group');
    expect(wrapper.text()).toContain('Title A');
    expect(wrapper.text()).toContain('Title B');
  });

  it('额外操作位于折叠按钮之外，点击时不会切换面板', async () => {
    const wrapper = mount(ExCollapse, {
      slots: {
        default: () =>
          h(
            ExCollapseItem,
            { name: 'a', title: 'Title A' },
            {
              default: () => 'Content A',
              extra: () => h('button', { class: 'extra-action' }, 'Action'),
            }
          ),
      },
    });
    const header = wrapper.find('.ex-collapse-item__header');
    const action = wrapper.find('.extra-action');

    expect(header.element.contains(action.element)).toBe(false);
    await action.trigger('click');
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  });

  it('禁用项使用原生 disabled 状态并退出键盘顺序', () => {
    const wrapper = mount(ExCollapse, {
      slots: {
        default: () => h(ExCollapseItem, { name: 'a', title: 'Disabled', disabled: true }),
      },
    });
    const header = wrapper.find('.ex-collapse-item__header');
    expect(header.attributes('disabled')).toBeDefined();
    expect(header.attributes('tabindex')).toBe('-1');
  });

  it('emits update:modelValue and change when a header is clicked', async () => {
    const wrapper = mount(ExCollapse, {
      props: { modelValue: [] },
      slots: { default: items },
    });
    await wrapper.findAll('.ex-collapse-item__header')[0].trigger('click');
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(toArray(wrapper.emitted('update:modelValue')!.at(-1)![0])).toContain('a');
    expect(wrapper.emitted('change')).toBeTruthy();
  });

  it('allows multiple panels open by default', async () => {
    const wrapper = mount(ExCollapse, {
      props: { modelValue: ['a'] },
      slots: { default: items },
    });
    await wrapper.findAll('.ex-collapse-item__header')[1].trigger('click');
    const val = toArray(wrapper.emitted('update:modelValue')!.at(-1)![0]);
    expect(val).toContain('a');
    expect(val).toContain('b');
  });

  it('accordion mode keeps only one panel open', async () => {
    const wrapper = mount(ExCollapse, {
      props: { modelValue: ['a'], accordion: true },
      slots: { default: items },
    });
    await wrapper.findAll('.ex-collapse-item__header')[1].trigger('click');
    const val = toArray(wrapper.emitted('update:modelValue')!.at(-1)![0]).filter(Boolean);
    expect(val).toContain('b');
    expect(val).not.toContain('a');
  });

  it('保留数值 0 名称并能正常展开与收起', async () => {
    const wrapper = mount(ExCollapse, {
      props: { modelValue: 0 },
      slots: {
        default: () => h(ExCollapseItem, { name: 0, title: 'Zero' }, () => 'Content'),
      },
    });

    expect(wrapper.find('.ex-collapse-item').classes()).toContain('is-active');
    await wrapper.find('.ex-collapse-item__header').trigger('click');
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([[]]);
  });

  it('手风琴模式用 null 表示全部关闭且初始化时只保留第一项', async () => {
    const wrapper = mount(ExCollapse, {
      props: { modelValue: ['a', 'b'], accordion: true },
      slots: { default: items },
    });

    expect(wrapper.findAll('.ex-collapse-item.is-active')).toHaveLength(1);
    await wrapper.findAll('.ex-collapse-item__header')[0].trigger('click');
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([null]);
  });

  it('规范化重复激活项，后续切换不会继续传播重复值', async () => {
    const wrapper = mount(ExCollapse, {
      props: { modelValue: ['a', 'a'] },
      slots: { default: items },
    });

    await wrapper.findAll('.ex-collapse-item__header')[1].trigger('click');
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['a', 'b']]);
  });

  it('setActiveNames 遵守手风琴约束并同步事件', () => {
    const wrapper = mount(ExCollapse, {
      props: { modelValue: null, accordion: true },
      slots: { default: items },
    });
    const exposed = wrapper.vm as unknown as ExCollapseExposed;

    exposed.setActiveNames(['b', 'a']);

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['b']);
    expect(wrapper.emitted('change')?.at(-1)).toEqual(['b']);
  });

  it('折叠项脱离容器使用时明确抛出错误', () => {
    expect(() => mount(ExCollapseItem, { props: { name: 'orphan' } })).toThrow(
      'ExCollapseItem 必须作为 ExCollapse 的子组件使用'
    );
  });

  it('拒绝重复 name，避免状态联动与 ARIA 标识冲突', () => {
    expect(() =>
      mount(ExCollapse, {
        slots: {
          default: () => [
            h(ExCollapseItem, { name: 'same', title: 'A' }),
            h(ExCollapseItem, { name: 'same', title: 'B' }),
          ],
        },
      })
    ).toThrow('ExCollapseItem 的 name 必须唯一：same');
  });
});
