<script setup lang="ts">
import { computed, ref, useSlots, watch, type CSSProperties } from 'vue';
import { useOverlay } from '../../composables/useOverlay';
import { useLocale } from '../../locale';
import { hasRenderableContent } from '../../utils/vnode';
import ExIcon from '../icon/ExIcon.vue';
import { normalizeImageDimension, normalizeImageRadius } from './image-utils';
import type { ExImageEmits, ExImageExposed, ExImageProps } from './types';

defineOptions({
  name: 'ExImage',
  inheritAttrs: false,
});

type ImageStatus = 'idle' | 'loading' | 'loaded' | 'error';

const props = withDefaults(defineProps<ExImageProps>(), {
  fit: 'cover',
  lazy: true,
  preview: false,
});
const emit = defineEmits<ExImageEmits>();
const slots = useSlots();
const { t } = useLocale('image');

const rootRef = ref<HTMLDivElement>();
const mainImageRef = ref<HTMLImageElement>();
const overlayRef = ref<HTMLDivElement>();
const previewImageRef = ref<HTMLImageElement>();
const status = ref<ImageStatus>(props.src ? 'loading' : 'idle');
const previewVisible = ref(false);
const previewStatus = ref<ImageStatus>('idle');

const previewSource = computed(() => props.previewSrc || props.src);
const canPreview = computed(
  () => props.preview && status.value === 'loaded' && Boolean(previewSource.value)
);
const hasPlaceholderSlot = computed(() => hasRenderableContent(slots.placeholder?.({})));
const hasErrorSlot = computed(() => hasRenderableContent(slots.error?.({})));
const hasDefaultSlot = computed(() => hasRenderableContent(slots.default?.({})));

const normalizedWidth = computed(() => normalizeImageDimension(props.width));
const normalizedHeight = computed(() => normalizeImageDimension(props.height));
const normalizedRadius = computed(() => normalizeImageRadius(props.radius));

const imageClasses = computed(() => [
  'ex-image',
  `ex-image--${status.value}`,
  {
    'ex-image--preview': props.preview,
    'ex-image--preview-ready': canPreview.value,
    'ex-image--circle': normalizedRadius.value === '50%',
  },
]);

const imageStyles = computed<CSSProperties>(
  () =>
    ({
      width: normalizedWidth.value,
      height: normalizedHeight.value,
      borderRadius: normalizedRadius.value,
      '--ex-image-fit': props.fit,
    }) as CSSProperties
);

const previewTriggerLabel = computed(() =>
  props.alt ? t('openPreview', { alt: props.alt }) : t('preview')
);
const previewDialogLabel = computed(() =>
  props.alt ? t('previewDialog', { alt: props.alt }) : t('preview')
);

function closePreview(): void {
  previewVisible.value = false;
  previewStatus.value = 'idle';
}

function openPreview(): void {
  if (!canPreview.value) return;
  previewStatus.value = 'loading';
  emit('preview');
  previewVisible.value = true;
}

useOverlay({
  active: () => previewVisible.value,
  container: overlayRef,
  closeOnEscape: () => true,
  onEscape: closePreview,
  restoreFocus: true,
});

watch(
  () => props.src,
  source => {
    status.value = source ? 'loading' : 'idle';
    closePreview();
  }
);

watch(
  () => props.preview,
  enabled => {
    if (!enabled) closePreview();
  }
);

watch(previewSource, () => {
  if (!previewVisible.value) return;
  previewStatus.value = 'loading';
});

function handleLoad(event: Event): void {
  if (event.currentTarget !== mainImageRef.value) return;
  status.value = 'loaded';
  emit('load', event);
}

function handleError(event: Event): void {
  if (event.currentTarget !== mainImageRef.value) return;
  status.value = 'error';
  emit('error', event);
}

function handlePreviewLoad(event: Event): void {
  if (event.currentTarget === previewImageRef.value) previewStatus.value = 'loaded';
}

function handlePreviewError(event: Event): void {
  if (event.currentTarget === previewImageRef.value) previewStatus.value = 'error';
}

const getElement = () => rootRef.value ?? null;

defineExpose<ExImageExposed>({
  getElement,
});
</script>

<template>
  <div
    ref="rootRef"
    v-bind="$attrs"
    :class="imageClasses"
    :style="imageStyles"
    :aria-busy="status === 'loading' ? 'true' : undefined"
  >
    <img
      v-if="src && status !== 'error'"
      :key="src"
      ref="mainImageRef"
      class="ex-image__img"
      :src="src"
      :alt="alt"
      :title="title"
      :loading="lazy ? 'lazy' : 'eager'"
      decoding="async"
      :draggable="false"
      @load="handleLoad"
      @error="handleError"
    />

    <div
      v-if="status === 'loading'"
      class="ex-image__placeholder"
      role="status"
      aria-live="polite"
      :aria-label="t('loading')"
    >
      <slot
        v-if="hasPlaceholderSlot"
        name="placeholder"
      ></slot>
      <span
        v-else
        class="ex-image__spinner"
        aria-hidden="true"
      ></span>
    </div>

    <div
      v-else-if="status === 'error'"
      class="ex-image__error"
      role="alert"
      :aria-label="hasErrorSlot ? undefined : t('error')"
    >
      <slot
        v-if="hasErrorSlot"
        name="error"
      ></slot>
      <template v-else>
        <ExIcon
          class="ex-image__error-icon"
          icon="error-warning-line"
          :size="48"
          aria-hidden="true"
        />
        <span class="ex-image__error-text">{{ t('error') }}</span>
      </template>
    </div>

    <div
      v-if="status === 'loaded' && hasDefaultSlot"
      class="ex-image__overlay"
    >
      <slot></slot>
    </div>

    <button
      v-if="preview"
      type="button"
      class="ex-image__preview-trigger"
      :disabled="!canPreview"
      :aria-label="previewTriggerLabel"
      aria-haspopup="dialog"
      :aria-expanded="previewVisible"
      @click="openPreview"
    ></button>

    <Teleport to="body">
      <Transition name="ex-image-preview-fade">
        <div
          v-if="previewVisible"
          ref="overlayRef"
          class="ex-image-preview"
          role="dialog"
          aria-modal="true"
          :aria-label="previewDialogLabel"
          :aria-busy="previewStatus === 'loading' ? 'true' : undefined"
          @click.self="closePreview"
        >
          <button
            type="button"
            class="ex-image-preview__close"
            :aria-label="t('closePreview')"
            @click="closePreview"
          >
            <ExIcon
              icon="close-line"
              :size="24"
              aria-hidden="true"
            />
          </button>

          <img
            v-if="previewStatus !== 'error'"
            :key="previewSource"
            ref="previewImageRef"
            class="ex-image-preview__img"
            :src="previewSource"
            :alt="alt"
            decoding="async"
            :draggable="false"
            @load="handlePreviewLoad"
            @error="handlePreviewError"
          />

          <div
            v-if="previewStatus === 'loading'"
            class="ex-image-preview__loading"
            role="status"
            :aria-label="t('previewLoading')"
          >
            <span
              class="ex-image__spinner"
              aria-hidden="true"
            ></span>
          </div>

          <div
            v-else-if="previewStatus === 'error'"
            class="ex-image-preview__error"
            role="alert"
          >
            <ExIcon
              icon="error-warning-line"
              :size="48"
              aria-hidden="true"
            />
            <span>{{ t('previewError') }}</span>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped lang="scss" src="./ExImage.scss"></style>
