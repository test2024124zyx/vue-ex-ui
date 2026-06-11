<template>
  <div
    :class="rateClasses"
    :style="rateStyles"
    @mouseleave="handleMouseLeave"
  >
    <!-- 评分星星 -->
    <div class="ex-rate__stars">
      <span
        v-for="item in max"
        :key="item"
        :class="getStarClasses(item)"
        @mouseenter="handleMouseEnter(item)"
        @mousemove="handleMouseMove(item, $event)"
        @click="handleClick(item, $event)"
      >
        <!-- 未选中的图标 -->
        <span 
          class="ex-rate__icon ex-rate__icon--void"
        >
          <slot
            name="icon-void"
            :index="item"
            :color="voidColor"
          >
            <ex-icon
              src="https://api.iconify.design/ri/star-line.svg"
              :size="iconSize"
              :color="voidColor"
            />
          </slot>
        </span>
        
        <!-- 选中的图标 -->
        <span 
          class="ex-rate__icon ex-rate__icon--active"
        >
          <slot
            name="icon-active"
            :index="item"
            :color="disabled ? disabledVoidColor : color"
          >
            <ex-icon
              src="https://api.iconify.design/ri/star-fill.svg"
              :size="iconSize"
              :color="disabled ? disabledVoidColor : color"
              :style="getActiveStyle(item)"
            />
          </slot>
        </span>
      </span>
    </div>

    <!-- 分数显示 -->
    <span
      v-if="showScore || showText"
      class="ex-rate__text"
    >
      {{ displayText }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { ExRateProps, ExRateEmits } from './types';
import ExIcon from '../icon/ExIcon.vue';

defineOptions({
  name: 'ExRate',
});

const props = withDefaults(defineProps<ExRateProps>(), {
  modelValue: 0,
  max: 5,
  disabled: false,
  readonly: false,
  allowHalf: false,
  showScore: false,
  showText: false,
  scoreTemplate: '{value}',
  size: 'medium',
  color: '#00f0ff',
  voidColor: '#4a5568',
  disabledVoidColor: '#6b7280',
});

const emit = defineEmits<ExRateEmits>();

// 响应式状态
const currentValue = ref(props.modelValue);
const hoverValue = ref(-1);
const isHovering = ref(false);

// 计算属性
const rateClasses = computed(() => {
  const classes = [
    'ex-rate',
    `ex-rate--${props.size}`,
  ];

  if (props.disabled) classes.push('is-disabled');
  if (props.readonly) classes.push('is-readonly');

  return classes;
});

const rateStyles = computed(() => {
  if (typeof props.customStyle === 'string') {
    return props.customStyle;
  }
  return props.customStyle || {};
});

const iconSize = computed(() => {
  const sizeMap = {
    small: 16,
    medium: 20,
    large: 24,
  };
  return sizeMap[props.size];
});

const displayValue = computed(() => {
  return isHovering.value ? hoverValue.value : currentValue.value;
});

const displayText = computed(() => {
  if (props.showText && props.texts && props.texts.length > 0) {
    const index = Math.ceil(displayValue.value) - 1;
    return props.texts[index] || '';
  }
  
  if (props.showScore) {
    return props.scoreTemplate.replace('{value}', displayValue.value.toString());
  }
  
  return '';
});

// 方法
function getStarClasses(item: number) {
  const classes = ['ex-rate__star'];
  
  const value = displayValue.value;
  
  if (item <= value) {
    classes.push('is-active');
  } else if (props.allowHalf && item - 0.5 <= value) {
    classes.push('is-half');
  }
  
  if (!props.disabled && !props.readonly) {
    classes.push('is-interactive');
  }
  
  return classes;
}

function getActiveStyle(item: number) {
  const value = displayValue.value;
  const styles: Record<string, string> = {};
  
  if (props.allowHalf && item - 0.5 <= value && item > value) {
    styles.clipPath = 'inset(0 50% 0 0)';
  }
  
  return styles;
}

function getValueFromEvent(item: number, event: MouseEvent): number {
  if (!props.allowHalf) {
    return item;
  }
  
  const target = event.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  const offsetX = event.clientX - rect.left;
  const isHalf = offsetX < rect.width / 2;
  
  return isHalf ? item - 0.5 : item;
}

function handleMouseEnter(item: number) {
  if (props.disabled || props.readonly) return;
  
  isHovering.value = true;
  hoverValue.value = item;
}

function handleMouseMove(item: number, event: MouseEvent) {
  if (props.disabled || props.readonly || !props.allowHalf) return;
  
  const value = getValueFromEvent(item, event);
  hoverValue.value = value;
}

function handleMouseLeave() {
  if (props.disabled || props.readonly) return;
  
  isHovering.value = false;
  hoverValue.value = -1;
}

function handleClick(item: number, event: MouseEvent) {
  if (props.disabled || props.readonly) return;
  
  const newValue = getValueFromEvent(item, event);
  
  currentValue.value = newValue;
  emit('update:modelValue', newValue);
  emit('change', newValue);
}

function setCurrentValue(value: number) {
  currentValue.value = value;
}

function resetCurrentValue() {
  currentValue.value = 0;
  emit('update:modelValue', 0);
  emit('change', 0);
}

// 监听 modelValue 变化
watch(() => props.modelValue, (newValue) => {
  currentValue.value = newValue;
});

// 暴露方法
defineExpose({
  setCurrentValue,
  resetCurrentValue,
});
</script>

<script lang="ts">
import { watch } from 'vue';
</script>

<style scoped lang="scss" src="./ExRate.scss"></style>
