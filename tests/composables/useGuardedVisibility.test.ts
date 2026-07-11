import { flushPromises, mount, type VueWrapper } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  useGuardedVisibility,
  type UseGuardedVisibilityReturn,
  type VisibilityGuard,
} from '../../src/composables/useGuardedVisibility';

const GuardedVisibilityHarness = defineComponent({
  props: {
    modelValue: { type: Boolean, default: false },
    beforeOpen: { type: Function, default: undefined },
    beforeClose: { type: Function, default: undefined },
  },
  emits: ['update:modelValue', 'open', 'close', 'guardError'],
  setup(props, { emit, expose }) {
    const state = useGuardedVisibility({
      modelValue: () => props.modelValue,
      beforeOpen: () => props.beforeOpen as VisibilityGuard | undefined,
      beforeClose: () => props.beforeClose as VisibilityGuard | undefined,
      requestModelValue: value => emit('update:modelValue', value),
      onOpen: () => emit('open'),
      onClose: () => emit('close'),
      onGuardError: (error, phase) => emit('guardError', error, phase),
      skipRedundantRequests: true,
    });

    expose(state);
    return () => h('div', { 'data-visible': String(state.visible.value) });
  },
});

describe('useGuardedVisibility', () => {
  const wrappers: VueWrapper[] = [];

  const mountHarness = (props: Record<string, unknown> = {}) => {
    const wrapper = mount(GuardedVisibilityHarness, { props });
    wrappers.push(wrapper);
    return wrapper;
  };

  const getState = (wrapper: VueWrapper): UseGuardedVisibilityReturn =>
    wrapper.vm as unknown as UseGuardedVisibilityReturn;

  afterEach(() => {
    wrappers.splice(0).forEach(wrapper => wrapper.unmount());
    vi.restoreAllMocks();
  });

  it('无守卫的初始打开状态同步生效，保证服务端与客户端首屏一致', () => {
    const wrapper = mountHarness({ modelValue: true });

    expect(wrapper.attributes('data-visible')).toBe('true');
    expect(wrapper.emitted('open')).toEqual([[]]);
  });

  it('同步守卫异常按阶段暴露并拒绝本次打开', () => {
    const error = new Error('同步校验失败');
    const wrapper = mountHarness({
      modelValue: true,
      beforeOpen: () => {
        throw error;
      },
    });

    expect(wrapper.attributes('data-visible')).toBe('false');
    expect(wrapper.emitted('guardError')).toEqual([[error, 'open']]);
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]]);
  });

  it('关闭状态下 close 幂等返回 false，不执行无意义守卫与更新', async () => {
    const beforeClose = vi.fn().mockReturnValue(true);
    const wrapper = mountHarness({ modelValue: false, beforeClose });

    await expect(getState(wrapper).requestClose()).resolves.toBe(false);
    expect(beforeClose).not.toHaveBeenCalled();
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  });

  it('并发关闭共享同一任务并只执行一次守卫', async () => {
    let resolveGuard: ((value: boolean) => void) | undefined;
    const beforeClose = vi.fn(() => new Promise<boolean>(resolve => (resolveGuard = resolve)));
    const wrapper = mountHarness({ modelValue: true, beforeClose });
    const state = getState(wrapper);

    const first = state.requestClose();
    const second = state.requestClose();
    expect(second).toBe(first);
    expect(beforeClose).toHaveBeenCalledTimes(1);

    resolveGuard?.(true);
    await expect(first).resolves.toBe(true);
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]]);
  });

  it('旧关闭守卫不会关闭外部已经重新打开的新一轮内容', async () => {
    let resolveGuard: ((value: boolean) => void) | undefined;
    const wrapper = mountHarness({
      modelValue: true,
      beforeClose: () => new Promise<boolean>(resolve => (resolveGuard = resolve)),
    });
    const operation = getState(wrapper).requestClose();

    await wrapper.setProps({ modelValue: false });
    await wrapper.setProps({ modelValue: true });
    expect(wrapper.attributes('data-visible')).toBe('true');

    resolveGuard?.(true);
    await expect(operation).resolves.toBe(false);
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  });

  it('打开请求可撤销尚未完成的关闭任务且不产生重复更新', async () => {
    let resolveGuard: ((value: boolean) => void) | undefined;
    const wrapper = mountHarness({
      modelValue: true,
      beforeClose: () => new Promise<boolean>(resolve => (resolveGuard = resolve)),
    });
    const state = getState(wrapper);
    const operation = state.requestClose();

    state.requestOpen();
    resolveGuard?.(true);
    await expect(operation).resolves.toBe(false);
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    expect(wrapper.attributes('data-visible')).toBe('true');
  });

  it('已打开时 open 幂等，关闭时只请求一次父级更新', async () => {
    const wrapper = mountHarness({ modelValue: true });
    const state = getState(wrapper);

    state.requestOpen();
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();

    await wrapper.setProps({ modelValue: false });
    state.requestOpen();
    expect(wrapper.emitted('update:modelValue')).toEqual([[true]]);
    await flushPromises();
  });
});
