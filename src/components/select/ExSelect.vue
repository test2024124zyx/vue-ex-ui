<template>
  <div ref="selectRef" :class="selectClasses" :style="selectStyles">
    <!-- 选择器触发器 -->
    <div
      ref="triggerRef"
      class="ex-select__trigger"
      role="combobox"
      aria-haspopup="listbox"
      :aria-expanded="dropdownVisible"
      :aria-disabled="disabled"
      :tabindex="disabled || searchable ? undefined : 0"
      @click="handleTriggerClick"
      @keydown="handleKeydown"
    >
      <!-- 选中的值显示 -->
      <div class="ex-select__value">
        <span v-if="selectedOption" class="ex-select__label">
          {{ selectedOption.label }}
        </span>
        <input
          v-else-if="searchable"
          ref="inputRef"
          v-model="searchQuery"
          class="ex-select__input"
          :placeholder="placeholder"
          :disabled="disabled"
          @focus="handleFocus"
          @blur="handleBlur"
          @input="handleSearch"
          @keydown="handleKeydown"
        />
        <span v-else class="ex-select__placeholder">
          {{ placeholder }}
        </span>
      </div>

      <!-- 右侧图标 -->
      <div class="ex-select__suffix">
        <!-- 清空按钮 -->
        <span v-if="showClearIcon" class="ex-select__clear" @click.stop="handleClear">
          <svg viewBox="0 0 1024 1024" width="14" height="14">
            <path
              d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm165.4 618.2l-66-.3L512 563.4l-99.3 118.4-66.1.3c-4.4 0-8-3.5-8-8 0-1.9.7-3.7 1.9-5.2l130.1-155L340.5 359a8.32 8.32 0 01-1.9-5.2c0-4.4 3.6-8 8-8l66.1.3L512 464.6l99.3-118.4 66-.3c4.4 0 8 3.5 8 8 0 1.9-.7 3.7-1.9 5.2L553.5 514l130 155c1.2 1.5 1.9 3.3 1.9 5.2 0 4.4-3.6 8-8 8z"
              fill="currentColor"
            />
          </svg>
        </span>

        <!-- 下拉箭头 -->
        <span class="ex-select__arrow" :class="{ 'is-reverse': dropdownVisible }">
          <svg viewBox="0 0 1024 1024" width="14" height="14">
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
          ref="dropdownRef"
          class="ex-select__dropdown"
          :style="dropdownStyles"
        >
          <ul class="ex-select__options" role="listbox">
            <template v-for="(item, index) in filteredOptions" :key="index">
              <!-- 分组标题 -->
              <li v-if="isGroup(item)" class="ex-select__group">
                {{ item.label }}
              </li>

              <!-- 分组选项 -->
              <template v-if="isGroup(item)">
                <li
                  v-for="option in item.options"
                  :key="option.value"
                  class="ex-select__option"
                  :class="{
                    'is-selected': isSelected(option),
                    'is-disabled': option.disabled,
                    'is-hover': hoverIndex === getOptionIndex(option),
                  }"
                  role="option"
                  :aria-selected="isSelected(option)"
                  @click="handleSelect(option)"
                  @mouseenter="hoverIndex = getOptionIndex(option)"
                >
                  {{ option.label }}
                </li>
              </template>

              <!-- 普通选项 -->
              <li
                v-else
                class="ex-select__option"
                :class="{
                  'is-selected': isSelected(item),
                  'is-disabled': item.disabled,
                  'is-hover': hoverIndex === getOptionIndex(item),
                }"
                role="option"
                :aria-selected="isSelected(item)"
                @click="handleSelect(item)"
                @mouseenter="hoverIndex = getOptionIndex(item)"
              >
                {{ item.label }}
              </li>
            </template>

            <!-- 无数据 -->
            <li v-if="filteredOptions.length === 0" class="ex-select__empty">
              {{ t('noData') }}
            </li>
          </ul>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick, onUnmounted } from 'vue';
import type {
  ExSelectProps,
  ExSelectEmits,
  ExSelectExposed,
  SelectOption,
  SelectOptionGroup,
} from './types';
import { useLocale } from '../../locale';
import { useComponentSize } from '../config-provider/composables';

defineOptions({
  name: 'ExSelect',
});

const props = withDefaults(defineProps<ExSelectProps>(), {
  modelValue: null,
  options: () => [],
  placeholder: '',
  size: undefined,
  disabled: false,
  clearable: false,
  searchable: false,
});

const emit = defineEmits<ExSelectEmits>();

const { t } = useLocale('selector');

// 使用全局尺寸配置
const componentSize = useComponentSize(computed(() => props.size));

// Refs
const selectRef = ref<HTMLElement>();
const triggerRef = ref<HTMLElement>();
const inputRef = ref<HTMLInputElement>();
const dropdownRef = ref<HTMLElement>();

// State
const dropdownVisible = ref(false);
const searchQuery = ref('');
const hoverIndex = ref(-1);
const dropdownStyles = ref<Record<string, string>>({});

// 计算属性
const selectClasses = computed(() => {
  const classes = ['ex-select', `ex-select--${componentSize.value}`];

  if (props.disabled) classes.push('is-disabled');
  if (dropdownVisible.value) classes.push('is-focus');

  if (props.class) {
    if (typeof props.class === 'string') {
      classes.push(props.class);
    } else if (Array.isArray(props.class)) {
      classes.push(...props.class);
    } else {
      Object.entries(props.class).forEach(([key, value]) => {
        if (value) classes.push(key);
      });
    }
  }

  return classes;
});

const selectStyles = computed(() => {
  if (!props.style) return undefined;
  if (typeof props.style === 'string') return props.style;
  return props.style;
});

// 扁平化选项
const flatOptions = computed<SelectOption[]>(() => {
  const flat: SelectOption[] = [];
  props.options.forEach(item => {
    if (isGroup(item)) {
      flat.push(...item.options);
    } else {
      flat.push(item);
    }
  });
  return flat;
});

// 过滤选项
const filteredOptions = computed(() => {
  if (!props.searchable || !searchQuery.value) {
    return props.options;
  }

  const query = searchQuery.value.toLowerCase();
  const result: typeof props.options = [];

  props.options.forEach(item => {
    if (isGroup(item)) {
      const filteredGroupOptions = item.options.filter(opt => matchOption(opt, query));
      if (filteredGroupOptions.length > 0) {
        result.push({ ...item, options: filteredGroupOptions });
      }
    } else {
      if (matchOption(item, query)) {
        result.push(item);
      }
    }
  });

  return result;
});

// 选中的选项
const selectedOption = computed(() => {
  return flatOptions.value.find(opt => opt.value === props.modelValue) || null;
});

// 显示清空图标
const showClearIcon = computed(() => {
  return props.clearable && props.modelValue != null && !props.disabled;
});

// 工具函数
const isGroup = (item: SelectOption | SelectOptionGroup): item is SelectOptionGroup => {
  return 'options' in item;
};

const matchOption = (option: SelectOption, query: string): boolean => {
  const labelMatch = option.label.toLowerCase().includes(query);
  const keywordsMatch = option.keywords?.some(kw => kw.toLowerCase().includes(query));
  return labelMatch || !!keywordsMatch;
};

const isSelected = (option: SelectOption): boolean => {
  return option.value === props.modelValue;
};

// 扁平化"过滤后"的选项：键盘导航与高亮都以此为准，
// 避免搜索过滤后索引与渲染列表错位
const flatFilteredOptions = computed<SelectOption[]>(() => {
  const flat: SelectOption[] = [];
  filteredOptions.value.forEach(item => {
    if (isGroup(item)) {
      flat.push(...item.options);
    } else {
      flat.push(item);
    }
  });
  return flat;
});

const getOptionIndex = (option: SelectOption): number => {
  return flatFilteredOptions.value.findIndex(opt => opt.value === option.value);
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
  const dropdownHeight = dropdownRef.value.offsetHeight;
  const spaceBelow = window.innerHeight - triggerRect.bottom;
  const spaceAbove = triggerRect.top;

  let top: number;
  const left = triggerRect.left;
  const width = triggerRect.width;

  // 判断下拉方向
  if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
    // 向上展开
    top = triggerRect.top - dropdownHeight - 4;
  } else {
    // 向下展开
    top = triggerRect.bottom + 4;
  }

  dropdownStyles.value = {
    top: `${top}px`,
    left: `${left}px`,
    minWidth: `${width}px`,
  };
};

// 事件处理
const handleTriggerClick = () => {
  if (props.disabled) return;

  if (dropdownVisible.value) {
    hideDropdown();
  } else {
    showDropdown();
  }
};

const showDropdown = () => {
  if (props.disabled) return;

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
  dropdownVisible.value = false;
  emit('visible-change', false);
  searchQuery.value = '';
  hoverIndex.value = -1;
};

const handleSelect = (option: SelectOption) => {
  if (option.disabled) return;

  emit('update:modelValue', option.value);
  emit('change', option.value, option);
  hideDropdown();
};

const handleClear = () => {
  emit('update:modelValue', null);
  emit('change', null, null);
  emit('clear');
  hideDropdown();
};

const handleFocus = (event: FocusEvent) => {
  emit('focus', event);
};

const handleBlur = (event: FocusEvent) => {
  emit('blur', event);
};

const handleSearch = () => {
  if (!dropdownVisible.value) {
    showDropdown();
  }
};

const handleKeydown = (event: KeyboardEvent) => {
  if (props.disabled) return;

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      if (!dropdownVisible.value) {
        showDropdown();
      } else {
        hoverIndex.value = findEnabledIndex(hoverIndex.value, 1);
      }
      break;

    case 'ArrowUp':
      event.preventDefault();
      if (!dropdownVisible.value) {
        showDropdown();
      } else {
        hoverIndex.value = findEnabledIndex(
          hoverIndex.value < 0 ? flatFilteredOptions.value.length : hoverIndex.value,
          -1
        );
      }
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
      event.preventDefault();
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
  if (
    selectRef.value &&
    !selectRef.value.contains(target) &&
    dropdownRef.value &&
    !dropdownRef.value.contains(target)
  ) {
    hideDropdown();
  }
};

// 监听下拉状态：仅在下拉打开时挂载全局监听器
watch(dropdownVisible, visible => {
  if (visible) {
    nextTick(() => {
      updateDropdownPosition();
      // 设置初始 hover 索引为选中项
      if (selectedOption.value) {
        hoverIndex.value = getOptionIndex(selectedOption.value);
      }
    });
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', updateDropdownPosition);
    window.addEventListener('scroll', updateDropdownPosition, true);
  } else {
    document.removeEventListener('mousedown', handleClickOutside);
    window.removeEventListener('resize', updateDropdownPosition);
    window.removeEventListener('scroll', updateDropdownPosition, true);
  }
});

// 生命周期：卸载时兜底清理
onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside);
  window.removeEventListener('resize', updateDropdownPosition);
  window.removeEventListener('scroll', updateDropdownPosition, true);
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
