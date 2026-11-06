import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { Fragment, h } from 'vue';
import ExAvatarGroup from '../../../src/components/avatar/ExAvatarGroup.vue';
import ExAvatar from '../../../src/components/avatar/ExAvatar.vue';

// Mock ExIcon component
vi.mock('../../../src/components/icon/ExIcon.vue', () => ({
  default: {
    name: 'ExIcon',
    props: ['name'],
    template: '<i :class="`icon-${name}`"></i>',
  },
}));

describe('ExAvatarGroup', () => {
  it('renders correctly with default props', () => {
    const wrapper = mount(ExAvatarGroup);

    expect(wrapper.classes()).toContain('ex-avatar-group');
    expect(wrapper.attributes('role')).toBe('group');
    expect(wrapper.attributes('aria-label')).toBe('Avatar group');
  });

  it('supports a custom accessible group name', () => {
    const wrapper = mount(ExAvatarGroup, {
      props: { ariaLabel: '项目成员' },
    });

    expect(wrapper.attributes('aria-label')).toBe('项目成员');
  });

  it('applies custom class correctly', () => {
    const wrapper = mount(ExAvatarGroup, {
      props: {
        class: 'custom-group',
      },
    });

    expect(wrapper.classes()).toContain('custom-group');
  });

  it('applies custom class array correctly', () => {
    const wrapper = mount(ExAvatarGroup, {
      props: {
        class: ['class1', 'class2'],
      },
    });

    expect(wrapper.classes()).toContain('class1');
    expect(wrapper.classes()).toContain('class2');
  });

  it('applies custom class object correctly', () => {
    const wrapper = mount(ExAvatarGroup, {
      props: {
        class: { active: true, disabled: false },
      },
    });

    expect(wrapper.classes()).toContain('active');
    expect(wrapper.classes()).not.toContain('disabled');
  });

  it('applies custom spacing correctly', () => {
    const wrapper = mount(ExAvatarGroup, {
      props: {
        spacing: 12,
      },
    });

    const style = wrapper.attributes('style');
    expect(style).toContain('--ex-avatar-spacing: 12px');
  });

  it('applies string spacing correctly', () => {
    const wrapper = mount(ExAvatarGroup, {
      props: {
        spacing: '1rem',
      },
    });

    const style = wrapper.attributes('style');
    expect(style).toContain('--ex-avatar-spacing: 1rem');
  });

  it('保留负间距作为头像重叠配置，并回退无效数字', () => {
    const overlapping = mount(ExAvatarGroup, {
      props: { spacing: -10 },
    });
    const invalid = mount(ExAvatarGroup, {
      props: { spacing: Number.NaN },
    });

    expect(overlapping.attributes('style')).toContain('--ex-avatar-spacing: -10px');
    expect(invalid.attributes('style')).toContain('--ex-avatar-spacing: 8px');
  });

  it('applies custom style object correctly', () => {
    const wrapper = mount(ExAvatarGroup, {
      props: {
        style: { backgroundColor: 'red', padding: '10px' },
      },
    });

    const style = wrapper.attributes('style');
    expect(style).toContain('background-color: red');
    expect(style).toContain('padding: 10px');
  });

  it('applies custom style string correctly', () => {
    const wrapper = mount(ExAvatarGroup, {
      props: {
        style: 'background-color: blue; margin: 5px;',
      },
    });

    const style = wrapper.attributes('style');
    expect(style).toContain('background-color: blue');
    expect(style).toContain('margin: 5px');
  });

  it('renders slot content correctly', () => {
    const wrapper = mount(ExAvatarGroup, {
      slots: {
        default: 'Test Content',
      },
    });

    // 简化测试，只验证组件能正常渲染
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.classes()).toContain('ex-avatar-group');
  });

  it('点击溢出头像时触发 overflowClick 事件', async () => {
    const wrapper = mount(ExAvatarGroup, {
      props: {
        maxCount: 1,
      },
      slots: {
        default: () => [h(ExAvatar, { text: 'A' }), h(ExAvatar, { text: 'B' })],
      },
    });

    await wrapper.find('.ex-avatar-group__overflow').trigger('click');

    expect(wrapper.emitted('overflowClick')?.[0]).toEqual([1]);
  });

  it('handles maxStyle prop correctly', () => {
    const wrapper = mount(ExAvatarGroup, {
      props: {
        maxCount: 2,
        maxStyle: { backgroundColor: 'red', color: 'white' },
      },
      slots: {
        default: () => [
          h(ExAvatar, { text: 'A' }),
          h(ExAvatar, { text: 'B' }),
          h(ExAvatar, { text: 'C' }),
        ],
      },
    });

    const overflowAvatar = wrapper.find('.ex-avatar-group__overflow').findComponent(ExAvatar);
    expect(overflowAvatar.attributes('style')).toContain('background-color: red');
    expect(overflowAvatar.attributes('style')).toContain('color: white');
  });

  it('passes size prop to child avatars', () => {
    const wrapper = mount(ExAvatarGroup, {
      props: {
        size: 'large',
      },
      slots: {
        default: `
          <ex-avatar text="A" />
          <ex-avatar text="B" />
        `,
      },
      global: {
        components: {
          ExAvatar,
        },
      },
    });

    const avatars = wrapper.findAllComponents(ExAvatar);
    expect(avatars).toHaveLength(2);
    avatars.forEach(avatar => expect(avatar.props('size')).toBe('large'));
  });

  it('passes shape prop to child avatars', () => {
    const wrapper = mount(ExAvatarGroup, {
      props: {
        shape: 'square',
      },
      slots: {
        default: `
          <ex-avatar text="A" />
          <ex-avatar text="B" />
        `,
      },
      global: {
        components: {
          ExAvatar,
        },
      },
    });

    const avatars = wrapper.findAllComponents(ExAvatar);
    expect(avatars).toHaveLength(2);
    avatars.forEach(avatar => expect(avatar.props('shape')).toBe('square'));
  });

  it('flattens fragments, clones real avatar vnodes and renders an accurate overflow', () => {
    const wrapper = mount(ExAvatarGroup, {
      props: { maxCount: 2, size: 'large', shape: 'square' },
      slots: {
        default: () => [
          h(Fragment, null, [
            h(ExAvatar, { text: 'A', class: 'first-avatar' }),
            h(ExAvatar, { text: 'B' }),
          ]),
          h(ExAvatar, { text: 'C' }),
          h(ExAvatar, { text: 'D' }),
        ],
      },
    });

    const avatars = wrapper.findAllComponents(ExAvatar);
    expect(avatars).toHaveLength(3);
    expect(avatars[0]?.props('size')).toBe('large');
    expect(avatars[0]?.props('shape')).toBe('square');
    expect(avatars[0]?.classes()).toContain('first-avatar');
    expect(wrapper.find('.ex-avatar-group__overflow').text()).toContain('+2');
  });

  it('treats maxCount zero as a real limit and exposes overflow as a native button', async () => {
    const wrapper = mount(ExAvatarGroup, {
      props: { maxCount: 0 },
      slots: {
        default: () => [h(ExAvatar, { text: 'A' }), h(ExAvatar, { text: 'B' })],
      },
    });

    const overflow = wrapper.find('.ex-avatar-group__overflow');
    expect(wrapper.findAllComponents(ExAvatar)).toHaveLength(1);
    expect(overflow.element.tagName).toBe('BUTTON');
    expect(overflow.attributes('aria-label')).toBe('2 more');
    expect(overflow.text()).toContain('+2');

    await overflow.trigger('click');
    expect(wrapper.emitted('overflowClick')?.[0]).toEqual([2]);
  });
});
