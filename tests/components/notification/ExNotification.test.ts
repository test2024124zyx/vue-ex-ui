/**
 * Notification 组件单元测试
 */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ExNotification from '../../../src/components/notification/ExNotification.vue';
import type {
  NotificationType,
  NotificationPosition,
} from '../../../src/components/notification/types';

afterEach(() => {
  vi.useRealTimers();
});

describe('ExNotification 组件', () => {
  describe('组件渲染', () => {
    it('正确渲染默认状态', () => {
      const wrapper = mount(ExNotification, {
        props: {
          title: '测试标题',
          content: '测试内容',
          duration: 0,
        },
      });

      expect(wrapper.find('.ex-notification').exists()).toBe(true);
      expect(wrapper.find('.ex-notification__title').text()).toBe('测试标题');
      expect(wrapper.find('.ex-notification__description').text()).toBe('测试内容');
      expect(wrapper.find('.ex-notification').classes()).toContain('ex-notification--info');
    });

    it('渲染不同类型的通知', () => {
      const types: NotificationType[] = ['info', 'success', 'warning', 'error'];

      types.forEach(type => {
        const wrapper = mount(ExNotification, {
          props: {
            type,
            title: `${type} 标题`,
            content: `${type} 内容`,
            duration: 0,
          },
        });
        expect(wrapper.find('.ex-notification').classes()).toContain(`ex-notification--${type}`);
      });
    });

    it('渲染不同位置的通知', () => {
      const positions: NotificationPosition[] = [
        'top-right',
        'top-left',
        'bottom-right',
        'bottom-left',
      ];

      positions.forEach(position => {
        const wrapper = mount(ExNotification, {
          props: {
            title: '测试标题',
            position,
            duration: 0,
          },
        });
        expect(wrapper.find('.ex-notification').classes()).toContain(
          `ex-notification--${position}`
        );
      });
    });

    it('显示图标', () => {
      const wrapper = mount(ExNotification, {
        props: {
          title: '带图标的通知',
          showIcon: true,
          duration: 0,
        },
      });

      expect(wrapper.find('.ex-notification__icon').exists()).toBe(true);
    });

    it('隐藏图标', () => {
      const wrapper = mount(ExNotification, {
        props: {
          title: '不带图标的通知',
          showIcon: false,
          duration: 0,
        },
      });

      expect(wrapper.find('.ex-notification__icon').exists()).toBe(false);
    });

    it('显示关闭按钮', () => {
      const wrapper = mount(ExNotification, {
        props: {
          title: '可关闭的通知',
          closable: true,
          duration: 0,
        },
      });

      expect(wrapper.find('.ex-notification__close').exists()).toBe(true);
      expect(wrapper.find('.ex-notification').classes()).toContain('ex-notification--closable');
    });

    it('隐藏关闭按钮', () => {
      const wrapper = mount(ExNotification, {
        props: {
          title: '不可关闭的通知',
          closable: false,
          duration: 0,
        },
      });

      expect(wrapper.find('.ex-notification__close').exists()).toBe(false);
    });

    it('应用自定义类名', () => {
      const wrapper = mount(ExNotification, {
        props: {
          title: '自定义类名',
          customClass: 'my-custom-class',
          duration: 0,
        },
      });

      expect(wrapper.find('.ex-notification').classes()).toContain('my-custom-class');
    });

    it('渲染 HTML 内容', () => {
      const wrapper = mount(ExNotification, {
        props: {
          title: '测试标题',
          content: '<strong>加粗文本</strong>',
          dangerouslyUseHTMLString: true,
          duration: 0,
        },
      });

      expect(wrapper.find('.ex-notification__description strong').exists()).toBe(true);
    });

    it('只有标题没有内容', () => {
      const wrapper = mount(ExNotification, {
        props: {
          title: '只有标题',
          duration: 0,
        },
      });

      expect(wrapper.find('.ex-notification__title').exists()).toBe(true);
      expect(wrapper.find('.ex-notification__description').exists()).toBe(false);
    });
  });

  describe('暴露方法', () => {
    it('暴露 close 方法', () => {
      const wrapper = mount(ExNotification, {
        props: {
          title: '测试通知',
          duration: 0,
        },
      });

      const vm = wrapper.vm as { close: () => void };
      expect(typeof vm.close).toBe('function');
    });

    it('暴露 visible 属性', () => {
      const wrapper = mount(ExNotification, {
        props: {
          title: '测试通知',
          duration: 0,
        },
      });

      const vm = wrapper.vm as unknown as { visible: boolean };
      expect(typeof vm.visible).toBe('boolean');
    });
  });

  describe('自动关闭计时', () => {
    it('焦点仍在通知内时鼠标离开不会恢复计时', async () => {
      vi.useFakeTimers();
      const wrapper = mount(ExNotification, {
        props: {
          title: '交错暂停通知',
          duration: 1000,
        },
      });
      const notification = wrapper.get('.ex-notification');

      await vi.advanceTimersByTimeAsync(300);
      await notification.trigger('mouseenter');
      await vi.advanceTimersByTimeAsync(200);
      await notification.trigger('focusin');
      await notification.trigger('mouseleave');
      await vi.advanceTimersByTimeAsync(1000);

      expect(wrapper.emitted('close')).toBeUndefined();

      await notification.trigger('focusout');
      await vi.advanceTimersByTimeAsync(699);
      expect(wrapper.emitted('close')).toBeUndefined();

      await vi.advanceTimersByTimeAsync(1);
      expect(wrapper.emitted('close')).toHaveLength(1);

      await vi.advanceTimersByTimeAsync(1000);
      expect(wrapper.emitted('close')).toHaveLength(1);
      wrapper.unmount();
    });

    it('鼠标仍悬停时焦点移出不会恢复计时', async () => {
      vi.useFakeTimers();
      const wrapper = mount(ExNotification, {
        props: {
          title: '反向交错暂停通知',
          duration: 1000,
        },
      });
      const notification = wrapper.get('.ex-notification');

      await vi.advanceTimersByTimeAsync(200);
      await notification.trigger('focusin');
      await notification.trigger('mouseenter');
      await notification.trigger('focusout');
      await vi.advanceTimersByTimeAsync(1000);

      expect(wrapper.emitted('close')).toBeUndefined();

      await notification.trigger('mouseleave');
      await vi.advanceTimersByTimeAsync(799);
      expect(wrapper.emitted('close')).toBeUndefined();

      await vi.advanceTimersByTimeAsync(1);
      expect(wrapper.emitted('close')).toHaveLength(1);
      wrapper.unmount();
    });
  });

  describe('无障碍支持', () => {
    it('设置正确的 role 属性', () => {
      const wrapper = mount(ExNotification, {
        props: {
          title: '测试通知',
          duration: 0,
        },
      });

      expect(wrapper.find('.ex-notification').attributes('role')).toBe('status');
    });

    it('info 类型使用 polite aria-live', () => {
      const wrapper = mount(ExNotification, {
        props: {
          type: 'info',
          title: '信息通知',
          duration: 0,
        },
      });

      expect(wrapper.find('.ex-notification').attributes('aria-live')).toBe('polite');
    });

    it('error 类型使用 assertive aria-live', () => {
      const wrapper = mount(ExNotification, {
        props: {
          type: 'error',
          title: '错误通知',
          duration: 0,
        },
      });

      expect(wrapper.find('.ex-notification').attributes('aria-live')).toBe('assertive');
    });

    it('关闭按钮有 aria-label', () => {
      const wrapper = mount(ExNotification, {
        props: {
          title: '可关闭的通知',
          closable: true,
          duration: 0,
        },
      });

      expect(wrapper.find('.ex-notification__close').attributes('aria-label')).toBeTruthy();
    });

    it('关闭按钮可通过键盘聚焦', () => {
      const wrapper = mount(ExNotification, {
        props: {
          title: '可关闭的通知',
          closable: true,
          duration: 0,
        },
      });

      expect(wrapper.find('.ex-notification__close').element.tagName).toBe('BUTTON');
    });
  });
});
