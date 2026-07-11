<template>
  <li
    class="ex-breadcrumb-item"
    :class="[
      `ex-breadcrumb-item--${size}`,
      {
        'ex-breadcrumb-item--clickable': isClickable,
        'ex-breadcrumb-item--last': isLast,
        'ex-breadcrumb-item--disabled': item.disabled,
      },
    ]"
    :aria-disabled="item.disabled || undefined"
  >
    <a
      v-if="isClickable"
      :href="item.path"
      class="ex-breadcrumb-item__link"
      @click.prevent="handleClick"
    >
      <span v-if="$slots.icon" class="ex-breadcrumb-item__icon">
        <slot name="icon" :item="item" :index="index" />
      </span>
      <span class="ex-breadcrumb-item__text">{{ item.label }}</span>
    </a>

    <span
      v-else
      class="ex-breadcrumb-item__text-wrapper"
      :aria-current="isLast ? 'page' : undefined"
    >
      <span v-if="$slots.icon" class="ex-breadcrumb-item__icon">
        <slot name="icon" :item="item" :index="index" />
      </span>
      <span class="ex-breadcrumb-item__text">{{ item.label }}</span>
    </span>

    <!-- 分隔符 -->
    <span
      v-if="!isLast && (separator || $slots.separator)"
      class="ex-breadcrumb-item__separator"
      aria-hidden="true"
    >
      <slot v-if="$slots.separator" name="separator" />
      <span v-else>{{ separator || '/' }}</span>
    </span>
  </li>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { BreadcrumbItemProps, BreadcrumbItemEmits } from './types';

defineOptions({
  name: 'ExBreadcrumbItem',
});

const props = withDefaults(defineProps<BreadcrumbItemProps>(), {
  index: 0,
  isLast: false,
  separator: '/',
  size: 'medium',
  clickable: true,
});

const emit = defineEmits<BreadcrumbItemEmits>();

// 是否可点击
const isClickable = computed(() => {
  return Boolean(props.clickable && !props.isLast && !props.item.disabled && props.item.path);
});

// 处理点击
const handleClick = () => {
  if (isClickable.value) {
    emit('click', props.item);
  }
};
</script>

<style scoped lang="scss" src="./ExBreadcrumbItem.scss"></style>
