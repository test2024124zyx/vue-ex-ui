import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ExImage from '@/components/image/ExImage.vue';

describe('ExImage', () => {
  it('renders with required alt and src', () => {
    const wrapper = mount(ExImage, {
      props: { src: 'https://example.com/test.png', alt: 'test image' }
    });
    const img = wrapper.find('img');
    expect(img.exists()).toBe(true);
    expect(img.attributes('alt')).toBe('test image');
  });

  it('emits load when image load event fires', async () => {
    const wrapper = mount(ExImage, {
      props: { src: 'https://example.com/test.png', alt: 'img' }
    });
    const img = wrapper.find('img');
    // 触发原生 load 事件（jsdom 中手动派发）
    img.element.dispatchEvent(new Event('load'));
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted('load')).toBeTruthy();
  });

  it('shows error slot and emits error on failure', async () => {
    const wrapper = mount(ExImage, {
      props: { src: 'https://invalid.local/error.png', alt: 'img' },
      slots: {
        error: '<div class="err">failed</div>'
      }
    });
    const img = wrapper.find('img');
    img.element.dispatchEvent(new Event('error'));
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted('error')).toBeTruthy();
    expect(wrapper.find('.err').exists()).toBe(true);
  });

  it('renders placeholder slot while loading', async () => {
    const wrapper = mount(ExImage, {
      props: { src: 'https://example.com/slow.png', alt: 'img' },
      slots: { placeholder: '<div class="ph">loading...</div>' }
    });
    // 初始 src 存在时状态应为 loading，placeholder 可见
    expect(wrapper.find('.ph').exists()).toBe(true);
  });

  it('supports object-fit via fit prop', () => {
    const wrapper = mount(ExImage, {
      props: { src: 'x.png', alt: 'img', fit: 'contain' }
    });
    const img = wrapper.find('img');
    expect(img.attributes('style')).toContain('object-fit: contain;');
  });
});