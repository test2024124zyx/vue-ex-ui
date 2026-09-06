<template>
  <div
    ref="selectRef"
    :class="selectClasses"
    :style="selectStyles"
  >
    <!-- 选择器触发器 -->
    <div
      :id="searchable ? undefined : controlId"
      ref="triggerRef"
      class="ex-select__trigger"
      v-bind="searchable ? undefined : triggerAttrs"
      :role="searchable ? undefined : 'combobox'"
      :aria-label="searchable ? undefined : accessibleLabel"
      :aria-labelledby="searchable ? undefined : labelledBy"
      :aria-describedby="searchable ? undefined : describedBy"
      :aria-errormessage="searchable ? undefined : errorMessageId"
      :aria-invalid="searchable ? undefined : ariaInvalid"
      :aria-readonly="searchable ? undefined : effectiveReadonly"
      :aria-haspopup="searchable ? undefined : 'listbox'"
      :aria-expanded="dropdownVisible"
      :aria-controls="searchable ? undefined : dropdownId"
      :aria-disabled="effectiveDisabled"
      :aria-activedescendant="activeDescendantId"
      :tabindex="effectiveDisabled || searchable ? undefined : 0"
      @click="handleTriggerClick"
      @keydown="handleKeydown"
      @focus="handleFocus"
      @blur="handleBlur"
    >
      <!-- 选中的值显示 -->
      <div class="ex-select__value">
        <!-- 多选：标签 -->
        <template v-if="multiple">
          <span
            v-for="tag in displayTags"
            :key="tag.value"
            class="ex-select__tag"
          >
            <span class="ex-select__tag-label">
              <slot
                name="tag"
                :option="tag"
              >
                {{ tag.label }}
              </slot>
            </span>
            <button
              v-if="!effectiveDisabled && !effectiveReadonly"
              type="button"
              class="ex-select__tag-close"
              :aria-label="t('removeTagAria', { label: tag.label })"
              @keydown.stop
              @click.stop="removeTag(tag.value)"
            >
              ×
            </button>
          </span>
          <span
            v-if="collapsedCount > 0"
            class="ex-select__tag ex-select__tag--count"
          >
            +{{ collapsedCount }}
          </span>
          <input
            v-if="searchable"
            :id="controlId"
            ref="inputRef"
            v-model="searchQuery"
            class="ex-select__input"
            v-bind="triggerAttrs"
            role="combobox"
            aria-haspopup="listbox"
            aria-autocomplete="list"
            :aria-label="accessibleLabel"
            :aria-labelledby="labelledBy"
            :aria-describedby="describedBy"
            :aria-errormessage="errorMessageId"
            :aria-invalid="ariaInvalid"
            :aria-readonly="effectiveReadonly"
            :aria-expanded="dropdownVisible"
            :aria-controls="dropdownId"
            :aria-activedescendant="activeDescendantId"
            :placeholder="selectedValues.length ? '' : currentPlaceholder"
            :disabled="effectiveDisabled"
            :readonly="effectiveReadonly"
            @click.stop="handleInputClick"
            @focus="handleFocus"
            @blur="handleBlur"
            @input="handleSearch"
            @keydown.stop="handleKeydown"
          />
          <span
            v-else-if="selectedValues.length === 0"
            class="ex-select__placeholder"
          >
            {{ currentPlaceholder }}
          </span>
        </template>

        <!-- 单选 -->
        <template v-else>
          <input
            v-if="searchable"
            :id="controlId"
            ref="inputRef"
            v-model="searchQuery"
            class="ex-select__input"
            v-bind="triggerAttrs"
            role="combobox"
            aria-haspopup="listbox"
            aria-autocomplete="list"
            :aria-label="accessibleLabel"
            :aria-labelledby="labelledBy"
            :aria-describedby="describedBy"
            :aria-errormessage="errorMessageId"
            :aria-invalid="ariaInvalid"
            :aria-readonly="effectiveReadonly"
            :aria-expanded="dropdownVisible"
            :aria-controls="dropdownId"
            :aria-activedescendant="activeDescendantId"
            :placeholder="
              selectedOption && !searchQuery && !dropdownVisible
                ? selectedOption.label
                : currentPlaceholder
            "
            :class="{ 'is-value-placeholder': selectedOption && !searchQuery && !dropdownVisible }"
            :disabled="effectiveDisabled"
            :readonly="effectiveReadonly"
            @click.stop="handleInputClick"
            @focus="handleFocus"
            @blur="handleBlur"
            @input="handleSearch"
            @keydown.stop="handleKeydown"
          />
          <span
            v-else-if="selectedOption"
            class="ex-select__label"
          >
            <slot
              name="label"
              :option="selectedOption"
            >
              {{ selectedOption.label }}
            </slot>
          </span>
          <span
            v-else
            class="ex-select__placeholder"
          >
            {{ currentPlaceholder }}
          </span>
        </template>
      </div>

      <!-- 右侧图标 -->
      <div class="ex-select__suffix">
        <!-- 清空按钮 -->
        <button
          v-if="showClearIcon"
          type="button"
          class="ex-select__clear"
          :aria-label="t('clear')"
          :disabled="effectiveReadonly"
          @mousedown.prevent
          @keydown.stop
          @click.stop="handleClear"
        >
          <svg
            viewBox="0 0 1024 1024"
            width="14"
            height="14"
          >
            <path
              d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm165.4 618.2l-66-.3L512 563.4l-99.3 118.4-66.1.3c-4.4 0-8-3.5-8-8 0-1.9.7-3.7 1.9-5.2l130.1-155L340.5 359a8.32 8.32 0 01-1.9-5.2c0-4.4 3.6-8 8-8l66.1.3L512 464.6l99.3-118.4 66-.3c4.4 0 8 3.5 8 8 0 1.9-.7 3.7-1.9 5.2L553.5 514l130 155c1.2 1.5 1.9 3.3 1.9 5.2 0 4.4-3.6 8-8 8z"
              fill="currentColor"
            />
          </svg>
        </button>

        <!-- 下拉箭头 -->
        <span
          class="ex-select__arrow"
          :class="{ 'is-reverse': dropdownVisible }"
        >
          <svg
            viewBox="0 0 1024 1024"
            width="14"
            height="14"
          >
            <path
              d="M884 256h-75c-5.1 0-9.9 2.5-12.9 6.6L512 654.2 227.9 262.6c-3-4.1-7.8-6.6-12.9-6.6h-75c-6.5 0-10.3 7.4-6.5 12.7l352.6 486.1c12.8 17.6 39 17.6 51.7 0l352.6-486.1c3.9-5.3.1-12.7-6.4-12.7z"
              fill="currentColor"
            />
          </svg>
        </span>
      </div>
    </div>

    <!-- 下拉菜单 -->
    <Teleport to="body">
      <Transition name="ex-select-dropdown">
        <div
          v-if="dropdownVisible"
          :id="dropdownId"
          ref="dropdownRef"
          class="ex-select__dropdown"
          :data-theme="configTheme"
          :class="dropdownClasses"
          role="listbox"
          :aria-labelledby="controlId"
          :aria-multiselectable="multiple || undefined"
          :style="[dropdownStyles, popupOverlayStyles]"
        >
          <!-- 分组标题与选项共享固定行高，键盘导航仍只计算可选项。 -->
          <ExVirtualList
            v-if="useVirtual"
            ref="virtualListRef"
            class="ex-select__options ex-select__options--virtual"
            wrapper-role="presentation"
            :wrapper-tabindex="-1"
            :data-source="virtualRows"
            :height="virtualHeight"
            :item-height="normalizedOptionHeight"
            item-key="key"
            :threshold="0"
            :buffer="6"
          >
            <template #default="{ item }">
              <div
                v-if="(item as SelectVirtualRow).option"
                :id="getOptionId((item as SelectVirtualRow).index)"
                class="ex-select__option"
                :class="{
                  'ex-select__option--virtual': true,
                  'is-selected': isSelected((item as SelectVirtualRow).option!),
                  'is-disabled': (item as SelectVirtualRow).option!.disabled,
                  'is-hover': hoverIndex === (item as SelectVirtualRow).index,
                }"
                role="option"
                :aria-selected="isSelected((item as SelectVirtualRow).option!)"
                :aria-disabled="(item as SelectVirtualRow).option!.disabled || undefined"
                @click="handleSelect((item as SelectVirtualRow).option!)"
                @mouseenter="hoverIndex = (item as SelectVirtualRow).index"
              >
                <slot
                  name="option"
                  :option="(item as SelectVirtualRow).option!"
                  :index="(item as SelectVirtualRow).index"
                  :selected="isSelected((item as SelectVirtualRow).option!)"
                >
                  {{ (item as SelectVirtualRow).option!.label }}
                </slot>
              </div>
              <div
                v-else
                class="ex-select__group ex-select__option--virtual"
                role="presentation"
              >
                <slot
                  name="group"
                  :group="(item as SelectVirtualRow).group!"
                >
                  {{ (item as SelectVirtualRow).group!.label }}
                </slot>
              </div>
            </template>
          </ExVirtualList>

          <ul
            v-else
            class="ex-select__options"
            role="presentation"
          >
            <template
              v-for="item in filteredOptions"
              :key="getOptionKey(item)"
            >
              <!-- 分组标题 -->
              <li
                v-if="isGroup(item)"
                class="ex-select__group"
                role="presentation"
              >
                <slot
                  name="group"
                  :group="item"
                >
                  {{ item.label }}
                </slot>
              </li>

              <!-- 分组选项 -->
              <template v-if="isGroup(item)">
                <li
                  v-for="option in item.options"
                  :id="getOptionId(getOptionIndex(option))"
                  :key="option.value"
                  class="ex-select__option"
                  :class="{
                    'is-selected': isSelected(option),
                    'is-disabled': option.disabled,
                    'is-hover': hoverIndex === getOptionIndex(option),
                  }"
                  role="option"
                  :aria-selected="isSelected(option)"
                  :aria-disabled="option.disabled || undefined"
                  @click="handleSelect(option)"
                  @mouseenter="hoverIndex = getOptionIndex(option)"
                >
                  <slot
                    name="option"
                    :option="option"
                    :index="getOptionIndex(option)"
                    :selected="isSelected(option)"
                  >
                    {{ option.label }}
                  </slot>
                </li>
              </template>

              <!-- 普通选项 -->
              <li
                v-else
                :id="getOptionId(getOptionIndex(item))"
                class="ex-select__option"
                :class="{
                  'is-selected': isSelected(item),
                  'is-disabled': item.disabled,
                  'is-hover': hoverIndex === getOptionIndex(item),
                }"
                role="option"
                :aria-selected="isSelected(item)"
                :aria-disabled="item.disabled || undefined"
                @click="handleSelect(item)"
                @mouseenter="hoverIndex = getOptionIndex(item)"
              >
                <slot
                  name="option"
                  :option="item"
                  :index="getOptionIndex(item)"
                  :selected="isSelected(item)"
                >
                  {{ item.label }}
                </slot>
              </li>
            </template>

            <!-- 加载中（远程搜索） -->
            <li
              v-if="loading"
              class="ex-select__loading"
            >
              <slot name="loading">{{ t('loading') }}</slot>
            </li>

            <!-- 无数据 -->
            <li
              v-else-if="filteredOptions.length === 0"
              class="ex-select__empty"
            >
              <slot name="empty">{{ t('noData') }}</slot>
            </li>
          </ul>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { normalizeCustomClass } from '../../composables/useCustomClass';
import { computed, ref, watch, nextTick, onUnmounted, useAttrs } from 'vue';
import type {
  ExSelectProps,
  ExSelectEmits,
  ExSelectExposed,
  ExSelectSlots,
  SelectOption,
  SelectValue,
} from './types';
import { useLocale } from '../../locale';
import { debounce } from '../../utils/debounce';
import {
  useAnimation,
  useComponentSize,
  useConfigTheme,
  useNeonEffect,
  useZIndexLayer,
} from '../config-provider/composables';
import { useFormItem } from '../form/use-form-item';
import { generateId } from '../../utils/id';
import ExVirtualList from '../virtual-list/ExVirtualList.vue';
import {
  SELECT_DEFAULT_OPTION_HEIGHT,
  SELECT_DEFAULT_REMOTE_DEBOUNCE,
  SELECT_DROPDOWN_OPTIONS_MAX_HEIGHT,
} from './constants';
import { calculateSelectDropdownPosition } from './position';
import { getOptionKey, isGroup, useSelectOptions } from './use-select-options';
import type { SelectVirtualRow } from './use-select-options';
import { usePopupOverlay } from '../../composables/usePopupOverlay';
import { isComposingKeyboardEvent } from '../../utils/keyboard';

defineOptions({
  name: 'ExSelect',
  inheritAttrs: false,
});

const props = withDefaults(defineProps<ExSelectProps>(), {
  modelValue: null,
  options: () => [],
  placeholder: '',
  size: undefined,
  disabled: false,
  clearable: false,
  searchable: false,
  remote: false,
  loading: false,
  remoteDebounce: SELECT_DEFAULT_REMOTE_DEBOUNCE,
  multiple: false,
  multipleLimit: 0,
  collapseTags: false,
  virtual: false,
  optionHeight: SELECT_DEFAULT_OPTION_HEIGHT,
});

const emit = defineEmits<ExSelectEmits>();
defineSlots<ExSelectSlots>();
const attrs = useAttrs();

const { t } = useLocale('selector');

// 所在 FormItem 的字段上下文（用于 blur/change 自动校验）
const formItem = useFormItem();

// 使用组件自身、FormItem 与 ConfigProvider 的尺寸继承链。
const componentSize = useComponentSize(computed(() => props.size ?? formItem?.size?.value));

// Refs
const selectRef = ref<HTMLElement>();
const triggerRef = ref<HTMLElement>();
const inputRef = ref<HTMLInputElement>();
const dropdownRef = ref<HTMLElement>();
const virtualListRef = ref<InstanceType<typeof ExVirtualList>>();

// State
const dropdownVisible = ref(false);
const searchQuery = ref('');
const hoverIndex = ref(-1);
const dropdownStyles = ref<Record<string, string>>({});
const configTheme = useConfigTheme();
const neonEffect = useNeonEffect();
const animation = useAnimation();
const dropdownZIndex = useZIndexLayer('dropdown');
const { styles: popupOverlayStyles, containsTarget: containsPopupTarget } = usePopupOverlay({
  active: () => dropdownVisible.value,
  container: dropdownRef,
  zIndex: () => dropdownZIndex.value,
  onEscape: () => hideDropdown(),
});
const availableDropdownHeight = ref(SELECT_DROPDOWN_OPTIONS_MAX_HEIGHT);

// 唯一 id 前缀：用于 option id 与 aria-activedescendant 关联（屏幕阅读器播报高亮项）
const baseId = generateId('ex-select');
const controlId = computed(() => props.id?.trim() || baseId);
const dropdownId = computed(() => `${controlId.value}-dropdown`);
const getOptionId = (index: number) => `${baseId}-opt-${index}`;
const activeDescendantId = computed(() =>
  hoverIndex.value >= 0 ? getOptionId(hoverIndex.value) : undefined
);

// 合并外部与 FormItem 提供的可访问性 ID，避免重复引用同一个节点。
const mergeAriaIds = (...values: Array<string | undefined>): string | undefined => {
  const ids = values.flatMap(value => value?.split(/\s+/) ?? []).filter(Boolean);
  return ids.length > 0 ? Array.from(new Set(ids)).join(' ') : undefined;
};

const readAttr = (name: string): string | undefined => {
  const value = attrs[name];
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (value === true) return 'true';
  if (value === false) return 'false';
  return undefined;
};

// 仅把未被组件显式处理的属性转发给真正的交互节点。
const triggerAttrs = computed<Record<string, unknown>>(() => {
  const forwarded = { ...attrs };
  delete forwarded.class;
  delete forwarded.style;
  return forwarded;
});

const externalAriaLabel = computed(() => readAttr('aria-label'));
const labelledBy = computed(() =>
  mergeAriaIds(
    readAttr('aria-labelledby'),
    externalAriaLabel.value ? undefined : formItem?.labelId?.value
  )
);
const describedBy = computed(() =>
  mergeAriaIds(readAttr('aria-describedby'), formItem?.describedBy?.value)
);
const errorMessageId = computed(() => {
  const externalId = readAttr('aria-errormessage');
  if (externalId) return externalId;
  if (formItem?.status?.value === 'error' && formItem.errorMessage?.value) {
    return formItem.describedBy?.value;
  }
  return undefined;
});
type AriaInvalidValue = 'true' | 'false' | 'grammar' | 'spelling';

const ariaInvalid = computed<AriaInvalidValue | undefined>(() => {
  const externalValue = readAttr('aria-invalid');
  if (
    externalValue === 'true' ||
    externalValue === 'false' ||
    externalValue === 'grammar' ||
    externalValue === 'spelling'
  ) {
    return externalValue;
  }
  return formItem?.status?.value === 'error' ? 'true' : undefined;
});

const effectiveDisabled = computed(() => props.disabled || Boolean(formItem?.disabled?.value));
const effectiveReadonly = computed(() => props.readonly || Boolean(formItem?.readonly?.value));
const inheritedStatus = computed(() => formItem?.status?.value || '');
const currentPlaceholder = computed(
  () => props.placeholder || (props.searchable ? t('searchPlaceholder') : t('placeholder'))
);
const accessibleLabel = computed(
  () => externalAriaLabel.value || (labelledBy.value ? undefined : currentPlaceholder.value)
);
const normalizedOptionHeight = computed(() => {
  const value = Number(props.optionHeight);
  return Number.isFinite(value) && value >= SELECT_DEFAULT_OPTION_HEIGHT
    ? value
    : SELECT_DEFAULT_OPTION_HEIGHT;
});
const normalizedMultipleLimit = computed(() => {
  const value = Number(props.multipleLimit);
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
});
const normalizedRemoteDebounce = computed(() => {
  const value = Number(props.remoteDebounce);
  return Number.isFinite(value) && value >= 0 ? value : SELECT_DEFAULT_REMOTE_DEBOUNCE;
});

const dropdownClasses = computed(() => [
  {
    'is-multiple': props.multiple,
    'ex-no-neon': !neonEffect.value,
    'ex-no-animation': !animation.value,
  },
]);

// 计算属性
const selectClasses = computed(() => {
  const classes = ['ex-select', `ex-select--${componentSize.value}`];

  if (props.multiple) classes.push('ex-select--multiple');
  if (effectiveDisabled.value) classes.push('is-disabled');
  if (effectiveReadonly.value) classes.push('is-readonly');
  if (inheritedStatus.value) classes.push(`is-${inheritedStatus.value}`);
  if (dropdownVisible.value) classes.push('is-focus');

  classes.push(...normalizeCustomClass(props.class));

  return classes;
});

const selectStyles = computed(() => {
  if (!props.style) return undefined;
  if (typeof props.style === 'string') return props.style;
  return props.style;
});

const {
  filteredOptions,
  flatFilteredOptions,
  selectedOption,
  selectedValues,
  selectedOptions,
  getOptionByValue,
  isSelected,
  getOptionIndex,
  virtualRows,
  getVirtualRowIndex,
  useVirtual,
} = useSelectOptions(props, searchQuery);

// 折叠标签时实际展示的标签与被折叠数量
const displayTags = computed<SelectOption[]>(() =>
  props.collapseTags ? selectedOptions.value.slice(0, 1) : selectedOptions.value
);
const collapsedCount = computed(() => selectedOptions.value.length - displayTags.value.length);

// 显示清空图标
const showClearIcon = computed(() => {
  if (!props.clearable || effectiveDisabled.value || effectiveReadonly.value) return false;
  // 只有界面上存在真实选中内容时才显示清空入口，避免空值或失效值出现假操作。
  return props.multiple ? selectedOptions.value.length > 0 : selectedOption.value !== null;
});

// 虚拟滚动容器高度：按选项数量自适应，最高不超过下拉的可视高度
const virtualHeight = computed(() => {
  const contentHeight = virtualRows.value.length * normalizedOptionHeight.value;
  return Math.min(contentHeight, SELECT_DROPDOWN_OPTIONS_MAX_HEIGHT, availableDropdownHeight.value);
});

// 键盘导航后将高亮项滚动进可视区域（虚拟滚动时按索引滚动）
const scrollHoverIntoView = () => {
  if (hoverIndex.value < 0) return;
  if (useVirtual.value) {
    nextTick(() => virtualListRef.value?.scrollToIndex(getVirtualRowIndex(hoverIndex.value)));
  }
};

// 在过滤后的列表里查找下一个/上一个可用（未禁用）选项索引
const findEnabledIndex = (from: number, direction: 1 | -1): number => {
  const list = flatFilteredOptions.value;
  if (list.length === 0) return -1;
  let index = from;
  for (let i = 0; i < list.length; i++) {
    index = (index + direction + list.length) % list.length;
    if (!list[index]?.disabled) return index;
  }
  return -1;
};

// 更新下拉菜单位置
const updateDropdownPosition = () => {
  if (!triggerRef.value || !dropdownRef.value) return;

  const triggerRect = triggerRef.value.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const dropdownHeight = dropdownRef.value.offsetHeight;
  const position = calculateSelectDropdownPosition(
    triggerRect,
    dropdownHeight,
    viewportWidth,
    viewportHeight
  );

  // 同时限制浮层和列表高度，避免小视口中内容溢出或虚拟列表行高失配。
  availableDropdownHeight.value = position.optionsMaxHeight;

  dropdownStyles.value = {
    top: `${position.top}px`,
    left: `${position.left}px`,
    minWidth: `${position.width}px`,
    maxWidth: `${position.maxWidth}px`,
    maxHeight: `${position.maxHeight}px`,
    zIndex: String(dropdownZIndex.value),
    '--ex-select-options-max-height': `${position.optionsMaxHeight}px`,
  };
};

// 视口变化后先恢复完整内容高度，再在下一帧重新测量，避免重复定位产生高度振荡。
const handleViewportChange = () => {
  availableDropdownHeight.value = SELECT_DROPDOWN_OPTIONS_MAX_HEIGHT;
  dropdownRef.value?.style.removeProperty('max-height');
  dropdownRef.value?.style.removeProperty('--ex-select-options-max-height');
  void nextTick(updateDropdownPosition);
};

// 事件处理
const handleTriggerClick = () => {
  if (effectiveDisabled.value || effectiveReadonly.value) return;

  if (dropdownVisible.value) {
    hideDropdown();
  } else {
    showDropdown();
  }
};

const showDropdown = () => {
  if (effectiveDisabled.value || effectiveReadonly.value || dropdownVisible.value) return;

  availableDropdownHeight.value = SELECT_DROPDOWN_OPTIONS_MAX_HEIGHT;
  dropdownStyles.value = {};
  dropdownVisible.value = true;
  emit('visible-change', true);

  nextTick(() => {
    updateDropdownPosition();
    if (props.searchable && inputRef.value) {
      inputRef.value.focus();
    }
  });
};

const hideDropdown = () => {
  if (!dropdownVisible.value) {
    searchQuery.value = '';
    hoverIndex.value = -1;
    return;
  }
  dropdownVisible.value = false;
  emit('visible-change', false);
  searchQuery.value = '';
  hoverIndex.value = -1;
};

const handleInputClick = () => {
  if (effectiveDisabled.value || effectiveReadonly.value) return;
  if (!dropdownVisible.value) showDropdown();
};

const handleSelect = (option: SelectOption) => {
  if (option.disabled || effectiveDisabled.value || effectiveReadonly.value) return;

  if (props.multiple) {
    const current = selectedValues.value;
    const already = current.includes(option.value);
    let next: Array<string | number>;
    if (already) {
      next = current.filter(v => v !== option.value);
    } else {
      // 达到上限则忽略新增
      if (normalizedMultipleLimit.value > 0 && current.length >= normalizedMultipleLimit.value) {
        return;
      }
      next = [...current, option.value];
    }
    emit('update:modelValue', next);
    emit(
      'change',
      next,
      next.map(getOptionByValue).filter((o): o is SelectOption => !!o)
    );
    formItem?.onFieldChange();
    // 多选保持下拉打开；清空搜索词以便继续筛选
    if (props.searchable) searchQuery.value = '';
    return;
  }

  emit('update:modelValue', option.value);
  emit('change', option.value, option);
  formItem?.onFieldChange();
  hideDropdown();
};

// 多选：移除某个标签
const removeTag = (value: string | number) => {
  if (effectiveDisabled.value || effectiveReadonly.value) return;
  const next = selectedValues.value.filter(v => v !== value);
  emit('update:modelValue', next);
  emit(
    'change',
    next,
    next.map(getOptionByValue).filter((o): o is SelectOption => !!o)
  );
  emit('remove-tag', value);
  formItem?.onFieldChange();
};

const handleClear = () => {
  if (effectiveDisabled.value || effectiveReadonly.value) return;
  const cleared: SelectValue = props.multiple ? [] : null;
  emit('update:modelValue', cleared);
  emit('change', cleared, props.multiple ? [] : null);
  emit('clear');
  formItem?.onFieldChange();
  hideDropdown();
};

const handleFocus = (event: FocusEvent) => {
  emit('focus', event);
};

const handleBlur = (event: FocusEvent) => {
  emit('blur', event);
  formItem?.onFieldBlur();
};

// 远程搜索：防抖触发父级的 remoteMethod
let triggerRemote = debounce((query: string) => {
  props.remoteMethod?.(query);
}, normalizedRemoteDebounce.value);

watch(normalizedRemoteDebounce, delay => {
  triggerRemote.cancel();
  triggerRemote = debounce((query: string) => {
    props.remoteMethod?.(query);
  }, delay);
});

watch([effectiveDisabled, effectiveReadonly], ([disabled, readonly]) => {
  if (!disabled && !readonly) return;
  triggerRemote.cancel();
  hideDropdown();
});

const handleSearch = () => {
  if (effectiveDisabled.value || effectiveReadonly.value) return;
  // 过滤结果变化后重置高亮，避免索引指向已被过滤掉的选项
  hoverIndex.value = -1;
  if (!dropdownVisible.value) {
    showDropdown();
  }
  if (props.remote && props.remoteMethod) {
    triggerRemote(searchQuery.value);
  }
};

const handleKeydown = (event: KeyboardEvent) => {
  if (effectiveDisabled.value || effectiveReadonly.value || isComposingKeyboardEvent(event)) return;

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      if (!dropdownVisible.value) {
        hoverIndex.value = findEnabledIndex(-1, 1);
        showDropdown();
        scrollHoverIntoView();
      } else {
        hoverIndex.value = findEnabledIndex(hoverIndex.value, 1);
        scrollHoverIntoView();
      }
      break;

    case 'ArrowUp':
      event.preventDefault();
      if (!dropdownVisible.value) {
        hoverIndex.value = findEnabledIndex(flatFilteredOptions.value.length, -1);
        showDropdown();
        scrollHoverIntoView();
      } else {
        hoverIndex.value = findEnabledIndex(
          hoverIndex.value < 0 ? flatFilteredOptions.value.length : hoverIndex.value,
          -1
        );
        scrollHoverIntoView();
      }
      break;

    case 'Home':
      if (!dropdownVisible.value) return;
      event.preventDefault();
      hoverIndex.value = findEnabledIndex(-1, 1);
      scrollHoverIntoView();
      break;

    case 'End':
      if (!dropdownVisible.value) return;
      event.preventDefault();
      hoverIndex.value = findEnabledIndex(flatFilteredOptions.value.length, -1);
      scrollHoverIntoView();
      break;

    case 'Enter':
    case ' ':
      // 空格仅在非搜索模式下触发（搜索输入框中空格属于正常输入）
      if (event.key === ' ' && props.searchable) return;
      event.preventDefault();
      if (dropdownVisible.value && hoverIndex.value >= 0) {
        const hovered = flatFilteredOptions.value[hoverIndex.value];
        if (hovered && !hovered.disabled) {
          handleSelect(hovered);
        }
      } else {
        showDropdown();
      }
      break;

    case 'Escape':
      if (!dropdownVisible.value) return;
      event.preventDefault();
      event.stopPropagation();
      hideDropdown();
      break;

    case 'Tab':
      hideDropdown();
      break;
  }
};

// 点击外部关闭
const handleClickOutside = (event: MouseEvent) => {
  if (!dropdownVisible.value) return;

  const target = event.target as Node;
  if (selectRef.value && !selectRef.value.contains(target) && !containsPopupTarget(target)) {
    hideDropdown();
  }
};

// 监听下拉状态：仅在下拉打开时挂载全局监听器
watch(dropdownVisible, visible => {
  if (visible) {
    nextTick(() => {
      updateDropdownPosition();
      // 设置初始 hover 索引为选中项
      const initialOption = selectedOption.value || selectedOptions.value[0];
      if (hoverIndex.value < 0 && initialOption) {
        hoverIndex.value = getOptionIndex(initialOption);
      }
    });
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('scroll', handleViewportChange, true);
  } else {
    document.removeEventListener('mousedown', handleClickOutside);
    window.removeEventListener('resize', handleViewportChange);
    window.removeEventListener('scroll', handleViewportChange, true);
  }
});

// 生命周期：卸载时兜底清理
onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside);
  window.removeEventListener('resize', handleViewportChange);
  window.removeEventListener('scroll', handleViewportChange, true);
  // 清理远程搜索防抖待执行的定时器
  triggerRemote.cancel();
});

// 暴露的方法
const focus = () => {
  if (props.searchable && inputRef.value) {
    inputRef.value.focus();
  } else {
    triggerRef.value?.focus();
  }
};

const blur = () => {
  if (props.searchable && inputRef.value) {
    inputRef.value.blur();
  } else {
    triggerRef.value?.blur();
  }
};

defineExpose<ExSelectExposed>({
  focus,
  blur,
  showDropdown,
  hideDropdown,
});
</script>

<style lang="scss" scoped src="./ExSelect.scss"></style>
