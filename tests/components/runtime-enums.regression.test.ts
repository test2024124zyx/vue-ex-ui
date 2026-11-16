import { afterEach, describe, expect, it } from 'vitest';
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { h } from 'vue';
import ExAlert from '../../src/components/alert/ExAlert.vue';
import ExConfigProvider from '../../src/components/config-provider/ExConfigProvider.vue';
import ExDialog from '../../src/components/dialog/ExDialog.vue';
import ExDrawer from '../../src/components/drawer/ExDrawer.vue';
import ExIcon from '../../src/components/icon/ExIcon.vue';
import ExNotification from '../../src/components/notification/ExNotification.vue';
import ExTypography from '../../src/components/typography/ExTypography.vue';

enableAutoUnmount(afterEach);

describe('组件运行时枚举回退', () => {
  it('Dialog 的未知尺寸继承配置，未知类型使用默认样式', () => {
    const wrapper = mount(ExConfigProvider, {
      props: { size: 'large' },
      slots: {
        default: () =>
          h(ExDialog, {
            modelValue: true,
            appendToBody: false,
            size: 'huge' as never,
            type: 'ghost' as never,
          }),
      },
    });
    const dialog = wrapper.get('.ex-dialog');
    expect(dialog.classes()).toEqual(
      expect.arrayContaining(['ex-dialog--large', 'ex-dialog--default'])
    );
    expect(dialog.classes()).not.toContain('ex-dialog--ghost');
  });

  it('Drawer 的未知方向同时按右侧样式、横向尺寸布局', async () => {
    const wrapper = mount(ExDrawer, {
      props: { modelValue: true, placement: 'middle' as never, size: 280 },
    });
    const drawer = document.querySelector<HTMLElement>('.ex-drawer')!;
    expect(drawer.classList.contains('ex-drawer--right')).toBe(true);
    expect(drawer.style.width).toBe('280px');
    await wrapper.setProps({ placement: 'top' });
    expect(drawer.classList.contains('ex-drawer--top')).toBe(true);
    expect(drawer.style.height).toBe('280px');
  });

  it('Typography 从原型名称和未知字号回退到正文', async () => {
    const wrapper = mount(ExTypography, {
      props: { text: '正文', variant: 'constructor' as never, size: 'huge' as never },
    });
    expect(wrapper.element.tagName).toBe('P');
    expect(wrapper.classes()).toContain('ex-typography--body');
    expect(wrapper.classes()).not.toContain('ex-typography--huge');
    await wrapper.setProps({ variant: 'heading', size: 'lg' });
    expect(wrapper.classes()).toEqual(
      expect.arrayContaining(['ex-typography--heading', 'ex-typography--lg'])
    );
  });

  it('Alert 回退信息样式和内置图标，合法错误类型仍即时播报', async () => {
    const wrapper = mount(ExAlert, {
      props: { title: '提醒', showIcon: true, type: 'ghost' as never, variant: 'unknown' as never },
    });
    const alert = wrapper.get('.ex-alert');
    expect(alert.classes()).toEqual(
      expect.arrayContaining(['ex-alert--info', 'ex-alert--standard'])
    );
    expect(wrapper.findComponent(ExIcon).props('icon')).toBe('information-line');
    await wrapper.setProps({ type: 'error', variant: 'filled' });
    expect(alert.attributes('aria-live')).toBe('assertive');
    expect(alert.classes()).toEqual(
      expect.arrayContaining(['ex-alert--error', 'ex-alert--filled'])
    );
  });

  it('Notification 渲染无效枚举用信息图标、温和播报和右上角', async () => {
    const wrapper = mount(ExNotification, {
      props: { title: '提醒', type: 'ghost' as never, position: 'middle' as never, duration: 0 },
    });
    const notification = wrapper.get('.ex-notification');
    expect(notification.classes()).toEqual(
      expect.arrayContaining(['ex-notification--info', 'ex-notification--top-right'])
    );
    expect(notification.attributes('role')).toBe('status');
    expect(wrapper.findComponent(ExIcon).props('icon')).toBe('information-line');
    await wrapper.setProps({ type: 'error', position: 'bottom-left' });
    expect(notification.attributes('aria-live')).toBe('assertive');
    expect(notification.classes()).toContain('ex-notification--bottom-left');
  });
});
