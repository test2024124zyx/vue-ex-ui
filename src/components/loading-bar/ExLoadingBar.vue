<template>
  <Transition name="ex-loading-bar-fade">
    <div
      v-if="props.visible"
      ref="loadingBarRef"
      v-bind="rootAttrs"
      :class="loadingBarClasses"
      :style="rootStyles"
      role="progressbar"
      :aria-label="resolvedAriaLabel"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-valuenow="normalizedPercentage"
      :data-status="normalizedStatus"
      :data-theme="configTheme"
    >
      <div
        class="ex-loading-bar__bar"
        :class="`ex-loading-bar__bar--${normalizedStatus}`"
        aria-hidden="true"
      >
        <div class="ex-loading-bar__glow"></div>
        <div class="ex-loading-bar__flow"></div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, ref, useAttrs } from 'vue';
import { useLocale } from '../../locale';
import { useAnimation, useConfigTheme, useNeonEffect } from '../config-provider/composables';
import {
  normalizeLoadingBarHeight,
  normalizeLoadingBarPercentage,
  normalizeLoadingBarStatus,
  normalizeLoadingBarZIndex,
  resolveLoadingBarColor,
} from './loading-bar-utils';
import type { ExLoadingBarExposed, ExLoadingBarProps } from './types';

defineOptions({
  name: 'ExLoadingBar',
  inheritAttrs: false,
});

const props = withDefaults(defineProps<ExLoadingBarProps>(), {
  visible: true,
  percentage: 0,
  status: 'loading',
  height: 3,
  color: undefined,
  zIndex: undefined,
});

const attrs = useAttrs();
const { t } = useLocale('loading');
const configTheme = useConfigTheme();
const animationEnabled = useAnimation();
const neonEnabled = useNeonEffect();
const loadingBarRef = ref<HTMLDivElement | null>(null);
const normalizedPercentage = computed(() => normalizeLoadingBarPercentage(props.percentage));
const normalizedStatus = computed(() => normalizeLoadingBarStatus(props.status));
const normalizedHeight = computed(() => normalizeLoadingBarHeight(props.height));
const normalizedZIndex = computed(() => normalizeLoadingBarZIndex(props.zIndex));
const normalizedColor = computed(() =>
  resolveLoadingBarColor(props.color, normalizedPercentage.value)
);
const loadingBarClasses = computed(() => [
  'ex-loading-bar',
  {
    'ex-loading-bar--no-animation': !animationEnabled.value,
    'ex-loading-bar--no-neon': !neonEnabled.value,
  },
]);

const OBSOLETE_ATTRS = new Set(['duration', 'animated', 'rounded']);
const PROTECTED_ATTRS = new Set(['role', 'ariavaluemin', 'ariavaluemax', 'ariavaluenow']);

const normalizeAttrName = (name: string): string => name.replace(/-/g, '').toLowerCase();

const rootAttrs = computed(() =>
  Object.fromEntries(
    Object.entries(attrs).filter(([key]) => {
      const normalizedKey = normalizeAttrName(key);
      return (
        key !== 'aria-label' &&
        !OBSOLETE_ATTRS.has(normalizedKey) &&
        !PROTECTED_ATTRS.has(normalizedKey)
      );
    })
  )
);

const resolvedAriaLabel = computed(() => {
  const label = attrs['aria-label'];
  return typeof label === 'string' && label.trim() ? label.trim() : t('loading');
});

const rootStyles = computed<Record<string, string>>(() => {
  const styles: Record<string, string> = {
    '--ex-loading-bar-height': `${normalizedHeight.value}px`,
    '--ex-loading-bar-progress': String(normalizedPercentage.value / 100),
  };

  if (normalizedColor.value) styles['--ex-loading-bar-color'] = normalizedColor.value;
  if (normalizedZIndex.value !== undefined) {
    styles['--ex-loading-bar-z-index'] = String(normalizedZIndex.value);
  }
  return styles;
});

const exposed: ExLoadingBarExposed = {
  getElement: () => loadingBarRef.value,
};

defineExpose(exposed);
</script>

<style scoped lang="scss" src="./ExLoadingBar.scss"></style>
