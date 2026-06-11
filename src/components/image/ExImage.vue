<script setup lang="ts">
import { ref, watch, computed, defineOptions } from 'vue';
import type { ExImageProps, ExImageEmits } from './types';
import { useI18n } from '../../locale';

defineOptions({ name: 'ExImage' });

const props = withDefaults(defineProps<ExImageProps>(), {
  fit: 'cover',
  lazy: true,
  preview: false,
});
const emit = defineEmits<ExImageEmits>();
const { t } = useI18n();

const status = ref<'idle' | 'loading' | 'loaded' | 'error'>(props.src ? 'loading' : 'idle');

const imageClasses = computed(() => [
  'ex-image',
  {
    'ex-image--preview': props.preview,
    'ex-image--circle': props.radius === '50%',
  },
]);

watch(
  () => props.src,
  src => {
    status.value = src ? 'loading' : 'idle';
  }
);

function onLoad(e: Event) {
  status.value = 'loaded';
  emit('load', e);
}

function onError(e: Event) {
  status.value = 'error';
  emit('error', e);
}

function handlePreview() {
  if (props.preview) {
    emit('preview');
  }
}
</script>

<template>
  <div
    :class="imageClasses"
    role="img"
    :aria-label="alt"
    :style="{
      width: typeof width === 'number' ? `${width}px` : width,
      height: typeof height === 'number' ? `${height}px` : height,
      borderRadius: radius,
    }"
    @click="handlePreview"
  >
    <img
      v-if="src && status !== 'error'"
      class="ex-image__img"
      :src="src"
      :alt="alt"
      :title="title || alt"
      :loading="lazy ? 'lazy' : undefined"
      :decoding="lazy ? 'async' : 'auto'"
      :style="{ objectFit: fit }"
      @load="onLoad"
      @error="onError"
    />

    <!-- 加载占位 -->
    <div v-if="status === 'loading'" class="ex-image__placeholder" aria-hidden="true">
      <slot name="placeholder" />
    </div>

    <!-- 错误状态 -->
    <div
      v-else-if="status === 'error'"
      class="ex-image__error"
      role="alert"
      :aria-label="t('image.error')"
    >
      <slot name="error">
        <div class="ex-image__error-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
              fill="currentColor"
            />
          </svg>
        </div>
        <span class="ex-image__error-text">{{ t('image.error') }}</span>
      </slot>
    </div>

    <!-- 默认插槽：额外装饰内容 -->
    <slot v-if="status === 'loaded'" />
  </div>
</template>
<style scoped lang="scss" src="./ExImage.scss"></style>
