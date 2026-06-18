<template>
  <div :class="rootClasses">
    <!-- 头部：标题 + 操作区 -->
    <div v-if="title || $slots.title || $slots.extra" class="ex-descriptions__header">
      <div class="ex-descriptions__title">
        <slot name="title">
          {{ title }}
        </slot>
      </div>
      <div v-if="$slots.extra" class="ex-descriptions__extra">
        <slot name="extra" />
      </div>
    </div>

    <!-- 主体表格 -->
    <div class="ex-descriptions__body">
      <table class="ex-descriptions__table">
        <tbody>
          <tr v-for="(row, ri) in tableRows" :key="ri" class="ex-descriptions__row">
            <template v-for="(cell, ci) in row" :key="ci">
              <th
                v-if="cell.kind === 'label'"
                class="ex-descriptions__cell ex-descriptions__label"
                :class="[cell.className, alignClass(cell.align)]"
                :style="cell.style"
                :colspan="cell.colspan"
              >
                <span class="ex-descriptions__label-inner">
                  <Cell :nodes="cell.nodes" />
                  <span v-if="showColon" class="ex-descriptions__colon">:</span>
                </span>
              </th>
              <td
                v-else
                class="ex-descriptions__cell ex-descriptions__content"
                :class="[cell.className, alignClass(cell.align)]"
                :style="cell.style"
                :colspan="cell.colspan"
              >
                <Cell :nodes="cell.nodes" />
              </td>
            </template>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useSlots, Fragment } from 'vue';
import type { Slots } from 'vue';
import type { VNode, VNodeArrayChildren, CSSProperties } from 'vue';
import type { ExDescriptionsProps, DescriptionsAlign } from './types';
import { useComponentSize } from '../config-provider/composables';

defineOptions({
  name: 'ExDescriptions',
});

const props = withDefaults(defineProps<ExDescriptionsProps>(), {
  column: 3,
  border: false,
  size: undefined,
  direction: 'horizontal',
  labelAlign: 'left',
  contentAlign: 'left',
  colon: true,
});

const slots = useSlots();
const componentSize = useComponentSize(computed(() => props.size));

const showColon = computed(() => !props.border && props.colon);

const rootClasses = computed(() => [
  'ex-descriptions',
  `ex-descriptions--${componentSize.value}`,
  `ex-descriptions--${props.direction}`,
  { 'ex-descriptions--border': props.border },
]);

// 函数式组件：渲染收集到的 vnode 数组或纯文本
const Cell = (p: { nodes: VNode[] | string | undefined }) => p.nodes ?? '';

interface ParsedItem {
  label?: string;
  contentNodes: VNode[] | string;
  span: number;
  labelAlign?: DescriptionsAlign;
  contentAlign?: DescriptionsAlign;
  labelClass?: string;
  contentClass?: string;
  labelStyle?: CSSProperties;
  contentStyle?: CSSProperties;
  labelNodes?: VNode[];
}

const getProp = (vprops: Record<string, unknown> | null, ...names: string[]): unknown => {
  if (!vprops) return undefined;
  for (const n of names) {
    if (vprops[n] !== undefined) return vprops[n];
  }
  return undefined;
};

const isItemVNode = (vnode: VNode): boolean => {
  const type = vnode.type as { name?: string; __name?: string } | undefined;
  return (
    !!type &&
    typeof type === 'object' &&
    (type.name === 'ExDescriptionsItem' || type.__name === 'ExDescriptionsItem')
  );
};

// 递归展开 Fragment（v-for / template 包裹会产生 Fragment）
const flatten = (children: VNodeArrayChildren | undefined): VNode[] => {
  const result: VNode[] = [];
  if (!children) return result;
  for (const child of children) {
    if (child == null || typeof child !== 'object') continue;
    const vnode = child as VNode;
    if (vnode.type === Fragment) {
      result.push(...flatten(vnode.children as VNodeArrayChildren));
    } else {
      result.push(vnode);
    }
  }
  return result;
};

const items = computed<ParsedItem[]>(() => {
  const raw = ((slots as Slots).default?.() ?? []) as VNodeArrayChildren;
  return flatten(raw)
    .filter(isItemVNode)
    .map(vnode => {
      const vp = (vnode.props ?? {}) as Record<string, unknown>;
      const children = (vnode.children ?? {}) as Record<string, (() => VNode[]) | undefined>;
      const span = Number(getProp(vp, 'span') ?? 1) || 1;
      return {
        label: getProp(vp, 'label') as string | undefined,
        labelNodes: typeof children.label === 'function' ? children.label() : undefined,
        contentNodes: typeof children.default === 'function' ? children.default() : '',
        span,
        labelAlign: getProp(vp, 'labelAlign', 'label-align') as DescriptionsAlign | undefined,
        contentAlign: getProp(vp, 'contentAlign', 'content-align') as DescriptionsAlign | undefined,
        labelClass: getProp(vp, 'labelClass', 'label-class') as string | undefined,
        contentClass: getProp(vp, 'contentClass', 'content-class') as string | undefined,
        labelStyle: getProp(vp, 'labelStyle', 'label-style') as CSSProperties | undefined,
        contentStyle: getProp(vp, 'contentStyle', 'content-style') as CSSProperties | undefined,
      };
    });
});

// 按 column 分行，每行最后一项扩展填满剩余列
const rowGroups = computed<ParsedItem[][]>(() => {
  const col = Math.max(1, props.column);
  const rows: ParsedItem[][] = [];
  let current: ParsedItem[] = [];
  let used = 0;

  for (const item of items.value) {
    const span = Math.min(item.span, col);
    if (used + span > col) {
      if (current.length) {
        const last = current[current.length - 1]!;
        last.span += col - used;
        rows.push(current);
      }
      current = [];
      used = 0;
    }
    current.push({ ...item, span });
    used += span;
  }

  if (current.length) {
    const last = current[current.length - 1]!;
    last.span += col - used;
    rows.push(current);
  }

  return rows;
});

interface RenderCell {
  kind: 'label' | 'content';
  nodes: VNode[] | string | undefined;
  colspan: number;
  align?: DescriptionsAlign;
  className?: string;
  style?: CSSProperties;
}

const labelOf = (item: ParsedItem): VNode[] | string => item.labelNodes ?? item.label ?? '';
const mergedLabelStyle = (item: ParsedItem): CSSProperties => ({
  ...(props.labelStyle || {}),
  ...(item.labelStyle || {}),
});
const mergedContentStyle = (item: ParsedItem): CSSProperties => ({
  ...(props.contentStyle || {}),
  ...(item.contentStyle || {}),
});

const tableRows = computed<RenderCell[][]>(() => {
  const out: RenderCell[][] = [];

  for (const group of rowGroups.value) {
    if (props.direction === 'vertical') {
      out.push(
        group.map(item => ({
          kind: 'label' as const,
          nodes: labelOf(item),
          colspan: item.span,
          align: item.labelAlign ?? props.labelAlign,
          className: item.labelClass,
          style: mergedLabelStyle(item),
        }))
      );
      out.push(
        group.map(item => ({
          kind: 'content' as const,
          nodes: item.contentNodes,
          colspan: item.span,
          align: item.contentAlign ?? props.contentAlign,
          className: item.contentClass,
          style: mergedContentStyle(item),
        }))
      );
    } else {
      const cells: RenderCell[] = [];
      for (const item of group) {
        cells.push({
          kind: 'label',
          nodes: labelOf(item),
          colspan: 1,
          align: item.labelAlign ?? props.labelAlign,
          className: item.labelClass,
          style: mergedLabelStyle(item),
        });
        cells.push({
          kind: 'content',
          nodes: item.contentNodes,
          colspan: item.span * 2 - 1,
          align: item.contentAlign ?? props.contentAlign,
          className: item.contentClass,
          style: mergedContentStyle(item),
        });
      }
      out.push(cells);
    }
  }

  return out;
});

const alignClass = (align?: DescriptionsAlign): string =>
  align ? `ex-descriptions__cell--${align}` : '';
</script>

<style scoped lang="scss" src="./ExDescriptions.scss"></style>
