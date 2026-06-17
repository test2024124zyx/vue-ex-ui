<template>
  <div
    :class="groupClasses"
    :style="groupStyles"
  >
    <!-- 显示的头像 -->
    <template
      v-for="(vnode, index) in displayAvatars"
      :key="index"
    >
      <slot
        name="avatar"
        :vnode="vnode"
        :index="index"
      >
        <component
          :is="vnode"
          :size="size || vnode.props?.size"
          :shape="shape || vnode.props?.shape"
          :class="['ex-avatar-group__item', vnode.props?.class]"
        />
      </slot>
    </template>

    <!-- 超出数量显示 -->
    <ex-avatar
      v-if="hasOverflow"
      :size="size"
      :shape="shape"
      :style="maxStyle"
      :text="overflowText"
      :aria-label="overflowAriaLabel"
      :title="overflowTitle"
      class="ex-avatar-group__overflow"
      @click="handleOverflowClick"
    />
  </div>
</template>

<script setup lang="ts">
import { normalizeCustomClass } from '../../composables/useCustomClass';
import { computed, useSlots } from 'vue';
import type { VNode, Component } from 'vue';
import type { ExAvatarGroupProps } from './types';
import { useI18n } from '../../locale';
import ExAvatar from './ExAvatar.vue';

defineOptions({
  name: 'ExAvatarGroup',
});

const props = withDefaults(defineProps<ExAvatarGroupProps>(), {
  spacing: '8px',
});

const emit = defineEmits<{
  overflowClick: [count: number];
}>();

defineSlots<{
  default?: () => VNode[];
  avatar?: (props: { vnode: VNode; index: number }) => VNode[];
}>();

const slots = useSlots();
const { t } = useI18n();

// 从插槽中获取头像数据 - 简化逻辑
const avatars = computed(() => {
  const defaultSlot = slots.default?.();
  if (!defaultSlot) return [];

  // 简化的插槽解析 - 直接使用插槽内容而不是提取props
  return defaultSlot.filter(vnode => {
    return (
      vnode &&
      vnode.type &&
      typeof vnode.type === 'object' &&
      (vnode.type as Component).name === 'ExAvatar'
    );
  });
});

const displayAvatars = computed(() => {
  if (!props.maxCount || avatars.value.length <= props.maxCount) {
    return avatars.value;
  }
  return avatars.value.slice(0, props.maxCount);
});

const hasOverflow = computed(() => {
  return props.maxCount && avatars.value.length > props.maxCount;
});

const overflowCount = computed(() => {
  if (!hasOverflow.value) return 0;
  return avatars.value.length - (props.maxCount || 0);
});

// 国际化计算属性
const overflowText = computed(() => {
  return `+${overflowCount.value}`;
});

const overflowAriaLabel = computed(() => {
  return t('avatar.groupMore', { count: overflowCount.value });
});

const overflowTitle = computed(() => {
  return overflowAriaLabel.value;
});

const groupClasses = computed(() => {
  const classes = ['ex-avatar-group'];

  classes.push(...normalizeCustomClass(props.class));

  return classes;
});

const groupStyles = computed(() => {
  const styles: Record<string, string> = {};

  // 设置头像重叠间距
  if (props.spacing) {
    const spacing = typeof props.spacing === 'number' ? `${props.spacing}px` : props.spacing;
    styles['--ex-avatar-overlap'] = spacing;
  }

  // 合并用户自定义样式
  if (props.style) {
    if (typeof props.style === 'string') {
      return `${Object.entries(styles)
        .map(([k, v]) => `${k}: ${v}`)
        .join('; ')}; ${props.style}`;
    } else {
      Object.assign(styles, props.style);
    }
  }

  return styles;
});

const handleOverflowClick = () => {
  emit('overflowClick', overflowCount.value);
};
</script>
<style scoped lang="scss" src="./ExAvatarGroup.scss"></style>
