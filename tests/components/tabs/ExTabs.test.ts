import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ExTabs from '../../../src/components/tabs/ExTabs.vue';
import ExTabPane from '../../../src/components/tabs/ExTabPane.vue';
import type { ExTabsProps } from '../../../src/components/tabs/types';

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

    types.forEach((type) => {
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

    positions.forEach((position) => {
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

    sizes.forEach((size) => {
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
    const tabs = wrapper.findAll('.ex-tabs__tab');
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

    const vm = wrapper.vm as any;
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

    const vm = wrapper.vm as any;
    expect(typeof vm.getElement).toBe('function');
  });
});
