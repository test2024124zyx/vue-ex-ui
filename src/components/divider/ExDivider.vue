<script setup lang="ts">
import { computed, useSlots } from 'vue';
import type { CSSProperties } from 'vue';
import { hasRenderableContent } from '../../utils/vnode';
import { useRenderComputed } from '../../composables/useRenderComputed';
import { useGlobalSize } from '../config-provider/composables';
import type { DividerOrientation, DividerPresetSize, DividerType, ExDividerProps } from './types';

defineOptions({ name: 'ExDivider' });

const props = withDefaults(defineProps<ExDividerProps>(), {
  type: 'horizontal',
  orientation: 'center',
  dashed: false,
  plain: false,
});

const slots = useSlots();
const globalSize = useGlobalSize();
const DIVIDER_TYPES = new Set<DividerType>(['horizontal', 'vertical']);
const DIVIDER_ORIENTATIONS = new Set<DividerOrientation>(['left', 'center', 'right']);
const PRESET_SIZES = new Set<DividerPresetSize>(['small', 'medium', 'large', 'default']);

/** 将有限数字或非空字符串转换为 CSS 长度。 */
const normalizeLength = (
  value: string | number | undefined,
  minimum = Number.NEGATIVE_INFINITY
): string | undefined => {
  if (typeof value === 'number') {
    return Number.isFinite(value) && value >= minimum ? `${value}px` : undefined;
  }
  const normalized = value?.trim();
  return normalized || undefined;
};

const normalizedType = computed<DividerType>(() =>
  DIVIDER_TYPES.has(props.type) ? props.type : 'horizontal'
);
const normalizedOrientation = computed<DividerOrientation>(() =>
  DIVIDER_ORIENTATIONS.has(props.orientation) ? props.orientation : 'center'
);
const normalizedSize = computed<DividerPresetSize | number>(() => {
  const size = props.size;
  if (typeof size === 'number' && Number.isFinite(size) && size > 0) return size;
  const preset = typeof size === 'string' && PRESET_SIZES.has(size) ? size : globalSize.value;
  return preset === 'medium' ? 'default' : preset;
});
const isVertical = computed(() => normalizedType.value === 'vertical');
const hasTitle = useRenderComputed(() =>
  isVertical.value ? false : hasRenderableContent(slots.default?.({}))
);

const classes = computed(() => [
  'ex-divider',
  `ex-divider--${normalizedType.value}`,
  {
    'ex-divider--dashed': props.dashed,
    'ex-divider--plain': props.plain && hasTitle.value,
    [`ex-divider--${normalizedOrientation.value}`]: hasTitle.value,
    [`ex-divider--size-${normalizedSize.value}`]: typeof normalizedSize.value === 'string',
  },
]);

const dividerStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {};
  const margin = normalizeLength(props.margin);
  if (margin) {
    style['--ex-divider-margin'] = isVertical.value ? `0 ${margin}` : `${margin} 0`;
  }

  if (typeof normalizedSize.value === 'number') {
    style['--ex-divider-size'] = `${normalizedSize.value}px`;
  }

  const canApplyOrientationMargin = hasTitle.value && normalizedOrientation.value !== 'center';
  const orientationMargin = normalizeLength(props.orientationMargin, 0);
  if (canApplyOrientationMargin && orientationMargin) {
    style['--ex-divider-orientation-margin'] = orientationMargin;
  }

  const color = props.color?.trim();
  if (color) style['--ex-divider-color'] = color;
  return style;
});

const accessibleLabel = computed(() => props.ariaLabel?.trim() || undefined);
</script>

<template>
  <div
    :class="classes"
    :style="dividerStyle"
    role="separator"
    :aria-orientation="isVertical ? 'vertical' : 'horizontal'"
    :aria-label="accessibleLabel"
  >
    <template v-if="!isVertical">
      <div
        class="ex-divider__line"
        aria-hidden="true"
      />
      <template v-if="hasTitle">
        <div class="ex-divider__content">
          <slot />
        </div>
        <div
          class="ex-divider__line"
          aria-hidden="true"
        />
      </template>
    </template>

    <div
      v-else
      class="ex-divider__line ex-divider__line--vertical"
      aria-hidden="true"
    />
  </div>
</template>

<style scoped lang="scss" src="./ExDivider.scss"></style>
