<template>
  <div :class="rootClasses">
    <div
      v-if="hasHeader"
      class="ex-descriptions__header"
      :class="{ 'has-title': hasTitle }"
    >
      <div
        v-if="hasTitle"
        :id="titleId"
        class="ex-descriptions__title"
      >
        <slot name="title">
          {{ title }}
        </slot>
      </div>
      <div
        v-if="$slots.extra"
        class="ex-descriptions__extra"
      >
        <slot name="extra" />
      </div>
    </div>

    <div class="ex-descriptions__body">
      <table
        class="ex-descriptions__table"
        :aria-labelledby="hasTitle ? titleId : undefined"
      >
        <tbody>
          <tr
            v-for="(row, rowIndex) in tableRows"
            :key="rowIndex"
            class="ex-descriptions__row"
          >
            <template
              v-for="cell in row"
              :key="cell.key"
            >
              <th
                v-if="cell.kind === 'label'"
                :id="cell.id"
                class="ex-descriptions__cell ex-descriptions__label"
                :class="[cell.className, alignClass(cell.align)]"
                :style="cell.style"
                :colspan="cell.colspan"
              >
                <span class="ex-descriptions__label-inner">
                  <Cell :nodes="cell.nodes" />
                  <span
                    v-if="showColon && cell.hasLabel"
                    class="ex-descriptions__colon"
                  >
                    :
                  </span>
                </span>
              </th>
              <td
                v-else
                class="ex-descriptions__cell ex-descriptions__content"
                :class="[cell.className, alignClass(cell.align)]"
                :style="cell.style"
                :colspan="cell.colspan"
                :headers="cell.headers"
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
import { computed, Fragment, useId, useSlots } from 'vue';
import type { CSSProperties, Slots, VNode, VNodeArrayChildren } from 'vue';
import { useComponentSize } from '../config-provider/composables';
import type { DescriptionsAlign, DescriptionsClass, ExDescriptionsProps } from './types';

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
const instanceId = useId();
const titleId = `ex-descriptions-title-${instanceId}`;
const hasTitle = computed(() => Boolean(props.title || slots.title));
const hasHeader = computed(() => hasTitle.value || Boolean(slots.extra));
const showColon = computed(() => !props.border && props.colon);

const rootClasses = computed(() => [
  'ex-descriptions',
  `ex-descriptions--${componentSize.value}`,
  `ex-descriptions--${props.direction}`,
  { 'ex-descriptions--border': props.border },
]);

/** 渲染已收集的插槽节点，内容始终由 Vue 进行安全转义。 */
const Cell = (cellProps: { nodes: VNode[] | string | undefined }) => cellProps.nodes ?? '';

interface ParsedItem {
  id: string;
  label?: string;
  labelNodes?: VNode[];
  contentNodes: VNode[] | string;
  hasLabel: boolean;
  span: number;
  labelAlign?: DescriptionsAlign;
  contentAlign?: DescriptionsAlign;
  labelClass?: DescriptionsClass;
  contentClass?: DescriptionsClass;
  labelStyle?: CSSProperties;
  contentStyle?: CSSProperties;
}

const MAX_TABLE_COLUMNS = 1000;
const VALID_ALIGNMENTS: readonly DescriptionsAlign[] = ['left', 'center', 'right'];

const normalizePositiveInteger = (value: unknown, fallback: number, maximum: number): number => {
  let numericValue: number;
  try {
    numericValue = typeof value === 'number' ? value : Number(value);
  } catch {
    return fallback;
  }
  if (!Number.isFinite(numericValue)) return fallback;
  const integer = Math.trunc(numericValue);
  return integer > 0 ? Math.min(integer, maximum) : fallback;
};

const normalizedColumn = computed(() =>
  normalizePositiveInteger(props.column, 3, MAX_TABLE_COLUMNS)
);

const normalizeAlign = (
  value: DescriptionsAlign | undefined,
  fallback: DescriptionsAlign
): DescriptionsAlign => (value && VALID_ALIGNMENTS.includes(value) ? value : fallback);

const getProp = (vnodeProps: Record<string, unknown> | null, ...names: string[]): unknown => {
  if (!vnodeProps) return undefined;
  for (const name of names) {
    if (vnodeProps[name] !== undefined) return vnodeProps[name];
  }
  return undefined;
};

const isItemVNode = (vnode: VNode): boolean => {
  const type = vnode.type as { name?: string; __name?: string } | undefined;
  return Boolean(
    type &&
    typeof type === 'object' &&
    (type.name === 'ExDescriptionsItem' || type.__name === 'ExDescriptionsItem')
  );
};

/** 递归展开 Fragment 与嵌套数组，兼容 template、v-for 和条件插槽。 */
const flatten = (children: VNodeArrayChildren | undefined): VNode[] => {
  const result: VNode[] = [];
  if (!children) return result;
  for (const child of children) {
    if (Array.isArray(child)) {
      result.push(...flatten(child));
      continue;
    }
    if (child == null || typeof child !== 'object') continue;
    const vnode = child as VNode;
    if (vnode.type === Fragment) result.push(...flatten(vnode.children as VNodeArrayChildren));
    else result.push(vnode);
  }
  return result;
};

const items = computed<ParsedItem[]>(() => {
  const raw = ((slots as Slots).default?.() ?? []) as VNodeArrayChildren;
  return flatten(raw)
    .filter(isItemVNode)
    .map((vnode, index) => {
      const vnodeProps = (vnode.props ?? {}) as Record<string, unknown>;
      const children = (vnode.children ?? {}) as Record<string, (() => VNode[]) | undefined>;
      const label = getProp(vnodeProps, 'label') as string | undefined;
      const labelNodes = typeof children.label === 'function' ? children.label() : undefined;
      return {
        id: `ex-descriptions-label-${instanceId}-${index}`,
        label,
        labelNodes,
        contentNodes: typeof children.default === 'function' ? children.default() : '',
        hasLabel: Boolean(label || labelNodes?.length),
        span: normalizePositiveInteger(getProp(vnodeProps, 'span') ?? 1, 1, normalizedColumn.value),
        labelAlign: getProp(vnodeProps, 'labelAlign', 'label-align') as
          DescriptionsAlign | undefined,
        contentAlign: getProp(vnodeProps, 'contentAlign', 'content-align') as
          DescriptionsAlign | undefined,
        labelClass: getProp(vnodeProps, 'labelClass', 'label-class') as
          DescriptionsClass | undefined,
        contentClass: getProp(vnodeProps, 'contentClass', 'content-class') as
          DescriptionsClass | undefined,
        labelStyle: getProp(vnodeProps, 'labelStyle', 'label-style') as CSSProperties | undefined,
        contentStyle: getProp(vnodeProps, 'contentStyle', 'content-style') as
          CSSProperties | undefined,
      };
    });
});

/** 按列数分行，并让每行最后一项填充剩余列。 */
const rowGroups = computed<ParsedItem[][]>(() => {
  const column = normalizedColumn.value;
  const rows: ParsedItem[][] = [];
  let current: ParsedItem[] = [];
  let usedColumns = 0;

  for (const sourceItem of items.value) {
    const item = { ...sourceItem, span: Math.min(sourceItem.span, column) };
    if (usedColumns + item.span > column && current.length) {
      current[current.length - 1]!.span += column - usedColumns;
      rows.push(current);
      current = [];
      usedColumns = 0;
    }
    current.push(item);
    usedColumns += item.span;
  }

  if (current.length) {
    current[current.length - 1]!.span += column - usedColumns;
    rows.push(current);
  }
  return rows;
});

interface RenderCell {
  key: string;
  kind: 'label' | 'content';
  nodes: VNode[] | string | undefined;
  colspan: number;
  hasLabel?: boolean;
  id?: string;
  headers?: string;
  align: DescriptionsAlign;
  className?: DescriptionsClass;
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

const createLabelCell = (item: ParsedItem): RenderCell => ({
  key: `${item.id}-label`,
  kind: 'label',
  id: item.hasLabel ? item.id : undefined,
  nodes: labelOf(item),
  colspan: props.direction === 'vertical' ? item.span : 1,
  hasLabel: item.hasLabel,
  align: normalizeAlign(item.labelAlign, props.labelAlign),
  className: item.labelClass,
  style: mergedLabelStyle(item),
});

const createContentCell = (item: ParsedItem): RenderCell => ({
  key: `${item.id}-content`,
  kind: 'content',
  headers: item.hasLabel ? item.id : undefined,
  nodes: item.contentNodes,
  colspan: props.direction === 'vertical' ? item.span : item.span * 2 - 1,
  align: normalizeAlign(item.contentAlign, props.contentAlign),
  className: item.contentClass,
  style: mergedContentStyle(item),
});

const tableRows = computed<RenderCell[][]>(() => {
  const rows: RenderCell[][] = [];
  for (const group of rowGroups.value) {
    if (props.direction === 'vertical') {
      rows.push(group.map(createLabelCell));
      rows.push(group.map(createContentCell));
    } else {
      rows.push(group.flatMap(item => [createLabelCell(item), createContentCell(item)]));
    }
  }
  return rows;
});

const alignClass = (align: DescriptionsAlign): string => `ex-descriptions__cell--${align}`;
</script>

<style scoped lang="scss" src="./ExDescriptions.scss"></style>
