import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ExEmpty from '../../../src/components/empty/ExEmpty.vue';

describe('ExEmpty', () => {
  it('renders root element', () => {
    const wrapper = mount(ExEmpty);
    expect(wrapper.find('.ex-empty').exists()).toBe(true);
  });

  it('renders the description prop', () => {
    const wrapper = mount(ExEmpty, { props: { description: '暂无数据' } });
    expect(wrapper.find('.ex-empty__description').text()).toBe('暂无数据');
  });

  it('hides the built-in illustration when showImage is false', () => {
    const wrapper = mount(ExEmpty, { props: { showImage: false } });
    expect(wrapper.find('.ex-empty__svg').exists()).toBe(false);
  });

  it('renders the default slot (footer/extra content)', () => {
    const wrapper = mount(ExEmpty, {
      slots: { default: '<button class="my-action">refresh</button>' },
    });
    expect(wrapper.find('.my-action').exists()).toBe(true);
  });

  it('renders a custom description via slot over the prop', () => {
    const wrapper = mount(ExEmpty, {
      props: { description: 'prop text' },
      slots: { description: '<span class="custom-desc">slot text</span>' },
    });
    expect(wrapper.find('.custom-desc').exists()).toBe(true);
  });
});
