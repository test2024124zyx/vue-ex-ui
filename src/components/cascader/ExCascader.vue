<template>
  <div
    ref="cascaderRef"
    :class="cascaderClasses"
    :style="cascaderStyles"
  >
    <!-- 输入框 -->
    <div
      ref="triggerRef"
      class="ex-cascader__input-wrapper"
      @click="handleTriggerClick"
    >
      <input
        ref="inputRef"
        :value="inputDisplayValue"
        :placeholder="currentPlaceholder"
        :disabled="disabled"
        :readonly="!filterable"
        class="ex-cascader__input"
        role="combobox"
        aria-haspopup="listbox"
        :aria-expanded="visible"
        :aria-controls="dropdownId"
        :aria-activedescendant="activeDescendant"
        @input="handleInput"
        @keydown="handleKeydown"
        @blur="handleInputBlur"
      />

      <!-- 后缀图标 -->
      <div class="ex-cascader__suffix">
        <button
          v-if="clearable && hasValue && !disabled"
          class="ex-cascader__clear"
          type="button"
          :aria-label="t('common.clear')"
          @click.stop="handleClear"
        >
          <ExIcon
            icon="close-line"
            :size="14"
            aria-hidden="true"
          />
        </button>
        <span
          v-else
          class="ex-cascader__arrow"
          :class="{ 'ex-cascader__arrow--open': visible }"
        >
          <ExIcon
            icon="arrow-down-s-line"
            :size="16"
            aria-hidden="true"
          />
        </span>
      </div>
    </div>

    <!-- 下拉面板（Teleport 到 body，避免被祖先 overflow:hidden 裁剪 / z-index 影响） -->
    <Teleport
      to="body"
      :disabled="!teleported"
    >
      <transition name="ex-cascader-dropdown">
        <div
          v-if="visible"
          :id="dropdownId"
          ref="dropdownRef"
          class="ex-cascader__dropdown"
          :data-theme="configTheme"
          :style="dropdownStyle"
        >
          <!-- 搜索结果（filterable 且有输入时） -->
          <div
            v-if="filterable && searchQuery"
            class="ex-cascader__search-results"
            role="listbox"
          >
            <button
              v-for="result in searchResults"
              :key="result.values.join('/')"
              class="ex-cascader__option"
              :class="{ 'ex-cascader__option--disabled': result.disabled }"
              type="button"
              role="option"
              tabindex="-1"
              :disabled="result.disabled"
              :aria-disabled="result.disabled || undefined"
              aria-selected="false"
              @click="handleSearchResultClick(result)"
            >
              <span class="ex-cascader__option-label">{{ result.labels.join(separator) }}</span>
            </button>
            <div
              v-if="searchResults.length === 0"
              class="ex-cascader__empty"
            >
              {{ t('cascader.noData') }}
            </div>
          </div>

          <div
            v-else
            class="ex-cascader__menus"
          >
            <div
              v-for="(menu, index) in menus"
              :key="index"
              class="ex-cascader__menu"
              role="listbox"
            >
              <button
                v-for="(option, optIndex) in menu"
                :id="getOptionId(index, optIndex)"
                :key="option.value"
                class="ex-cascader__option"
                type="button"
                tabindex="-1"
                role="option"
                :disabled="option.disabled"
                :aria-selected="isSelected(option, index)"
                :aria-disabled="option.disabled || undefined"
                :class="{
                  'ex-cascader__option--active': isActive(option, index),
                  'ex-cascader__option--disabled': option.disabled,
                  'ex-cascader__option--selected': isSelected(option, index),
                  'ex-cascader__option--keyboard': activeCol === index && activeIndex === optIndex,
                }"
                @click="handleOptionClick(option, index)"
                @mouseenter="trigger === 'hover' && handleOptionHover(option, index)"
              >
                <span class="ex-cascader__option-label">{{ option.label }}</span>
                <span
                  v-if="option.children && option.children.length"
                  class="ex-cascader__option-arrow"
                >
                  <ExIcon
                    icon="arrow-right-s-line"
                    :size="16"
                    aria-hidden="true"
                  />
                </span>
              </button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { normalizeCustomClass } from '../../composables/useCustomClass';
import ExIcon from '../icon/ExIcon.vue';
import { computed, ref, watch, onMounted, onBeforeUnmount, nextTick, useId } from 'vue';
import type { ExCascaderProps, ExCascaderEmits, ExCascaderExposed, CascaderOption } from './types';
import { useI18n } from '../../locale';
import { useComponentSize, useConfigTheme } from '../config-provider/composables';
import { useFormItem } from '../form/use-form-item';

defineOptions({
  name: 'ExCascader',
});

const props = withDefaults(defineProps<ExCascaderProps>(), {
  modelValue: () => [],
  options: () => [],
  placeholder: '',
  disabled: false,
  clearable: true,
  filterable: false,
  trigger: 'click',
  size: undefined,
  separator: ' / ',
  showAllLevels: true,
  changeOnSelect: false,
  teleported: true,
});

const { t } = useI18n();
const componentSize = useComponentSize(computed(() => props.size));

// 所在 FormItem 的字段上下文（用于 blur 自动校验）
const formItem = useFormItem();

const currentPlaceholder = computed(() => props.placeholder || t('cascader.placeholder'));

const emit = defineEmits<ExCascaderEmits>();

const cascaderRef = ref<HTMLDivElement>();
const triggerRef = ref<HTMLDivElement>();
const dropdownRef = ref<HTMLDivElement>();
const inputRef = ref<HTMLInputElement>();
const visible = ref(false);
const dropdownId = `ex-cascader-${useId()}`;
// 下拉面板定位样式（Teleport 到 body 后用 fixed 坐标定位）
const dropdownStyle = ref<Record<string, string>>({});
const configTheme = useConfigTheme();
const selectedPath = ref<(string | number)[]>([...props.modelValue]);
const activePath = ref<(string | number)[]>([...props.modelValue]);
const menus = ref<CascaderOption[][]>([]);
const searchQuery = ref('');
/** 键盘导航高亮位置：列索引与该列内选项索引（-1 表示无） */
const activeCol = ref(0);
const activeIndex = ref(-1);
const activeDescendant = computed(() => {
  if (!visible.value || activeIndex.value < 0) return undefined;
  return getOptionId(activeCol.value, activeIndex.value);
});

const getOptionId = (column: number, index: number) => `${dropdownId}-option-${column}-${index}`;

/** 搜索结果：一条完整的可选路径 */
interface CascaderSearchResult {
  labels: string[];
  values: (string | number)[];
  disabled: boolean;
}

// 输入框展示值：搜索时显示搜索词，否则显示选中路径
const inputDisplayValue = computed(() => {
  if (props.filterable && visible.value && searchQuery.value) {
    return searchQuery.value;
  }
  return displayValue.value;
});

// 搜索结果：遍历选项树，匹配"路径上任一级 label 包含关键词"的叶子路径
const searchResults = computed<CascaderSearchResult[]>(() => {
  if (!props.filterable || !searchQuery.value) return [];

  const query = searchQuery.value.toLowerCase();
  const results: CascaderSearchResult[] = [];

  const walk = (
    options: CascaderOption[],
    labels: string[],
    values: (string | number)[],
    disabled: boolean
  ) => {
    for (const option of options) {
      const nextLabels = [...labels, option.label];
      const nextValues = [...values, option.value];
      const nextDisabled = disabled || !!option.disabled;

      if (option.children && option.children.length) {
        walk(option.children, nextLabels, nextValues, nextDisabled);
      } else if (nextLabels.some(label => label.toLowerCase().includes(query))) {
        results.push({ labels: nextLabels, values: nextValues, disabled: nextDisabled });
      }
    }
  };

  walk(props.options, [], [], false);
  return results;
});

// 计算属性
const cascaderClasses = computed(() => {
  const classes = ['ex-cascader', `ex-cascader--${componentSize.value}`];

  if (props.disabled) classes.push('ex-cascader--disabled');
  if (visible.value) classes.push('ex-cascader--open');

  classes.push(...normalizeCustomClass(props.class));

  return classes;
});

const cascaderStyles = computed(() => {
  if (!props.style) return undefined;
  if (typeof props.style === 'string') return props.style;
  return props.style;
});

const hasValue = computed(() => {
  return selectedPath.value.length > 0;
});

const displayValue = computed(() => {
  if (!hasValue.value) return '';

  const labels: string[] = [];
  let currentOptions = props.options;

  for (const value of selectedPath.value) {
    const option = currentOptions.find(opt => opt.value === value);
    if (!option) break;

    labels.push(option.label);
    currentOptions = option.children || [];
  }

  return props.showAllLevels ? labels.join(props.separator) : labels[labels.length - 1] || '';
});

// 初始化菜单
const initMenus = () => {
  menus.value = [props.options];

  if (activePath.value.length > 0) {
    let currentOptions = props.options;

    for (let i = 0; i < activePath.value.length; i++) {
      const value = activePath.value[i];
      const option = currentOptions.find(opt => opt.value === value);

      if (option && option.children && option.children.length) {
        menus.value.push(option.children);
        currentOptions = option.children;
      } else {
        break;
      }
    }
  }
};

// 判断选项是否激活
const isActive = (option: CascaderOption, level: number) => {
  return activePath.value[level] === option.value;
};

// 判断选项是否被选中
const isSelected = (option: CascaderOption, level: number) => {
  return selectedPath.value[level] === option.value;
};

// 更新下拉面板位置（fixed 坐标 + 上下空间不足时翻转）
const updateDropdownPosition = () => {
  if (!triggerRef.value || !dropdownRef.value) return;

  const triggerRect = triggerRef.value.getBoundingClientRect();
  const dropdownHeight = dropdownRef.value.offsetHeight;
  const spaceBelow = window.innerHeight - triggerRect.bottom;
  const spaceAbove = triggerRect.top;

  let top: number;
  if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
    // 向上展开
    top = Math.max(4, triggerRect.top - dropdownHeight - 4);
  } else {
    // 向下展开
    top = triggerRect.bottom + 4;
  }

  dropdownStyle.value = {
    position: 'fixed',
    top: `${top}px`,
    left: `${triggerRect.left}px`,
    minWidth: `${triggerRect.width}px`,
    zIndex: '2000',
  };
};

// 显示/隐藏面板
const show = () => {
  if (props.disabled || visible.value) return;
  activePath.value = [...selectedPath.value];
  initMenus();
  visible.value = true;
  emit('visible-change', true);

  nextTick(() => {
    updateDropdownPosition();
    window.addEventListener('resize', updateDropdownPosition);
    window.addEventListener('scroll', updateDropdownPosition, true);
  });
};

const hide = () => {
  if (!visible.value) return;
  visible.value = false;
  searchQuery.value = '';
  activeIndex.value = -1;
  emit('visible-change', false);
  window.removeEventListener('resize', updateDropdownPosition);
  window.removeEventListener('scroll', updateDropdownPosition, true);
};

/** 在指定列中找到从 from 起、按 step 方向的下一个未禁用项索引 */
const nextEnabledIndex = (col: number, from: number, step: 1 | -1): number => {
  const column = menus.value[col];
  if (!column || column.length === 0) return -1;
  const len = column.length;
  for (let i = 1; i <= len; i++) {
    const idx = (from + step * i + len * i) % len;
    if (!column[idx]?.disabled) return idx;
  }
  return -1;
};

/**
 * 键盘交互：
 * - 关闭态：↓ / Enter 打开并高亮当前列首个可用项
 * - 打开态：↑↓ 列内移动、→/Enter 展开子级或选中叶子、← 返回上一列、Esc 关闭
 */
const handleKeydown = (e: KeyboardEvent) => {
  if (props.disabled) return;
  // 搜索模式下交给原生输入，仅处理 Esc
  if (props.filterable && searchQuery.value) {
    if (e.key === 'Escape') hide();
    return;
  }

  if (!visible.value) {
    if (e.key === 'ArrowDown' || e.key === 'Enter') {
      e.preventDefault();
      show();
      activeCol.value = Math.max(0, menus.value.length - 1);
      activeIndex.value = nextEnabledIndex(activeCol.value, -1, 1);
    }
    return;
  }

  const column = menus.value[activeCol.value] ?? [];
  const current = column[activeIndex.value];

  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      activeIndex.value = nextEnabledIndex(activeCol.value, activeIndex.value, 1);
      break;
    case 'ArrowUp':
      e.preventDefault();
      activeIndex.value = nextEnabledIndex(activeCol.value, activeIndex.value, -1);
      break;
    case 'ArrowRight':
      e.preventDefault();
      if (current && current.children && current.children.length) {
        handleOptionHover(current, activeCol.value);
        activeCol.value += 1;
        activeIndex.value = nextEnabledIndex(activeCol.value, -1, 1);
      }
      break;
    case 'ArrowLeft':
      e.preventDefault();
      if (activeCol.value > 0) {
        activeCol.value -= 1;
        activeIndex.value = nextEnabledIndex(activeCol.value, -1, 1);
      }
      break;
    case 'Enter':
      e.preventDefault();
      if (current) handleOptionClick(current, activeCol.value);
      break;
    case 'Escape':
      e.preventDefault();
      hide();
      break;
  }
};

// 事件处理
const handleTriggerClick = () => {
  if (props.disabled) return;
  if (visible.value) {
    hide();
  } else {
    show();
  }
};

const handleInput = (event: Event) => {
  if (!props.filterable) return;
  const target = event.target as HTMLInputElement;
  searchQuery.value = target.value;
  if (!visible.value) {
    show();
  }
};

// 失焦：触发 FormItem 的 blur 校验（面板关闭仍由外部点击检测负责）
const handleInputBlur = () => {
  formItem?.onFieldBlur();
};

// 点击搜索结果：直接选中整条路径
const handleSearchResultClick = (result: CascaderSearchResult) => {
  if (result.disabled) return;

  selectedPath.value = [...result.values];
  activePath.value = [...result.values];
  initMenus();
  emitChange();
  searchQuery.value = '';
  hide();
};

const handleOptionClick = (option: CascaderOption, level: number) => {
  if (option.disabled) return;

  // 基于浏览路径提交，悬停展开的祖先不会在叶子选择时丢失。
  const nextPath = activePath.value.slice(0, level);
  nextPath.push(option.value);
  activePath.value = nextPath;

  // 更新菜单
  menus.value = menus.value.slice(0, level + 1);

  if (option.children && option.children.length) {
    menus.value.push(option.children);

    // 如果允许选择任意一级，则触发变化
    if (props.changeOnSelect) {
      selectedPath.value = [...nextPath];
      emitChange();
    }
  } else {
    // 叶子节点，触发变化并关闭
    selectedPath.value = [...nextPath];
    emitChange();
    hide();
  }
};

const handleOptionHover = (option: CascaderOption, level: number) => {
  if (option.disabled) return;

  activePath.value = [...activePath.value.slice(0, level), option.value];
  menus.value = menus.value.slice(0, level + 1);
  if (option.children && option.children.length) {
    menus.value.push(option.children);
  }
};

const handleClear = () => {
  selectedPath.value = [];
  activePath.value = [];
  menus.value = [props.options];
  emit('update:modelValue', []);
  emit('change', [], []);
  emit('clear');
};

const emitChange = () => {
  const selectedOptions = getSelectedOptions();
  emit('update:modelValue', [...selectedPath.value]);
  emit('change', [...selectedPath.value], selectedOptions);
};

const getSelectedOptions = (): CascaderOption[] => {
  const result: CascaderOption[] = [];
  let currentOptions = props.options;

  for (const value of selectedPath.value) {
    const option = currentOptions.find(opt => opt.value === value);
    if (!option) break;

    result.push(option);
    currentOptions = option.children || [];
  }

  return result;
};

// 点击外部关闭
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node;

  // 检查点击是否在触发器或下拉面板内
  const isInTrigger = triggerRef.value?.contains(target);
  const isInDropdown = dropdownRef.value?.contains(target);

  if (!isInTrigger && !isInDropdown) {
    hide();
  }
};

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  newValue => {
    selectedPath.value = [...newValue];
    activePath.value = [...newValue];
    initMenus();
  },
  { deep: true }
);

watch(
  () => props.options,
  () => {
    activePath.value = [...selectedPath.value];
    initMenus();
  },
  { deep: true }
);

watch(
  () => props.disabled,
  disabled => {
    if (disabled) hide();
  }
);

// 菜单列变化（展开/收起子级）后重新定位，保证向上翻转时位置正确
watch(menus, () => {
  if (visible.value) {
    nextTick(updateDropdownPosition);
  }
});

// 生命周期
onMounted(() => {
  initMenus();
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
  window.removeEventListener('resize', updateDropdownPosition);
  window.removeEventListener('scroll', updateDropdownPosition, true);
});

// 暴露的方法
const getCheckedNodes = () => {
  return getSelectedOptions();
};

const getElement = () => {
  return cascaderRef.value || null;
};

defineExpose<ExCascaderExposed>({
  getCheckedNodes,
  getElement,
});
</script>

<style scoped lang="scss" src="./ExCascader.scss"></style>
