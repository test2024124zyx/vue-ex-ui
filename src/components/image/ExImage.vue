<script setup lang="ts">
import { computed, nextTick, onMounted, ref, useSlots, watch, type CSSProperties } from 'vue';
import { useOverlay } from '../../composables/useOverlay';
import { useLocale } from '../../locale';
import { hasRenderableContent } from '../../utils/vnode';
import {
  useAnimation,
  useConfigTheme,
  useNeonEffect,
  useZIndexLayer,
} from '../config-provider/composables';
import ExIcon from '../icon/ExIcon.vue';
import {
  normalizeImageAspectRatio,
  normalizeImageDimension,
  normalizeImageRadius,
} from './image-utils';
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
  retry: false,
});
const emit = defineEmits<ExImageEmits>();
const slots = useSlots();
const { t } = useLocale('image');
const configTheme = useConfigTheme();
const animation = useAnimation();
const neonEffect = useNeonEffect();
const previewZIndex = useZIndexLayer('modal');

const rootRef = ref<HTMLDivElement>();
const mainImageRef = ref<HTMLImageElement>();
const overlayRef = ref<HTMLDivElement>();
const previewImageRef = ref<HTMLImageElement>();
const mainImageRevision = ref(0);
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
const normalizedAspectRatio = computed(() => normalizeImageAspectRatio(props.aspectRatio));
const normalizedRadius = computed(() => normalizeImageRadius(props.radius));
const mainImageKey = computed(() => `${props.src}::${mainImageRevision.value}`);

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
      aspectRatio: normalizedAspectRatio.value,
      borderRadius: normalizedRadius.value,
      '--ex-image-fit': props.fit,
    }) as CSSProperties
);
const previewStyles = computed<CSSProperties>(() => ({ zIndex: previewZIndex.value }));
const previewClasses = computed(() => [
  'ex-image-preview',
  {
    'ex-no-animation': !animation.value,
    'ex-no-neon': !neonEffect.value,
  },
]);

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
  void nextTick(() => reconcilePreviewImageStatus(previewSource.value));
}

/**
 * SSR 水合或命中内存缓存时，原生 load/error 事件可能早于 Vue 监听器绑定。
 * 通过原生完成状态补发事件，统一走既有事件处理链并保留对外事件语义。
 */
function reconcileMainImageStatus(source?: string): void {
  const image = mainImageRef.value;
  if (!source || source !== props.src || status.value !== 'loading' || !image?.complete) return;

  image.dispatchEvent(new Event(image.naturalWidth > 0 ? 'load' : 'error'));
}

/** 预览图也可能在监听器绑定前完成，必须与主图使用相同的缓存补偿语义。 */
function reconcilePreviewImageStatus(source?: string): void {
  const image = previewImageRef.value;
  if (
    !source ||
    source !== previewSource.value ||
    previewStatus.value !== 'loading' ||
    !image?.complete
  ) {
    return;
  }

  image.dispatchEvent(new Event(image.naturalWidth > 0 ? 'load' : 'error'));
}

onMounted(async () => {
  await nextTick();
  reconcileMainImageStatus(props.src);
});

useOverlay({
  active: () => previewVisible.value,
  container: overlayRef,
  closeOnEscape: () => true,
  onEscape: closePreview,
  restoreFocus: true,
});

watch(
  () => props.src,
  async source => {
    status.value = source ? 'loading' : 'idle';
    closePreview();

    if (!source) return;
    await nextTick();
    reconcileMainImageStatus(source);
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
  void nextTick(() => reconcilePreviewImageStatus(previewSource.value));
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
  if (event.currentTarget !== previewImageRef.value) return;
  previewStatus.value = 'loaded';
  emit('previewLoad', event);
}

function handlePreviewError(event: Event): void {
  if (event.currentTarget !== previewImageRef.value) return;
  previewStatus.value = 'error';
  emit('previewError', event);
}

function reload(): void {
  if (!props.src) {
    status.value = 'idle';
    return;
  }

  mainImageRevision.value += 1;
  status.value = 'loading';
  closePreview();
  emit('retry');
  void nextTick(() => reconcileMainImageStatus(props.src));
}

const getElement = () => rootRef.value ?? null;

defineExpose<ExImageExposed>({
  getElement,
  reload,
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
      :key="mainImageKey"
      ref="mainImageRef"
      class="ex-image__img"
      :src="src"
      :srcset="srcset"
      :sizes="sizes"
      :alt="alt"
      :title="title"
      :loading="lazy ? 'lazy' : 'eager'"
      :fetchpriority="fetchPriority"
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
          aria-hidden="true"
        />
        <span class="ex-image__error-text">{{ t('error') }}</span>
      </template>
      <button
        v-if="retry"
        type="button"
        class="ex-image__retry"
        :aria-label="t('retry')"
        @click.stop="reload"
      >
        {{ t('retry') }}
      </button>
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
      @click.stop="openPreview"
    >
      <span
        v-if="canPreview"
        class="ex-image__preview-hint"
        aria-hidden="true"
      >
        <ExIcon
          class="ex-image__preview-hint-icon"
          icon="zoom-in-line"
          aria-hidden="true"
        />
      </span>
    </button>

    <Teleport to="body">
      <Transition name="ex-image-preview-fade">
        <div
          v-if="previewVisible"
          ref="overlayRef"
          :class="previewClasses"
          :style="previewStyles"
          :data-theme="configTheme"
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
              class="ex-image-preview__close-icon"
              icon="close-line"
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
              class="ex-image-preview__error-icon"
              icon="error-warning-line"
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
