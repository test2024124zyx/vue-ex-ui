<template>
  <div
    :class="itemClasses"
    @click="handleClick"
  >
    <img
      v-if="icon"
      :src="icon"
      alt="icon"
      class="ex-dropdown-item__icon"
    >
    <span class="ex-dropdown-item__label">
      <slot>{{ label }}</slot>
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ExDropdownItemProps } from './types';

defineOptions({
  name: 'ExDropdownItem',
});

const props = withDefaults(defineProps<ExDropdownItemProps>(), {
  disabled: false,
  divided: false,
});

const emit = defineEmits<{
  click: [];
}>();

// 计算属性
const itemClasses = computed(() => {
  const classes = ['ex-dropdown-item'];

  if (props.disabled) classes.push('ex-dropdown-item--disabled');

  return classes;
});

// 方法
const handleClick = () => {
  if (!props.disabled) {
    emit('click');
  }
};
</script>

<style scoped lang="scss" src="./ExDropdownItem.scss"></style>
