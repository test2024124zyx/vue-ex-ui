<template>
  <div
    ref="cascaderRef"
    :class="cascaderClasses"
    :style="cascaderStyles"
    v-bind="rootAttrs"
  >
    <!-- 输入框 -->
    <div
      ref="triggerRef"
      class="ex-cascader__input-wrapper"
      @click="handleTriggerClick"
    >
      <input
        :id="controlId"
        ref="inputRef"
        v-bind="triggerAttrs"
        :value="inputDisplayValue"
        :placeholder="currentPlaceholder"
        :disabled="effectiveDisabled"
        :readonly="effectiveReadonly || !filterable"
        class="ex-cascader__input"
        role="combobox"
        aria-haspopup="listbox"
        :aria-expanded="visible"
        :aria-controls="dropdownId"
        :aria-activedescendant="activeDescendant"
        :aria-label="accessibleLabel"
        :aria-labelledby="labelledBy"
        :aria-describedby="describedBy"
        :aria-errormessage="errorMessageId"
        :aria-invalid="ariaInvalid"
        :aria-disabled="effectiveDisabled || undefined"
        :aria-readonly="effectiveReadonly || !filterable ? 'true' : undefined"
        :aria-autocomplete="filterable ? 'list' : undefined"
        @input="handleInput"
        @keydown="handleKeydown"
        @focus="handleInputFocus"
        @blur="handleInputBlur"
      />

      <!-- 后缀图标 -->
      <div class="ex-cascader__suffix">
        <button
          v-if="clearable && hasValue && !effectiveDisabled && !effectiveReadonly"
          class="ex-cascader__clear"
          type="button"
          :aria-label="tCommon('clear')"
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
          :class="{
            'ex-cascader__dropdown--inline': !teleported,
            'ex-no-neon': !neonEffect,
            'ex-no-animation': !animation,
          }"
          :data-theme="configTheme"
          role="group"
          :aria-label="tCascader('panel')"
          :style="dropdownStyle"
        >
          <!-- 搜索结果（filterable 且有输入时） -->
          <div
            v-if="hasSearchQuery"
            class="ex-cascader__search-results"
          >
            <div
              v-if="searchResults.length === 0"
              class="ex-cascader__empty"
              role="status"
              aria-live="polite"
            >
              <ExIcon
                icon="search-line"
                :size="18"
                aria-hidden="true"
              />
              <span>{{ tCascader('noSearchResults') }}</span>
            </div>
            <div
              v-else
              role="listbox"
              :aria-label="tCascader('searchResults')"
            >
              <button
                v-for="(result, resultIndex) in searchResults"
                :id="getSearchResultId(resultIndex)"
                :key="getPathKey(result.values)"
                class="ex-cascader__option"
                :class="{
                  'ex-cascader__option--disabled': result.disabled,
                  'ex-cascader__option--selected': isSearchResultSelected(result),
                  'ex-cascader__option--keyboard': searchActiveIndex === resultIndex,
                }"
                type="button"
                role="option"
                tabindex="-1"
                :disabled="result.disabled"
                :aria-disabled="result.disabled || undefined"
                :aria-selected="isSearchResultSelected(result)"
                :aria-label="result.labels.join(separator)"
                @mouseenter="searchActiveIndex = resultIndex"
                @click="handleSearchResultClick(result)"
              >
                <span
                  class="ex-cascader__option-state"
                  aria-hidden="true"
                >
                  <ExIcon
                    v-if="isSearchResultSelected(result)"
                    icon="check-line"
                    :size="16"
                  />
                </span>
                <span class="ex-cascader__search-result-content">
                  <span class="ex-cascader__search-result-label">
                    {{ result.labels[result.labels.length - 1] }}
                  </span>
                  <span
                    v-if="result.labels.length > 1"
                    class="ex-cascader__search-result-path"
                  >
                    {{ result.labels.slice(0, -1).join(separator) }}
                  </span>
                </span>
              </button>
            </div>
          </div>

          <div
            v-else
            class="ex-cascader__browse"
          >
            <!-- 当前路径既是桌面端上下文提示，也是移动端的返回导航。 -->
            <nav
              class="ex-cascader__path"
              :aria-label="tCascader('currentPath')"
            >
              <button
                type="button"
                class="ex-cascader__path-button"
                :class="{ 'ex-cascader__path-button--current': activePathLabels.length === 0 }"
                :aria-current="activePathLabels.length === 0 ? 'step' : undefined"
                @click="handlePathCrumbClick(-1)"
              >
                {{ tCascader('allOptions') }}
              </button>
              <template
                v-for="(label, pathIndex) in activePathLabels"
                :key="`${pathIndex}-${label}`"
              >
                <span
                  class="ex-cascader__path-separator"
                  aria-hidden="true"
                >
                  {{ separator }}
                </span>
                <button
                  type="button"
                  class="ex-cascader__path-button"
                  :class="{
                    'ex-cascader__path-button--current': pathIndex === activePathLabels.length - 1,
                  }"
                  :aria-current="pathIndex === activePathLabels.length - 1 ? 'step' : undefined"
                  @click="handlePathCrumbClick(pathIndex)"
                >
                  {{ label }}
                </button>
              </template>
            </nav>

            <div class="ex-cascader__menus">
              <div
                v-for="(menu, index) in menus"
                :key="index"
                class="ex-cascader__menu"
                role="listbox"
                :aria-label="tCascader('level', { level: index + 1 })"
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
                  :aria-expanded="hasChildren(option) ? isActive(option, index) : undefined"
                  :aria-haspopup="hasChildren(option) ? 'listbox' : undefined"
                  :aria-disabled="option.disabled || undefined"
                  :class="{
                    'ex-cascader__option--active': isActive(option, index),
                    'ex-cascader__option--disabled': option.disabled,
                    'ex-cascader__option--selected': isSelected(option, index),
                    'ex-cascader__option--keyboard':
                      activeCol === index && activeIndex === optIndex,
                  }"
                  @click="handleOptionClick(option, index)"
                  @mouseenter="trigger === 'hover' && handleOptionHover(option, index, optIndex)"
                >
                  <span
                    class="ex-cascader__option-state"
                    aria-hidden="true"
                  >
                    <ExIcon
                      v-if="isSelected(option, index)"
                      icon="check-line"
                      :size="16"
                    />
                  </span>
                  <span class="ex-cascader__option-content">
                    <span class="ex-cascader__option-label">{{ option.label }}</span>
                  </span>
                  <span
                    v-if="hasChildren(option)"
                    class="ex-cascader__option-arrow"
                    aria-hidden="true"
                  >
                    <ExIcon
                      icon="arrow-right-s-line"
                      :size="16"
                    />
                  </span>
                </button>
              </div>
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
import { computed, ref, watch, onMounted, onBeforeUnmount, nextTick, useAttrs, useId } from 'vue';
import type { ExCascaderProps, ExCascaderEmits, ExCascaderExposed, CascaderOption } from './types';
import { useLocale } from '../../locale';
import {
  useAnimation,
  useComponentSize,
  useConfigTheme,
  useNeonEffect,
  useZIndexLayer,
} from '../config-provider/composables';
import { useFormItem } from '../form/use-form-item';
import { calculateCascaderDropdownPosition } from './position';
import { findNextEnabledIndex } from './keyboard';
import { useCascaderAria } from './use-cascader-aria';

defineOptions({
  name: 'ExCascader',
  inheritAttrs: false,
});

const props = withDefaults(defineProps<ExCascaderProps>(), {
  modelValue: () => [],
  options: () => [],
  id: undefined,
  placeholder: '',
  disabled: false,
  readonly: false,
  clearable: true,
  filterable: false,
  trigger: 'click',
  size: undefined,
  separator: ' / ',
  showAllLevels: true,
  changeOnSelect: false,
  teleported: true,
});

// 所在 FormItem 的字段上下文（用于 blur 自动校验）
const formItem = useFormItem();
const componentSize = useComponentSize(computed(() => props.size ?? formItem?.size?.value));
const { t: tCascader } = useLocale('cascader');
const { t: tCommon } = useLocale('common');
const attrs = useAttrs();
const currentPlaceholder = computed(() => props.placeholder || tCascader('placeholder'));
const emit = defineEmits<ExCascaderEmits>();

const cascaderRef = ref<HTMLDivElement>();
const triggerRef = ref<HTMLDivElement>();
const dropdownRef = ref<HTMLDivElement>();
const inputRef = ref<HTMLInputElement>();
const visible = ref(false);
const generatedId = `ex-cascader-${useId().replace(/:/g, '')}`;
const controlId = computed(() => props.id?.trim() || generatedId);
const dropdownId = computed(() => `${controlId.value}-dropdown`);
// 下拉面板定位样式（Teleport 到 body 后用 fixed 坐标定位）
const dropdownPositionStyle = ref<Record<string, string>>({});
const configTheme = useConfigTheme();
const neonEffect = useNeonEffect();
const animation = useAnimation();
const dropdownZIndex = useZIndexLayer('dropdown');
const dropdownStyle = computed<Record<string, string>>(() => ({
  ...dropdownPositionStyle.value,
  zIndex: String(dropdownZIndex.value),
}));
const selectedPath = ref<(string | number)[]>([...props.modelValue]);
const activePath = ref<(string | number)[]>([...props.modelValue]);
const menus = ref<CascaderOption[][]>([]);
const searchQuery = ref('');
/** 键盘导航高亮位置：列索引与该列内选项索引（-1 表示无） */
const activeCol = ref(0);
const activeIndex = ref(-1);
const searchActiveIndex = ref(-1);
const effectiveDisabled = computed(() => props.disabled || Boolean(formItem?.disabled?.value));
const effectiveReadonly = computed(() => props.readonly || Boolean(formItem?.readonly?.value));
const inheritedStatus = computed(() => formItem?.status?.value || '');
const {
  accessibleLabel,
  labelledBy,
  describedBy,
  errorMessageId,
  ariaInvalid,
  rootAttrs,
  triggerAttrs,
} = useCascaderAria({
  attrs,
  formItem,
  currentPlaceholder,
  effectiveDisabled,
  effectiveReadonly,
});

const getOptionId = (column: number, index: number) =>
  `${dropdownId.value}-option-${column}-${index}`;
const getSearchResultId = (index: number) => `${dropdownId.value}-search-${index}`;
const getPathKey = (values: (string | number)[]) =>
  values.map(value => `${typeof value}:${String(value)}`).join('/');
/** 搜索结果：一条完整的可选路径 */
interface CascaderSearchResult {
  labels: string[];
  values: (string | number)[];
  disabled: boolean;
}

const hasSearchQuery = computed(() => props.filterable && searchQuery.value.trim().length > 0);
const activeDescendant = computed(() => {
  if (!visible.value) return undefined;
  if (hasSearchQuery.value) {
    return searchActiveIndex.value >= 0 ? getSearchResultId(searchActiveIndex.value) : undefined;
  }
  if (activeIndex.value < 0) return undefined;
  return getOptionId(activeCol.value, activeIndex.value);
});

// 输入框展示值：搜索时显示搜索词，否则显示选中路径
const inputDisplayValue = computed(() => {
  if (hasSearchQuery.value && visible.value) {
    return searchQuery.value;
  }
  return displayValue.value;
});
// 先缓存叶子路径，搜索输入变化时只过滤缓存，避免每个字符都递归遍历整棵树。
const allLeafPaths = computed<CascaderSearchResult[]>(() => {
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
      } else {
        results.push({ labels: nextLabels, values: nextValues, disabled: nextDisabled });
      }
    }
  };

  walk(props.options, [], [], false);
  return results;
});
// 搜索结果是一条完整叶子路径，路径中任意一级标签命中即可显示。
const searchResults = computed<CascaderSearchResult[]>(() => {
  if (!hasSearchQuery.value) return [];

  const query = searchQuery.value.trim().toLowerCase();
  return allLeafPaths.value.filter(result =>
    result.labels.some(label => label.toLowerCase().includes(query))
  );
});

const isSearchResultSelected = (result: CascaderSearchResult): boolean =>
  selectedPath.value.length === result.values.length &&
  selectedPath.value.every((value, index) => value === result.values[index]);
// 计算属性
const cascaderClasses = computed(() => {
  const classes = ['ex-cascader', `ex-cascader--${componentSize.value}`];

  if (effectiveDisabled.value) classes.push('ex-cascader--disabled');
  if (effectiveReadonly.value) classes.push('ex-cascader--readonly');
  if (inheritedStatus.value) classes.push(`ex-cascader--${inheritedStatus.value}`);
  if (visible.value) classes.push('ex-cascader--open');

  classes.push(...normalizeCustomClass(props.class));
  return classes;
});

const cascaderStyles = computed(() => {
  if (!props.style) return undefined;
  if (typeof props.style === 'string') return props.style;
  return props.style;
});

const hasValue = computed(() => selectedPath.value.length > 0);
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
// 当前浏览路径的标签用于面板上下文提示和移动端返回导航。
const activePathLabels = computed(() => {
  const labels: string[] = [];
  let currentOptions = props.options;
  for (const value of activePath.value) {
    const option = currentOptions.find(candidate => candidate.value === value);
    if (!option) break;
    labels.push(option.label);
    currentOptions = option.children || [];
  }
  return labels;
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

const handlePathCrumbClick = (level: number) => {
  activePath.value = level < 0 ? [] : activePath.value.slice(0, level + 1);
  initMenus();
  initializeMenuActive();
};

// 判断选项是否激活
const isActive = (option: CascaderOption, level: number) =>
  activePath.value[level] === option.value;
const hasChildren = (option: CascaderOption) => Boolean(option.children?.length);
// 判断选项是否被选中
const isSelected = (option: CascaderOption, level: number) =>
  selectedPath.value[level] === option.value;
// 更新下拉面板位置；非 Teleport 模式保留 CSS 的就地/底部面板布局。
const updateDropdownPosition = () => {
  if (!props.teleported) {
    dropdownPositionStyle.value = {};
    return;
  }
  if (!triggerRef.value || !dropdownRef.value) return;

  const triggerRect = triggerRef.value.getBoundingClientRect();
  const position = calculateCascaderDropdownPosition(
    triggerRect,
    dropdownRef.value.offsetHeight,
    window.innerWidth,
    window.innerHeight
  );

  dropdownPositionStyle.value = {
    position: 'fixed',
    top: `${position.top}px`,
    left: `${position.left}px`,
    minWidth: `${position.minWidth}px`,
    maxWidth: `${position.maxWidth}px`,
    maxHeight: `${position.maxHeight}px`,
  };
};

/** 在指定菜单列设置键盘高亮，并跳过禁用选项。 */
const setMenuActive = (column: number, preferredIndex = -1) => {
  if (menus.value.length === 0) {
    activeCol.value = 0;
    activeIndex.value = -1;
    return;
  }

  activeCol.value = Math.min(Math.max(column, 0), menus.value.length - 1);
  const options = menus.value[activeCol.value] || [];
  const preferredOption = options[preferredIndex];
  activeIndex.value =
    preferredOption && !preferredOption.disabled
      ? preferredIndex
      : findNextEnabledIndex(options, -1, 1);
};

/** 按当前浏览路径初始化最后一列的键盘高亮。 */
const initializeMenuActive = () => {
  const column = Math.max(0, menus.value.length - 1);
  const value = activePath.value[column];
  const preferredIndex =
    value === undefined
      ? -1
      : (menus.value[column]?.findIndex(option => option.value === value) ?? -1);
  setMenuActive(column, preferredIndex);
};

/** 菜单重建后修正可能失效的高亮引用，避免 aria-activedescendant 指向不存在节点。 */
const normalizeMenuActive = () => {
  if (menus.value.length === 0) {
    activeCol.value = 0;
    activeIndex.value = -1;
    return;
  }

  const column = Math.min(activeCol.value, menus.value.length - 1);
  const options = menus.value[column] || [];
  activeCol.value = column;
  if (!options[activeIndex.value] || options[activeIndex.value]?.disabled) {
    activeIndex.value = findNextEnabledIndex(options, -1, 1);
  }
};

// 显示面板
const show = () => {
  if (effectiveDisabled.value || effectiveReadonly.value || visible.value) return;
  activePath.value = [...selectedPath.value];
  initMenus();
  searchActiveIndex.value = -1;
  initializeMenuActive();
  visible.value = true;
  emit('visible-change', true);

  nextTick(() => {
    if (!visible.value) return;
    updateDropdownPosition();
  });
};

const hide = (options: { restoreFocus?: boolean } = {}) => {
  if (!visible.value) {
    searchQuery.value = '';
    searchActiveIndex.value = -1;
    return;
  }

  visible.value = false;
  searchQuery.value = '';
  searchActiveIndex.value = -1;
  activeIndex.value = -1;
  emit('visible-change', false);

  if (options.restoreFocus) {
    nextTick(() => {
      if (!effectiveDisabled.value && !effectiveReadonly.value) inputRef.value?.focus();
    });
  }
};

/** 在指定列中找到从 from 起、按 step 方向的下一个未禁用项索引。 */
const nextEnabledIndex = (col: number, from: number, step: 1 | -1): number => {
  return findNextEnabledIndex(menus.value[col] || [], from, step);
};

/** 搜索状态下的键盘导航。搜索结果仍使用 aria-activedescendant，不让焦点跳入 Teleport 面板。 */
const handleSearchKeydown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      searchActiveIndex.value = findNextEnabledIndex(
        searchResults.value,
        searchActiveIndex.value,
        1
      );
      break;
    case 'ArrowUp':
      event.preventDefault();
      searchActiveIndex.value = findNextEnabledIndex(
        searchResults.value,
        searchActiveIndex.value,
        -1
      );
      break;
    case 'Home':
      event.preventDefault();
      searchActiveIndex.value = findNextEnabledIndex(searchResults.value, -1, 1);
      break;
    case 'End':
      event.preventDefault();
      searchActiveIndex.value = findNextEnabledIndex(
        searchResults.value,
        searchResults.value.length,
        -1
      );
      break;
    case 'Enter': {
      event.preventDefault();
      const result = searchResults.value[searchActiveIndex.value];
      if (result && !result.disabled) handleSearchResultClick(result);
      break;
    }
    case 'Escape':
      event.preventDefault();
      hide();
      break;
    case 'Tab':
      hide();
      break;
  }
};

/**
 * 键盘交互：
 * - 关闭态：↓ / Enter 打开并高亮当前列首个可用项
 * - 打开态：↑↓ 列内移动、→/Enter 展开子级或选中叶子、← 返回上一列、Esc 关闭
 */
const handleKeydown = (e: KeyboardEvent) => {
  if (effectiveDisabled.value || effectiveReadonly.value) return;
  if (hasSearchQuery.value) {
    handleSearchKeydown(e);
    return;
  }

  if (!visible.value) {
    if (
      e.key === 'ArrowDown' ||
      e.key === 'ArrowUp' ||
      e.key === 'Enter' ||
      (e.key === ' ' && !props.filterable)
    ) {
      e.preventDefault();
      show();
      activeCol.value = Math.max(0, menus.value.length - 1);
      activeIndex.value = nextEnabledIndex(
        activeCol.value,
        e.key === 'ArrowUp' ? menus.value[activeCol.value]?.length || 0 : -1,
        e.key === 'ArrowUp' ? -1 : 1
      );
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
        handleOptionHover(current, activeCol.value, activeIndex.value);
        activeCol.value += 1;
        activeIndex.value = nextEnabledIndex(activeCol.value, -1, 1);
      }
      break;
    case 'ArrowLeft':
      e.preventDefault();
      if (activeCol.value > 0) {
        activeCol.value -= 1;
        const value = activePath.value[activeCol.value];
        const preferredIndex =
          value === undefined
            ? -1
            : (menus.value[activeCol.value]?.findIndex(option => option.value === value) ?? -1);
        setMenuActive(activeCol.value, preferredIndex);
      }
      break;
    case 'Enter':
    case ' ':
      if (e.key === ' ' && props.filterable) return;
      e.preventDefault();
      if (current) handleOptionClick(current, activeCol.value);
      break;
    case 'Escape':
      e.preventDefault();
      hide();
      break;
    case 'Home':
      e.preventDefault();
      activeIndex.value = nextEnabledIndex(activeCol.value, -1, 1);
      break;
    case 'End':
      e.preventDefault();
      activeIndex.value = nextEnabledIndex(
        activeCol.value,
        menus.value[activeCol.value]?.length || 0,
        -1
      );
      break;
    case 'Tab':
      hide();
      break;
  }
};

// 事件处理
const handleTriggerClick = () => {
  if (effectiveDisabled.value || effectiveReadonly.value) return;
  if (visible.value) {
    hide();
  } else {
    show();
  }
};

const handleInput = (event: Event) => {
  if (!props.filterable || effectiveDisabled.value || effectiveReadonly.value) return;
  const target = event.target as HTMLInputElement;
  searchQuery.value = target.value;
  searchActiveIndex.value = -1;
  if (!visible.value) {
    show();
  }
};

const handleInputFocus = (event: FocusEvent) => {
  emit('focus', event);
};

// 失焦只触发表单校验；面板关闭由 Tab、Escape 和外部点击负责，避免点击 Teleport 面板时提前卸载。
const handleInputBlur = (event: FocusEvent) => {
  emit('blur', event);
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
  hide({ restoreFocus: true });
};

const handleOptionClick = (option: CascaderOption, level: number) => {
  if (option.disabled || effectiveDisabled.value || effectiveReadonly.value) return;

  setMenuActive(
    level,
    menus.value[level]?.findIndex(candidate => candidate.value === option.value) ?? -1
  );

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
    hide({ restoreFocus: true });
  }
};

const handleOptionHover = (option: CascaderOption, level: number, optionIndex = -1) => {
  if (option.disabled) return;

  activePath.value = [...activePath.value.slice(0, level), option.value];
  menus.value = menus.value.slice(0, level + 1);
  setMenuActive(level, optionIndex);
  if (option.children && option.children.length) {
    menus.value.push(option.children);
  }
};

const handleClear = () => {
  if (effectiveDisabled.value || effectiveReadonly.value) return;
  selectedPath.value = [];
  activePath.value = [];
  menus.value = [props.options];
  searchQuery.value = '';
  searchActiveIndex.value = -1;
  setMenuActive(0);
  emit('update:modelValue', []);
  emit('change', [], []);
  emit('clear');
  formItem?.onFieldChange();
};

const emitChange = () => {
  const selectedOptions = getSelectedOptions();
  emit('update:modelValue', [...selectedPath.value]);
  emit('change', [...selectedPath.value], selectedOptions);
  formItem?.onFieldChange();
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
  if (!visible.value) return;
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
    if (visible.value) initializeMenuActive();
  },
  { deep: true }
);

watch(
  () => props.options,
  () => {
    activePath.value = [...selectedPath.value];
    initMenus();
    searchActiveIndex.value = -1;
    if (visible.value) initializeMenuActive();
  },
  { deep: true }
);

watch([effectiveDisabled, effectiveReadonly], ([disabled, readonly]) => {
  if (disabled || readonly) hide();
});

// 菜单列变化后修正高亮并重新定位，保证向上翻转时位置正确。
watch(menus, () => {
  normalizeMenuActive();
  if (visible.value) {
    nextTick(() => {
      if (visible.value) updateDropdownPosition();
    });
  }
});

watch(
  () => props.teleported,
  () => {
    if (visible.value) nextTick(updateDropdownPosition);
  }
);

// 只在面板打开时监听全局事件，避免每个 Cascader 常驻 document 点击监听器。
watch(visible, isVisible => {
  if (isVisible) {
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', updateDropdownPosition);
    window.addEventListener('scroll', updateDropdownPosition, true);
    nextTick(() => {
      if (visible.value) updateDropdownPosition();
    });
  } else {
    document.removeEventListener('mousedown', handleClickOutside);
    window.removeEventListener('resize', updateDropdownPosition);
    window.removeEventListener('scroll', updateDropdownPosition, true);
  }
});

// 生命周期
onMounted(() => {
  initMenus();
});

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside);
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

const focus = () => {
  if (!effectiveDisabled.value) inputRef.value?.focus();
};

const blur = () => {
  inputRef.value?.blur();
};

defineExpose<ExCascaderExposed>({
  getCheckedNodes,
  getElement,
  focus,
  blur,
  show,
  hide,
});
</script>

<style scoped lang="scss" src="./ExCascader.scss"></style>
