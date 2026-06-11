<template>
  <component
    :is="linkComponent"
    ref="linkRef"
    :class="linkClasses"
    :style="linkStyles"
    v-bind="linkProps"
    @click="handleClick"
    @focus="handleFocus"
    @blur="handleBlur"
  >
    <!-- 左侧图标插槽 -->
    <span
      v-if="$slots.prefix || (iconPlacement === 'left' && $slots.icon)"
      class="ex-link__icon ex-link__icon--left"
    >
      <slot name="prefix">
        <slot
          v-if="iconPlacement === 'left'"
          name="icon"
        />
      </slot>
    </span>

    <!-- 链接内容 -->
    <span class="ex-link__content">
      <slot />
    </span>

    <!-- 右侧图标插槽 -->
    <span
      v-if="$slots.suffix || (iconPlacement === 'right' && $slots.icon)"
      class="ex-link__icon ex-link__icon--right"
    >
      <slot name="suffix">
        <slot
          v-if="iconPlacement === 'right'"
          name="icon"
        />
      </slot>
    </span>

    <!-- 外部链接图标 -->
    <span
      v-if="isExternalLink && showExternalIcon"
      class="ex-link__external-icon"
    >
      <slot name="external-icon">
        <ex-icon src="https://api.iconify.design/ri/external-link-line.svg" />
      </slot>
    </span>
  </component>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { ExLinkProps, ExLinkEmits, ExLinkExposed } from './types';
import ExIcon from '../icon/ExIcon.vue';

defineOptions({
  name: 'ExLink',
});

const props = withDefaults(defineProps<ExLinkProps>(), {
  type: 'default',
  size: 'medium',
  disabled: false,
  underline: true,
  target: '_self',
  iconPlacement: 'left',
  showExternalIcon: true,
});

const emit = defineEmits<ExLinkEmits>();

const linkRef = ref<HTMLElement>();

// 计算属性
const linkComponent = computed(() => {
  // 如果有 to 属性，使用 router-link
  if (props.to && !props.disabled) {
    return 'router-link';
  }
  // 否则使用普通 a 标签
  return 'a';
});

const linkClasses = computed(() => {
  const classes = [
    'ex-link',
    `ex-link--${props.type}`,
    `ex-link--${props.size}`,
  ];

  if (props.disabled) classes.push('ex-link--disabled');
  if (!props.underline) classes.push('ex-link--no-underline');
  if (isExternalLink.value) classes.push('ex-link--external');

  if (props.class) {
    if (typeof props.class === 'string') {
      classes.push(props.class);
    } else if (Array.isArray(props.class)) {
      classes.push(...props.class);
    } else {
      Object.entries(props.class).forEach(([key, value]) => {
        if (value) classes.push(key);
      });
    }
  }

  return classes;
});

const linkStyles = computed(() => {
  if (!props.style) return undefined;

  if (typeof props.style === 'string') {
    return props.style;
  }

  return props.style;
});

const linkProps = computed(() => {
  const baseProps: Record<string, string | number | boolean | undefined> = {};

  if (props.disabled) {
    baseProps.tabindex = -1;
    baseProps['aria-disabled'] = true;
  }

  if (props.ariaLabel) {
    baseProps['aria-label'] = props.ariaLabel;
  }

  // router-link 属性
  if (linkComponent.value === 'router-link') {
    baseProps.to = props.to as string;
    if (props.target !== '_self') {
      baseProps.target = props.target;
    }
  } else {
    // 普通 a 标签属性
    baseProps.href = props.disabled ? undefined : props.href;
    baseProps.target = props.target;
    baseProps.rel = props.rel || (isExternalLink.value ? 'noopener noreferrer' : undefined);
  }

  return baseProps;
});

const isExternalLink = computed(() => {
  if (!props.href) return false;

  try {
    const url = new URL(props.href, window.location.origin);
    return url.origin !== window.location.origin;
  } catch {
    return false;
  }
});

// 事件处理
const handleClick = (event: MouseEvent) => {
  if (props.disabled) {
    event.preventDefault();
    event.stopPropagation();
    return;
  }

  emit('click', event);
};

const handleFocus = (event: FocusEvent) => {
  if (!props.disabled) {
    emit('focus', event);
  }
};

const handleBlur = (event: FocusEvent) => {
  if (!props.disabled) {
    emit('blur', event);
  }
};

// 暴露的方法
const focus = () => {
  if (!props.disabled) {
    linkRef.value?.focus();
  }
};

const blur = () => {
  linkRef.value?.blur();
};

const getElement = () => {
  return linkRef.value || null;
};

defineExpose<ExLinkExposed>({
  focus,
  blur,
  getElement,
});
</script>
<style lang="scss" scoped src="./ExLink.scss"></style>
