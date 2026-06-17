import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import ExTooltip from '../../../src/components/tooltip/ExTooltip.vue';

describe('ExTooltip', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  describe('组件渲染', () => {
    it('应该正确渲染触发元素', () => {
      const wrapper = mount(ExTooltip, {
        props: {
          content: '提示内容',
        },
        slots: {
          default: '<button>触发按钮</button>',
        },
      });

      expect(wrapper.find('.ex-tooltip').exists()).toBe(true);
      expect(wrapper.text()).toContain('触发按钮');
    });

    it('应该在悬停时显示提示', async () => {
      const wrapper = mount(ExTooltip, {
        props: {
          content: '提示内容',
        },
        slots: {
          default: '<button>触发按钮</button>',
        },
        attachTo: document.body,
      });

      await wrapper.trigger('mouseenter');
      await nextTick();

      expect(document.querySelector('.ex-tooltip__popper')).toBeTruthy();
    });

    it('应该显示箭头', async () => {
      const wrapper = mount(ExTooltip, {
        props: {
          content: '提示内容',
          showArrow: true,
        },
        slots: {
          default: '<button>触发按钮</button>',
        },
        attachTo: document.body,
      });

      await wrapper.trigger('mouseenter');
      await nextTick();

      expect(document.querySelector('.ex-tooltip__arrow')).toBeTruthy();
    });

    it('应该隐藏箭头', async () => {
      const wrapper = mount(ExTooltip, {
        props: {
          content: '提示内容',
          showArrow: false,
        },
        slots: {
          default: '<button>触发按钮</button>',
        },
        attachTo: document.body,
      });

      await wrapper.trigger('mouseenter');
      await nextTick();

      expect(document.querySelector('.ex-tooltip__arrow')).toBeFalsy();
    });
  });

  describe('位置', () => {
    it.each([
      ['top', 'ex-tooltip__popper--top'],
      ['bottom', 'ex-tooltip__popper--bottom'],
      ['left', 'ex-tooltip__popper--left'],
      ['right', 'ex-tooltip__popper--right'],
    ])('应该正确应用 %s 位置样式', async (placement, className) => {
      const wrapper = mount(ExTooltip, {
        props: {
          content: '提示内容',
          placement: placement as any,
        },
        slots: {
          default: '<button>触发按钮</button>',
        },
        attachTo: document.body,
      });

      await wrapper.trigger('mouseenter');
      await nextTick();

      const popper = document.querySelector('.ex-tooltip__popper');
      expect(popper?.classList.contains(className)).toBe(true);
    });
  });

  describe('主题', () => {
    it('应该应用深色主题', async () => {
      const wrapper = mount(ExTooltip, {
        props: {
          content: '提示内容',
          effect: 'dark',
        },
        slots: {
          default: '<button>触发按钮</button>',
        },
        attachTo: document.body,
      });

      await wrapper.trigger('mouseenter');
      await nextTick();

      const popper = document.querySelector('.ex-tooltip__popper');
      expect(popper?.classList.contains('ex-tooltip__popper--dark')).toBe(true);
    });

    it('应该应用浅色主题', async () => {
      const wrapper = mount(ExTooltip, {
        props: {
          content: '提示内容',
          effect: 'light',
        },
        slots: {
          default: '<button>触发按钮</button>',
        },
        attachTo: document.body,
      });

      await wrapper.trigger('mouseenter');
      await nextTick();

      const popper = document.querySelector('.ex-tooltip__popper');
      expect(popper?.classList.contains('ex-tooltip__popper--light')).toBe(true);
    });
  });

  describe('触发方式', () => {
    it('hover 触发应该工作', async () => {
      const wrapper = mount(ExTooltip, {
        props: {
          content: '提示内容',
          trigger: 'hover',
        },
        slots: {
          default: '<button>触发按钮</button>',
        },
        attachTo: document.body,
      });

      await wrapper.trigger('mouseenter');
      await nextTick();

      expect(document.querySelector('.ex-tooltip__popper')).toBeTruthy();

      await wrapper.trigger('mouseleave');
      vi.advanceTimersByTime(200);
      await nextTick();

      expect(document.querySelector('.ex-tooltip__popper')).toBeFalsy();
    });

    it('click 触发应该工作', async () => {
      const wrapper = mount(ExTooltip, {
        props: {
          content: '提示内容',
          trigger: 'click',
        },
        slots: {
          default: '<button>触发按钮</button>',
        },
        attachTo: document.body,
      });

      await wrapper.trigger('click');
      await nextTick();

      expect(document.querySelector('.ex-tooltip__popper')).toBeTruthy();

      await wrapper.trigger('click');
      vi.advanceTimersByTime(200);
      await nextTick();

      expect(document.querySelector('.ex-tooltip__popper')).toBeFalsy();
    });

    it('focus 触发应该工作', async () => {
      const wrapper = mount(ExTooltip, {
        props: {
          content: '提示内容',
          trigger: 'focus',
        },
        slots: {
          default: '<button>触发按钮</button>',
        },
        attachTo: document.body,
      });

      // focusin/focusout 会冒泡，聚焦内部触发元素也能正确触发（focus/blur 不冒泡）
      await wrapper.trigger('focusin');
      await nextTick();

      expect(document.querySelector('.ex-tooltip__popper')).toBeTruthy();

      await wrapper.trigger('focusout');
      vi.advanceTimersByTime(200);
      await nextTick();

      expect(document.querySelector('.ex-tooltip__popper')).toBeFalsy();
    });
  });

  describe('延迟', () => {
    it('应该延迟显示', async () => {
      const wrapper = mount(ExTooltip, {
        props: {
          content: '提示内容',
          openDelay: 500,
        },
        slots: {
          default: '<button>触发按钮</button>',
        },
        attachTo: document.body,
      });

      await wrapper.trigger('mouseenter');
      await nextTick();

      expect(document.querySelector('.ex-tooltip__popper')).toBeFalsy();

      vi.advanceTimersByTime(500);
      await nextTick();

      expect(document.querySelector('.ex-tooltip__popper')).toBeTruthy();
    });

    it('应该延迟隐藏', async () => {
      const wrapper = mount(ExTooltip, {
        props: {
          content: '提示内容',
          closeDelay: 500,
        },
        slots: {
          default: '<button>触发按钮</button>',
        },
        attachTo: document.body,
      });

      await wrapper.trigger('mouseenter');
      await nextTick();

      expect(document.querySelector('.ex-tooltip__popper')).toBeTruthy();

      await wrapper.trigger('mouseleave');
      await nextTick();

      expect(document.querySelector('.ex-tooltip__popper')).toBeTruthy();

      vi.advanceTimersByTime(500);
      await nextTick();

      expect(document.querySelector('.ex-tooltip__popper')).toBeFalsy();
    });
  });

  describe('禁用状态', () => {
    it('禁用时不应该显示提示', async () => {
      const wrapper = mount(ExTooltip, {
        props: {
          content: '提示内容',
          disabled: true,
        },
        slots: {
          default: '<button>触发按钮</button>',
        },
        attachTo: document.body,
      });

      await wrapper.trigger('mouseenter');
      await nextTick();

      expect(document.querySelector('.ex-tooltip__popper')).toBeFalsy();
    });
  });

  describe('手动控制', () => {
    it('应该通过 modelValue 控制显示', async () => {
      const wrapper = mount(ExTooltip, {
        props: {
          content: '提示内容',
          modelValue: false,
        },
        slots: {
          default: '<button>触发按钮</button>',
        },
        attachTo: document.body,
      });

      expect(document.querySelector('.ex-tooltip__popper')).toBeFalsy();

      await wrapper.setProps({ modelValue: true });
      await nextTick();

      expect(document.querySelector('.ex-tooltip__popper')).toBeTruthy();

      await wrapper.setProps({ modelValue: false });
      vi.advanceTimersByTime(200);
      await nextTick();

      expect(document.querySelector('.ex-tooltip__popper')).toBeFalsy();
    });
  });

  describe('自定义样式', () => {
    it('应该应用自定义类名', async () => {
      const wrapper = mount(ExTooltip, {
        props: {
          content: '提示内容',
          customClass: 'custom-tooltip',
        },
        slots: {
          default: '<button>触发按钮</button>',
        },
        attachTo: document.body,
      });

      await wrapper.trigger('mouseenter');
      await nextTick();

      const popper = document.querySelector('.ex-tooltip__popper');
      expect(popper?.classList.contains('custom-tooltip')).toBe(true);
    });

    it('应该应用自定义层级', async () => {
      const wrapper = mount(ExTooltip, {
        props: {
          content: '提示内容',
          zIndex: 3000,
        },
        slots: {
          default: '<button>触发按钮</button>',
        },
        attachTo: document.body,
      });

      await wrapper.trigger('mouseenter');
      await nextTick();

      const popper = document.querySelector('.ex-tooltip__popper') as HTMLElement;
      // z-index 通过 CSS 变量体系下发（--ex-z-tooltip 参与 calc 计算）
      expect(popper?.style.getPropertyValue('--ex-z-tooltip')).toBe('3000');
    });
  });

  describe('插槽', () => {
    it('应该支持内容插槽', async () => {
      const wrapper = mount(ExTooltip, {
        props: {
          content: '默认内容',
        },
        slots: {
          default: '<button>触发按钮</button>',
          content: '<div class="custom-content">自定义内容</div>',
        },
        attachTo: document.body,
      });

      await wrapper.trigger('mouseenter');
      await nextTick();

      expect(document.querySelector('.custom-content')).toBeTruthy();
    });
  });

  describe('事件', () => {
    it('应该触发 show 事件', async () => {
      const onShow = vi.fn();

      const wrapper = mount(ExTooltip, {
        props: {
          content: '提示内容',
          onShow,
        },
        slots: {
          default: '<button>触发按钮</button>',
        },
        attachTo: document.body,
      });

      await wrapper.trigger('mouseenter');
      await nextTick();

      expect(onShow).toHaveBeenCalled();
    });

    it('应该触发 hide 事件', async () => {
      const onHide = vi.fn();

      const wrapper = mount(ExTooltip, {
        props: {
          content: '提示内容',
          onHide,
        },
        slots: {
          default: '<button>触发按钮</button>',
        },
        attachTo: document.body,
      });

      await wrapper.trigger('mouseenter');
      await nextTick();

      await wrapper.trigger('mouseleave');
      vi.advanceTimersByTime(200);
      await nextTick();

      expect(onHide).toHaveBeenCalled();
    });
  });

  describe('暴露的方法', () => {
    it('应该暴露 show、hide 和 updatePosition 方法', () => {
      const wrapper = mount(ExTooltip, {
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
