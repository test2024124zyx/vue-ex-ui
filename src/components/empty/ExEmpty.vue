<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { CSSProperties } from 'vue';
import { useLocale } from '../../locale';
import { hasRenderableContent } from '../../utils/vnode';
import type {
  ExEmptyEmits,
  ExEmptyPresetSize,
  ExEmptyProps,
  ExEmptySlots,
  ExEmptyType,
} from './types';

defineOptions({ name: 'ExEmpty' });

const props = withDefaults(defineProps<ExEmptyProps>(), {
  image: undefined,
  imageAlt: undefined,
  imageSize: 'medium',
  description: undefined,
  showImage: true,
  type: 'default',
});
const emit = defineEmits<ExEmptyEmits>();
const slots = defineSlots<ExEmptySlots>();
const { t } = useLocale('empty');

const EMPTY_TYPES = new Set<ExEmptyType>([
  'default',
  'no-data',
  'no-result',
  'error',
  'network-error',
]);
const PRESET_SIZES = new Set<ExEmptyPresetSize>(['small', 'medium', 'large']);
const TYPE_DESCRIPTION_KEY: Record<ExEmptyType, string> = {
  default: 'description',
  'no-data': 'noData',
  'no-result': 'noResult',
  error: 'error',
  'network-error': 'networkError',
};

/** 运行时输入可能绕过 TypeScript，所有有限集合都在渲染前归一化。 */
const normalizedType = computed<ExEmptyType>(() =>
  EMPTY_TYPES.has(props.type) ? props.type : 'default'
);
const normalizedSize = computed<ExEmptyPresetSize | number>(() => {
  if (typeof props.imageSize === 'number') {
    return Number.isFinite(props.imageSize) && props.imageSize > 0 ? props.imageSize : 'medium';
  }
  return PRESET_SIZES.has(props.imageSize) ? props.imageSize : 'medium';
});
const normalizedImage = computed(() => props.image?.trim() || undefined);
const normalizedImageAlt = computed(() => props.imageAlt?.trim() || undefined);

const imageFailed = ref(false);
watch(normalizedImage, () => {
  imageFailed.value = false;
});

const descriptionText = computed(() => {
  if (props.description !== undefined) return props.description;
  return t(TYPE_DESCRIPTION_KEY[normalizedType.value]);
});

const hasImageSlot = computed(() => hasRenderableContent(slots.image?.()));
const hasDescriptionSlot = computed(() => hasRenderableContent(slots.description?.()));
const hasDescription = computed(
  () => hasDescriptionSlot.value || descriptionText.value.trim().length > 0
);
const hasFooter = computed(() => hasRenderableContent(slots.default?.()));

const emptyClasses = computed(() => [
  'ex-empty',
  typeof normalizedSize.value === 'number'
    ? 'ex-empty--custom'
    : `ex-empty--${normalizedSize.value}`,
]);
const emptyStyle = computed<CSSProperties>(() =>
  typeof normalizedSize.value === 'number'
    ? { '--ex-empty-image-size': `${normalizedSize.value}px` }
    : {}
);

/** 图片错误属于可恢复状态：通知调用方，并使用内置插图维持完整布局。 */
const handleImageError = (event: Event) => {
  imageFailed.value = true;
  emit('image-error', event);
};
</script>

<template>
  <div
    :class="emptyClasses"
    :style="emptyStyle"
  >
    <div
      v-if="showImage"
      class="ex-empty__image"
    >
      <slot
        v-if="hasImageSlot"
        name="image"
      />
      <!-- prettier-ignore -->
      <img
        v-else-if="normalizedImage && !imageFailed"
        :src="normalizedImage"
        :alt="normalizedImageAlt || ''"
        :aria-hidden="normalizedImageAlt ? undefined : 'true'"
        class="ex-empty__img"
        @error="handleImageError"
      >
      <svg
        v-else
        class="ex-empty__svg"
        viewBox="0 0 184 152"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
      >
        <g
          fill="none"
          fill-rule="evenodd"
        >
          <g transform="translate(24 31.67)">
            <ellipse
              class="ex-empty__ellipse"
              cx="67.797"
              cy="106.89"
              rx="67.797"
              ry="12.668"
            />
            <path
              class="ex-empty__path-1"
              d="M122.034 69.674L98.109 40.229c-1.148-1.386-2.826-2.225-4.593-2.225h-51.44c-1.766 0-3.444.839-4.592 2.225L13.56 69.674v15.383h108.475V69.674z"
            />
            <path
              class="ex-empty__path-2"
              d="M101.537 86.214L80.63 61.102c-1.001-1.207-2.507-1.867-4.048-1.867H31.724c-1.54 0-3.047.66-4.048 1.867L6.769 86.214v13.792h94.768V86.214z"
              transform="translate(13.56)"
            />
            <path
              class="ex-empty__path-3"
              d="M33.83 0h67.933a4 4 0 0 1 4 4v93.344a4 4 0 0 1-4 4H33.83a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4z"
            />
            <path
              class="ex-empty__path-4"
              d="M42.678 9.953h50.237a2 2 0 0 1 2 2V36.91a2 2 0 0 1-2 2H42.678a2 2 0 0 1-2-2V11.953a2 2 0 0 1 2-2zM42.94 49.767h49.713a2.262 2.262 0 1 1 0 4.524H42.94a2.262 2.262 0 0 1 0-4.524zM42.94 61.53h49.713a2.262 2.262 0 1 1 0 4.525H42.94a2.262 2.262 0 0 1 0-4.525zM121.813 105.032c-.775 3.071-3.497 5.36-6.735 5.36H20.515c-3.238 0-5.96-2.29-6.734-5.36a7.309 7.309 0 0 1-.222-1.79V69.675h26.318c2.907 0 5.25 2.448 5.25 5.42v.04c0 2.971 2.37 5.37 5.277 5.37h34.785c2.907 0 5.277-2.421 5.277-5.393V75.1c0-2.972 2.343-5.426 5.25-5.426h26.318v33.569c0 .617-.077 1.216-.221 1.789z"
            />
          </g>
          <path
            class="ex-empty__path-5"
            d="M149.121 33.292l-6.83 2.65a1 1 0 0 1-1.317-1.23l1.937-6.207c-2.589-2.944-4.109-6.534-4.109-10.408C138.802 8.102 148.92 0 161.402 0 173.881 0 184 8.102 184 18.097c0 9.995-10.118 18.097-22.599 18.097-4.528 0-8.744-1.066-12.28-2.902z"
          />
          <g
            class="ex-empty__g"
            transform="translate(149.65 15.383)"
          >
            <ellipse
              cx="20.654"
              cy="3.167"
              rx="2.849"
              ry="2.815"
            />
            <path d="M5.698 5.63H0L2.898.704zM9.259.704h4.985V5.63H9.259z" />
          </g>
        </g>
      </svg>
    </div>

    <div
      v-if="hasDescription"
      class="ex-empty__description"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <slot
        v-if="hasDescriptionSlot"
        name="description"
      />
      <template v-else>
        {{ descriptionText }}
      </template>
    </div>

    <div
      v-if="hasFooter"
      class="ex-empty__footer"
    >
      <slot />
    </div>
  </div>
</template>

<style scoped lang="scss" src="./ExEmpty.scss"></style>
