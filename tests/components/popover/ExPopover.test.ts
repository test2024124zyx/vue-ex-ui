import { describe, it, expect, afterEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { mount } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import ExPopover from '../../../src/components/popover/ExPopover.vue';
import ExConfigProvider from '../../../src/components/config-provider/ExConfigProvider.vue';
import type { ExPopoverExposed } from '../../../src/components/popover/types';

describe('ExPopover', () => {
  it('淡入淡出动画的每个 transition 项都使用有效简写', () => {
    const styleSource = readFileSync(
      join(process.cwd(), 'src/components/popover/ExPopover.scss'),
      'utf8'
    );

    expect(styleSource).toMatch(
      /transition:\s*opacity var\(--ex-motion-duration-fast\) var\(--ex-motion-ease-in-out\),\s*transform var\(--ex-motion-duration-fast\) var\(--ex-motion-ease-in-out\);/
    );
    expect(styleSource).not.toMatch(
      /var\(--ex-motion-ease-in-out\)\s+var\(--ex-motion-ease-in-out\)/
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });
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

      const exposed = wrapper.vm as unknown as ExPopoverExposed;
      expect(exposed.show).toBeDefined();
      expect(exposed.hide).toBeDefined();
      expect(exposed.updatePosition).toBeDefined();
    });
  });

  describe('受控状态与交互语义', () => {
    it('Teleport 浮层继承 ConfigProvider 的语义层级和效果开关', async () => {
      const wrapper = mount(ExConfigProvider, {
        attachTo: document.body,
        props: { zIndex: 2400, neonEffect: false, animation: false },
        slots: {
          default: () =>
            h(
              ExPopover,
              { modelValue: true, title: '标题', content: '内容' },
              { default: () => h('button', '触发按钮') }
            ),
        },
      });
      await nextTick();

      const popper = document.querySelector<HTMLElement>('.ex-popover__popper')!;
      expect(popper.style.zIndex).toBe('2460');
      expect(popper.classList).toContain('ex-no-neon');
      expect(popper.classList).toContain('ex-no-animation');
      wrapper.unmount();
    });

    it('初始 modelValue=true 应该直接渲染浮层', async () => {
      mount(ExPopover, {
        props: { modelValue: true, title: '标题', content: '内容' },
        slots: { default: '<button>触发按钮</button>' },
        attachTo: document.body,
      });
      await nextTick();

      expect(document.querySelector('.ex-popover__popper')).toBeTruthy();
    });

    it('父级同步 modelValue 不应该重复发出更新和生命周期事件', async () => {
      const wrapper = mount(ExPopover, {
        props: { modelValue: false, content: '内容' },
        slots: { default: '<button>触发按钮</button>' },
        attachTo: document.body,
      });

      await wrapper.setProps({ modelValue: true });
      await nextTick();

      expect(wrapper.emitted('update:modelValue')).toBeUndefined();
      expect(wrapper.emitted('show')).toHaveLength(1);
    });

    it('contextmenu 触发应该阻止默认菜单并打开浮层', async () => {
      const wrapper = mount(ExPopover, {
        props: { trigger: 'contextmenu', content: '内容' },
        slots: { default: '<button class="trigger">触发按钮</button>' },
        attachTo: document.body,
      });
      const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });

      wrapper.find('.trigger').element.dispatchEvent(event);
      await nextTick();

      expect(event.defaultPrevented).toBe(true);
      expect(document.querySelector('.ex-popover__popper')).toBeTruthy();
    });

    it('ARIA 展开状态应该落在真实触发器且标题命名对话框', async () => {
      const wrapper = mount(ExPopover, {
        props: { title: '危险操作', content: '内容' },
        slots: { default: '<button class="trigger">触发按钮</button>' },
        attachTo: document.body,
      });
      await wrapper.find('.trigger').trigger('click');
      await nextTick();
      const trigger = wrapper.find('.trigger');
      const dialog = document.querySelector<HTMLElement>('[role="dialog"]')!;

      expect(trigger.attributes('aria-haspopup')).toBe('dialog');
      expect(trigger.attributes('aria-expanded')).toBe('true');
      expect(trigger.attributes('aria-controls')).toBe(dialog.id);
      expect(dialog.getAttribute('aria-labelledby')).toBe(
        document.querySelector<HTMLElement>('.ex-popover__title')!.id
      );
      expect(wrapper.attributes('aria-expanded')).toBeUndefined();
    });

    it('焦点从触发器移入 Teleport 面板时不应该关闭', async () => {
      const wrapper = mount(ExPopover, {
        props: { trigger: 'focus', closeDelay: 0 },
        slots: {
          default: '<button class="trigger">触发按钮</button>',
          content: '<button class="panel-action">面板操作</button>',
        },
        attachTo: document.body,
      });
      await wrapper.trigger('focusin');
      await nextTick();
      const action = document.querySelector<HTMLButtonElement>('.panel-action')!;

      await wrapper.trigger('focusout', { relatedTarget: action });
      action.focus();
      await nextTick();

      expect(document.querySelector('.ex-popover__popper')).toBeTruthy();
    });

    it('运行时切换为 click 后外部点击仍应该关闭', async () => {
      vi.useFakeTimers();
      const wrapper = mount(ExPopover, {
        props: { trigger: 'hover', content: '内容' },
        slots: { default: '<button class="trigger">触发按钮</button>' },
        attachTo: document.body,
      });
      await wrapper.setProps({ trigger: 'click' });
      await wrapper.find('.trigger').trigger('click');
      await nextTick();

      document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      vi.advanceTimersByTime(200);
      await nextTick();

      expect(document.querySelector('.ex-popover__popper')).toBeFalsy();
    });

    it('隐藏实例不应该常驻 resize 和 scroll 监听', () => {
      const addListener = vi.spyOn(window, 'addEventListener');
      mount(ExPopover, {
        props: { content: '内容' },
        slots: { default: '<button>触发按钮</button>' },
      });

      expect(addListener).not.toHaveBeenCalledWith('resize', expect.any(Function));
      expect(addListener).not.toHaveBeenCalledWith('scroll', expect.any(Function), true);
    });

    it('运行时禁用应该取消待显示任务', async () => {
      vi.useFakeTimers();
      const wrapper = mount(ExPopover, {
        props: { trigger: 'hover', content: '内容', openDelay: 100 },
        slots: { default: '<button>触发按钮</button>' },
        attachTo: document.body,
      });
      await wrapper.trigger('mouseenter');
      await wrapper.setProps({ disabled: true });
      vi.advanceTimersByTime(100);
      await nextTick();

      expect(document.querySelector('.ex-popover__popper')).toBeFalsy();
    });
  });
});
