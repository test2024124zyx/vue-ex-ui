import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, ref } from 'vue';
import { useOverlay } from '../../src/composables/useOverlay';
import {
  createFocusTrap,
  registerOverlay,
  scheduleAutoFocus,
} from '../../src/composables/overlay-manager';

const OverlayHarness = defineComponent({
  props: {
    active: { type: Boolean, default: false },
    lockScroll: { type: Boolean, default: true },
    trapFocus: { type: Boolean, default: true },
    onEscape: { type: Function, required: true },
  },
  setup(props) {
    const container = ref<HTMLElement>();
    useOverlay({
      active: () => props.active,
      container,
      lockScroll: () => props.lockScroll,
      trapFocus: () => props.trapFocus,
      autoFocus: () => false,
      onEscape: () => (props.onEscape as () => void)(),
    });
    return () =>
      h('div', { ref: container, class: 'overlay-harness' }, [
        h('button', { class: 'first' }, 'First'),
        h('button', { class: 'last' }, 'Last'),
      ]);
  },
});

describe('useOverlay', () => {
  const wrappers: Array<ReturnType<typeof mount>> = [];

  afterEach(() => {
    wrappers.splice(0).forEach(wrapper => wrapper.unmount());
    document.body.innerHTML = '';
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    vi.restoreAllMocks();
  });

  const mountOverlay = (props: {
    onEscape: () => void;
    active?: boolean;
    lockScroll?: boolean;
    trapFocus?: boolean;
  }) => {
    const wrapper = mount(OverlayHarness, { props, attachTo: document.body });
    wrappers.push(wrapper);
    return wrapper;
  };

  it('嵌套浮层使用引用计数锁定滚动，最后一层关闭后恢复原样', async () => {
    document.body.style.overflow = 'auto';
    const first = mountOverlay({ active: true, onEscape: vi.fn() });
    const second = mountOverlay({ active: true, onEscape: vi.fn() });
    expect(document.body.style.overflow).toBe('hidden');

    await first.setProps({ active: false });
    expect(document.body.style.overflow).toBe('hidden');
    await second.setProps({ active: false });
    expect(document.body.style.overflow).toBe('auto');
  });

  it('打开期间动态切换 lockScroll 会严格配对加锁与解锁', async () => {
    const wrapper = mountOverlay({ active: true, lockScroll: true, onEscape: vi.fn() });
    expect(document.body.style.overflow).toBe('hidden');

    await wrapper.setProps({ lockScroll: false });
    expect(document.body.style.overflow).toBe('');
    await wrapper.setProps({ lockScroll: true });
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('Escape 只交给最顶层浮层处理', async () => {
    const firstEscape = vi.fn();
    const secondEscape = vi.fn();
    const first = mountOverlay({ active: true, onEscape: firstEscape });
    const second = mountOverlay({ active: true, onEscape: secondEscape });

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(firstEscape).not.toHaveBeenCalled();
    expect(secondEscape).toHaveBeenCalledTimes(1);

    await second.setProps({ active: false });
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(firstEscape).toHaveBeenCalledTimes(1);
    await first.setProps({ active: false });
  });

  it('焦点圈闭在末项 Tab 时回到首项，关闭后移除监听', async () => {
    const wrapper = mountOverlay({ active: true, onEscape: vi.fn() });
    await wrapper.vm.$nextTick();
    const first = wrapper.find<HTMLButtonElement>('.first').element;
    const last = wrapper.find<HTMLButtonElement>('.last').element;
    last.focus();
    last.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    expect(document.activeElement).toBe(first);

    await wrapper.setProps({ active: false });
    last.focus();
    last.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    expect(document.activeElement).toBe(last);
  });

  it('底层浮层栈应该只响应可逃逸的顶层项并支持非顶层注销', () => {
    const firstEscape = vi.fn();
    const secondEscape = vi.fn();
    const first = registerOverlay({ canEscape: () => true, onEscape: firstEscape });
    const second = registerOverlay({ canEscape: () => false, onEscape: secondEscape });

    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
    );
    expect(firstEscape).not.toHaveBeenCalled();
    expect(secondEscape).not.toHaveBeenCalled();
    expect(first()).toBe(false);
    expect(second()).toBe(true);
    expect(second()).toBe(false);
  });

  it('没有可聚焦元素时焦点圈闭应该聚焦容器并阻止 Tab', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const stop = createFocusTrap(container);
    const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    container.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(container);
    stop();
  });

  it('自动聚焦应该在两帧后聚焦首个控件，断开节点时不聚焦', () => {
    const callbacks: FrameRequestCallback[] = [];
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => {
      callbacks.push(callback);
      return callbacks.length;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => undefined);

    const container = document.createElement('div');
    const button = document.createElement('button');
    container.appendChild(button);
    document.body.appendChild(container);
    const stop = scheduleAutoFocus(container);
    callbacks[0]?.(0);
    callbacks[1]?.(0);
    expect(document.activeElement).toBe(button);
    stop();

    const detached = document.createElement('div');
    const detachedStop = scheduleAutoFocus(detached);
    callbacks[2]?.(0);
    callbacks[3]?.(0);
    expect(document.activeElement).toBe(button);
    detachedStop();
  });
});
