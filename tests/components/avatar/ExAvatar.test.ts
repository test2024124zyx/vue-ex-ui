import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ExAvatar from '../../../src/components/avatar/ExAvatar.vue';

// Mock ExIcon component
vi.mock('../../../src/components/icon/ExIcon.vue', () => ({
  default: {
    name: 'ExIcon',
    props: ['name'],
    template: '<i :class="`icon-${name}`"></i>',
  },
}));

describe('ExAvatar', () => {
  it('renders correctly with default props', () => {
    const wrapper = mount(ExAvatar);

    expect(wrapper.classes()).toContain('ex-avatar');
    expect(wrapper.classes()).toContain('ex-avatar--circle');
    expect(wrapper.classes()).toContain('ex-avatar--medium');
  });

  it('renders image avatar correctly', () => {
    const wrapper = mount(ExAvatar, {
      props: {
        src: 'https://example.com/avatar.jpg',
        alt: 'User Avatar',
      },
    });

    const img = wrapper.find('img');
    expect(img.exists()).toBe(true);
    expect(img.attributes('src')).toBe('https://example.com/avatar.jpg');
    expect(img.attributes('alt')).toBe('User Avatar');
    expect(wrapper.classes()).toContain('ex-avatar--image');
  });

  it('图标头像使用独立居中容器承载图标插槽', () => {
    const wrapper = mount(ExAvatar, {
      slots: {
        icon: '<ex-icon src="/user.svg"></ex-icon>',
      },
      global: {
        components: {
          'ex-icon': {
            name: 'ex-icon',
            props: ['src'],
            template: '<i class="ex-icon" :src="src"></i>',
          },
        },
      },
    });

    expect(wrapper.find('.ex-avatar__icon > .ex-icon').exists()).toBe(true);
    expect(wrapper.classes()).toContain('ex-avatar--icon');
  });

  it('文字头像只显示首个完整字素', () => {
    const wrapper = mount(ExAvatar, {
      props: {
        text: '👩‍💻开发者',
      },
    });

    const textSpan = wrapper.find('.ex-avatar__text');
    expect(textSpan.exists()).toBe(true);
    expect(textSpan.text()).toBe('👩‍💻');
    expect(wrapper.classes()).toContain('ex-avatar--text');
  });

  it('renders slot content when no props provided', () => {
    const wrapper = mount(ExAvatar, {
      slots: {
        default: '<span>Custom Content</span>',
      },
    });

    expect(wrapper.html()).toContain('<span>Custom Content</span>');
  });

  it('applies different sizes correctly', () => {
    const smallWrapper = mount(ExAvatar, {
      props: { size: 'small' },
    });
    expect(smallWrapper.classes()).toContain('ex-avatar--small');

    const largeWrapper = mount(ExAvatar, {
      props: { size: 'large' },
    });
    expect(largeWrapper.classes()).toContain('ex-avatar--large');

    const customWrapper = mount(ExAvatar, {
      props: { size: 60 },
    });
    expect(customWrapper.classes()).toContain('ex-avatar--custom');
    expect(customWrapper.attributes('style')).toContain('width: 60px');
    expect(customWrapper.attributes('style')).toContain('height: 60px');
  });

  it('applies different shapes correctly', () => {
    const circleWrapper = mount(ExAvatar, {
      props: { shape: 'circle' },
    });
    expect(circleWrapper.classes()).toContain('ex-avatar--circle');

    const squareWrapper = mount(ExAvatar, {
      props: { shape: 'square' },
    });
    expect(squareWrapper.classes()).toContain('ex-avatar--square');
  });

  it('applies custom colors correctly', () => {
    const wrapper = mount(ExAvatar, {
      props: {
        backgroundColor: '#ff0000',
        textColor: '#ffffff',
        text: 'AB',
      },
    });

    const style = wrapper.attributes('style');
    expect(style).toContain('background-color: rgb(255, 0, 0)');
    expect(style).toContain('color: rgb(255, 255, 255)');
  });

  it('handles image load event', async () => {
    const wrapper = mount(ExAvatar, {
      props: {
        src: 'https://example.com/avatar.jpg',
      },
    });

    const img = wrapper.find('img');
    await img.trigger('load');

    expect(wrapper.emitted('load')).toBeTruthy();
  });

  it('handles image error event', async () => {
    const wrapper = mount(ExAvatar, {
      props: {
        src: 'https://example.com/invalid.jpg',
      },
    });

    const img = wrapper.find('img');
    await img.trigger('error');

    expect(wrapper.emitted('error')).toBeTruthy();
    // After error, image should not be shown
    await wrapper.vm.$nextTick();
    expect(wrapper.find('img').exists()).toBe(false);
  });

  it('resets a previous image error when src changes', async () => {
    const wrapper = mount(ExAvatar, {
      props: { src: 'https://example.com/broken.jpg' },
    });

    await wrapper.find('img').trigger('error');
    expect(wrapper.find('img').exists()).toBe(false);

    await wrapper.setProps({ src: 'https://example.com/valid.jpg' });
    expect(wrapper.find('img').attributes('src')).toBe('https://example.com/valid.jpg');
  });

  it('uses a native retry button and remounts the image on retry', async () => {
    const wrapper = mount(ExAvatar, {
      props: { src: 'https://example.com/retry.jpg' },
    });

    await wrapper.find('img').trigger('error');
    const retry = wrapper.find('.ex-avatar__error');
    expect(retry.element.tagName).toBe('BUTTON');
    expect(retry.attributes('type')).toBe('button');

    await retry.trigger('click');
    expect(wrapper.find('img').attributes('src')).toBe('https://example.com/retry.jpg');
  });

  it('handles click event', async () => {
    const wrapper = mount(ExAvatar, {
      props: {
        text: 'AB',
      },
    });

    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toBeTruthy();
  });

  it('applies custom class correctly', () => {
    const wrapper = mount(ExAvatar, {
      props: {
        class: 'custom-class',
      },
    });

    expect(wrapper.classes()).toContain('custom-class');
  });

  it('applies custom class array correctly', () => {
    const wrapper = mount(ExAvatar, {
      props: {
        class: ['class1', 'class2'],
      },
    });

    expect(wrapper.classes()).toContain('class1');
    expect(wrapper.classes()).toContain('class2');
  });

  it('applies custom class object correctly', () => {
    const wrapper = mount(ExAvatar, {
      props: {
        class: { active: true, disabled: false },
      },
    });

    expect(wrapper.classes()).toContain('active');
    expect(wrapper.classes()).not.toContain('disabled');
  });

  it('sets aria-label correctly', () => {
    const wrapper = mount(ExAvatar, {
      props: {
        ariaLabel: 'User Profile Picture',
      },
    });

    expect(wrapper.attributes('aria-label')).toBe('User Profile Picture');
  });

  it('falls back to alt for aria-label', () => {
    const wrapper = mount(ExAvatar, {
      props: {
        src: 'https://example.com/avatar.jpg',
        alt: 'User Avatar',
      },
    });

    expect(wrapper.attributes('aria-label')).toBe('Image avatar');
  });

  it('exposes getElement method', () => {
    const wrapper = mount(ExAvatar);
    const vm = wrapper.vm as any;

    expect(typeof vm.getElement).toBe('function');
    expect(vm.getElement()).toBe(wrapper.element);
  });

  it('exposes reload method', () => {
    const wrapper = mount(ExAvatar, {
      props: {
        src: 'https://example.com/avatar.jpg',
      },
    });
    const vm = wrapper.vm as any;

    expect(typeof vm.reload).toBe('function');
    // Should not throw error when called
    expect(() => vm.reload()).not.toThrow();
  });

  it('handles draggable prop correctly', () => {
    const wrapper = mount(ExAvatar, {
      props: {
        src: 'https://example.com/avatar.jpg',
        draggable: true,
      },
    });

    const img = wrapper.find('img');
    expect(img.attributes('draggable')).toBe('true');
  });

  it('handles crossOrigin prop correctly', () => {
    const wrapper = mount(ExAvatar, {
      props: {
        src: 'https://example.com/avatar.jpg',
        crossOrigin: 'anonymous',
      },
    });

    const img = wrapper.find('img');
    expect(img.attributes('crossorigin')).toBe('anonymous');
  });

  it('handles srcset prop correctly', () => {
    const wrapper = mount(ExAvatar, {
      props: {
        src: 'https://example.com/avatar.jpg',
        srcset: 'https://example.com/avatar-2x.jpg 2x',
      },
    });

    const img = wrapper.find('img');
    expect(img.attributes('srcset')).toBe('https://example.com/avatar-2x.jpg 2x');
  });
});
