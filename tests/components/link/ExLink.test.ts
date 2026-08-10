import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import ExConfigProvider from '../../../src/components/config-provider/ExConfigProvider.vue';
import ExLink from '../../../src/components/link/ExLink.vue';
import type { ExLinkExposed, LinkSize, LinkType } from '../../../src/components/link/types';

vi.mock('../../../src/components/icon/ExIcon.vue', () => ({
  default: {
    name: 'ExIcon',
    props: ['icon', 'size'],
    template: '<i class="ex-icon-stub" :data-icon="icon" :data-size="size" />',
  },
}));

const mountLink = (props: Record<string, unknown> = {}, slots: Record<string, string> = {}) =>
  mount(ExLink, {
    props,
    slots: {
      default: '链接内容',
      ...slots,
    },
  });

describe('ExLink', () => {
  it('没有 href 时渲染为不会提交表单的动作按钮', () => {
    const wrapper = mountLink();

    expect(wrapper.element.tagName).toBe('BUTTON');
    expect(wrapper.attributes('type')).toBe('button');
    expect(wrapper.text()).toBe('链接内容');
    expect(wrapper.classes()).toContain('ex-link--action');
    expect(wrapper.classes()).toEqual(
      expect.arrayContaining(['ex-link', 'ex-link--default', 'ex-link--medium'])
    );
  });

  it('存在安全 href 时渲染为原生锚点', () => {
    const wrapper = mountLink({ href: '/account?tab=profile#name' });

    expect(wrapper.element.tagName).toBe('A');
    expect(wrapper.attributes('href')).toBe('/account?tab=profile#name');
    expect(wrapper.classes()).not.toContain('ex-link--action');
    expect(wrapper.attributes('target')).toBeUndefined();
    expect(wrapper.attributes('rel')).toBeUndefined();
  });

  it('继承 ConfigProvider 尺寸，并允许显式 size 覆盖', () => {
    const inherited = mount({
      components: { ExConfigProvider, ExLink },
      template:
        '<ExConfigProvider size="large"><ExLink href="/profile">个人资料</ExLink></ExConfigProvider>',
    });
    const explicit = mount({
      components: { ExConfigProvider, ExLink },
      template:
        '<ExConfigProvider size="large"><ExLink href="/profile" size="small">个人资料</ExLink></ExConfigProvider>',
    });

    expect(inherited.find('.ex-link').classes()).toContain('ex-link--large');
    expect(explicit.find('.ex-link').classes()).toContain('ex-link--small');
  });

  it('遵循 ConfigProvider 的光效与动画配置', () => {
    const wrapper = mount({
      components: { ExConfigProvider, ExLink },
      template:
        '<ExConfigProvider :neon-effect="false" :animation="false"><ExLink href="/profile" type="primary">个人资料</ExLink></ExConfigProvider>',
    });

    expect(wrapper.find('.ex-link').classes()).toEqual(
      expect.arrayContaining(['ex-link--no-neon', 'ex-link--no-animation'])
    );
  });

  it.each<LinkType>(['default', 'primary', 'success', 'warning', 'danger', 'info'])(
    '为 %s 类型应用稳定类名',
    type => {
      expect(mountLink({ type }).classes()).toContain(`ex-link--${type}`);
    }
  );

  it.each<LinkSize>(['small', 'medium', 'large'])('为 %s 尺寸应用稳定类名', size => {
    expect(mountLink({ size }).classes()).toContain(`ex-link--${size}`);
  });

  it('关闭下划线时仅添加对应状态类', () => {
    expect(mountLink({ underline: false }).classes()).toContain('ex-link--no-underline');
    expect(mountLink({ underline: true }).classes()).not.toContain('ex-link--no-underline');
  });

  it('通过 Vue 原生透传合并 class、style 与无障碍属性', () => {
    const wrapper = mountLink({
      class: ['custom-link', { active: true, inactive: false }],
      style: { color: 'rgb(255, 0, 0)' },
      'aria-label': '打开个人资料',
      'data-track-id': 'profile-link',
    });

    expect(wrapper.classes()).toEqual(expect.arrayContaining(['custom-link', 'active']));
    expect(wrapper.classes()).not.toContain('inactive');
    expect((wrapper.element as HTMLElement).style.color).toBe('rgb(255, 0, 0)');
    expect(wrapper.attributes('aria-label')).toBe('打开个人资料');
    expect(wrapper.attributes('data-track-id')).toBe('profile-link');
  });

  it('动作按钮点击时发送原始鼠标事件', async () => {
    const wrapper = mountLink();

    await wrapper.trigger('click');

    const event = wrapper.emitted('click')?.[0]?.[0];
    expect(event).toBeInstanceOf(MouseEvent);
  });

  it('锚点点击时保留原生导航默认行为并发送事件', () => {
    const wrapper = mountLink({ href: '#details' });
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });

    wrapper.element.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
    expect(wrapper.emitted('click')?.[0]?.[0]).toBe(event);
  });

  it('禁用动作按钮时使用原生 disabled 且不发送交互事件', async () => {
    const wrapper = mountLink({ disabled: true });

    expect(wrapper.element.tagName).toBe('BUTTON');
    expect(wrapper.attributes('disabled')).toBe('');
    expect(wrapper.classes()).toContain('ex-link--disabled');

    await wrapper.trigger('click');
    await wrapper.trigger('focus');
    await wrapper.trigger('blur');

    expect(wrapper.emitted('click')).toBeUndefined();
    expect(wrapper.emitted('focus')).toBeUndefined();
    expect(wrapper.emitted('blur')).toBeUndefined();
  });

  it('禁用锚点时移除所有导航属性并阻止冒泡', () => {
    const parentClick = vi.fn();
    const wrapper = mount({
      components: { ExLink },
      setup: () => ({ parentClick }),
      template:
        '<div @click="parentClick"><ExLink href="https://example.com" target="_blank" rel="nofollow" disabled>禁用链接</ExLink></div>',
    });
    const link = wrapper.findComponent(ExLink);
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });

    link.element.dispatchEvent(event);

    expect(link.element.tagName).toBe('A');
    expect(link.attributes('href')).toBeUndefined();
    expect(link.attributes('target')).toBeUndefined();
    expect(link.attributes('rel')).toBeUndefined();
    expect(link.attributes('tabindex')).toBe('-1');
    expect(link.attributes('role')).toBe('link');
    expect(link.attributes('aria-disabled')).toBe('true');
    expect(event.defaultPrevented).toBe(true);
    expect(parentClick).not.toHaveBeenCalled();
    expect(link.emitted('click')).toBeUndefined();
  });

  it.each(['javascript:alert(1)', ' java\nscript:alert(1)', 'data:text/html,<script>1</script>'])(
    '危险地址 %s 会退化为不可导航的禁用锚点',
    href => {
      const wrapper = mountLink({ href });

      expect(wrapper.element.tagName).toBe('A');
      expect(wrapper.attributes('href')).toBeUndefined();
      expect(wrapper.attributes('role')).toBe('link');
      expect(wrapper.attributes('aria-disabled')).toBe('true');
      expect(wrapper.classes()).toContain('ex-link--disabled');
    }
  );

  it('空白 href 不会被误判为动作按钮', () => {
    const wrapper = mountLink({ href: '   ' });

    expect(wrapper.element.tagName).toBe('A');
    expect(wrapper.attributes('href')).toBeUndefined();
    expect(wrapper.attributes('aria-disabled')).toBe('true');
  });

  it('绝对网络地址稳定显示外链标识且不依赖 window.origin', () => {
    const absolute = mountLink({ href: 'https://example.com/path' });
    const protocolRelative = mountLink({ href: '//cdn.example.com/file' });
    const relative = mountLink({ href: '/local/path' });
    const mail = mountLink({ href: 'mailto:team@example.com' });

    expect(absolute.classes()).toContain('ex-link--external');
    expect(protocolRelative.classes()).toContain('ex-link--external');
    expect(relative.classes()).not.toContain('ex-link--external');
    expect(mail.classes()).not.toContain('ex-link--external');
    expect(absolute.find('.ex-link__external-icon').exists()).toBe(true);
    expect(absolute.find('.ex-link__external-label').text()).toBe('External Link');
    expect(absolute.find('.ex-link__external-icon').attributes('aria-hidden')).toBe('true');
    expect(absolute.find('.ex-icon-stub').attributes('data-icon')).toBe('external-link-line');
    expect(absolute.find('.ex-icon-stub').attributes('data-size')).toBe('var(--ex-link-icon-size)');
    expect(absolute.find('.ex-icon-stub').attributes('aria-hidden')).toBe('true');
    expect(relative.find('.ex-link__external-label').exists()).toBe(false);
  });

  it('允许关闭或替换外链图标', () => {
    const hidden = mountLink({ href: 'https://example.com', showExternalIcon: false });
    const custom = mountLink(
      { href: 'https://example.com' },
      { 'external-icon': '<span class="custom-external-icon">离开</span>' }
    );

    expect(hidden.find('.ex-link__external-icon').exists()).toBe(false);
    expect(hidden.find('.ex-link__external-label').exists()).toBe(true);
    expect(custom.find('.custom-external-icon').exists()).toBe(true);
    expect(custom.find('.ex-link__external-icon').attributes('aria-hidden')).toBe('true');
  });

  it('目标为 _blank 时保留 rel 令牌、去重并强制使用 noopener', () => {
    const wrapper = mountLink({
      href: 'https://example.com',
      target: '_blank',
      rel: 'nofollow OPENER nofollow',
    });

    expect(wrapper.attributes('target')).toBe('_blank');
    expect(wrapper.attributes('rel')).toBe('nofollow noopener');
  });

  it('非 _blank 目标不会擅自改写 rel', () => {
    const wrapper = mountLink({
      href: '/license',
      target: '_self',
      rel: 'license nofollow',
    });

    expect(wrapper.attributes('rel')).toBe('license nofollow');
  });

  it('按图标位置渲染 icon 插槽，并由 prefix/suffix 插槽覆盖对应位置', () => {
    const left = mountLink({}, { icon: '<i class="slot-icon" />' });
    const right = mountLink(
      { iconPlacement: 'right' },
      { icon: '<i class="slot-icon" />', suffix: '<i class="suffix-icon" />' }
    );

    expect(left.find('.ex-link__icon--left .slot-icon').exists()).toBe(true);
    expect(left.find('.ex-link__icon--right').exists()).toBe(false);
    expect(right.find('.ex-link__icon--right .suffix-icon').exists()).toBe(true);
    expect(right.find('.ex-link__icon--right .slot-icon').exists()).toBe(false);
  });

  it('有效状态发送 focus/blur，暴露的方法操作真实根元素', async () => {
    const wrapper = mount(ExLink, {
      attachTo: document.body,
      props: { href: '#focus-target' },
      slots: { default: '可聚焦链接' },
    });
    const exposed = wrapper.vm as unknown as ExLinkExposed;

    exposed.focus();
    expect(document.activeElement).toBe(wrapper.element);
    expect(exposed.getElement()).toBe(wrapper.element);

    await wrapper.trigger('focus');
    await wrapper.trigger('blur');
    expect(wrapper.emitted('focus')?.[0]?.[0]).toBeInstanceOf(FocusEvent);
    expect(wrapper.emitted('blur')?.[0]?.[0]).toBeInstanceOf(FocusEvent);

    exposed.blur();
    expect(document.activeElement).not.toBe(wrapper.element);
    wrapper.unmount();
  });

  it('禁用状态的暴露 focus 方法不会改变当前焦点', () => {
    const previous = document.createElement('button');
    document.body.append(previous);
    previous.focus();
    const wrapper = mountLink({ href: '/private', disabled: true });
    const exposed = wrapper.vm as unknown as ExLinkExposed;

    exposed.focus();

    expect(document.activeElement).toBe(previous);
    previous.remove();
  });
});
