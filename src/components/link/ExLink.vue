<template>
  <component
    :is="rootTag"
    ref="linkRef"
    :class="linkClasses"
    :type="isAction ? 'button' : undefined"
    :disabled="isAction && disabled ? true : undefined"
    :href="anchorHref"
    :target="anchorTarget"
    :rel="anchorRel"
    :role="isAnchor && isDisabled ? 'link' : undefined"
    :tabindex="isAnchor && isDisabled ? -1 : undefined"
    :aria-disabled="isAnchor && isDisabled ? 'true' : undefined"
    @click="handleClick"
    @focus="handleFocus"
    @blur="handleBlur"
  >
    <!-- 左侧图标区域，prefix 插槽优先于通用 icon 插槽。 -->
    <span
      v-if="$slots.prefix || (iconPlacement === 'left' && $slots.icon)"
      class="ex-link__icon ex-link__icon--left"
    >
      <slot name="prefix">
        <slot
          v-if="iconPlacement === 'left'"
          name="icon"
        ></slot>
      </slot>
    </span>

    <span class="ex-link__content">
      <slot></slot>
    </span>

    <!-- 右侧图标区域，suffix 插槽优先于通用 icon 插槽。 -->
    <span
      v-if="$slots.suffix || (iconPlacement === 'right' && $slots.icon)"
      class="ex-link__icon ex-link__icon--right"
    >
      <slot name="suffix">
        <slot
          v-if="iconPlacement === 'right'"
          name="icon"
        ></slot>
      </slot>
    </span>

    <span
      v-if="isExternalLink && showExternalIcon"
      class="ex-link__external-icon"
    >
      <slot name="external-icon">
        <ExIcon
          icon="external-link-line"
          aria-hidden="true"
        />
      </slot>
    </span>
  </component>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import ExIcon from '../icon/ExIcon.vue';
import { buildSecureRel, isExternalLinkHref, normalizeLinkHref } from './link-utils';
import type { ExLinkEmits, ExLinkExposed, ExLinkProps } from './types';

defineOptions({
  name: 'ExLink',
});

const props = withDefaults(defineProps<ExLinkProps>(), {
  type: 'default',
  size: 'medium',
  disabled: false,
  underline: true,
  iconPlacement: 'left',
  showExternalIcon: true,
});

const emit = defineEmits<ExLinkEmits>();
const linkRef = ref<HTMLAnchorElement | HTMLButtonElement | null>(null);

// href 是否出现决定根元素语义；无 href 是动作按钮，非法 href 仍保持禁用锚点语义。
const isAnchor = computed(() => props.href !== undefined);
const isAction = computed(() => !isAnchor.value);
const normalizedHref = computed(() => normalizeLinkHref(props.href));
const hasInvalidHref = computed(() => isAnchor.value && normalizedHref.value === undefined);
const isDisabled = computed(() => props.disabled || hasInvalidHref.value);
const rootTag = computed(() => (isAnchor.value ? 'a' : 'button'));

const isExternalLink = computed(
  () => !isDisabled.value && isExternalLinkHref(normalizedHref.value)
);

const linkClasses = computed(() => [
  'ex-link',
  `ex-link--${props.type}`,
  `ex-link--${props.size}`,
  {
    'ex-link--disabled': isDisabled.value,
    'ex-link--no-underline': !props.underline,
    'ex-link--external': isExternalLink.value,
  },
]);

const anchorHref = computed(() =>
  isAnchor.value && !isDisabled.value ? normalizedHref.value : undefined
);
const anchorTarget = computed(() =>
  isAnchor.value && !isDisabled.value ? props.target : undefined
);
const anchorRel = computed(() =>
  isAnchor.value && !isDisabled.value ? buildSecureRel(props.rel, props.target) : undefined
);

const handleClick = (event: MouseEvent): void => {
  if (isDisabled.value) {
    event.preventDefault();
    event.stopPropagation();
    return;
  }

  emit('click', event);
};

const handleFocus = (event: FocusEvent): void => {
  if (!isDisabled.value) emit('focus', event);
};

const handleBlur = (event: FocusEvent): void => {
  if (!isDisabled.value) emit('blur', event);
};

const focus = (): void => {
  if (!isDisabled.value) linkRef.value?.focus();
};

const blur = (): void => {
  linkRef.value?.blur();
};

const getElement = (): HTMLAnchorElement | HTMLButtonElement | null => linkRef.value;

defineExpose<ExLinkExposed>({
  focus,
  blur,
  getElement,
});
</script>

<style lang="scss" scoped src="./ExLink.scss"></style>
