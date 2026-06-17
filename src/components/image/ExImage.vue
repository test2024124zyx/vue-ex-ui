<script setup lang="ts">
import { ref, watch, computed, defineOptions } from 'vue';
import type { ExImageProps, ExImageEmits } from './types';
import { useI18n } from '../../locale';
import { useOverlay } from '../../composables/useOverlay';

defineOptions({ name: 'ExImage' });

const rootRef = ref<HTMLElement>();
const overlayRef = ref<HTMLElement>();

const props = withDefaults(defineProps<ExImageProps>(), {
  fit: 'cover',
  lazy: true,
  preview: false,
});
const emit = defineEmits<ExImageEmits>();
const { t } = useI18n();

const status = ref<'idle' | 'loading' | 'loaded' | 'error'>(props.src ? 'loading' : 'idle');

// 内置全屏预览
const previewVisible = ref(false);
const previewSource = computed(() => props.previewSrc || props.src);

function closePreview() {
  previewVisible.value = false;
}

// 复用浮层通用机制：Esc 关闭、滚动锁定、焦点陷阱与归还
useOverlay({
  active: () => previewVisible.value,
  container: overlayRef,
  closeOnEscape: () => true,
  onEscape: closePreview,
  restoreFocus: true,
});

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
  if (!props.preview) return;
  emit('preview');
  previewVisible.value = true;
}

// 键盘触发预览：preview 模式下根元素可聚焦，Enter / Space 等同点击
function handleKeydown(e: KeyboardEvent) {
  if (!props.preview) return;
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    handlePreview();
  }
}

const getElement = () => rootRef.value || null;

defineExpose({ getElement });
</script>

<template>
  <div
    ref="rootRef"
    :class="imageClasses"
    role="img"
    :aria-label="alt"
    :tabindex="preview ? 0 : undefined"
    :style="{
      width: typeof width === 'number' ? `${width}px` : width,
      height: typeof height === 'number' ? `${height}px` : height,
      borderRadius: radius,
    }"
    @click="handlePreview"
    @keydown="handleKeydown"
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
    >

    <!-- 加载占位 -->
    <div
      v-if="status === 'loading'"
      class="ex-image__placeholder"
      aria-hidden="true"
    >
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
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
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

  <!-- 内置全屏预览 -->
  <Teleport to="body">
    <Transition name="ex-image-preview-fade">
      <div
        v-if="previewVisible"
        ref="overlayRef"
        class="ex-image-preview"
        role="dialog"
        aria-modal="true"
        :aria-label="alt"
        @click.self="closePreview"
      >
        <button
          type="button"
          class="ex-image-preview__close"
          :aria-label="t('image.closePreview')"
          @click="closePreview"
        >
          <svg
            viewBox="0 0 24 24"
            width="24"
            height="24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </button>
        <img
          class="ex-image-preview__img"
          :src="previewSource"
          :alt="alt"
        >
      </div>
    </Transition>
  </Teleport>
</template>
<style scoped lang="scss" src="./ExImage.scss"></style>
