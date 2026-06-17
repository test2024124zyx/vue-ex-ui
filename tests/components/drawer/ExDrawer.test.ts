import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import ExDrawer from '../../../src/components/drawer/ExDrawer.vue';

describe('ExDrawer', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('组件渲染', () => {
    it('应该正确渲染抽屉', async () => {
      const wrapper = mount(ExDrawer, {
        props: {
          modelValue: true,
          title: '抽屉标题',
        },
        attachTo: document.body,
      });

      await nextTick();

      expect(document.querySelector('.ex-drawer')).toBeTruthy();
      expect(document.querySelector('.ex-drawer__title')?.textContent).toBe('抽屉标题');
    });

    it('应该渲染关闭按钮', async () => {
      const wrapper = mount(ExDrawer, {
        props: {
          modelValue: true,
          closable: true,
        },
        attachTo: document.body,
      });

      await nextTick();

      expect(document.querySelector('.ex-drawer__close')).toBeTruthy();
    });

    it('应该渲染遮罩层', async () => {
      const wrapper = mount(ExDrawer, {
        props: {
          modelValue: true,
          mask: true,
        },
        attachTo: document.body,
      });

      await nextTick();

      expect(document.querySelector('.ex-drawer-mask')).toBeTruthy();
    });

    it('应该渲染底部操作栏', async () => {
      const wrapper = mount(ExDrawer, {
        props: {
          modelValue: true,
          showFooter: true,
        },
        attachTo: document.body,
      });

      await nextTick();

      expect(document.querySelector('.ex-drawer__footer')).toBeTruthy();
    });
  });

  describe('抽屉位置', () => {
    it.each([
      ['left', 'ex-drawer--left'],
      ['right', 'ex-drawer--right'],
      ['top', 'ex-drawer--top'],
      ['bottom', 'ex-drawer--bottom'],
    ])('应该正确应用 %s 位置样式', async (placement, className) => {
      const wrapper = mount(ExDrawer, {
        props: {
          modelValue: true,
          placement: placement as any,
        },
        attachTo: document.body,
      });

      await nextTick();

      const drawer = document.querySelector('.ex-drawer');
      expect(drawer?.classList.contains(className)).toBe(true);
    });
  });

  describe('抽屉尺寸', () => {
    it('应该应用预设尺寸', async () => {
      const wrapper = mount(ExDrawer, {
        props: {
          modelValue: true,
          size: 'small',
        },
        attachTo: document.body,
      });

      await nextTick();

      const drawer = document.querySelector('.ex-drawer') as HTMLElement;
      expect(drawer?.style.width).toBe('300px');
    });

    it('应该应用自定义数字尺寸', async () => {
      const wrapper = mount(ExDrawer, {
        props: {
          modelValue: true,
          size: 600,
        },
        attachTo: document.body,
      });

      await nextTick();

      const drawer = document.querySelector('.ex-drawer') as HTMLElement;
      expect(drawer?.style.width).toBe('600px');
    });

    it('应该应用自定义字符串尺寸', async () => {
      const wrapper = mount(ExDrawer, {
        props: {
          modelValue: true,
          size: '50%',
        },
        attachTo: document.body,
      });

      await nextTick();

      const drawer = document.querySelector('.ex-drawer') as HTMLElement;
      expect(drawer?.style.width).toBe('50%');
    });
  });

  describe('事件处理', () => {
    it('应该触发打开事件', async () => {
      const onOpen = vi.fn();
      // 注：onOpened 依赖 Transition 动画完成回调，在 jsdom 中不会触发

      const wrapper = mount(ExDrawer, {
        props: {
          modelValue: false,
          onOpen,
        },
        attachTo: document.body,
      });

      await wrapper.setProps({ modelValue: true });
      await nextTick();

      expect(onOpen).toHaveBeenCalled();
    });

    it('应该触发关闭事件', async () => {
      const onClose = vi.fn();
      // 注：onClosed 依赖 Transition 的 @after-leave 回调，在 jsdom 中不会触发

      const wrapper = mount(ExDrawer, {
        props: {
          modelValue: true,
          onClose,
        },
        attachTo: document.body,
      });

      await nextTick();
      await wrapper.setProps({ modelValue: false });
      await nextTick();

      expect(onClose).toHaveBeenCalled();
    });

    it('应该触发确认事件', async () => {
      const onOk = vi.fn();

      const wrapper = mount(ExDrawer, {
        props: {
          modelValue: true,
          showFooter: true,
          onOk,
        },
        attachTo: document.body,
      });

      await nextTick();

      const okButton = document.querySelectorAll('.ex-button')[1] as HTMLElement;
      okButton?.click();

      expect(onOk).toHaveBeenCalled();
    });

    it('应该触发取消事件', async () => {
      const onCancel = vi.fn();

      const wrapper = mount(ExDrawer, {
        props: {
          modelValue: true,
          showFooter: true,
          onCancel,
        },
        attachTo: document.body,
      });

      await nextTick();

      const cancelButton = document.querySelectorAll('.ex-button')[0] as HTMLElement;
      cancelButton?.click();

      expect(onCancel).toHaveBeenCalled();
    });

    it('点击关闭按钮应该关闭抽屉', async () => {
      const wrapper = mount(ExDrawer, {
        props: {
          modelValue: true,
          closable: true,
        },
        attachTo: document.body,
      });

      await nextTick();

      const closeButton = document.querySelector('.ex-drawer__close') as HTMLElement;
      closeButton?.click();

      // 第一个事件是打开时的 true，第二个是关闭时的 false
      const events = wrapper.emitted('update:modelValue');
      expect(events?.[events.length - 1]).toEqual([false]);
    });

    it('点击遮罩层应该关闭抽屉', async () => {
      const wrapper = mount(ExDrawer, {
        props: {
          modelValue: true,
          mask: true,
          maskClosable: true,
        },
        attachTo: document.body,
      });

      await nextTick();

      const mask = document.querySelector('.ex-drawer-mask') as HTMLElement;
      mask?.click();

      // 第一个事件是打开时的 true，第二个是关闭时的 false
      const events = wrapper.emitted('update:modelValue');
      expect(events?.[events.length - 1]).toEqual([false]);
    });

    it('maskClosable 为 false 时点击遮罩层不应该关闭', async () => {
      const wrapper = mount(ExDrawer, {
        props: {
          modelValue: true,
          mask: true,
          maskClosable: false,
        },
        attachTo: document.body,
      });

      await nextTick();

      const eventsBeforeClick = wrapper.emitted('update:modelValue')?.length || 0;

      const mask = document.querySelector('.ex-drawer-mask') as HTMLElement;
      mask?.click();

      const eventsAfterClick = wrapper.emitted('update:modelValue')?.length || 0;

      // 点击后不应该有新的事件
      expect(eventsAfterClick).toBe(eventsBeforeClick);
    });
  });

  describe('自定义样式', () => {
    it('应该应用自定义类名', async () => {
      const wrapper = mount(ExDrawer, {
        props: {
          modelValue: true,
          customClass: 'custom-drawer',
        },
        attachTo: document.body,
      });

      await nextTick();

      const drawer = document.querySelector('.ex-drawer');
      expect(drawer?.classList.contains('custom-drawer')).toBe(true);
    });

    it('应该应用自定义层级', async () => {
      const wrapper = mount(ExDrawer, {
        props: {
          modelValue: true,
          zIndex: 2000,
        },
        attachTo: document.body,
      });

      await nextTick();

      const drawerWrapper = document.querySelector('.ex-drawer-wrapper') as HTMLElement;
      expect(drawerWrapper?.style.zIndex).toBe('2000');
    });
  });

  describe('插槽', () => {
    it('应该支持默认插槽', async () => {
      const wrapper = mount(ExDrawer, {
        props: {
          modelValue: true,
        },
        slots: {
          default: '<div class="custom-content">自定义内容</div>',
        },
        attachTo: document.body,
      });

      await nextTick();

      expect(document.querySelector('.custom-content')).toBeTruthy();
    });

    it('应该支持标题插槽', async () => {
      const wrapper = mount(ExDrawer, {
        props: {
          modelValue: true,
        },
        slots: {
          title: '<span class="custom-title">自定义标题</span>',
        },
        attachTo: document.body,
      });

      await nextTick();

      expect(document.querySelector('.custom-title')).toBeTruthy();
    });

    it('应该支持底部插槽', async () => {
      const wrapper = mount(ExDrawer, {
        props: {
          modelValue: true,
        },
        slots: {
          footer: '<div class="custom-footer">自定义底部</div>',
        },
        attachTo: document.body,
      });

      await nextTick();

      expect(document.querySelector('.custom-footer')).toBeTruthy();
    });
  });

  describe('无障碍支持', () => {
    it('应该有正确的 ARIA 属性', async () => {
      const wrapper = mount(ExDrawer, {
        props: {
          modelValue: true,
          title: '抽屉标题',
          ariaLabel: '自定义标签',
        },
        attachTo: document.body,
      });

      await nextTick();

      const drawer = document.querySelector('.ex-drawer');
      expect(drawer?.getAttribute('role')).toBe('dialog');
      expect(drawer?.getAttribute('aria-modal')).toBe('true');
      expect(drawer?.getAttribute('aria-label')).toBe('自定义标签');
    });
  });

  describe('暴露的方法', () => {
    it('应该暴露 open 和 close 方法', async () => {
      const wrapper = mount(ExDrawer, {
        props: {
          modelValue: false,
        },
        attachTo: document.body,
      });

      const exposed = wrapper.vm as any;
      expect(exposed.open).toBeDefined();
      expect(exposed.close).toBeDefined();
      expect(exposed.getElement).toBeDefined();
    });
  });
});
