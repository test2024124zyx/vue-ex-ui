import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ExPanel from '../../../src/components/panel/ExPanel.vue';

describe('ExPanel', () => {
  it('renders root element', () => {
    const wrapper = mount(ExPanel);
    expect(wrapper.find('.ex-panel').exists()).toBe(true);
  });

  it('renders the title prop', () => {
    const wrapper = mount(ExPanel, { props: { title: '面板标题' } });
    expect(wrapper.find('.ex-panel__header').exists()).toBe(true);
    expect(wrapper.text()).toContain('面板标题');
  });

  it('renders default slot into the body', () => {
    const wrapper = mount(ExPanel, {
      slots: { default: '<p class="inner">body content</p>' },
    });
    expect(wrapper.find('.ex-panel__body .inner').exists()).toBe(true);
  });

  it('applies the loading modifier', () => {
    const wrapper = mount(ExPanel, { props: { loading: true } });
    expect(wrapper.find('.ex-panel--loading').exists()).toBe(true);
  });

  it('renders the footer slot', () => {
    const wrapper = mount(ExPanel, {
      slots: { footer: '<span class="foot">footer</span>' },
    });
    expect(wrapper.find('.ex-panel__footer .foot').exists()).toBe(true);
  });
});
