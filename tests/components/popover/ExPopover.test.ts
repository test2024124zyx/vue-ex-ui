import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ExPopover from '../../../src/components/popover/ExPopover.vue';

describe('ExPopover', () => {
  describe('组件渲染', () => {
    it('应该正确渲染触发元素', () => {
      const wrapper = mount(ExPopover, {
        props: {
          content: '提示内容',
        },
        slots: {
          default: '<button>触发按钮</button>',
        },
      });

      expect(wrapper.find('.ex-popover').exists()).toBe(true);
      expect(wrapper.text()).toContain('触发按钮');
    });
  });

  describe('属性', () => {
    it('应该接受 title 属性', () => {
      const wrapper = mount(ExPopover, {
        props: {
          title: '标题',
          content: '内容',
        },
        slots: {
          default: '<button>按钮</button>',
        },
      });

      expect(wrapper.props('title')).toBe('标题');
    });

    it('应该接受 content 属性', () => {
      const wrapper = mount(ExPopover, {
        props: {
          content: '内容文本',
        },
        slots: {
          default: '<button>按钮</button>',
        },
      });

      expect(wrapper.props('content')).toBe('内容文本');
    });

    it('应该接受 placement 属性', () => {
      const wrapper = mount(ExPopover, {
        props: {
          content: '内容',
          placement: 'bottom',
        },
        slots: {
          default: '<button>按钮</button>',
        },
      });

      expect(wrapper.props('placement')).toBe('bottom');
    });

    it('应该接受 trigger 属性', () => {
      const wrapper = mount(ExPopover, {
        props: {
          content: '内容',
          trigger: 'hover',
        },
        slots: {
          default: '<button>按钮</button>',
        },
      });

      expect(wrapper.props('trigger')).toBe('hover');
    });
  });

  describe('暴露的方法', () => {
    it('应该暴露 show、hide 和 updatePosition 方法', () => {
      const wrapper = mount(ExPopover, {
        props: {
          content: '提示内容',
        },
        slots: {
          default: '<button>触发按钮</button>',
        },
      });

      const exposed = wrapper.vm as any;
      expect(exposed.show).toBeDefined();
      expect(exposed.hide).toBeDefined();
      expect(exposed.updatePosition).toBeDefined();
    });
  });
});
