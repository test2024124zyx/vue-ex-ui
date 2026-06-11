<template>
  <div ref="cascaderRef" :class="cascaderClasses" :style="cascaderStyles">
    <!-- 输入框 -->
    <div ref="triggerRef" class="ex-cascader__input-wrapper" @click="handleTriggerClick">
      <input
        ref="inputRef"
        :value="inputDisplayValue"
        :placeholder="currentPlaceholder"
        :disabled="disabled"
        :readonly="!filterable"
        class="ex-cascader__input"
        @input="handleInput"
      />

      <!-- 后缀图标 -->
      <div class="ex-cascader__suffix">
        <button
          v-if="clearable && hasValue && !disabled"
          class="ex-cascader__clear"
          @click.stop="handleClear"
        >
          <ExIcon icon="close-line" :size="14" aria-hidden="true" />
        </button>
        <span v-else class="ex-cascader__arrow" :class="{ 'ex-cascader__arrow--open': visible }">
          <ExIcon icon="arrow-down-s-line" :size="16" aria-hidden="true" />
        </span>
      </div>
    </div>

    <!-- 下拉面板 -->
    <transition name="ex-cascader-dropdown">
      <div v-show="visible" ref="dropdownRef" class="ex-cascader__dropdown">
        <!-- 搜索结果（filterable 且有输入时） -->
        <div v-if="filterable && searchQuery" class="ex-cascader__search-results">
          <div
            v-for="result in searchResults"
            :key="result.values.join('/')"
            class="ex-cascader__option"
            :class="{ 'ex-cascader__option--disabled': result.disabled }"
            @click="handleSearchResultClick(result)"
          >
            <span class="ex-cascader__option-label">{{ result.labels.join(separator) }}</span>
          </div>
          <div v-if="searchResults.length === 0" class="ex-cascader__empty">
            {{ t('cascader.noData') }}
          </div>
        </div>

        <div v-else class="ex-cascader__menus">
          <div v-for="(menu, index) in menus" :key="index" class="ex-cascader__menu">
            <div
              v-for="option in menu"
              :key="option.value"
              class="ex-cascader__option"
              :class="{
                'ex-cascader__option--active': isActive(option, index),
                'ex-cascader__option--disabled': option.disabled,
                'ex-cascader__option--selected': isSelected(option, index),
              }"
              @click="handleOptionClick(option, index)"
              @mouseenter="trigger === 'hover' && handleOptionHover(option, index)"
            >
              <span class="ex-cascader__option-label">{{ option.label }}</span>
              <span
                v-if="option.children && option.children.length"
                class="ex-cascader__option-arrow"
              >
                <ExIcon icon="arrow-right-s-line" :size="16" aria-hidden="true" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import ExIcon from '../icon/ExIcon.vue';
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue';
import type { ExCascaderProps, ExCascaderEmits, ExCascaderExposed, CascaderOption } from './types';
import { useI18n } from '../../locale';
import { useComponentSize } from '../config-provider/composables';

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
});

const { t } = useI18n();
const componentSize = useComponentSize(computed(() => props.size));

const currentPlaceholder = computed(() => props.placeholder || t('cascader.placeholder'));

const emit = defineEmits<ExCascaderEmits>();

const cascaderRef = ref<HTMLDivElement>();
const triggerRef = ref<HTMLDivElement>();
const dropdownRef = ref<HTMLDivElement>();
const inputRef = ref<HTMLInputElement>();
const visible = ref(false);
const selectedPath = ref<(string | number)[]>([...props.modelValue]);
const menus = ref<CascaderOption[][]>([]);
const searchQuery = ref('');

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

  if (selectedPath.value.length > 0) {
    let currentOptions = props.options;

    for (let i = 0; i < selectedPath.value.length; i++) {
      const value = selectedPath.value[i];
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
  return selectedPath.value[level] === option.value;
};

// 判断选项是否被选中
const isSelected = (option: CascaderOption, level: number) => {
  return selectedPath.value[level] === option.value;
};

// 显示/隐藏面板
const show = () => {
  if (props.disabled) return;
  visible.value = true;
  emit('visible-change', true);
};

const hide = () => {
  visible.value = false;
  searchQuery.value = '';
  emit('visible-change', false);
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

// 点击搜索结果：直接选中整条路径
const handleSearchResultClick = (result: CascaderSearchResult) => {
  if (result.disabled) return;

  selectedPath.value = [...result.values];
  initMenus();
  emitChange();
  searchQuery.value = '';
  hide();
};

const handleOptionClick = (option: CascaderOption, level: number) => {
  if (option.disabled) return;

  // 更新选中路径
  selectedPath.value = selectedPath.value.slice(0, level);
  selectedPath.value.push(option.value);

  // 更新菜单
  menus.value = menus.value.slice(0, level + 1);

  if (option.children && option.children.length) {
    menus.value.push(option.children);

    // 如果允许选择任意一级，则触发变化
    if (props.changeOnSelect) {
      emitChange();
    }
  } else {
    // 叶子节点，触发变化并关闭
    emitChange();
    hide();
  }
};

const handleOptionHover = (option: CascaderOption, level: number) => {
  if (option.disabled) return;

  if (option.children && option.children.length) {
    menus.value = menus.value.slice(0, level + 1);
    menus.value.push(option.children);
  }
};

const handleClear = () => {
  selectedPath.value = [];
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
    initMenus();
  }
);

// 生命周期
onMounted(() => {
  initMenus();
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
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
