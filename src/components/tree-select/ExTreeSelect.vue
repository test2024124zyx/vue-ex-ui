<template>
  <div
    ref="rootRef"
    :class="rootClasses"
    :style="rootStyle"
  >
    <!-- 触发器 -->
    <div
      ref="triggerRef"
      class="ex-tree-select__trigger"
      role="combobox"
      aria-haspopup="tree"
      :aria-controls="panelId"
      :aria-expanded="visible"
      :aria-disabled="disabled"
      :tabindex="disabled ? undefined : 0"
      @click="handleTriggerClick"
      @keydown="handleKeydown"
      @focus="handleFocus"
      @blur="handleBlur"
    >
      <div class="ex-tree-select__value">
        <!-- 多选标签 -->
        <template v-if="multiple">
          <span
            v-for="tag in displayTags"
            :key="tag.value"
            class="ex-tree-select__tag"
          >
            <span class="ex-tree-select__tag-label">{{ tag.label }}</span>
            <button
              v-if="!disabled"
              type="button"
              class="ex-tree-select__tag-close"
              :aria-label="t('removeTag')"
              @click.stop="removeTag(tag.value)"
            >
              ×
            </button>
          </span>
          <span
            v-if="collapsedCount > 0"
            class="ex-tree-select__tag ex-tree-select__tag--count"
          >
            +{{ collapsedCount }}
          </span>
          <span
            v-if="selectedNodes.length === 0"
            class="ex-tree-select__placeholder"
          >
            {{ placeholder || t('placeholder') }}
          </span>
        </template>

        <!-- 单选 -->
        <template v-else>
          <span
            v-if="selectedSingleNode"
            class="ex-tree-select__label"
          >
            {{ selectedSingleNode.label }}
          </span>
          <span
            v-else
            class="ex-tree-select__placeholder"
          >
            {{ placeholder || t('placeholder') }}
          </span>
        </template>
      </div>

      <button
        v-if="showClear"
        type="button"
        class="ex-tree-select__clear"
        :aria-label="t('clear')"
        @click.stop="handleClear"
      >
        <ExIcon
          icon="close-circle-line"
          :size="15"
          aria-hidden="true"
        />
      </button>
      <ExIcon
        class="ex-tree-select__arrow"
        icon="arrow-down-s-line"
        :size="14"
        aria-hidden="true"
      />
    </div>

    <!-- 下拉面板 -->
    <Teleport
      to="body"
      :disabled="!teleported"
    >
      <Transition name="ex-tree-select-dropdown">
        <div
          v-if="visible"
          :id="panelId"
          ref="panelRef"
          class="ex-tree-select__panel"
          :class="popperClass"
          :style="panelStyle"
        >
          <div
            v-if="filterable"
            class="ex-tree-select__search"
          >
            <input
              ref="searchInputRef"
              v-model="searchQuery"
              class="ex-tree-select__search-input"
              :placeholder="t('searchPlaceholder')"
            />
          </div>

          <div
            class="ex-tree-select__tree"
            role="tree"
            :aria-multiselectable="multiple"
          >
            <div
              v-for="flat in flatNodes"
              :key="flat.node.value"
              :ref="element => setNodeRef(flat.node.value, element)"
              class="ex-tree-select__node"
              :class="{
                'is-selected': !multiple && flat.node.value === modelValue,
                'is-disabled': flat.node.disabled,
              }"
              role="treeitem"
              :tabindex="flat.node.disabled ? -1 : 0"
              :aria-expanded="flat.hasChildren ? flat.expanded : undefined"
              :aria-selected="isChecked(flat.node) || flat.node.value === modelValue"
              :aria-disabled="flat.node.disabled || undefined"
              :aria-level="flat.level + 1"
              :style="{ paddingLeft: `${flat.level * 18 + 8}px` }"
              @click="handleNodeClick(flat.node)"
              @keydown="handleNodeKeydown($event, flat)"
            >
              <!-- 展开箭头 -->
              <span
                class="ex-tree-select__expand"
                :class="{ 'is-leaf': !flat.hasChildren }"
                aria-hidden="true"
                @click.stop="flat.hasChildren && toggleExpand(flat.node)"
              >
                <ExIcon
                  v-if="flat.hasChildren"
                  icon="arrow-right-s-line"
                  :size="14"
                  :class="{ 'is-expanded': flat.expanded }"
                  aria-hidden="true"
                />
              </span>

              <!-- 复选框（多选） -->
              <span
                v-if="multiple"
                class="ex-tree-select__checkbox"
                :class="{
                  'is-checked': isChecked(flat.node),
                  'is-indeterminate': isIndeterminate(flat.node),
                }"
              ></span>

              <span class="ex-tree-select__node-label">{{ flat.node.label }}</span>
            </div>

            <div
              v-if="flatNodes.length === 0"
              class="ex-tree-select__empty"
            >
              {{ t('noData') }}
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick, onMounted, onUnmounted, useId } from 'vue';
import type {
  ExTreeSelectProps,
  ExTreeSelectEmits,
  ExTreeSelectExposed,
  TreeSelectNode,
} from './types';
import { useLocale } from '../../locale';
import { useComponentSize } from '../config-provider/composables';
import { useFormItem } from '../form/use-form-item';
import { normalizeCustomClass } from '../../composables/useCustomClass';
import ExIcon from '../icon/ExIcon.vue';

defineOptions({
  name: 'ExTreeSelect',
  inheritAttrs: false,
});

const props = withDefaults(defineProps<ExTreeSelectProps>(), {
  modelValue: null,
  data: () => [],
  multiple: false,
  checkStrictly: false,
  disabled: false,
  clearable: false,
  filterable: false,
  placeholder: '',
  size: undefined,
  defaultExpandAll: false,
  collapseTags: false,
  teleported: true,
});

const emit = defineEmits<ExTreeSelectEmits>();

const { t } = useLocale('treeSelect');
const componentSize = useComponentSize(computed(() => props.size));
const formItem = useFormItem();

const rootRef = ref<HTMLElement>();
const triggerRef = ref<HTMLElement>();
const panelRef = ref<HTMLElement>();
const searchInputRef = ref<HTMLInputElement>();
const idSuffix = useId().replace(/:/g, '');
const panelId = `ex-tree-select-panel-${idSuffix}`;
const nodeRefs = new Map<string | number, HTMLElement>();

const visible = ref(false);
const panelStyle = ref<Record<string, string>>({});
const searchQuery = ref('');
const expandedKeys = ref<Set<string | number>>(new Set());

const rootClasses = computed(() => [
  'ex-tree-select',
  `ex-tree-select--${componentSize.value}`,
  {
    'is-disabled': props.disabled,
    'is-active': visible.value,
    'ex-tree-select--multiple': props.multiple,
  },
  ...normalizeCustomClass(props.class),
]);
const rootStyle = computed(() => (props.style ? props.style : undefined));

// ---- 树结构索引 ----
const maps = computed(() => {
  const nodeMap = new Map<string | number, TreeSelectNode>();
  const parentMap = new Map<string | number, string | number | null>();
  const build = (nodes: TreeSelectNode[], parent: TreeSelectNode | null) => {
    for (const n of nodes) {
      nodeMap.set(n.value, n);
      parentMap.set(n.value, parent ? parent.value : null);
      if (n.children) build(n.children, n);
    }
  };
  build(props.data, null);
  return { nodeMap, parentMap };
});
const nodeMap = computed(() => maps.value.nodeMap);
const parentMap = computed(() => maps.value.parentMap);

const getDescendants = (node: TreeSelectNode): TreeSelectNode[] => {
  const res: TreeSelectNode[] = [];
  const dfs = (nodes?: TreeSelectNode[]) => {
    for (const c of nodes ?? []) {
      res.push(c);
      if (c.children) dfs(c.children);
    }
  };
  dfs(node.children);
  return res;
};

const walk = (
  nodes: TreeSelectNode[],
  cb: (node: TreeSelectNode, ancestors: TreeSelectNode[]) => void,
  ancestors: TreeSelectNode[] = []
) => {
  for (const n of nodes) {
    cb(n, ancestors);
    if (n.children) walk(n.children, cb, [...ancestors, n]);
  }
};

// ---- 过滤 ----
const lowerQuery = computed(() => searchQuery.value.trim().toLowerCase());
const filterActive = computed(() => props.filterable && !!lowerQuery.value);
const visibleSet = computed<Set<string | number> | null>(() => {
  if (!filterActive.value) return null;
  const set = new Set<string | number>();
  walk(props.data, (node, ancestors) => {
    if (node.label.toLowerCase().includes(lowerQuery.value)) {
      set.add(node.value);
      ancestors.forEach(a => set.add(a.value));
    }
  });
  return set;
});

interface FlatNode {
  node: TreeSelectNode;
  level: number;
  hasChildren: boolean;
  expanded: boolean;
}
const flatNodes = computed<FlatNode[]>(() => {
  const out: FlatNode[] = [];
  const vset = visibleSet.value;
  const dfs = (nodes: TreeSelectNode[], level: number) => {
    for (const node of nodes) {
      if (vset && !vset.has(node.value)) continue;
      const hasChildren = !!(node.children && node.children.length);
      const expanded = filterActive.value ? true : expandedKeys.value.has(node.value);
      out.push({ node, level, hasChildren, expanded });
      if (hasChildren && expanded) dfs(node.children!, level + 1);
    }
  };
  dfs(props.data, 0);
  return out;
});

const setNodeRef = (value: string | number, element: unknown) => {
  if (element && typeof element === 'object' && 'focus' in element) {
    nodeRefs.set(value, element as HTMLElement);
  } else {
    nodeRefs.delete(value);
  }
};

const focusNodeAt = (index: number) => {
  const target = flatNodes.value[index];
  if (!target) return;
  nodeRefs.get(target.node.value)?.focus();
};

const handleNodeKeydown = (event: KeyboardEvent, flat: FlatNode) => {
  if (flat.node.disabled) return;

  const currentIndex = flatNodes.value.findIndex(item => item.node.value === flat.node.value);
  if (currentIndex < 0) return;

  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    handleNodeClick(flat.node);
    return;
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault();
    focusNodeAt(Math.min(currentIndex + 1, flatNodes.value.length - 1));
    return;
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault();
    focusNodeAt(Math.max(currentIndex - 1, 0));
    return;
  }

  if (event.key === 'ArrowRight' && flat.hasChildren) {
    event.preventDefault();
    if (!flat.expanded) toggleExpand(flat.node);
    else focusNodeAt(currentIndex + 1);
    return;
  }

  if (event.key === 'ArrowLeft') {
    event.preventDefault();
    if (flat.hasChildren && flat.expanded) {
      toggleExpand(flat.node);
      return;
    }
    const parentValue = parentMap.value.get(flat.node.value);
    if (parentValue != null) {
      const parentIndex = flatNodes.value.findIndex(item => item.node.value === parentValue);
      focusNodeAt(parentIndex);
    }
  }
};

// ---- 选中状态 ----
const selectedValues = computed<Array<string | number>>(() =>
  props.multiple && Array.isArray(props.modelValue) ? props.modelValue : []
);
const checkedSet = computed(() => new Set(selectedValues.value));
const selectedNodes = computed<TreeSelectNode[]>(() =>
  selectedValues.value.map(v => nodeMap.value.get(v)).filter((n): n is TreeSelectNode => !!n)
);
const displayTags = computed<TreeSelectNode[]>(() =>
  props.collapseTags ? selectedNodes.value.slice(0, 1) : selectedNodes.value
);
const collapsedCount = computed(() => selectedNodes.value.length - displayTags.value.length);
const selectedSingleNode = computed<TreeSelectNode | null>(() =>
  !props.multiple && props.modelValue != null
    ? (nodeMap.value.get(props.modelValue as string | number) ?? null)
    : null
);

const showClear = computed(() => {
  if (!props.clearable || props.disabled) return false;
  return props.multiple ? selectedValues.value.length > 0 : props.modelValue != null;
});

const isChecked = (node: TreeSelectNode): boolean => checkedSet.value.has(node.value);
const isIndeterminate = (node: TreeSelectNode): boolean => {
  if (props.checkStrictly || isChecked(node)) return false;
  return getDescendants(node).some(d => checkedSet.value.has(d.value));
};

// ---- 交互 ----
const toggleExpand = (node: TreeSelectNode) => {
  const next = new Set(expandedKeys.value);
  if (next.has(node.value)) next.delete(node.value);
  else next.add(node.value);
  expandedKeys.value = next;
  emit('expand', [...next]);
};

const handleNodeClick = (node: TreeSelectNode) => {
  if (node.disabled) return;
  if (props.multiple) {
    toggleCheck(node);
  } else {
    emit('update:modelValue', node.value);
    emit('change', node.value, node);
    formItem?.onFieldChange();
    close();
  }
};

const toggleCheck = (node: TreeSelectNode) => {
  if (node.disabled) return;
  const next = new Set(checkedSet.value);
  const target = !next.has(node.value);

  if (props.checkStrictly) {
    if (target) next.add(node.value);
    else next.delete(node.value);
  } else {
    const affected = [node, ...getDescendants(node)].filter(n => !n.disabled);
    affected.forEach(n => {
      if (target) next.add(n.value);
      else next.delete(n.value);
    });
    // 自下而上更新祖先选中态
    let parentVal = parentMap.value.get(node.value) ?? null;
    while (parentVal != null) {
      const parent = nodeMap.value.get(parentVal);
      if (!parent) break;
      const children = (parent.children ?? []).filter(c => !c.disabled);
      const allChecked = children.length > 0 && children.every(c => next.has(c.value));
      if (allChecked) next.add(parent.value);
      else next.delete(parent.value);
      parentVal = parentMap.value.get(parentVal) ?? null;
    }
  }

  const arr = [...next];
  emit('update:modelValue', arr);
  emit(
    'change',
    arr,
    arr.map(v => nodeMap.value.get(v)).filter((n): n is TreeSelectNode => !!n)
  );
  formItem?.onFieldChange();
};

const removeTag = (value: string | number) => {
  if (props.disabled) return;
  const node = nodeMap.value.get(value);
  if (node) {
    // 已选中则执行取消（含级联）
    if (checkedSet.value.has(value)) toggleCheck(node);
  } else {
    const arr = selectedValues.value.filter(v => v !== value);
    emit('update:modelValue', arr);
    emit('change', arr, []);
    formItem?.onFieldChange();
  }
};

const handleClear = () => {
  const cleared = props.multiple ? [] : null;
  emit('update:modelValue', cleared);
  emit('change', cleared, props.multiple ? [] : null);
  emit('clear');
  formItem?.onFieldChange();
  close();
};

// ---- 面板 ----
const updatePanelPosition = () => {
  if (!props.teleported || !triggerRef.value || !panelRef.value) return;
  const rect = triggerRef.value.getBoundingClientRect();
  const panelHeight = panelRef.value.offsetHeight;
  const spaceBelow = window.innerHeight - rect.bottom;
  const top =
    spaceBelow < panelHeight && rect.top > panelHeight
      ? rect.top - panelHeight - 4
      : rect.bottom + 4;
  panelStyle.value = {
    position: 'fixed',
    top: `${top}px`,
    left: `${rect.left}px`,
    minWidth: `${rect.width}px`,
  };
};

const open = () => {
  if (props.disabled) return;
  visible.value = true;
  emit('visible-change', true);
  nextTick(() => {
    updatePanelPosition();
    if (props.filterable) searchInputRef.value?.focus();
  });
};
const close = () => {
  if (!visible.value) return;
  visible.value = false;
  emit('visible-change', false);
  searchQuery.value = '';
};

const handleTriggerClick = () => {
  if (props.disabled) return;
  if (visible.value) close();
  else open();
};

const handleFocus = (e: FocusEvent) => emit('focus', e);
const handleBlur = (e: FocusEvent) => {
  emit('blur', e);
  formItem?.onFieldBlur();
};
const handleKeydown = (e: KeyboardEvent) => {
  if (props.disabled) return;
  if (e.key === 'Enter' || (e.key === ' ' && !props.filterable)) {
    e.preventDefault();
    if (visible.value) close();
    else open();
  } else if (e.key === 'Escape' && visible.value) {
    e.preventDefault();
    close();
  } else if (e.key === 'ArrowDown' && !visible.value) {
    e.preventDefault();
    open();
  }
};

const handleClickOutside = (event: MouseEvent) => {
  if (!visible.value) return;
  const target = event.target as Node;
  if (
    rootRef.value &&
    !rootRef.value.contains(target) &&
    panelRef.value &&
    !panelRef.value.contains(target)
  ) {
    close();
  }
};

const expandAll = () => {
  const next = new Set<string | number>();
  walk(props.data, node => {
    if (node.children && node.children.length) next.add(node.value);
  });
  expandedKeys.value = next;
};
const collapseAll = () => {
  expandedKeys.value = new Set();
};

watch(visible, isVisible => {
  if (isVisible) {
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', updatePanelPosition);
    window.addEventListener('scroll', updatePanelPosition, true);
  } else {
    document.removeEventListener('mousedown', handleClickOutside);
    window.removeEventListener('resize', updatePanelPosition);
    window.removeEventListener('scroll', updatePanelPosition, true);
  }
});

onMounted(() => {
  if (props.defaultExpandAll) expandAll();
});

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside);
  window.removeEventListener('resize', updatePanelPosition);
  window.removeEventListener('scroll', updatePanelPosition, true);
});

const focus = () => triggerRef.value?.focus();
const blur = () => triggerRef.value?.blur();

defineExpose<ExTreeSelectExposed>({ focus, blur, expandAll, collapseAll });
</script>

<style scoped lang="scss" src="./ExTreeSelect.scss"></style>
