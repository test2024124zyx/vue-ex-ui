<template>
  <div
    v-if="divided"
    class="ex-dropdown-item__divider"
    role="separator"
  />
  <div
    v-bind="$attrs"
    :id="itemId"
    :class="itemClasses"
    role="menuitem"
    data-ex-dropdown-item
    :aria-disabled="disabled ? 'true' : undefined"
    @mouseenter="handleMouseEnter"
    @click="handleClick"
  >
    <!-- prettier-ignore -->
    <img
      v-if="icon"
      :src="icon"
      alt=""
      class="ex-dropdown-item__icon"
      aria-hidden="true"
    >
    <span class="ex-dropdown-item__label">
      <slot>{{ label }}</slot>
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, useId } from 'vue';
import { DROPDOWN_INJECTION_KEY } from './context';
import type { ExDropdownItemEmits, ExDropdownItemProps } from './types';

defineOptions({
  name: 'ExDropdownItem',
  inheritAttrs: false,
});

const props = withDefaults(defineProps<ExDropdownItemProps>(), {
  disabled: false,
  divided: false,
});
const emit = defineEmits<ExDropdownItemEmits>();
const dropdown = inject(DROPDOWN_INJECTION_KEY, null);
const generatedId = `ex-dropdown-item-${useId()}`;
const itemId = computed(() => props.id || generatedId);

const itemClasses = computed(() => [
  'ex-dropdown-item',
  {
    'ex-dropdown-item--disabled': props.disabled,
    'ex-dropdown-item--active': dropdown?.activeItemId.value === itemId.value,
  },
]);

const handleMouseEnter = () => {
  if (!props.disabled) dropdown?.activate(itemId.value);
};

const handleClick = (event: MouseEvent) => {
  if (props.disabled) return;
  emit('click', event);
  dropdown?.select();
};
</script>

<style scoped lang="scss" src="./ExDropdownItem.scss"></style>
