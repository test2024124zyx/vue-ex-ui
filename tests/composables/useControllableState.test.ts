import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, effectScope, h, nextTick, ref, type PropType } from 'vue';
import { useControllableState } from '../../src/composables/useControllableState';

describe('useControllableState', () => {
  it('解除受控后的同轮合法请求不会被延迟快照覆盖', async () => {
    const scope = effectScope();
    const controlled = ref<number | undefined>(5);
    const state = scope.run(() =>
      useControllableState({ controlledValue: () => controlled.value, defaultValue: 0 })
    )!;
    try {
      controlled.value = undefined;
      state.request(9);
      expect(state.value.value).toBe(9);
      await nextTick();
      expect(state.value.value).toBe(9);
    } finally {
      scope.stop();
    }
  });

  it('null 是已确认的受控空值，同步读取及解除控制均不能回退旧值', async () => {
    const scope = effectScope();
    const controlled = ref<string | null | undefined>('selected');
    const state = scope.run(() =>
      useControllableState<string | null>({
        controlledValue: () => controlled.value,
        defaultValue: 'default',
      })
    )!;
    try {
      controlled.value = null;
      expect(state.value.value).toBeNull();
      state.request('rejected');
      expect(state.value.value).toBeNull();
      await nextTick();
      controlled.value = undefined;
      await nextTick();
      expect(state.value.value).toBeNull();
      state.request('accepted');
      expect(state.value.value).toBe('accepted');
    } finally {
      scope.stop();
    }
  });

  it('非受控模式立即提交内部状态并通知调用方', async () => {
    const changes: string[] = [];
    const Host = defineComponent({
      props: {
        value: {
          type: String,
          default: undefined,
        },
      },
      setup(props, { expose }) {
        const state = useControllableState({
          controlledValue: () => props.value,
          defaultValue: 'list',
          onChange: value => changes.push(value),
        });
        expose(state);
        return () => h('span', state.value.value);
      },
    });
    const wrapper = mount(Host);

    (wrapper.vm as unknown as { request: (value: string) => void }).request('grid');
    await nextTick();

    expect(wrapper.text()).toBe('grid');
    expect(changes).toEqual(['grid']);
  });

  it('受控模式只发出更新请求，等待外部值真正变化', async () => {
    const changes: string[] = [];
    const Host = defineComponent({
      props: {
        value: {
          type: String,
          default: undefined,
        },
      },
      setup(props, { expose }) {
        const state = useControllableState({
          controlledValue: () => props.value,
          defaultValue: 'list',
          onChange: value => changes.push(value),
        });
        expose(state);
        return () => h('span', state.value.value);
      },
    });
    const wrapper = mount(Host, { props: { value: 'list' } });

    (wrapper.vm as unknown as { request: (value: string) => void }).request('grid');
    await nextTick();
    expect(wrapper.text()).toBe('list');
    expect(changes).toEqual(['grid']);

    await wrapper.setProps({ value: 'grid' });
    expect(wrapper.text()).toBe('grid');
  });

  it('从受控切换为非受控时保留最后一次真实外部状态', async () => {
    const Host = defineComponent({
      props: {
        value: {
          type: String,
          default: undefined,
        },
      },
      setup(props) {
        const state = useControllableState({
          controlledValue: () => props.value,
          defaultValue: 'list',
        });
        return () => h('span', state.value.value);
      },
    });
    const wrapper = mount(Host, { props: { value: 'grid' } });

    await wrapper.setProps({ value: 'table' });
    await wrapper.setProps({ value: undefined });

    expect(wrapper.text()).toBe('table');
  });

  it('通过 clone 隔离数组默认值、外部值和更新载荷', async () => {
    const defaults = ['a'];
    const changes: string[][] = [];
    const Host = defineComponent({
      props: {
        value: {
          type: Array as PropType<string[]>,
          default: undefined,
        },
      },
      setup(props, { expose }) {
        const state = useControllableState<string[]>({
          controlledValue: () => props.value,
          defaultValue: defaults,
          clone: value => [...value],
          onChange: value => changes.push(value),
        });
        expose(state);
        return () => h('span', state.value.value.join(','));
      },
    });
    const wrapper = mount(Host);
    defaults.push('pollution');
    expect(wrapper.text()).toBe('a');

    const next = ['b'];
    (wrapper.vm as unknown as { request: (value: string[]) => void }).request(next);
    next.push('pollution');
    await nextTick();

    expect(wrapper.text()).toBe('b');
    expect(changes).toEqual([['b']]);
    expect(changes[0]).not.toBe(next);
  });
});
