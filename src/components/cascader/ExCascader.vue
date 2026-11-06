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
      <div
        v-if="multiple && displayTags.length"
        class="ex-cascader__tags"
      >
        <span
          v-for="tag in displayTags"
          :key="tag.key"
          class="ex-cascader__tag"
        >
          <span
            class="ex-cascader__tag-label"
            :title="tag.label"
          >
            {{ tag.label }}
          </span>
          <button
            v-if="!tag.disabled && !effectiveDisabled && !effectiveReadonly"
            type="button"
            class="ex-cascader__tag-remove"
            :aria-label="`${tCommon('clear')}: ${tag.label}`"
            @click.stop="multipleState.remove(tag.path)"
          >
            ×
          </button>
        </span>
        <span
          v-if="collapsedCount"
          class="ex-cascader__tag"
        >
          +{{ collapsedCount }}
        </span>
      </div>
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
          v-if="
            clearable &&
            hasValue &&
            (multiple ? multipleState.canClear.value : !selectedPathDisabled) &&
            !effectiveDisabled &&
            !effectiveReadonly
          "
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
            [`ex-cascader--${componentSize}`]: true,
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
              <slot name="empty">
                <span>{{ tCascader('noSearchResults') }}</span>
              </slot>
            </div>
            <div
              v-else
              role="listbox"
              :aria-label="tCascader('searchResults')"
              :aria-multiselectable="multiple || undefined"
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
                @mouseenter="!result.disabled && (searchActiveIndex = resultIndex)"
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
                  <slot
                    name="search-result"
                    :labels="result.labels"
                    :values="result.values"
                  >
                    <span class="ex-cascader__search-result-label">
                      {{ result.labels[result.labels.length - 1] }}
                    </span>
                    <span
                      v-if="result.labels.length > 1"
                      class="ex-cascader__search-result-path"
                    >
                      {{ result.labels.slice(0, -1).join(separator) }}
                    </span>
                  </slot>
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
                :aria-multiselectable="multiple || undefined"
              >
                <button
                  v-for="(option, optIndex) in menu"
                  :id="getOptionId(index, optIndex)"
                  :key="option.value"
                  class="ex-cascader__option"
                  type="button"
                  tabindex="-1"
                  role="option"
                  :disabled="isOptionDisabled(option, index)"
                  :aria-selected="isSelected(option, index)"
                  :aria-expanded="hasChildren(option, index) ? isActive(option, index) : undefined"
                  :aria-haspopup="hasChildren(option, index) ? 'listbox' : undefined"
                  :aria-busy="
                    getNodeLoadState(getOptionPath(option, index)).status === 'loading' || undefined
                  "
                  :aria-disabled="isOptionDisabled(option, index) || undefined"
                  :class="{
                    'ex-cascader__option--active': isActive(option, index),
                    'ex-cascader__option--disabled': isOptionDisabled(option, index),
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
                    <slot
                      name="option"
                      :option="option"
                      :level="index"
                      :selected="isSelected(option, index)"
                      :expanded="isActive(option, index)"
                    >
                      <span class="ex-cascader__option-label">{{ option.label }}</span>
                    </slot>
                  </span>
                  <span
                    v-if="hasChildren(option, index)"
                    class="ex-cascader__option-arrow"
                    aria-hidden="true"
                  >
                    <ExIcon
                      :icon="
                        getNodeLoadState(getOptionPath(option, index)).status === 'loading'
                          ? 'loader-4-line'
                          : 'arrow-right-s-line'
                      "
                      :spin="getNodeLoadState(getOptionPath(option, index)).status === 'loading'"
                      :size="16"
                    />
                  </span>
                </button>
                <div
                  v-if="
                    activePath[index] !== undefined &&
                    getNodeLoadState(activePath.slice(0, index + 1)).status === 'error'
                  "
                  class="ex-cascader__load-error"
                  role="status"
                >
                  <span>{{ tTree('loadError') }}</span>
                  <button
                    type="button"
                    class="ex-cascader__retry"
                    @click="reloadNode(activePath.slice(0, index + 1))"
                  >
                    {{ tTree('retryLoad') }}
                  </button>
                </div>
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
import { computed, ref, watch, onBeforeUnmount, nextTick, useAttrs, useId } from 'vue';
import type {
  ExCascaderProps,
  ExCascaderEmits,
  ExCascaderExposed,
  ExCascaderSlots,
  CascaderOption,
} from './types';
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
import { usePopupOverlay } from '../../composables/usePopupOverlay';
import { collectCascaderLeafPaths } from './search';
import type { CascaderSearchResult } from './search';
import { useCascaderPaths } from './use-cascader-paths';
import { useCascaderKeyboard } from './use-cascader-keyboard';
import { useCascaderMultiple, cascaderPathKey } from './use-cascader-multiple';
import { useAsyncOptions } from '../tree-select/use-async-options';
import { captureReactiveValue } from '../../utils/reactive-snapshot';

defineOptions({
  name: 'ExCascader',
  inheritAttrs: false,
});

const props = withDefaults(defineProps<ExCascaderProps>(), {
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
  multiple: false,
  collapseTags: false,
});

// 所在 FormItem 的字段上下文（用于 blur 自动校验）
const formItem = useFormItem();
const componentSize = useComponentSize(computed(() => props.size ?? formItem?.size?.value));
const effectiveDisabled = computed(() => props.disabled || Boolean(formItem?.disabled?.value));
const effectiveReadonly = computed(() => props.readonly || Boolean(formItem?.readonly?.value));
const { t: tCascader } = useLocale('cascader');
const { t: tCommon } = useLocale('common');
const { t: tTree } = useLocale('tree');
const attrs = useAttrs();
const currentPlaceholder = computed(() => props.placeholder || tCascader('placeholder'));
const emit = defineEmits<ExCascaderEmits>();
defineSlots<ExCascaderSlots>();

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
const { styles: popupOverlayStyles, containsTarget: containsPopupTarget } = usePopupOverlay({
  active: () => visible.value,
  container: dropdownRef,
  zIndex: () => dropdownZIndex.value,
  onEscape: () => hide(),
});
const dropdownStyle = computed<Record<string, string>>(() => ({
  ...dropdownPositionStyle.value,
  ...popupOverlayStyles.value,
}));
const asyncOptions = useAsyncOptions<CascaderOption>({
  data: () => props.options,
  loader: () => props.loadData,
  blocked: () => effectiveDisabled.value || effectiveReadonly.value,
  active: () => visible.value,
  identity: 'path',
  onLoad: (option, children, path) => emit('load', option, children, path),
  onError: (error, option, path) => emit('load-error', error, option, path),
});
const reloadNode = asyncOptions.reload;
const cancelNodeLoad = asyncOptions.cancel;
const getNodeLoadState = asyncOptions.stateFor;
const {
  selectedPath,
  requestSelectedPath,
  activePath,
  menus,
  isOptionDisabled,
  getSelectedOptions,
  selectedPathDisabled,
  canSelectPath,
  activePathLabels,
} = useCascaderPaths({
  get options() {
    return asyncOptions.data.value;
  },
  get modelValue() {
    return props.modelValue;
  },
});
const multipleState = useCascaderMultiple({
  props,
  blocked: () => effectiveDisabled.value || effectiveReadonly.value,
  getOptions: getSelectedOptions,
  onChange: (paths, options) => {
    emit('update:selectedPaths', paths);
    emit('selection-change', paths, options);
    formItem?.onFieldChange();
  },
});
const { displayTags, collapsedCount } = multipleState;
watch(
  activePath,
  path => asyncOptions.syncExpanded(path.map((_value, index) => path.slice(0, index + 1))),
  { immediate: true }
);
const searchQuery = ref('');
/** 键盘导航高亮位置：列索引与该列内选项索引（-1 表示无） */
const activeCol = ref(0);
const activeIndex = ref(-1);
const searchActiveIndex = ref(-1);
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
const getPathKey = cascaderPathKey;

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
  if (props.multiple) return '';
  return displayValue.value;
});
// 先缓存叶子路径，搜索输入变化时只过滤缓存，避免每个字符都递归遍历整棵树。
const allLeafPaths = computed(() => collectCascaderLeafPaths(asyncOptions.data.value));
// 搜索结果是一条完整叶子路径，路径中任意一级标签命中即可显示。
const searchResults = computed<CascaderSearchResult[]>(() => {
  if (!hasSearchQuery.value) return [];

  const query = searchQuery.value.trim().toLowerCase();
  return allLeafPaths.value.filter(result =>
    result.labels.some(label => label.toLowerCase().includes(query))
  );
});

const isSearchResultSelected = (result: CascaderSearchResult): boolean =>
  props.multiple
    ? multipleState.isSelected(result.values)
    : selectedPath.value.length === result.values.length &&
      selectedPath.value.every((value, index) => value === result.values[index]);
// 计算属性
const cascaderClasses = computed(() => {
  const classes = ['ex-cascader', `ex-cascader--${componentSize.value}`];

  if (effectiveDisabled.value) classes.push('ex-cascader--disabled');
  if (effectiveReadonly.value) classes.push('ex-cascader--readonly');
  if (inheritedStatus.value) classes.push(`ex-cascader--${inheritedStatus.value}`);
  if (visible.value) classes.push('ex-cascader--open');
  if (props.multiple) classes.push('ex-cascader--multiple');

  classes.push(...normalizeCustomClass(props.class));
  return classes;
});

const cascaderStyles = computed(() => {
  if (!props.style) return undefined;
  if (typeof props.style === 'string') return props.style;
  return props.style;
});

const hasValue = computed(() =>
  props.multiple ? multipleState.selected.value.length > 0 : selectedPath.value.length > 0
);
const displayValue = computed(() => {
  if (!hasValue.value) return '';
  const labels = getSelectedOptions().map(option => option.label);
  return props.showAllLevels ? labels.join(props.separator) : labels[labels.length - 1] || '';
});

const handlePathCrumbClick = (level: number) => {
  activePath.value = level < 0 ? [] : activePath.value.slice(0, level + 1);
  initializeMenuActive();
};

// 判断选项是否激活
const isActive = (option: CascaderOption, level: number) =>
  activePath.value[level] === option.value;
const getOptionPath = (option: CascaderOption, level: number) => [
  ...activePath.value.slice(0, level),
  option.value,
];
const hasChildren = (option: CascaderOption, level: number) =>
  asyncOptions.expandable(option, getOptionPath(option, level));
// 判断选项是否被选中
const isSelected = (option: CascaderOption, level: number) =>
  props.multiple
    ? multipleState.isSelected(getOptionPath(option, level))
    : selectedPath.value[level] === option.value;
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
    preferredOption && !isOptionDisabled(preferredOption, activeCol.value)
      ? preferredIndex
      : nextEnabledIndex(activeCol.value, -1, 1);
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
  if (!options[activeIndex.value] || isOptionDisabled(options[activeIndex.value]!, column)) {
    activeIndex.value = nextEnabledIndex(column, -1, 1);
  }
};

// 显示面板
const show = () => {
  if (effectiveDisabled.value || effectiveReadonly.value || visible.value) return;
  activePath.value = [
    ...(props.multiple ? (multipleState.selected.value[0] ?? []) : selectedPath.value),
  ];
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
  return findNextEnabledIndex(menus.value[col] || [], from, step, option =>
    isOptionDisabled(option, col)
  );
};

const handleKeydown = useCascaderKeyboard({
  blocked: () => effectiveDisabled.value || effectiveReadonly.value,
  filterable: () => props.filterable,
  visible,
  searching: hasSearchQuery,
  results: searchResults,
  menus,
  activePath,
  activeCol,
  activeIndex,
  searchActiveIndex,
  nextEnabledIndex,
  setMenuActive,
  show,
  hide,
  selectResult: result => handleSearchResultClick(result),
  selectOption: (option, level) => handleOptionClick(option, level),
  expandOption: (option, level, index) => expandFromKeyboard(option, level, index),
});

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
  if (effectiveDisabled.value || effectiveReadonly.value || !canSelectPath(result.values)) return;
  activePath.value = [...result.values];
  if (props.multiple) {
    multipleState.toggle(result.values);
    return;
  }
  emitChange(result.values);
  searchQuery.value = '';
  hide({ restoreFocus: true });
};

const handleOptionClick = (option: CascaderOption, level: number) => {
  if (isOptionDisabled(option, level) || effectiveDisabled.value || effectiveReadonly.value) return;

  setMenuActive(
    level,
    menus.value[level]?.findIndex(candidate => candidate.value === option.value) ?? -1
  );

  // 基于浏览路径提交，悬停展开的祖先不会在叶子选择时丢失。
  const nextPath = activePath.value.slice(0, level);
  nextPath.push(option.value);
  activePath.value = nextPath;

  if (hasChildren(option, level)) {
    // 如果允许选择任意一级，则触发变化
    if (props.changeOnSelect) {
      if (props.multiple) multipleState.toggle(nextPath);
      else emitChange(nextPath);
    }
  } else {
    // 叶子节点，触发变化并关闭
    if (props.multiple) multipleState.toggle(nextPath);
    else {
      emitChange(nextPath);
      hide({ restoreFocus: true });
    }
  }
};

const handleOptionHover = (option: CascaderOption, level: number, optionIndex = -1) => {
  if (isOptionDisabled(option, level) || effectiveDisabled.value || effectiveReadonly.value) return;

  activePath.value = [...activePath.value.slice(0, level), option.value];
  setMenuActive(level, optionIndex);
};

const expandFromKeyboard = async (option: CascaderOption, level: number, index: number) => {
  if (isOptionDisabled(option, level) || !hasChildren(option, level)) return;
  handleOptionHover(option, level, index);
  const path = [...activePath.value];
  if (!option.children?.length) await asyncOptions.load(path, false, true);
  await nextTick();
  if (!visible.value || cascaderPathKey(path) !== cascaderPathKey(activePath.value)) return;
  if (menus.value[level + 1]?.length) setMenuActive(level + 1);
};

const handleClear = () => {
  if (props.multiple) {
    if (effectiveDisabled.value || effectiveReadonly.value || !multipleState.canClear.value) return;
    multipleState.clear();
    emit('clear');
    return;
  }
  if (effectiveDisabled.value || effectiveReadonly.value || selectedPathDisabled.value) return;
  requestSelectedPath([]);
  activePath.value = [];
  searchQuery.value = '';
  searchActiveIndex.value = -1;
  setMenuActive(0);
  emit('update:modelValue', []);
  emit('change', [], []);
  emit('clear');
  formItem?.onFieldChange();
};

const emitChange = (path: Array<string | number>) => {
  const selectedOptions = getSelectedOptions(path);
  requestSelectedPath(path);
  emit('update:modelValue', [...path]);
  emit('change', [...path], selectedOptions);
  formItem?.onFieldChange();
};

// 点击外部关闭
const handleClickOutside = (event: MouseEvent) => {
  if (!visible.value) return;
  const target = event.target as Node;

  // 检查点击是否在触发器或下拉面板内
  const isInTrigger = triggerRef.value?.contains(target);
  const isInDropdown = containsPopupTarget(target);

  if (!isInTrigger && !isInDropdown) {
    hide();
  }
};

// 确认路径同时覆盖外部回写和非受控提交，浏览状态不提前替代确认值。
watch(
  selectedPath,
  newValue => {
    if (props.multiple) return;
    activePath.value = [...newValue];
    if (visible.value) initializeMenuActive();
  },
  { deep: true }
);

watch(
  () => captureReactiveValue(props.options),
  () => {
    activePath.value = [
      ...(props.multiple ? (multipleState.selected.value[0] ?? []) : selectedPath.value),
    ];
    searchActiveIndex.value = -1;
    if (visible.value) initializeMenuActive();
  }
);

watch(
  () => props.multiple,
  () => {
    activePath.value = [
      ...(props.multiple ? (multipleState.selected.value[0] ?? []) : selectedPath.value),
    ];
    searchQuery.value = '';
    searchActiveIndex.value = -1;
    if (visible.value) initializeMenuActive();
  }
);

watch([effectiveDisabled, effectiveReadonly], ([disabled, readonly]) => {
  if (disabled || readonly) hide();
});

watch(
  () => formItem?.resetRevision?.value,
  () => {
    asyncOptions.cancelAll();
    hide();
    activePath.value = [
      ...(props.multiple ? (multipleState.selected.value[0] ?? []) : selectedPath.value),
    ];
    activeCol.value = 0;
    activeIndex.value = -1;
  },
  { flush: 'post' }
);

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

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside);
  window.removeEventListener('resize', updateDropdownPosition);
  window.removeEventListener('scroll', updateDropdownPosition, true);
});

// 暴露的方法
const getCheckedNodes = () => {
  return props.multiple ? multipleState.getCheckedNodes() : getSelectedOptions();
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
  getCheckedPaths: multipleState.getCheckedPaths,
  reloadNode,
  cancelNodeLoad,
  getNodeLoadState,
});
</script>

<style scoped lang="scss" src="./ExCascader.scss"></style>
