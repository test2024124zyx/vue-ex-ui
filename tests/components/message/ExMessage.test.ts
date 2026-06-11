/**
 * Message 组件单元测试
 */

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ExMessage from '../../../src/components/message/ExMessage.vue';
import type { MessageType } from '../../../src/components/message/types';

describe('ExMessage 组件', () => {
  describe('组件渲染', () => {
    it('正确渲染默认状态', () => {
      const wrapper = mount(ExMessage, {
        props: {
          content: '测试消息',
          duration: 0,
        },
      });

      expect(wrapper.find('.ex-message').exists()).toBe(true);
      expect(wrapper.find('.ex-message__content').text()).toBe('测试消息');
      expect(wrapper.find('.ex-message').classes()).toContain('ex-message--info');
    });

    it('渲染不同类型的消息', () => {
      const types: MessageType[] = ['info', 'success', 'warning', 'error', 'loading'];

      types.forEach((type) => {
        const wrapper = mount(ExMessage, {
          props: {
            type,
            content: `${type} 消息`,
            duration: 0,
          },
        });
        expect(wrapper.find('.ex-message').classes()).toContain(`ex-message--${type}`);
      });
    });

    it('显示图标', () => {
      const wrapper = mount(ExMessage, {
        props: {
          content: '带图标的消息',
          showIcon: true,
          duration: 0,
        },
      });

      expect(wrapper.find('.ex-message__icon').exists()).toBe(true);
    });

    it('隐藏图标', () => {
      const wrapper = mount(ExMessage, {
        props: {
          content: '不带图标的消息',
          showIcon: false,
          duration: 0,
        },
      });

      expect(wrapper.find('.ex-message__icon').exists()).toBe(false);
    });

    it('显示关闭按钮', () => {
      const wrapper = mount(ExMessage, {
        props: {
          content: '可关闭的消息',
          closable: true,
          duration: 0,
        },
      });

      expect(wrapper.find('.ex-message__close').exists()).toBe(true);
      expect(wrapper.find('.ex-message').classes()).toContain('ex-message--closable');
    });

    it('隐藏关闭按钮', () => {
      const wrapper = mount(ExMessage, {
        props: {
          content: '不可关闭的消息',
          closable: false,
          duration: 0,
        },
      });

      expect(wrapper.find('.ex-message__close').exists()).toBe(false);
    });

    it('应用自定义类名', () => {
      const wrapper = mount(ExMessage, {
        props: {
          content: '自定义类名',
          customClass: 'my-custom-class',
          duration: 0,
        },
      });

      expect(wrapper.find('.ex-message').classes()).toContain('my-custom-class');
    });

    it('渲染 HTML 内容', () => {
      const wrapper = mount(ExMessage, {
        props: {
          content: '<strong>加粗文本</strong>',
          dangerouslyUseHTMLString: true,
          duration: 0,
        },
      });

      expect(wrapper.find('.ex-message__content strong').exists()).toBe(true);
    });
  });

  describe('暴露方法', () => {
    it('暴露 close 方法', () => {
      const wrapper = mount(ExMessage, {
        props: {
          content: '测试消息',
          duration: 0,
        },
      });

      const vm = wrapper.vm as { close: () => void };
      expect(typeof vm.close).toBe('function');
    });

    it('暴露 visible 属性', () => {
      const wrapper = mount(ExMessage, {
        props: {
          content: '测试消息',
          duration: 0,
        },
      });

      const vm = wrapper.vm as { visible: boolean };
      expect(typeof vm.visible).toBe('boolean');
    });
  });

  describe('无障碍支持', () => {
    it('设置正确的 role 属性', () => {
      const wrapper = mount(ExMessage, {
        props: {
          content: '测试消息',
          duration: 0,
        },
      });

      expect(wrapper.find('.ex-message').attributes('role')).toBe('alert');
    });

    it('info 类型使用 polite aria-live', () => {
      const wrapper = mount(ExMessage, {
        props: {
          type: 'info',
          content: '信息消息',
          duration: 0,
        },
      });

      expect(wrapper.find('.ex-message').attributes('aria-live')).toBe('polite');
    });

    it('error 类型使用 assertive aria-live', () => {
      const wrapper = mount(ExMessage, {
        props: {
          type: 'error',
          content: '错误消息',
          duration: 0,
        },
      });

      expect(wrapper.find('.ex-message').attributes('aria-live')).toBe('assertive');
    });

    it('关闭按钮有 aria-label', () => {
      const wrapper = mount(ExMessage, {
        props: {
          content: '可关闭的消息',
          closable: true,
          duration: 0,
        },
      });

      expect(wrapper.find('.ex-message__close').attributes('aria-label')).toBeTruthy();
    });

    it('关闭按钮可通过键盘聚焦', () => {
      const wrapper = mount(ExMessage, {
        props: {
          content: '可关闭的消息',
          closable: true,
          duration: 0,
        },
      });

      expect(wrapper.find('.ex-message__close').attributes('tabindex')).toBe('0');
    });
  });
});
