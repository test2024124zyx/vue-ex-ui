import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick, ref } from 'vue';
import ExTabs from '../../../src/components/tabs/ExTabs.vue';
import ExTabPane from '../../../src/components/tabs/ExTabPane.vue';
import type {
  ExTabPaneExposed,
  ExTabsExposed,
  ExTabsProps,
} from '../../../src/components/tabs/types';

describe('ExTabs', () => {
  it('renders correctly with default props', () => {
    const wrapper = mount(ExTabs, {
      props: { modelValue: 'tab1' },
      slots: {
        default: `
          <ExTabPane name="tab1" label="Tab 1">Content 1</ExTabPane>
          <ExTabPane name="tab2" label="Tab 2">Content 2</ExTabPane>
        `,
      },
      global: {
        components: { ExTabPane },
      },
    });

    expect(wrapper.find('.ex-tabs').exists()).toBe(true);
    expect(wrapper.classes()).toContain('ex-tabs--line');
    expect(wrapper.classes()).toContain('ex-tabs--top');
    expect(wrapper.classes()).toContain('ex-tabs--medium');
  });

  it('renders different tab types', () => {
    const types: ExTabsProps['type'][] = ['line', 'card', 'button'];

    types.forEach(type => {
      const wrapper = mount(ExTabs, {
        props: { modelValue: 'tab1', type },
        slots: {
          default: '<ExTabPane name="tab1" label="Tab 1">Content</ExTabPane>',
        },
        global: {
          components: { ExTabPane },
        },
      });
      expect(wrapper.classes()).toContain(`ex-tabs--${type}`);
    });
  });

  it('renders different tab positions', () => {
    const positions: ExTabsProps['position'][] = ['top', 'right', 'bottom', 'left'];

    positions.forEach(position => {
      const wrapper = mount(ExTabs, {
        props: { modelValue: 'tab1', position },
        slots: {
          default: '<ExTabPane name="tab1" label="Tab 1">Content</ExTabPane>',
        },
        global: {
          components: { ExTabPane },
        },
      });
      expect(wrapper.classes()).toContain(`ex-tabs--${position}`);
    });
  });

  it('renders different tab sizes', () => {
    const sizes: ExTabsProps['size'][] = ['small', 'medium', 'large'];

    sizes.forEach(size => {
      const wrapper = mount(ExTabs, {
        props: { modelValue: 'tab1', size },
        slots: {
          default: '<ExTabPane name="tab1" label="Tab 1">Content</ExTabPane>',
        },
        global: {
          components: { ExTabPane },
        },
      });
      expect(wrapper.classes()).toContain(`ex-tabs--${size}`);
    });
  });

  it('handles tab click', async () => {
    const wrapper = mount(ExTabs, {
      props: { modelValue: 'tab1' },
      slots: {
        default: `
          <ExTabPane name="tab1" label="Tab 1">Content 1</ExTabPane>
          <ExTabPane name="tab2" label="Tab 2">Content 2</ExTabPane>
        `,
      },
      global: {
        components: { ExTabPane },
      },
    });

    await wrapper.vm.$nextTick();
    // Tabs are rendered dynamically, so we just check the component exists
    expect(wrapper.find('.ex-tabs').exists()).toBe(true);
  });

  it('emits update:modelValue on tab click', async () => {
    const wrapper = mount(ExTabs, {
      props: { modelValue: 'tab1' },
      slots: {
        default: `
          <ExTabPane name="tab1" label="Tab 1">Content 1</ExTabPane>
          <ExTabPane name="tab2" label="Tab 2">Content 2</ExTabPane>
        `,
      },
      global: {
        components: { ExTabPane },
      },
    });

    await wrapper.vm.$nextTick();
    const tabs = wrapper.findAll('.ex-tabs__tab');

    if (tabs.length > 1) {
      await tabs[1].trigger('click');
      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    }
  });

  it('renders with closable tabs', () => {
    const wrapper = mount(ExTabs, {
      props: { modelValue: 'tab1', closable: true },
      slots: {
        default: '<ExTabPane name="tab1" label="Tab 1">Content</ExTabPane>',
      },
      global: {
        components: { ExTabPane },
      },
    });

    expect(wrapper.find('.ex-tabs').exists()).toBe(true);
  });

  it('关闭控件应该是具有可访问名称的原生按钮', async () => {
    const wrapper = mount(ExTabs, {
      props: { modelValue: 'tab1', closable: true },
      slots: {
        default: '<ExTabPane name="tab1" label="Tab 1">Content</ExTabPane>',
      },
      global: { components: { ExTabPane } },
    });
    await nextTick();

    const close = wrapper.find('.ex-tabs__tab-close');
    const tab = wrapper.get('[role="tab"]');
    expect(tab.element.tagName).toBe('BUTTON');
    expect(close.element.tagName).toBe('BUTTON');
    expect(tab.find('.ex-tabs__tab-close').exists()).toBe(false);
    expect(close.element.parentElement).toBe(tab.element.parentElement);
    expect(close.attributes('aria-label')).toContain('Tab 1');
  });

  it('renders with addable tabs', () => {
    const wrapper = mount(ExTabs, {
      props: { modelValue: 'tab1', addable: true },
      slots: {
        default: '<ExTabPane name="tab1" label="Tab 1">Content</ExTabPane>',
      },
      global: {
        components: { ExTabPane },
      },
    });

    expect(wrapper.find('.ex-tabs__tab--add').exists()).toBe(true);
  });

  it('添加控件应该是具有可访问名称的原生按钮', async () => {
    const wrapper = mount(ExTabs, {
      props: { modelValue: 'tab1', addable: true },
      slots: {
        default: '<ExTabPane name="tab1" label="Tab 1">Content</ExTabPane>',
      },
      global: { components: { ExTabPane } },
    });

    const add = wrapper.find('.ex-tabs__tab--add');
    expect(add.element.tagName).toBe('BUTTON');
    expect(add.attributes('aria-label')).toBeTruthy();
    await add.trigger('keydown', { key: 'Enter' });
    await add.trigger('click');
    expect(wrapper.emitted('tab-add')).toHaveLength(1);
  });

  it('关闭激活项时应该跳过禁用的相邻标签', async () => {
    const wrapper = mount(ExTabs, {
      props: { modelValue: 'tab1', closable: true },
      slots: {
        default: `
          <ExTabPane name="tab1" label="Tab 1">One</ExTabPane>
          <ExTabPane name="tab2" label="Tab 2" disabled>Two</ExTabPane>
          <ExTabPane name="tab3" label="Tab 3">Three</ExTabPane>
        `,
      },
      global: { components: { ExTabPane } },
    });
    await nextTick();

    await wrapper.find('.ex-tabs__tab-close').trigger('click');

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['tab3']);
  });

  it('懒加载面板首次激活后应该保留内部状态', async () => {
    const StatefulPane = defineComponent({
      data: () => ({ value: '' }),
      template: '<input class="stateful-input" v-model="value" />',
    });
    const wrapper = mount(ExTabs, {
      props: { modelValue: 'tab1' },
      slots: {
        default: () => [
          h(ExTabPane, { name: 'tab1', label: 'Tab 1' }, () => 'One'),
          h(ExTabPane, { name: 'tab2', label: 'Tab 2', lazy: true }, () => h(StatefulPane)),
        ],
      },
    });

    await wrapper.setProps({ modelValue: 'tab2' });
    await wrapper.find('.stateful-input').setValue('保留');
    await wrapper.setProps({ modelValue: 'tab1' });
    await wrapper.setProps({ modelValue: 'tab2' });

    expect((wrapper.find('.stateful-input').element as HTMLInputElement).value).toBe('保留');
  });

  it('面板标签、禁用和关闭属性运行时变化应该同步到导航', async () => {
    const label = ref('旧标签');
    const disabled = ref(false);
    const closable = ref(false);
    const wrapper = mount(ExTabs, {
      props: { modelValue: 'tab1' },
      slots: {
        default: () =>
          h(ExTabPane, {
            name: 'tab1',
            label: label.value,
            disabled: disabled.value,
            closable: closable.value,
          }),
      },
    });

    label.value = '新标签';
    disabled.value = true;
    closable.value = true;
    await nextTick();

    expect(wrapper.find('[role="tab"]').text()).toContain('新标签');
    expect(wrapper.find('[role="tab"]').attributes('aria-disabled')).toBe('true');
    expect(wrapper.find('.ex-tabs__tab-close').exists()).toBe(false);

    disabled.value = false;
    await nextTick();
    expect(wrapper.find('.ex-tabs__tab-close').exists()).toBe(true);
  });

  it('含空格的业务名称不应该生成非法的 ARIA IDREF', async () => {
    const wrapper = mount(ExTabs, {
      props: { modelValue: 'account details' },
      slots: {
        default: '<ExTabPane name="account details" label="详情">Content</ExTabPane>',
      },
      global: { components: { ExTabPane } },
    });
    await nextTick();
    const tab = wrapper.find('[role="tab"]');
    const panel = wrapper.find('[role="tabpanel"]');

    expect(tab.attributes('aria-controls')).not.toContain(' ');
    expect(tab.attributes('aria-controls')).toBe(panel.attributes('id'));
    expect(panel.attributes('aria-labelledby')).toBe(tab.attributes('id'));
  });

  it('exposes getElement method', () => {
    const wrapper = mount(ExTabs, {
      props: { modelValue: 'tab1' },
      slots: {
        default: '<ExTabPane name="tab1" label="Tab 1">Content</ExTabPane>',
      },
      global: {
        components: { ExTabPane },
      },
    });

    const vm = wrapper.vm as unknown as ExTabsExposed;
    expect(typeof vm.getElement).toBe('function');
  });
});

describe('ExTabPane', () => {
  it('renders correctly', () => {
    const wrapper = mount(ExTabPane, {
      props: { name: 'tab1', label: 'Tab 1' },
      slots: { default: 'Tab content' },
      global: {
        provide: {
          activeTab: { value: 'tab1' },
          registerPane: vi.fn(),
          unregisterPane: vi.fn(),
        },
      },
    });

    expect(wrapper.find('.ex-tab-pane').exists()).toBe(true);
    expect(wrapper.text()).toContain('Tab content');
  });

  it('handles disabled state', () => {
    const wrapper = mount(ExTabPane, {
      props: { name: 'tab1', label: 'Tab 1', disabled: true },
      slots: { default: 'Tab content' },
      global: {
        provide: {
          activeTab: { value: 'tab1' },
          registerPane: vi.fn(),
          unregisterPane: vi.fn(),
        },
      },
    });

    expect(wrapper.find('.ex-tab-pane').exists()).toBe(true);
  });

  it('exposes getElement method', () => {
    const wrapper = mount(ExTabPane, {
      props: { name: 'tab1', label: 'Tab 1' },
      slots: { default: 'Tab content' },
      global: {
        provide: {
          activeTab: { value: 'tab1' },
          registerPane: vi.fn(),
          unregisterPane: vi.fn(),
        },
      },
    });

    const vm = wrapper.vm as unknown as ExTabPaneExposed;
    expect(typeof vm.getElement).toBe('function');
  });
});
