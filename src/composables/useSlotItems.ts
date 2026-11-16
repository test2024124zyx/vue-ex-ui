import { computed, inject, isVNode, ssrContextKey, useSlots } from 'vue';
import type { VNode } from 'vue';
import { useRenderComputed } from './useRenderComputed';

/** 在渲染前收集已声明子项，服务端无需等待 mounted 注册便可确定导航和总数。 */
export function useSlotItems(componentName: string) {
  const slots = useSlots();
  const isServer = inject(ssrContextKey, undefined) !== undefined;
  let serverNodes: VNode[] | undefined;
  const readSlot = () => slots.default?.() ?? [];
  // 服务端同一次渲染中，导航与内容共享一份实例内的插槽节点。
  const nodes = useRenderComputed(() => (isServer ? (serverNodes ??= readSlot()) : readSlot()));
  const items = computed(() => {
    const result: VNode[] = [];
    const visit = (value: unknown) => {
      if (Array.isArray(value)) {
        value.forEach(visit);
        return;
      }
      if (!isVNode(value)) return;
      const type = value.type as { name?: string; __name?: string };
      if (type.name === componentName || type.__name === componentName) result.push(value);
      else if (Array.isArray(value.children)) visit(value.children);
    };
    visit(nodes.value);
    return result;
  });
  // 读取和渲染使用同一组 VNode，避免重复调用插槽产生不同的条件分支。
  const SlotContent = () => nodes.value;
  return { items, nodes, SlotContent };
}
