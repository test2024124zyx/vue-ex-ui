import { afterEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { h, nextTick, reactive, ref } from 'vue';
import ExForm from '../../../src/components/form/ExForm.vue';
import ExFormItem from '../../../src/components/form/ExFormItem.vue';
import ExSelect from '../../../src/components/select/ExSelect.vue';
import ExTreeSelect from '../../../src/components/tree-select/ExTreeSelect.vue';
import ExCascader from '../../../src/components/cascader/ExCascader.vue';
import type { FormInstance } from '../../../src/components/form/types';

const wrappers: Array<{ unmount(): void }> = [];
afterEach(() => wrappers.splice(0).forEach(wrapper => wrapper.unmount()));

describe('选择器重置撤销搜索与节点加载', () => {
  it.each(['select', 'tree-select', 'cascader'] as const)(
    '%s 同值重置关闭面板，中止旧请求，重新打开仍可使用',
    async kind => {
      const form = ref<FormInstance>();
      const model = reactive({ choice: kind === 'cascader' ? [] : null });
      const signals: AbortSignal[] = [];
      const results: Array<(value: Array<{ value: string; label: string }>) => void> = [];
      const loader = vi.fn((_query: unknown, context: { signal: AbortSignal }) => {
        signals.push(context.signal);
        return new Promise<Array<{ value: string; label: string }>>(resolve =>
          results.push(resolve)
        );
      });
      const nodes = [{ value: 'root', label: '根', isLeaf: false }];
      const renderControl = () =>
        kind === 'select'
          ? h(ExSelect, { modelValue: null, searchable: true, remote: true, remoteLoader: loader })
          : kind === 'tree-select'
            ? h(ExTreeSelect, {
                modelValue: null,
                data: nodes,
                loadData: loader,
                teleported: false,
              })
            : h(ExCascader, {
                modelValue: [],
                options: nodes,
                loadData: loader,
                teleported: false,
              });
      const wrapper = mount({
        render: () =>
          h(ExForm, { ref: form, model }, () => h(ExFormItem, { prop: 'choice' }, renderControl)),
      });
      wrappers.push(wrapper);
      const open = async () => {
        await wrapper.get('[role="combobox"]').trigger('click');
        if (kind === 'tree-select') void wrapper.getComponent(ExTreeSelect).vm.reloadNode('root');
        if (kind === 'cascader') void wrapper.getComponent(ExCascader).vm.reloadNode(['root']);
        await nextTick();
      };
      await open();
      expect(signals).toHaveLength(1);
      form.value!.resetFields();
      await nextTick();
      expect(signals[0]?.aborted).toBe(true);
      expect(wrapper.get('[role="combobox"]').attributes('aria-expanded')).toBe('false');
      results[0]!([{ value: 'stale', label: '旧结果' }]);
      await flushPromises();
      expect(wrapper.text()).not.toContain('旧结果');
      await open();
      expect(signals).toHaveLength(2);
      results[1]!([{ value: 'current', label: '新结果' }]);
      await flushPromises();
      const control =
        kind === 'select'
          ? wrapper.getComponent(ExSelect)
          : kind === 'tree-select'
            ? wrapper.getComponent(ExTreeSelect)
            : wrapper.getComponent(ExCascader);
      expect(control.emitted('update:modelValue')).toBeUndefined();
      if (kind !== 'select') expect(control.emitted('load')).toHaveLength(1);
    }
  );
});
