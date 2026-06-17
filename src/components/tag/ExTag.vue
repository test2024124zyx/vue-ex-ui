<template>
  <span
    :class="classes"
    :style="styles"
    @click="handleClick"
  >
    <span
      v-if="$slots.prefix"
      class="ex-tag__prefix"
    >
      <slot name="prefix" />
    </span>

    <span class="ex-tag__content">
      <slot />
    </span>

    <span
      v-if="closable"
      class="ex-tag__close"
      role="button"
      tabindex="0"
      :aria-label="t('tag.close')"
      @click.stop="handleClose"
      @keydown.enter.stop.prevent="handleClose"
      @keydown.space.stop.prevent="handleClose"
    >
      <slot name="close">
        <ExIcon
          icon="close-line"
          :size="12"
        />
      </slot>
    </span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { TagProps } from './types';
import ExIcon from '../icon/ExIcon.vue';
import { useComponentSize } from '../config-provider/composables';
import { useI18n } from '../../locale';

const props = withDefaults(defineProps<TagProps>(), {
  type: 'primary',
  closable: false,
  round: false,
  size: undefined, // 改为 undefined，让 useComponentSize 处理默认值
  effect: 'light',
});

const emit = defineEmits(['click', 'close']);

const { t } = useI18n();

// 使用全局尺寸配置
const componentSize = useComponentSize(computed(() => props.size));

const classes = computed(() => [
  'ex-tag',
  `ex-tag--${props.type}`,
  `ex-tag--${componentSize.value}`,
  `ex-tag--${props.effect}`,
  {
    'is-round': props.round,
    'is-closable': props.closable,
  },
]);

const styles = computed(() => {
  const style: {
    '--ex-tag-text-color'?: string;
    '--ex-tag-bg-color'?: string;
    '--ex-tag-border-color'?: string;
  } = {};

  if (props.color) {
    style['--ex-tag-text-color'] = props.color;
  }
  if (props.bgColor) {
    style['--ex-tag-bg-color'] = props.bgColor;
  }
  if (props.borderColor) {
    style['--ex-tag-border-color'] = props.borderColor;
  }

  return style;
});

const handleClick = (event: MouseEvent) => {
  emit('click', event);
};

const handleClose = (event: MouseEvent | KeyboardEvent) => {
  emit('close', event);
};
</script>
<style lang="scss" scoped src="./ExTag.scss"></style>
