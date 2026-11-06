import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import ExSkeleton from '../../../src/components/skeleton/ExSkeleton.vue';

describe('骨架内容布局与加载切换', () => {
  it.each(['article', 'card', 'list'] as const)(
    '%s 的头像标题段落遵守自定义尺寸',
    async variant => {
      const wrapper = mount(ExSkeleton, {
        props: {
          variant,
          avatar: true,
          avatarSize: 32,
          title: true,
          titleWidth: '70%',
          rows: 3,
          rowsWidth: ['100%', 120],
          count: 2,
          style: 'margin: 4px',
          width: 240,
          height: '180px',
        },
        slots: { content: '<button>真实内容</button>' },
      });
      expect(wrapper.get('.ex-skeleton').attributes('style')).toContain('width: 240px');
      expect(wrapper.get('.ex-skeleton').attributes('style')).toContain('height: 180px');
      expect(wrapper.get('.ex-skeleton__avatar').attributes('style')).toContain('width: 32px');
      expect(wrapper.get('.ex-skeleton__title').attributes('style')).toContain('width: 70%');
      expect(wrapper.findAll('.ex-skeleton__row')[1]!.attributes('style')).toContain(
        'width: 120px'
      );
      await wrapper.setProps({ loading: false });
      expect(wrapper.get('button').text()).toBe('真实内容');
      wrapper.unmount();
    }
  );

  it('尺寸字符串、统一行宽、关闭动画与零数量都保持有效布局', async () => {
    const wrapper = mount(ExSkeleton, {
      props: {
        avatar: true,
        avatarSize: '2rem',
        title: true,
        titleWidth: 100,
        rows: 2,
        rowsWidth: '80%',
        active: false,
        style: { color: 'red' },
      },
    });
    expect(wrapper.get('.ex-skeleton__avatar').attributes('style')).toContain('width: 2rem');
    expect(
      wrapper
        .findAll('.ex-skeleton__row')
        .every(row => row.attributes('style')?.includes('width: 80%'))
    ).toBe(true);
    expect(wrapper.classes().some(value => value.includes('animation-'))).toBe(false);
    await wrapper.setProps({ count: 0, rows: 0, title: false, avatar: false });
    expect(wrapper.find('.ex-skeleton__row').exists()).toBe(false);
    expect(wrapper.find('.ex-skeleton__element').exists()).toBe(false);
    wrapper.unmount();
  });
});
